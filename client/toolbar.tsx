import { ASCII, UNICODE } from "#asciiflow/client/constants";
import { ExportDialog } from "#asciiflow/client/export";
import { DrawingId, store, ToolMode, useAppStore } from "#asciiflow/client/store";
import { DrawingStringifier } from "#asciiflow/client/store/drawing_stringifier";
import {
  Button,
  ControlledDialog,
  Kbd,
  Menu,
  MenuItemButton,
  MenuDivider,
  TextField,
  Toast,
} from "#asciiflow/client/ui/components";
import styles from "#asciiflow/client/toolbar.module.css";
import * as React from "react";
import { useState } from "react";
import { useHistory } from "react-router";

// ---------------------------------------------------------------------------
// Tool icon mapping — Unicode characters chosen for cross-platform consistency.
// Uses box-drawing and common symbols available in all modern monospace fonts.
// ---------------------------------------------------------------------------

const TOOLS: Array<{
  mode: ToolMode;
  icon: string;
  label: string;
  testId: string;
  shortcut: string;
}> = [
  { mode: ToolMode.BOX, icon: "\u25A1", label: "Box", testId: "tool-boxes", shortcut: "1" },
  { mode: ToolMode.SELECT, icon: "\u2B9A", label: "Select", testId: "tool-select---move", shortcut: "2" },
  { mode: ToolMode.FREEFORM, icon: "\u270E", label: "Draw", testId: "tool-freeform", shortcut: "3" },
  { mode: ToolMode.ARROWS, icon: "\u2197", label: "Arrow", testId: "tool-arrow", shortcut: "4" },
  { mode: ToolMode.LINES, icon: "\u2500", label: "Line", testId: "tool-line", shortcut: "5" },
  { mode: ToolMode.TEXT, icon: "T", label: "Text", testId: "tool-text", shortcut: "6" },
];

// ---------------------------------------------------------------------------
// Top-level Toolbar component
// ---------------------------------------------------------------------------

export function Toolbar() {
  const darkMode = useAppStore((s) => s.darkMode);
  const route = useAppStore((s) => s.route);
  const selectedToolMode = useAppStore((s) => s.selectedToolMode);
  const altPressed = useAppStore((s) => s.altPressed);
  const freeformCharacter = useAppStore((s) => s.freeformCharacter);
  const canvasVersion = useAppStore((s) => s.canvasVersion);
  const isShared = Boolean(route.shareSpec);

  return (
    <div className={styles.topBar}>
      {/* Row 1: Menu bar */}
      <div className={styles.menuBar}>
        <img
          src="/public/logo_min.svg"
          className={styles.logo}
          alt="ASCIIFlow"
        />

        <FileMenu />

        <ExportDialog
          button={
            <button className={styles.menuBarBtn} data-testid="export-button">
              Export
            </button>
          }
          drawingId={route}
        />

        <HelpButton />

        <div className={styles.menuBarSpacer} />

        {/* Right side: theme toggle + GitHub */}
        <a href="https://github.com/lewish/asciiflow" title="GitHub">
          <button className={styles.iconBtn}>
            {"\u2697"}
          </button>
        </a>
        <button
          className={styles.iconBtn}
          onClick={() => store.setDarkMode(!darkMode)}
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode ? "\u263C" : "\u263E"}
        </button>
      </div>

      {/* Row 2: Tool bar (or shared banner) */}
      {isShared ? (
        <SharedBanner drawingId={route} />
      ) : (
        <div className={styles.toolBar}>
          {TOOLS.map((tool) => (
            <ToolButton
              key={tool.mode}
              mode={tool.mode}
              config={tool}
              active={selectedToolMode === tool.mode}
              altPressed={altPressed}
            />
          ))}

          {selectedToolMode === ToolMode.FREEFORM && (
            <FreeformCharacterPicker />
          )}

          <div className={styles.toolSpacer} />

          <div className={styles.toolBarRight}>
            {!isShared && (
              <>
                <button
                  className={styles.menuBarBtn}
                  onClick={() => store.currentCanvas.undo()}
                  title="Undo"
                >
                  {"\u21A9"}
                  {altPressed && (
                    <> <Kbd>{`${ctrlOrCmd()}+z`}</Kbd></>
                  )}
                </button>
                <button
                  className={styles.menuBarBtn}
                  onClick={() => store.currentCanvas.redo()}
                  title="Redo"
                >
                  {"\u21AA"}
                  {altPressed && (
                    <> <Kbd>{`${ctrlOrCmd()}+shift+z`}</Kbd></>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tool button
// ---------------------------------------------------------------------------

function ToolButton({
  mode,
  config,
  active,
  altPressed,
}: {
  mode: ToolMode;
  config: { icon: string; label: string; testId: string; shortcut: string };
  active: boolean;
  altPressed: boolean;
}) {
  return (
    <button
      className={[styles.toolBtn, active ? styles.toolBtnActive : ""]
        .filter(Boolean)
        .join(" ")}
      onClick={() => store.setToolMode(mode)}
      data-testid={config.testId}
    >
      <span className={styles.toolIcon}>{config.icon}</span>
      {config.label}
      {altPressed && <Kbd>{`alt+${config.shortcut}`}</Kbd>}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Freeform character picker
// ---------------------------------------------------------------------------

const shortcutKeys = [
  ...Object.values(UNICODE),
  ...new Set(Object.values(ASCII)),
  ...Array.from(Array(127 - 33).keys())
    .map((i) => i + 33)
    .map((i) => String.fromCharCode(i)),
];

function FreeformCharacterPicker() {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const freeformCharacter = useAppStore((s) => s.freeformCharacter);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={ref}>
      <button
        className={styles.toolBtn}
        onClick={() => setOpen(!open)}
        title="Pick character"
      >
        [{freeformCharacter}]
      </button>
      {open && (
        <div className={styles.charPicker}>
          {shortcutKeys.map((key, i) => (
            <button
              key={i}
              className={styles.charBtn}
              onClick={() => {
                setOpen(false);
                store.setToolMode(ToolMode.FREEFORM);
                store.setFreeformCharacter(key);
              }}
            >
              {key}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// File menu
// ---------------------------------------------------------------------------

function FileMenu() {
  const history = useHistory();
  const route = useAppStore((s) => s.route);
  const localDrawingIds = useAppStore((s) => s.localDrawingIds);
  const canvasVersion = useAppStore((s) => s.canvasVersion);

  return (
    <Menu
      trigger={<button className={styles.menuBarBtn}>File</button>}
    >
      <NewDrawingMenuItem />
      <MenuDivider />
      <div className={styles.fileList}>
        {store.drawings.map((drawingId) => (
          <FileMenuItem
            key={drawingId.toString()}
            drawingId={drawingId}
            active={route.toString() === drawingId.toString()}
          />
        ))}
      </div>
    </Menu>
  );
}

function FileMenuItem({
  drawingId,
  active,
}: {
  drawingId: DrawingId;
  active: boolean;
}) {
  const history = useHistory();
  const name = drawingId.localId
    ? drawingId.localId
    : drawingId.shareSpec
    ? new DrawingStringifier().deserialize(drawingId.shareSpec).name
    : "Default drawing";
  const size = store.canvas(drawingId).committed.size();
  const isShared = Boolean(drawingId.shareSpec);

  return (
    <div
      className={[styles.fileItem, active ? styles.fileItemActive : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        className={styles.fileItem}
        style={{ padding: 0, flex: 1 }}
        onClick={(e) => {
          history.push(drawingId.href);
          e.preventDefault();
        }}
      >
        <span>{isShared ? "\u2191" : "\u2630"}</span>
        <span className={styles.fileItemName}>{name}</span>
        <span className={styles.fileItemSize}>{size}B</span>
      </button>

      <Menu
        trigger={
          <button className={styles.iconBtn} title="Actions">{"\u22EF"}</button>
        }
        align="right"
      >
        {isShared ? (
          <ForkDrawingMenuItem drawingId={drawingId} />
        ) : (
          <>
            <RenameDrawingMenuItem drawingId={drawingId} />
            <ShareMenuItem drawingId={drawingId} />
            <MenuDivider />
            <DeleteDrawingMenuItem drawingId={drawingId} />
          </>
        )}
      </Menu>
    </div>
  );
}

// ---------------------------------------------------------------------------
// File action menu items
// ---------------------------------------------------------------------------

function NewDrawingMenuItem() {
  const history = useHistory();
  let defaultName = "Untitled drawing";
  for (let i = 2; true; i++) {
    if (!isValidDrawingName(defaultName)) {
      defaultName = `Untitled drawing ${i}`;
    } else {
      break;
    }
  }
  const [name, setName] = useState(defaultName);
  const valid = isValidDrawingName(name);

  return (
    <ControlledDialog
      button={<MenuItemButton>+ New drawing</MenuItemButton>}
      title="New drawing"
      confirmButton={
        <Button
          variant="primary"
          onClick={() => {
            store.setLocalDrawingIds([
              ...store.localDrawingIds,
              DrawingId.local(name),
            ]);
            history.push(DrawingId.local(name).href);
          }}
        >
          Create
        </Button>
      }
    >
      <TextField
        label="Drawing name"
        error={!valid}
        helperText={!valid ? "Name must be unique." : undefined}
        defaultValue={defaultName}
        autoFocus
        onKeyDown={(e) => e.stopPropagation()}
        onChange={(e) => setName(e.target.value)}
      />
    </ControlledDialog>
  );
}

function DeleteDrawingMenuItem({ drawingId }: { drawingId: DrawingId }) {
  const history = useHistory();
  return (
    <ControlledDialog
      button={<MenuItemButton>{"\u2717"} Delete</MenuItemButton>}
      title="Delete drawing"
      confirmButton={
        <Button
          variant="danger"
          onClick={() => {
            store.deleteDrawing(drawingId);
            history.push(
              store.drawings.length > 0
                ? store.drawings[0].href
                : DrawingId.local(null).href
            );
          }}
        >
          Delete
        </Button>
      }
    >
      <p>Are you sure you want to delete this drawing?</p>
    </ControlledDialog>
  );
}

function RenameDrawingMenuItem({ drawingId }: { drawingId: DrawingId }) {
  const history = useHistory();
  const defaultName = drawingId.localId;
  const [name, setName] = useState(defaultName);
  const valid = isValidDrawingName(name);

  return (
    <ControlledDialog
      button={<MenuItemButton>{"\u270F"} Rename</MenuItemButton>}
      title="Rename drawing"
      confirmButton={
        <Button
          variant="primary"
          onClick={() => {
            store.renameDrawing(drawingId.localId, name);
            history.push(DrawingId.local(name).href);
          }}
        >
          Rename
        </Button>
      }
    >
      <TextField
        label="New name"
        error={!valid}
        helperText={!valid ? "Name already exists." : undefined}
        defaultValue={defaultName}
        autoFocus
        onKeyDown={(e) => e.stopPropagation()}
        onChange={(e) => setName(e.target.value)}
      />
    </ControlledDialog>
  );
}

function ForkDrawingMenuItem({ drawingId }: { drawingId: DrawingId }) {
  const history = useHistory();
  const drawing = new DrawingStringifier().deserialize(drawingId.shareSpec);
  const defaultName = drawing.name;
  const [name, setName] = useState(defaultName);
  const valid = isValidDrawingName(name);

  return (
    <ControlledDialog
      button={<MenuItemButton>{"\u2442"} Fork & edit</MenuItemButton>}
      title="Fork drawing"
      confirmButton={
        <Button
          variant="primary"
          onClick={() => {
            store.saveDrawing(drawingId, name);
            history.push(DrawingId.local(name).href);
          }}
        >
          Fork
        </Button>
      }
    >
      <p>Save this shared drawing locally so it can be edited.</p>
      <TextField
        label="Drawing name"
        error={!valid}
        helperText={!valid ? "Name already exists." : undefined}
        defaultValue={defaultName}
        autoFocus
        onKeyDown={(e) => e.stopPropagation()}
        onChange={(e) => setName(e.target.value)}
      />
    </ControlledDialog>
  );
}

function ShareMenuItem({ drawingId }: { drawingId: DrawingId }) {
  const [toastOpen, setToastOpen] = useState(false);
  return (
    <>
      <MenuItemButton
        onClick={() => {
          navigator.clipboard.writeText(
            `${window.location.protocol}//${window.location.host}${window.location.pathname}#${DrawingId.share(store.canvas(drawingId).shareSpec).href})`
          );
          setToastOpen(true);
        }}
      >
        {"\u2197"} Share
      </MenuItemButton>
      <Toast
        open={toastOpen}
        message="Copied link to clipboard"
        onClose={() => setToastOpen(false)}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Shared drawing banner
// ---------------------------------------------------------------------------

function SharedBanner({ drawingId }: { drawingId: DrawingId }) {
  return (
    <div className={styles.sharedBanner}>
      <span>This is a shared drawing (read-only).</span>
      <ForkButton drawingId={drawingId} />
    </div>
  );
}

function ForkButton({ drawingId }: { drawingId: DrawingId }) {
  const history = useHistory();
  const drawing = new DrawingStringifier().deserialize(drawingId.shareSpec);
  const defaultName = drawing.name;
  const [name, setName] = useState(defaultName);
  const valid = isValidDrawingName(name);

  return (
    <ControlledDialog
      button={<Button variant="primary">Fork & edit</Button>}
      title="Fork drawing"
      confirmButton={
        <Button
          variant="primary"
          onClick={() => {
            store.saveDrawing(drawingId, name);
            history.push(DrawingId.local(name).href);
          }}
        >
          Fork
        </Button>
      }
    >
      <p>Save this shared drawing locally so it can be edited.</p>
      <TextField
        label="Drawing name"
        error={!valid}
        helperText={!valid ? "Name already exists." : undefined}
        defaultValue={defaultName}
        autoFocus
        onKeyDown={(e) => e.stopPropagation()}
        onChange={(e) => setName(e.target.value)}
      />
    </ControlledDialog>
  );
}

// ---------------------------------------------------------------------------
// Help panel
// ---------------------------------------------------------------------------

function HelpButton() {
  const [open, setOpen] = useState(false);
  const route = useAppStore((s) => s.route);
  const isShared = Boolean(route.shareSpec);

  return (
    <>
      <button
        className={styles.menuBarBtn}
        onClick={() => setOpen(!open)}
      >
        Help
      </button>
      {open && (
        <>
          <div className={styles.helpOverlay} onClick={() => setOpen(false)} />
          <div className={styles.helpPanel}>
            <div className={styles.helpPanelHeader}>
              <span className={styles.helpPanelTitle}>Help</span>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {"\u2715"}
              </Button>
            </div>

            <p>
              <strong>Tools</strong>
            </p>
            <p>
              <Kbd>Box</Kbd> Draw boxes by dragging from one corner to
              another.
            </p>
            <p>
              <Kbd>Select</Kbd> Click and drag to resize/move boxes, lines,
              and arrows. Select an area then drag to move, or use{" "}
              <Kbd>{ctrlOrCmd()}+c</Kbd> to copy, <Kbd>{ctrlOrCmd()}+v</Kbd>{" "}
              to paste, <Kbd>delete</Kbd> or <Kbd>backspace</Kbd> to erase.
              Hold <Kbd>shift</Kbd> to force selection.
            </p>
            <p>
              <Kbd>Draw</Kbd> Click and drag to draw freeform. Press any key
              to change the character.
            </p>
            <p>
              <Kbd>Arrow</Kbd> / <Kbd>Line</Kbd> Drag from start to end.
              Hold <Kbd>shift</Kbd> to change orientation.
            </p>
            <p>
              <Kbd>Text</Kbd> Click and type. <Kbd>enter</Kbd> to commit.{" "}
              <Kbd>shift+enter</Kbd> or <Kbd>{ctrlOrCmd()}+enter</Kbd> for
              newline. <Kbd>arrow keys</Kbd> to move.
            </p>

            <p>
              <strong>Navigation</strong>
            </p>
            <p>
              Scroll to pan. <Kbd>shift+scroll</Kbd> to pan horizontally.{" "}
              <Kbd>middle-click drag</Kbd> to pan freely.{" "}
              <Kbd>{ctrlOrCmd()}+scroll</Kbd> to zoom.
            </p>
            {!isShared && (
              <p>
                <Kbd>{ctrlOrCmd()}+z</Kbd> undo,{" "}
                <Kbd>{ctrlOrCmd()}+shift+z</Kbd> redo.
              </p>
            )}
            <p>
              Hold <Kbd>alt</Kbd> to view tool shortcuts.
            </p>
          </div>
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function ctrlOrCmd() {
  if (navigator.platform.toLowerCase().startsWith("mac")) {
    return "cmd";
  }
  return "ctrl";
}

function isValidDrawingName(name: string) {
  return !store.localDrawingIds.some(
    (drawingId) =>
      DrawingId.local(name).toString() === drawingId.toString()
  );
}
