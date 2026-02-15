/* global fetch, setTimeout */
/**
 * Shared Playwright runner for Bazel.
 *
 * Supports two modes:
 * 1. --server: Start a server binary before tests
 * 2. --static-dir: Serve static files from a directory in runfiles
 *
 * Usage: node playwright-runner.mjs [options]
 *
 * Options:
 *   --config <path>       Path to playwright config file (relative to runfiles root)
 *   --server <path>       Path to server binary to start before tests
 *   --static-dir <path>   Runfiles-relative directory to serve as static site
 *   --health-url <url>    URL to poll for server health
 */
import { spawn } from "child_process"
import { createServer, get as httpGet } from "http"
import { readFile } from "fs/promises"
import { join, resolve, extname } from "path"
import { writeFileSync, unlinkSync, realpathSync } from "fs"
import { tmpdir, userInfo } from "os"

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
}

function parseArgs(args) {
  const result = {
    config: "playwright.config.mjs",
    server: null,
    staticDir: null,
    healthUrl: null,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--config" && args[i + 1]) {
      result.config = args[++i]
    } else if (arg === "--server" && args[i + 1]) {
      result.server = args[++i]
    } else if (arg === "--static-dir" && args[i + 1]) {
      result.staticDir = args[++i]
    } else if (arg === "--health-url" && args[i + 1]) {
      result.healthUrl = args[++i]
    }
  }

  return result
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const ok = await new Promise((resolve, reject) => {
        const req = httpGet(url, (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 400)
          res.resume()
        })
        req.on("error", reject)
        req.setTimeout(5000, () => {
          req.destroy()
          reject(new Error("timeout"))
        })
      })
      if (ok) return true
    } catch {
      // Server not ready yet
    }
    await new Promise(r => setTimeout(r, 500))
  }
  throw new Error(`Server did not become ready at ${url} within ${timeoutMs}ms`)
}

/**
 * Start a simple static file server serving from the given directory.
 */
function startStaticServer(dir) {
  console.log(`Static server root: ${dir}`)

  return new Promise((resolvePromise) => {
    const server = createServer(async (req, res) => {
      let urlPath = req.url.split("?")[0]
      if (urlPath === "/") urlPath = "/index.html"

      const filePath = join(dir, urlPath)

      try {
        const data = await readFile(filePath)
        const ext = extname(filePath)
        res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" })
        res.end(data)
      } catch {
        // SPA fallback: serve index.html for any 404
        try {
          const indexData = await readFile(join(dir, "index.html"))
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
          res.end(indexData)
        } catch {
          res.writeHead(404)
          res.end("Not found")
        }
      }
    })

    // Use port 0 to let the OS assign a free port, avoiding conflicts
    // with devservers or other test runs.
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port
      console.log(`Static server listening on http://127.0.0.1:${port}`)
      resolvePromise(server)
    })
  })
}

const args = parseArgs(process.argv.slice(2))

// Get runfiles for finding the server binary and config
const runfilesDir = process.env.JS_BINARY__RUNFILES
const runfilesMain = runfilesDir ? join(runfilesDir, "_main") : process.cwd()

let serverProcess = null
let staticServer = null

try {
  // Start the server if specified
  if (args.server) {
    const serverPath = join(runfilesMain, args.server)

    console.log(`Starting server: ${serverPath}`)
    serverProcess = spawn(serverPath, [], {
      stdio: ["ignore", "pipe", "pipe"],
      cwd: runfilesMain,
      env: {
        ...process.env,
      },
    })

    serverProcess.stdout.on("data", data => {
      process.stdout.write(`[server] ${data}`)
    })

    serverProcess.stderr.on("data", data => {
      process.stderr.write(`[server] ${data}`)
    })

    if (args.healthUrl) {
      console.log(`Waiting for server at ${args.healthUrl}...`)
      await waitForServer(args.healthUrl)
      console.log("Server is ready!")
    } else {
      await new Promise(r => setTimeout(r, 2000))
    }
  } else if (args.staticDir) {
    // Serve static files from the specified directory within runfiles.
    // Port is auto-assigned (0) to avoid conflicts with devservers.
    const serveDir = resolve(runfilesMain, args.staticDir)
    staticServer = await startStaticServer(serveDir)
  }

  // Config path is relative to runfiles root
  const configPath = resolve(runfilesMain, args.config)

  console.log(`Running Playwright tests...`)

  // Find the playwright CLI in the runfiles node_modules
  const playwrightTestDir = join(runfilesMain, "node_modules/@playwright/test")
  const playwrightCli = join(playwrightTestDir, "cli.js")

  // The node_modules in runfiles (the canonical path we want all modules resolved through)
  const runfilesNodeModules = join(runfilesMain, "node_modules")

  // Find the execroot-relative node_modules path (where symlinks resolve to).
  // Playwright's fork() spawns workers that resolve modules from the execroot,
  // while test files resolve from runfiles. We need to redirect the execroot
  // paths back to runfiles so the module cache has consistent keys.
  let execrootNodeModules
  try {
    const realPath = realpathSync(playwrightTestDir)
    const idx = realPath.indexOf("/node_modules/")
    execrootNodeModules = idx >= 0 ? realPath.substring(0, idx + "/node_modules".length) : null
  } catch {
    execrootNodeModules = null
  }

  // Create a CJS --require hook that:
  // 1. Redirects module resolution from execroot paths to runfiles paths
  //    (ensures the same module instance is used by both the worker and spec files)
  // 2. Patches Playwright's duplicate module detection
  const loaderFile = join(tmpdir(), `pw-loader-${Date.now()}.cjs`)
  const loaderCode = `
const Module = require('module');
const path = require('path');

const RUNFILES_NM = ${JSON.stringify(runfilesNodeModules)};
const EXECROOT_NM = ${JSON.stringify(execrootNodeModules)};

// Redirect execroot module paths to runfiles paths for consistent module caching
if (EXECROOT_NM && RUNFILES_NM && EXECROOT_NM !== RUNFILES_NM) {
  const originalResolve = Module._resolveFilename;
  Module._resolveFilename = function(request, parent, isMain, options) {
    const resolved = originalResolve.call(this, request, parent, isMain, options);
    // If the resolved path is under execroot node_modules, redirect to runfiles
    if (resolved.startsWith(EXECROOT_NM)) {
      const redirected = RUNFILES_NM + resolved.slice(EXECROOT_NM.length);
      // Verify the redirected path exists in the require cache or can be resolved
      try {
        require.resolve(redirected);
        return redirected;
      } catch {
        // Fall back to original if redirect doesn't exist
      }
    }
    return resolved;
  };
}

// Patch Playwright's duplicate module detection
const originalCompile = Module.prototype._compile;
Module.prototype._compile = function(content, filename) {
  if (filename.includes('playwright') && filename.endsWith('lib/index.js')) {
    content = content.replace(
      /if\\s*\\(process\\["__pw_initiator__"\\]\\)[\\s\\S]*?\\}\\s*else\\s*\\{\\s*process\\["__pw_initiator__"\\]\\s*=\\s*new Error\\(\\)\\.stack;\\s*\\}/g,
      'if (!process["__pw_initiator__"]) { process["__pw_initiator__"] = new Error().stack; }'
    );
  }
  return originalCompile.call(this, content, filename);
};
`
  writeFileSync(loaderFile, loaderCode)

  // Run playwright from the runfiles root.
  // IMPORTANT: Use spawn (not spawnSync) so the Node.js event loop stays active.
  // When using --static-dir mode, the static file server runs in this process's
  // event loop. spawnSync would block the event loop and prevent the server from
  // responding to Chromium's requests.
  const exitCode = await new Promise((resolveExit) => {
    const child = spawn(
      process.execPath,
      [
        "--require", loaderFile,
        playwrightCli,
        "test",
        "--config", configPath,
        "--reporter=list",
      ],
      {
        stdio: "inherit",
        cwd: runfilesMain,
        env: {
          ...process.env,
          CI: "true",
          PLAYWRIGHT_SERVER_RUNNING: "true",
          // Pass the auto-assigned port so the Playwright config can use it.
          ...(staticServer ? { TEST_SERVER_PORT: String(staticServer.address().port) } : {}),
          // Use userInfo().homedir which reads from /etc/passwd, not HOME env var.
          // Bazel overrides HOME to the sandbox/runfiles root, so process.env.HOME
          // would point to the wrong location for browser binaries.
          PLAYWRIGHT_BROWSERS_PATH: join(userInfo().homedir, ".cache/ms-playwright"),
        },
      }
    )

    child.on("close", (code) => {
      resolveExit(code ?? 1)
    })
  })

  // Clean up loader file
  try { unlinkSync(loaderFile) } catch {}

  process.exit(exitCode)
} catch (error) {
  console.error("Playwright runner error:", error)
  process.exit(1)
} finally {
  if (serverProcess) {
    serverProcess.kill()
  }
  if (staticServer) {
    staticServer.close()
  }
}
