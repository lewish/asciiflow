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

Re-triaged February 2026. See GitHub issues for full details.

### Fixed in staging (merged to main, pending production deploy)

| Issue | Summary |
|-------|---------|
| #258 | Blurry canvas on HiDPI/Retina displays — DPR scaling implemented |
| #189 | Ctrl+Z triggers browser undo — preventDefault added |
| #202 | Apostrophe/slash triggers Firefox Quick Find — preventDefault added |
| #193 | Backspace in text mode doesn't move cursor |
| #332 | Undo while entering text reverts previous drawing action |
| #307 | Delete doesn't work for first scene |
| #321 | Side-scroll wheel only zooms out |
| #28 | Pan/zoom UX — scroll pans, Cmd+scroll zooms |
| #129 | Two-finger swipe panning |
| #195 | Space-to-pan in text mode |
| #297 | Space and Delete in text mode |
| #187 | Line breaks in paste — line ending normalization |
| #338 | Copy/paste on macOS Safari/Firefox — native clipboard events |
| #246 | Visible gridlines — toggle in view panel |
| #238 | Usability review — closed, bulk addressed by terminal UI overhaul |

### Open bugs

| Issue | Summary |
|-------|---------|
| #211 | Spaces broken during export |
| #85 | CJK character support (fullwidth characters, IME input) |

### Feature Requests — High Priority

| Issue | Summary |
|-------|---------|
| #241 | Customisable line/border/corner styles (Unicode box-drawing variants, rounded corners, ASCII mode, dashed lines) |
| #43 | Diagonal lines |
| #54 | Export selected area only |
| #190 | Mobile device support (toolbar is responsive, needs touch gesture work) |
| #346 | PWA support for offline/installable use (replaces Electron) |
| #339 | Emoji support (wide character rendering) |

### Feature Requests — Moderate Priority

| Issue | Summary |
|-------|---------|
| #162 | Vertical/horizontal flip and 90-degree rotation |
| #76 | Auto-centre text within boxes |
| #73 | Show x,y dimensions when drawing boxes |
| #324 | Remember cursor position across select/text tool switches |
| #240 | Text tool insert mode (in addition to overwrite) |
| #303 | Ctrl+arrow for word navigation in text mode |
| #337 | Distinguishing crossing arrows (╫ or similar) |
| #259 | Table generator with specified rows/columns |
| #200 | Drag/move with arrow keys |
| #197 | Set exact size for lines/boxes |

### Feature Requests — Lower Priority / Longer Term

| Issue | Summary |
|-------|---------|
| #58 | Object model for manipulating individual elements |
| #44 | Configurable/limited drawing area |
| #229 | Circle/ellipse support |
| #134 | Trapezoid/mux shapes |
| #336 | Colour support |
| #228 | Block elements (▀▄█░▒▓) in freeform mode |
| #273 | Pixel-perfect freeform lines |
| #274 | Auto-hide/show toolbar on hover (rethink with new top bar) |
| #219 | Copy/paste characters in freeform mode |
| #296 | VS Code extension (community — ASCIIFlow is MIT) |
