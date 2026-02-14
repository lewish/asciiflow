# ASCIIFlow

ASCII diagram drawing web app (asciiflow.com). Client-side only, also runs as Electron desktop app.

## Stack

- **Language:** TypeScript 5.8
- **UI:** React 16.14.0 + Material-UI 4.12.4
- **Routing:** React Router DOM 5.3.4
- **Build:** Bazel 8 (via Bazelisk) + esbuild (via aspect_rules_esbuild)
- **Tests:** Mocha + Chai + Sinon (unit), Playwright (e2e)
- **Desktop:** Electron 29.0.1

## Build & Dev

```bash
bazel build client:bundle      # Production build (esbuild)
bazel build client:site         # Full site with static assets
bazel test //common:all         # Common tests only
bazel test //client:all         # Client tests only
bazel test //e2e:all            # Playwright e2e tests
```

Requires Node 22.x (managed by Bazel toolchain) and Bazel 8.x (via Bazelisk).

## Project Structure

```
client/                # Main frontend app
  store/               # State management (Watchable pattern)
    index.ts           # Store singleton, ToolMode enum, tool instances
    canvas.ts          # Per-drawing state (layers, undo/redo, zoom)
    persistent.ts      # localStorage wrapper with serialization
    drawing_stringifier.ts  # Compress/share drawings via URL
  draw/                # Drawing tool implementations (IDrawFunction interface)
    box.ts, line.ts, text.ts, select.ts, freeform.ts, erase.ts, move.ts
  components/          # Reusable React components
  app.tsx              # React entry point with router
  controller.ts        # Input event handling (desktop + touch)
  view.tsx             # Canvas rendering (HTML5 canvas)
  layer.ts             # Sparse grid data model (Vector → char)
  vector.ts            # 2D vector math
  constants.ts         # Character sets, grid dimensions, input config
  drawer.tsx           # Sidebar UI (tools, file management, export)
  export.tsx           # Export (SVG, HTML, PNG, Markdown, JSON)
common/                # Shared utilities
  watchable.ts         # Reactive state: WatchableAdapter, useWatchable hook, autorun
  stringifiers.ts      # Serialization interfaces
bazel/                 # Bazel build infrastructure
  playwright.bzl       # playwright_test() rule for e2e tests
  playwright-runner.mjs # Playwright test runner with static server
  resolve-extensions-loader.mjs # ESM loader for .ts extension resolution
e2e/                   # Playwright e2e tests
  app.spec.js          # Application e2e tests
  playwright.config.mjs # Playwright configuration
electron/              # Electron desktop wrapper
site/                  # Static site assets
```

## Architecture

- **State:** Custom reactive system (`Watchable` pattern in `common/watchable.ts`). `Store` is a singleton with `WatchableAdapter` values. React components subscribe via `useWatchable()` hook. `autorun()` for side effects.
- **Drawing:** Command pattern — Controller dispatches input to the active `IDrawFunction` tool. Tools write to a scratch `Layer`, which is applied on commit.
- **Layers:** Sparse grid (`Map<string, string>` keyed by Vector). `LayerView` composes multiple layers for rendering.
- **Persistence:** `Persistent<T>` wraps `WatchableAdapter` with automatic localStorage sync.
- **Sharing:** Drawing → JSON → pako deflate → base64 → URL param at `/share/:encoded`.
- **Routes:** `/` (new), `/local/:id` (saved), `/share/:encoded` (shared read-only).

## Conventions

- TypeScript with strict type checking
- React functional components with hooks
- Bazel BUILD files per directory
- Unit tests use `.spec.ts` suffix alongside source files
- E2e tests use `.spec.js` in `e2e/` directory
- Path alias: `#asciiflow/*` maps to repo root
- CSS modules for component styling
- Drawing tools implement `IDrawFunction` with: `start()`, `move()`, `end()`, `handleKey()`, `getCursor()`
