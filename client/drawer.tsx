import * as React from "react";
import MaterialDrawer from "@material-ui/core/Drawer";
import * as styles from "asciiflow/client/drawer.css";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse,
  Paper,
  ListItemSecondaryAction,
  ListSubheader,
  Chip,
  MenuItem,
  MenuList,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Fab,
  Popover,
} from "@material-ui/core";
import * as Icons from "@material-ui/icons";
import { useObserver } from "mobx-react";
import { DrawingId, store, ToolMode } from "asciiflow/client/store";
import { ControlledMenu } from "asciiflow/client/components/controlled_menu";
import { IRouteProps } from "asciiflow/client/app";
import { ControlledDialog } from "asciiflow/client/components/controlled_dialog";
import { useHistory } from "react-router";
import { DrawingStringifier } from "asciiflow/client/store/drawing_stringifier";
import { ExportDialog } from "asciiflow/client/export";
import { useState } from "react";
import { ASCII, UNICODE } from "asciiflow/client/constants";

export function Drawer() {
  const history = useHistory();
  return useObserver(() => {
    if (!store.controlsOpen.get()) {
      return (
        <Fab
          className={styles.fab}
          onClick={() => store.controlsOpen.set(!store.controlsOpen.get())}
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
              store.controlsOpen.get()
                ? "/public/logo_full.svg"
                : "/public/logo_min.svg"
            }
            className={styles.logo}
          />

          <IconButton
            onClick={() => store.controlsOpen.set(!store.controlsOpen.get())}
          >
            {store.controlsOpen.get() ? (
              <Icons.ChevronLeft />
            ) : (
              <Icons.ChevronRight />
            )}
          </IconButton>
        </div>

        {store.controlsOpen.get() && (
          <>
            <List>
              <ListItem>
                <ListItemText>File</ListItemText>
                <ListItemSecondaryAction>
                  <ExportDialog
                    button={
                      <IconButton>
                        <Icons.GetApp />
                      </IconButton>
                    }
                    drawingId={store.route}
                  />

                  <NewDrawingButton />
                  <IconButton
                    onClick={() =>
                      store.fileControlsOpen.set(!store.fileControlsOpen.get())
                    }
                  >
                    {store.fileControlsOpen.get() ? (
                      <Icons.ExpandLess />
                    ) : (
                      <Icons.ExpandMore />
                    )}
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {store.fileControlsOpen.get() &&
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
                        <Icons.Share
                          color={
                            store.route.toString() === drawingId.toString()
                              ? "primary"
                              : "inherit"
                          }
                        />
                      ) : (
                        <Icons.FileCopy
                          color={
                            store.route.toString() === drawingId.toString()
                              ? "primary"
                              : "inherit"
                          }
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText>
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
                            <Icons.MoreHoriz />
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
                                    <Icons.Delete />
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
                                <Icons.GetApp />
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
                      store.editControlsOpen.set(!store.editControlsOpen.get())
                    }
                  >
                    {store.editControlsOpen.get() ? (
                      <Icons.ExpandLess />
                    ) : (
                      <Icons.ExpandMore />
                    )}
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {!store.editControlsOpen.get() ? null : store.route.shareSpec ? (
                <>
                  <div className={styles.helpText}>
                    This is a shared drawing. To make edits fork it so it can be
                    saved locally.
                  </div>
                  <div className={styles.helpText}>
                    <ForkDrawingButton drawingId={store.route} />
                  </div>
                </>
              ) : (
                <>
                  <ToolControl
                    name="Boxes"
                    tool={ToolMode.BOX}
                    icon={<Icons.CheckBoxOutlineBlank />}
                  />
                  <ToolControl
                    name="Select & Move"
                    tool={ToolMode.SELECT}
                    icon={<Icons.NearMe />}
                  />
                  <ToolControl
                    name="Freeform"
                    tool={ToolMode.FREEFORM}
                    icon={<Icons.Gesture />}
                  >
                    <ListItemSecondaryAction>
                      <FreeFormCharacterSelect />
                    </ListItemSecondaryAction>
                  </ToolControl>
                  <ToolControl
                    name="Arrow"
                    tool={ToolMode.ARROWS}
                    icon={<Icons.TrendingUp />}
                  />

                  <ToolControl
                    name="Line"
                    tool={ToolMode.LINES}
                    icon={<Icons.ShowChart />}
                  />
                  <ToolControl
                    name="Text"
                    tool={ToolMode.TEXT}
                    icon={<Icons.TextFields />}
                  />
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
                    onClick={() => store.darkMode.set(!store.darkMode.get())}
                  >
                    {store.darkMode.get() ? (
                      <Icons.WbIncandescent />
                    ) : (
                      <Icons.Brightness2Outlined />
                    )}
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      store.helpControlsOpen.set(!store.helpControlsOpen.get())
                    }
                  >
                    {store.helpControlsOpen.get() ? (
                      <Icons.ExpandLess />
                    ) : (
                      <Icons.ExpandMore />
                    )}
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            {store.helpControlsOpen.get() && (
              <div className={styles.helpText}>
                <ToolHelp tool={ToolMode.BOX}>
                  Draw boxes by dragging from one corner to another. Boxes can
                  be resized and moved with the{" "}
                  <Chip
                    icon={<Icons.NearMe />}
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
                    icon={<Icons.NearMe />}
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
                    icon={<Icons.NearMe />}
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
                Pan around the canvas by holding <ShortcutChip label="space" />
                {store.route.shareSpec ? (
                  "."
                ) : (
                  <>
                    {" "}
                    and dragging with the mouse. Use{" "}
                    <ShortcutChip label={`${ctrlOrCmd()} + z`} /> to undo and{" "}
                    <ShortcutChip label={`${ctrlOrCmd()} + shift + z`} /> to
                    redo.
                  </>
                )}{" "}
                You can return to the previous version of ASCIIFlow{" "}
                <a href="legacy">here</a>.
              </div>
            )}
          </>
        )}
      </Paper>
    );
  });
}

function ctrlOrCmd() {
  if (navigator.platform.toLowerCase().startsWith("mac")) {
    return "cmd";
  }
  return "ctrl";
}

function ShortcutChip({ label }: { label: string }) {
  return (
    <Chip
      icon={<Icons.KeyboardOutlined />}
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
  return useObserver(() => {
    return (
      <ListItem
        selected={store.toolMode === props.tool}
        button={true}
        onClick={() => store.setToolMode(props.tool)}
      >
        <ListItemIcon>{props.icon}</ListItemIcon>
        <ListItemText primary={props.name} />
        {props.children}
      </ListItem>
    );
  });
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
  return useObserver(() => {
    return (
      <>
        <Button
          variant="outlined"
          className={styles.freeformCharacterButton}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          {store.freeformCharacter}
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
                  store.freeformCharacter = key;
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
  });
}

function ToolHelp(
  props: React.PropsWithChildren<{
    tool: ToolMode;
  }>
) {
  return useObserver(() => {
    return store.toolMode === props.tool ? <>{props.children}</> : null;
  });
}

function isValidDrawingName(name: string) {
  return !store.localDrawingIds
    .get()
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
          <Icons.Add />
        </IconButton>
      }
      confirmButton={
        <Button
          onClick={() => history.push(DrawingId.local(newDrawingName).href)}
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
          label="Drawing name"
          helperText={!validDrawingName && "Drawing name must be unique."}
          defaultValue={defaultNewDrawingName}
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
            <Icons.Edit />
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
          error={!validDrawingName}
          label="Drawing name"
          helperText={!validDrawingName && "Drawing name already exists."}
          defaultValue={defaultNewDrawingName}
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
              <Icons.Edit />
            </ListItemIcon>
            Fork & edit
          </MenuItem>
        ) : (
          <Button color="primary" startIcon={<Icons.Edit />}>
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
          label="Drawing name"
          helperText={!validDrawingName && "Drawing name already exists."}
          defaultValue={defaultNewDrawingName}
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
        <Icons.Share />
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
