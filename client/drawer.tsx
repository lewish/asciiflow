import { ControlledDialog } from "#asciiflow/client/components/controlled_dialog";
import { ControlledMenu } from "#asciiflow/client/components/controlled_menu";
import { ASCII, UNICODE } from "#asciiflow/client/constants";
import styles from "#asciiflow/client/drawer.module.css";
import { ExportDialog } from "#asciiflow/client/export";
import { DrawingId, store, ToolMode, useAppStore } from "#asciiflow/client/store";
import { DrawingStringifier } from "#asciiflow/client/store/drawing_stringifier";
import {
  Button,
  Chip,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Popover,
  Snackbar,
  TextField,
} from "@material-ui/core";
import Add from "@material-ui/icons/Add";
import Brightness2Outlined from "@material-ui/icons/Brightness2Outlined";
import CheckBoxOutlineBlank from "@material-ui/icons/CheckBoxOutlineBlank";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Delete from "@material-ui/icons/Delete";
import Edit from "@material-ui/icons/Edit";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import FileCopy from "@material-ui/icons/FileCopy";
import Gesture from "@material-ui/icons/Gesture";
import GetApp from "@material-ui/icons/GetApp";
import KeyboardOutlined from "@material-ui/icons/KeyboardOutlined";
import MoreHoriz from "@material-ui/icons/MoreHoriz";
import NearMe from "@material-ui/icons/NearMe";
import Share from "@material-ui/icons/Share";
import ShowChart from "@material-ui/icons/ShowChart";
import TextFields from "@material-ui/icons/TextFields";
import TrendingUp from "@material-ui/icons/TrendingUp";
import WbIncandescent from "@material-ui/icons/WbIncandescent";
import * as React from "react";
import { useState } from "react";
import { useHistory } from "react-router";

export function Drawer() {
  const history = useHistory();
  const controlsOpen = useAppStore((s) => s.controlsOpen);
  const fileControlsOpen = useAppStore((s) => s.fileControlsOpen);
  const editControlsOpen = useAppStore((s) => s.editControlsOpen);
  const helpControlsOpen = useAppStore((s) => s.helpControlsOpen);
  const darkMode = useAppStore((s) => s.darkMode);
  const route = useAppStore((s) => s.route);
  const selectedToolMode = useAppStore((s) => s.selectedToolMode);
  const localDrawingIds = useAppStore((s) => s.localDrawingIds);
  const canvasVersion = useAppStore((s) => s.canvasVersion);

  if (!controlsOpen) {
    return (
      <Fab
        className={styles.fab}
        onClick={() => store.setControlsOpen(!controlsOpen)}
      >
        <img src={"/public/logo_min.svg"} />
      </Fab>
    );
  }
  return (
    <Paper elevation={3} className={styles.drawer}>
      <div className={styles.header}>
        <img
          src={
            controlsOpen
              ? "/public/logo_full.svg"
              : "/public/logo_min.svg"
          }
          className={styles.logo}
        />

        <IconButton
          onClick={() => store.setControlsOpen(!controlsOpen)}
        >
          {controlsOpen ? (
            <ChevronLeft />
          ) : (
            <ChevronRight />
          )}
        </IconButton>
      </div>

      {controlsOpen && (
        <>
          <List>
            <ListItem>
              <ListItemText>File</ListItemText>
              <ListItemSecondaryAction>
                <ExportDialog
                  button={
                    <IconButton data-testid="export-button">
                      <GetApp />
                    </IconButton>
                  }
                  drawingId={route}
                />

                <NewDrawingButton />
                <IconButton
                  onClick={() =>
                    store.setFileControlsOpen(!fileControlsOpen)
                  }
                >
                  {fileControlsOpen ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {fileControlsOpen &&
              store.drawings.map((drawingId) => (
                <ListItem
                  key={drawingId.toString()}
                  component="a"
                  href={drawingId.href}
                  onClick={(e: React.MouseEvent) => {
                    history.push(drawingId.href);
                    e.preventDefault();
                  }}
                >
                  <ListItemIcon>
                    {drawingId.shareSpec ? (
                      <Share
                        color={
                          route.toString() === drawingId.toString()
                            ? "primary"
                            : "inherit"
                        }
                      />
                    ) : (
                      <FileCopy
                        color={
                          route.toString() === drawingId.toString()
                            ? "primary"
                            : "inherit"
                        }
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText className={styles.filenameText}>
                    {drawingId.localId
                      ? drawingId.localId
                      : drawingId.shareSpec
                      ? new DrawingStringifier().deserialize(
                          drawingId.shareSpec
                        ).name
                      : "Default drawing"}{" "}
                    <span className={styles.bytesLabel}>
                      ({store.canvas(drawingId).committed.size()}B)
                    </span>
                  </ListItemText>
                  <ListItemSecondaryAction>
                    <ControlledMenu
                      button={
                        <IconButton>
                          <MoreHoriz />
                        </IconButton>
                      }
                    >
                      {drawingId.shareSpec ? (
                        <ForkDrawingButton
                          drawingId={drawingId}
                          menu={true}
                        />
                      ) : (
                        <>
                          <ControlledDialog
                            button={
                              <MenuItem>
                                <ListItemIcon>
                                  <Delete />
                                </ListItemIcon>
                                Delete
                              </MenuItem>
                            }
                            confirmButton={
                              <Button
                                onClick={() => {
                                  store.deleteDrawing(drawingId);
                                  history.push(
                                    store.drawings.length > 0
                                      ? store.drawings[0].href
                                      : DrawingId.local(null).href
                                  );
                                }}
                                color="secondary"
                              >
                                Delete
                              </Button>
                            }
                          >
                            <DialogTitle>Delete drawing</DialogTitle>
                            <DialogContent>
                              Are you sure you want to delete this drawing?
                            </DialogContent>
                          </ControlledDialog>

                          <RenameDrawingButton drawingId={drawingId} />
                          <ShareButton drawingId={drawingId} />
                        </>
                      )}
                      <ExportDialog
                        button={
                          <MenuItem>
                            <ListItemIcon>
                              <GetApp />
                            </ListItemIcon>
                            Export
                          </MenuItem>
                        }
                        drawingId={drawingId}
                      />
                    </ControlledMenu>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}

            <ListItem>
              <ListItemText>Edit</ListItemText>
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() =>
                    store.setEditControlsOpen(!editControlsOpen)
                  }
                >
                  {editControlsOpen ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {!editControlsOpen ? null : route
                .shareSpec ? (
              <>
                <div className={styles.helpText}>
                  This is a shared drawing. To make edits fork it so it can be
                  saved locally.
                </div>
                <div className={styles.helpText}>
                  <ForkDrawingButton drawingId={route} />
                </div>
              </>
            ) : (
              <>
                <ToolControl
                  name="Boxes"
                  tool={ToolMode.BOX}
                  icon={<CheckBoxOutlineBlank />}
                >
                  <ShortcutChip label={"alt + 1"} hideUntilAlt={true} />
                </ToolControl>
                <ToolControl
                  name="Select & Move"
                  tool={ToolMode.SELECT}
                  icon={<NearMe />}
                >
                  <ShortcutChip label={"alt + 2"} hideUntilAlt={true} />
                </ToolControl>
                <ToolControl
                  name="Freeform"
                  tool={ToolMode.FREEFORM}
                  icon={<Gesture />}
                >
                  <ListItemSecondaryAction>
                    <ShortcutChip label={"alt + 3"} hideUntilAlt={true} />
                    <FreeFormCharacterSelect />
                  </ListItemSecondaryAction>
                </ToolControl>
                <ToolControl
                  name="Arrow"
                  tool={ToolMode.ARROWS}
                  icon={<TrendingUp />}
                >
                  <ShortcutChip label={"alt + 4"} hideUntilAlt={true} />
                </ToolControl>

                <ToolControl
                  name="Line"
                  tool={ToolMode.LINES}
                  icon={<ShowChart />}
                >
                  <ShortcutChip label={"alt + 5"} hideUntilAlt={true} />
                </ToolControl>
                <ToolControl
                  name="Text"
                  tool={ToolMode.TEXT}
                  icon={<TextFields />}
                >
                  <ShortcutChip label={"alt + 6"} hideUntilAlt={true} />
                </ToolControl>
              </>
            )}
            <ListItem>
              <ListItemText>Help</ListItemText>
              <ListItemSecondaryAction>
                <a href="https://github.com/lewish/asciiflow">
                  <IconButton>
                    <img
                      className={styles.githubMark}
                      width="24"
                      height="24"
                      src="public/github_mark.png"
                    />
                  </IconButton>
                </a>
                <IconButton
                  onClick={() => store.setDarkMode(!darkMode)}
                >
                  {darkMode ? (
                    <WbIncandescent />
                  ) : (
                    <Brightness2Outlined />
                  )}
                </IconButton>
                <IconButton
                  onClick={() =>
                    store.setHelpControlsOpen(!helpControlsOpen)
                  }
                >
                  {helpControlsOpen ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </List>

          {helpControlsOpen && (
            <div className={styles.helpText}>
              <ToolHelp tool={ToolMode.BOX}>
                Draw boxes by dragging from one corner to another. Boxes can
                be resized and moved with the{" "}
                <Chip
                  icon={<NearMe />}
                  label="Select & Move"
                  size="small"
                />{" "}
                tool.
              </ToolHelp>
              <ToolHelp tool={ToolMode.SELECT}>
                Click and drag on any boxes, lines, or arrows to resize and
                move them. Select any area and then drag to move it, or use{" "}
                <ShortcutChip label={`${ctrlOrCmd()} + c`} /> to copy,{" "}
                <ShortcutChip label={`${ctrlOrCmd()} + v`} /> to paste, and{" "}
                <ShortcutChip label="delete" /> or{" "}
                <ShortcutChip label="backspace" /> to erase. Hold{" "}
                <ShortcutChip label="shift" /> to force selection mode instead
                of resize mode.
              </ToolHelp>
              <ToolHelp tool={ToolMode.LINES}>
                Draw a line from dragging from the start to the end point.
                Hold <ShortcutChip label={"shift"} /> to change the
                orientation of the line. Lines can be resized and moved with
                the{" "}
                <Chip
                  icon={<NearMe />}
                  label="Select & Move"
                  size="small"
                />{" "}
                tool.
              </ToolHelp>
              <ToolHelp tool={ToolMode.ARROWS}>
                Draw an arrow from dragging from the start to the end point.
                Hold <ShortcutChip label={"shift"} /> to change the
                orientation of the line. Lines can be resized and moved with
                the{" "}
                <Chip
                  icon={<NearMe />}
                  label="Select & Move"
                  size="small"
                />{" "}
                tool.
              </ToolHelp>
              <ToolHelp tool={ToolMode.FREEFORM}>
                Click and drag to draw freeform characters. Select from the
                menu, or press any key on the keyboard to change the character
                that will be drawn.
              </ToolHelp>
              <ToolHelp tool={ToolMode.TEXT}>
                Click on any square and start typing. Press{" "}
                <ShortcutChip label={"enter"} /> to save your changes. Press
                either <ShortcutChip label={"shift + enter"} /> or{" "}
                <ShortcutChip label={`${ctrlOrCmd()} + enter`} /> to start a
                new line without committing your changes. Use the{" "}
                <ShortcutChip label={"arrow keys"} /> to move around.
              </ToolHelp>{" "}
              Scroll to pan.{" "}
              <ShortcutChip label="shift + scroll" /> to pan horizontally.{" "}
              <ShortcutChip label="middle-click drag" /> to pan freely.{" "}
              <ShortcutChip label={`${ctrlOrCmd()} + scroll`} /> to zoom.
              {!route.shareSpec && (
                <>
                  {" "}
                  <ShortcutChip label={`${ctrlOrCmd()} + z`} /> to undo,{" "}
                  <ShortcutChip label={`${ctrlOrCmd()} + shift + z`} /> to
                  redo.
                </>
              )}{" "}
              View shortcuts by pressing <ShortcutChip label={"alt"} />.
            </div>
          )}
        </>
      )}
    </Paper>
  );
}

function ctrlOrCmd() {
  if (navigator.platform.toLowerCase().startsWith("mac")) {
    return "cmd";
  }
  return "ctrl";
}

function ShortcutChip({
  label,
  hideUntilAlt,
}: {
  label: string;
  hideUntilAlt?: boolean;
}) {
  const altPressed = useAppStore((s) => s.altPressed);
  if (hideUntilAlt && !altPressed) return null;
  return (
    <Chip
      icon={<KeyboardOutlined />}
      label={
        <span style={{ fontFamily: "monospace", fontSize: 12 }}>{label}</span>
      }
      size="small"
    />
  );
}

function ToolControl(
  props: React.PropsWithChildren<{
    tool: ToolMode;
    name: React.ReactNode;
    icon: React.ReactNode;
  }>
) {
  const selectedToolMode = useAppStore((s) => s.selectedToolMode);
  const route = useAppStore((s) => s.route);
  const toolMode = route.shareSpec ? undefined : selectedToolMode;
  const testId = typeof props.name === "string"
    ? `tool-${props.name.toLowerCase().replace(/[^a-z]/g, "-")}`
    : undefined;
  return (
    <ListItem
      selected={toolMode === props.tool}
      button={true}
      onClick={() => store.setToolMode(props.tool)}
      data-testid={testId}
    >
      <ListItemIcon>{props.icon}</ListItemIcon>
      <ListItemText primary={props.name} />
      {props.children}
    </ListItem>
  );
}

const shortcutKeys = [
  ...Object.values(UNICODE),
  ...new Set(Object.values(ASCII)),
  // All the standard ascii characters.
  ...Array.from(Array(127 - 33).keys())
    .map((i) => i + 33)
    .map((i) => String.fromCharCode(i)),
];
function FreeFormCharacterSelect() {
  const [anchorEl, setAnchorEl] = useState(null);
  const freeformCharacter = useAppStore((s) => s.freeformCharacter);
  return (
    <>
      <Button
        variant="outlined"
        className={styles.freeformCharacterButton}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        {freeformCharacter}
      </Button>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        onClose={() => setAnchorEl(null)}
      >
        <div style={{ maxWidth: 400 }}>
          {shortcutKeys.map((key, i) => (
            <Button
              onClick={() => {
                setAnchorEl(null);
                store.setToolMode(ToolMode.FREEFORM);
                store.setFreeformCharacter(key);
              }}
              className={styles.freeformCharacterButton}
              key={i}
            >
              {key}
            </Button>
          ))}
        </div>
      </Popover>
    </>
  );
}

function ToolHelp(
  props: React.PropsWithChildren<{
    tool: ToolMode;
  }>
) {
  const selectedToolMode = useAppStore((s) => s.selectedToolMode);
  const route = useAppStore((s) => s.route);
  const toolMode = route.shareSpec ? undefined : selectedToolMode;
  return toolMode === props.tool ? <>{props.children}</> : null;
}

function isValidDrawingName(name: string) {
  return !store.localDrawingIds
    .some(
      (drawingId) => DrawingId.local(name).toString() === drawingId.toString()
    );
}

function NewDrawingButton() {
  const history = useHistory();
  let defaultNewDrawingName = "Untitled drawing";
  for (let i = 2; true; i++) {
    if (!isValidDrawingName(defaultNewDrawingName)) {
      defaultNewDrawingName = `Untitled drawing ${i}`;
    } else {
      break;
    }
  }
  const [newDrawingName, setNewDrawingName] = React.useState(
    defaultNewDrawingName
  );
  const validDrawingName = isValidDrawingName(newDrawingName);
  return (
    <ControlledDialog
      button={
        <IconButton>
          <Add />
        </IconButton>
      }
      confirmButton={
        <Button
          onClick={() => {
            store.setLocalDrawingIds([
              ...store.localDrawingIds,
              DrawingId.local(newDrawingName),
            ]);
            history.push(DrawingId.local(newDrawingName).href);
          }}
          color="primary"
        >
          Create
        </Button>
      }
    >
      <DialogTitle>Create a new drawing</DialogTitle>
      <DialogContent>Provide a name for the drawing.</DialogContent>
      <DialogContent>
        <TextField
          error={!validDrawingName}
          autoFocus={true}
          label="Drawing name"
          helperText={!validDrawingName && "Drawing name must be unique."}
          defaultValue={defaultNewDrawingName}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) => setNewDrawingName(e.target.value)}
        />
      </DialogContent>
    </ControlledDialog>
  );
}

function RenameDrawingButton({ drawingId }: { drawingId: DrawingId }) {
  const history = useHistory();
  const defaultNewDrawingName = drawingId.localId;
  const [newDrawingName, setNewDrawingName] = React.useState(
    defaultNewDrawingName
  );
  const validDrawingName = isValidDrawingName(newDrawingName);
  return (
    <ControlledDialog
      button={
        <MenuItem>
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          Rename
        </MenuItem>
      }
      confirmButton={
        <Button
          onClick={() => {
            store.renameDrawing(drawingId.localId, newDrawingName);
            history.push(DrawingId.local(newDrawingName).href);
          }}
          color="primary"
        >
          Create
        </Button>
      }
    >
      <DialogTitle>Rename drawing</DialogTitle>
      <DialogContent>Provide a new name for the drawing.</DialogContent>
      <DialogContent>
        <TextField
          autoFocus={true}
          error={!validDrawingName}
          label="Drawing name"
          helperText={!validDrawingName && "Drawing name already exists."}
          defaultValue={defaultNewDrawingName}
          onKeyDown={e => e.stopPropagation()}
          onChange={(e) => setNewDrawingName(e.target.value)}
        />
      </DialogContent>
    </ControlledDialog>
  );
}

function ForkDrawingButton({
  drawingId,
  menu,
}: {
  drawingId: DrawingId;
  menu?: boolean;
}) {
  const history = useHistory();
  const drawing = new DrawingStringifier().deserialize(drawingId.shareSpec);
  const defaultNewDrawingName = drawing.name;
  const [newDrawingName, setNewDrawingName] = React.useState(
    defaultNewDrawingName
  );
  const validDrawingName = isValidDrawingName(newDrawingName);
  return (
    <ControlledDialog
      button={
        menu ? (
          <MenuItem>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            Fork & edit
          </MenuItem>
        ) : (
          <Button color="primary" startIcon={<Edit />}>
            Fork & edit
          </Button>
        )
      }
      confirmButton={
        <Button
          onClick={() => {
            store.saveDrawing(drawingId, newDrawingName);
            history.push(DrawingId.local(newDrawingName).href);
          }}
          color="primary"
        >
          Fork
        </Button>
      }
    >
      <DialogTitle>Fork drawing</DialogTitle>
      <DialogContent>
        Save this shared drawing locally so it can be edited.
      </DialogContent>
      <DialogContent>
        <TextField
          error={!validDrawingName}
          autoFocus={true}
          label="Drawing name"
          helperText={!validDrawingName && "Drawing name already exists."}
          defaultValue={defaultNewDrawingName}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) => setNewDrawingName(e.target.value)}
        />
      </DialogContent>
    </ControlledDialog>
  );
}

function ShareButton({ drawingId }: { drawingId: DrawingId }) {
  const [open, setOpen] = React.useState(false);
  return (
    <MenuItem
      onClick={() => {
        navigator.clipboard.writeText(
          `${window.location.protocol}//${window.location.host}${
            window.location.pathname
          }#${DrawingId.share(store.canvas(drawingId).shareSpec).href})`
        );
        setOpen(true);
      }}
    >
      <ListItemIcon>
        <Share />
      </ListItemIcon>
      Share
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        message="Copied link to clipboard"
        action={
          <Button color="secondary" size="small" onClick={() => setOpen(false)}>
            Dismiss
          </Button>
        }
      />
    </MenuItem>
  );
}
