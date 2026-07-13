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
  store/               # State management (Zustand)
    index.ts           # Store singleton, ToolMode enum, tool instances
    canvas.ts          # Per-drawing state (layers, undo/redo, zoom)
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
  stringifiers.ts      # Serialization interfaces
testing/               # Test infrastructure
  test_setup.ts        # localStorage/window shim for Node.js tests
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

- **State:** Zustand store (`client/store/index.ts`). `Store` is a singleton. React components subscribe via Zustand's `useStore()` hook with selectors.
- **Drawing:** Command pattern — Controller dispatches input to the active `IDrawFunction` tool. Tools write to a scratch `Layer`, which is applied on commit.
- **Layers:** Sparse grid (`Map<string, string>` keyed by Vector). `LayerView` composes multiple layers for rendering.
- **Persistence:** Direct `localStorage.getItem`/`setItem` with `IStringifier` serialization (in store/index.ts and store/canvas.ts).
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

## Issue Priority List

Re-triaged July 13, 2026 after the v1.1.0 production release and the merge of PR #368. See GitHub issues for full details.

### Recently shipped and closed in v1.1.0

These were previously labelled `fixed-in-staging`. The fixes are in tag `v1.1.0`, are live on asciiflow.com, and the issues have been closed or had the stale label removed.

| Issue | Summary |
|-------|---------|
| #28 | Pan/zoom UX, scroll pans and Cmd/Ctrl+scroll zooms |
| #129 | Two-finger swipe panning |
| #187 | Line breaks in paste and export normalization |
| #189 | Ctrl/Cmd+Z browser undo prevention |
| #193 | Backspace in text mode moves and clears correctly |
| #195 | Space-to-pan in text mode conflict |
| #246 | Visible gridlines toggle in view panel |
| #258 | Blurry canvas on HiDPI/Retina displays |
| #297 | Space and Delete in text mode |
| #307 | Delete works for the first scene |
| #321 | Side-scroll wheel behaviour |
| #332 | Undo while typing no longer reverts previous drawing action |
| #338 | Copy/paste on macOS Safari/Firefox via native clipboard events |

### Merged to main, pending next production release

| Issue / PR | Summary |
|------------|---------|
| #368 | Entity-aware select/move tool and smarter snapping. Boxes move from their interior, attached lines reflow, line tips reshape, words move, rubber-band selections keep connected lines tidier. |
| #58 | Partially addressed by #368, but still open because a full object model for arbitrary element manipulation is broader than the current select-tool work. |

### Open bugs

| Issue | Summary |
|-------|---------|
| #202 | Firefox Quick Find still reported for apostrophe/slash after the original v1.1.0 fix, needs fresh repro on current production |
| #211 | Spaces broken during export |
| #85 | CJK character support, fullwidth characters and IME input |

### Feature Requests, High Priority

| Issue | Summary |
|-------|---------|
| #241 | Customisable line/border/corner styles, including Unicode variants, rounded corners, ASCII mode, dashed lines |
| #361 | Different characters for boxes and lines, likely folds into #241 |
| #43 | Diagonal lines |
| #54 | Export selected area only |
| #346 | PWA support for offline/installable use, likely replaces Electron |

### Feature Requests, Moderate Priority

| Issue | Summary |
|-------|---------|
| #162 | Vertical/horizontal flip and 90-degree rotation |
| #76 | Auto-centre text within boxes |
| #324 | Remember cursor position across select/text tool switches |
| #240 | Text tool insert mode in addition to overwrite |
| #303 | Ctrl+arrow for word navigation in text mode |
| #337 | Distinguishing crossing arrows, for example ╫ or similar |
| #259 | Table generator with specified rows/columns |
| #200 | Drag/move with arrow keys |
| #197 | Set exact size for lines/boxes |

### Feature Requests, Lower Priority / Longer Term

| Issue | Summary |
|-------|---------|
| #44 | Configurable or limited drawing area |
| #229 | Circle/ellipse support |
| #134 | Trapezoid/mux shapes |
| #336 | Colour support |
| #273 | Pixel-perfect freeform lines |
| #219 | Copy/paste characters in freeform mode |

### Non-action / community

| Issue | Summary |
|-------|---------|
| #369 | Thank-you issue. Needs a friendly reply and can probably be closed afterwards. |
