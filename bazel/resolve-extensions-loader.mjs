/**
 * Custom ESM resolve hook that adds .js extension to import specifiers that lack one.
 * This replaces the deprecated --experimental-specifier-resolution=node flag.
 *
 * Used via: --loader ./bazel/resolve-extensions-loader.mjs
 */
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err.code === "ERR_MODULE_NOT_FOUND" || err.code === "ERR_UNSUPPORTED_DIR_IMPORT") {
      // Try adding .js extension
      try {
        return await nextResolve(specifier + ".js", context);
      } catch {
        // Try /index.js
        try {
          return await nextResolve(specifier + "/index.js", context);
        } catch {
          // Fall through to original error
        }
      }
    }
    throw err;
  }
}
