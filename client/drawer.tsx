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
} from "@material-ui/core";
import * as Icons from "@material-ui/icons";
import { useObserver } from "mobx-react";
import { DrawingId, store, ToolMode } from "asciiflow/client/store";
import { ControlledMenu } from "asciiflow/client/components/controlled_menu";
import { IRouteProps } from "asciiflow/client/app";
import { ControlledDialog } from "asciiflow/client/components/controlled_dialog";
import { useHistory } from "react-router";

export function Drawer() {
  const history = useHistory();
  return useObserver(() => {
    return (
      <Paper elevation={3} className={styles.drawer}>
        <div className={styles.header}>
          <img src="/public/logo_full.svg" className={styles.logo} />

          <IconButton
            onClick={() => store.controlsOpen.set(!store.controlsOpen.get())}
          >
            {store.controlsOpen.get() ? (
              <Icons.ExpandLess />
            ) : (
              <Icons.ExpandMore />
            )}
          </IconButton>
        </div>

        {store.controlsOpen.get() && (
          <List>
            <ListItem>
              <ListItemText>File</ListItemText>
              <ListItemSecondaryAction>
                <IconButton>
                  <Icons.GetApp />
                </IconButton>
                <NewDrawingButton />
                <IconButton>
                  <Icons.ExpandLess />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {store.drawings.get().map((drawingId) => (
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
                  <Icons.FileCopy
                    color={
                      store.route.toString() === drawingId.toString()
                        ? "primary"
                        : "inherit"
                    }
                  />
                </ListItemIcon>
                <ListItemText>
                  {drawingId.localId || "Default drawing"}{" "}
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
                          onClick={() => store.deleteDrawing(drawingId)}
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
                  </ControlledMenu>
                </ListItemSecondaryAction>
              </ListItem>
            ))}

            <ListItem>
              <ListItemText>Edit</ListItemText>
              <ListItemSecondaryAction>
                <IconButton>
                  <Icons.ExpandLess />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
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
                <Chip
                  variant="outlined"
                  style={{ marginRight: 10 }}
                  label={
                    <span className={styles.freeformLabel}>
                      {store.freeformCharacter}
                    </span>
                  }
                />
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
            <ListItem>
              <ListItemText>Help</ListItemText>
              <ListItemSecondaryAction>
                <IconButton>
                  <Icons.ExpandLess />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        )}
        <div className={styles.helpText}>
          <ToolHelp tool={ToolMode.BOX}>
            Draw boxes by dragging from one corner to another. Boxes can be
            resized and moved with the{" "}
            <Chip icon={<Icons.NearMe />} label="Select & Move" size="small" />{" "}
            tool.
          </ToolHelp>
          <ToolHelp tool={ToolMode.SELECT}>
            Click and drag on any boxes, lines, or arrows to resize and move
            them. Select any area and then drag to move it, or use{" "}
            <ShortcutChip label="ctrl + c" /> to copy,{" "}
            <ShortcutChip label="ctrl + v" /> to paste, and{" "}
            <ShortcutChip label="delete" /> or{" "}
            <ShortcutChip label="backspace" /> to erase. Hold{" "}
            <ShortcutChip label="shift" /> to force selection mode instead of
            resize mode.
          </ToolHelp>
          <ToolHelp tool={ToolMode.LINES}>
            Draw a line from dragging from the start to the end point. Hold{" "}
            <ShortcutChip label={"shift"} /> to change the orientation of the
            line. Lines can be resized and moved with the{" "}
            <Chip icon={<Icons.NearMe />} label="Select & Move" size="small" />{" "}
            tool.
          </ToolHelp>
          <ToolHelp tool={ToolMode.ARROWS}>
            Draw an arrow from dragging from the start to the end point. Hold{" "}
            <ShortcutChip label={"shift"} /> to change the orientation of the
            line. Lines can be resized and moved with the{" "}
            <Chip icon={<Icons.NearMe />} label="Select & Move" size="small" />{" "}
            tool.
          </ToolHelp>
          <ToolHelp tool={ToolMode.FREEFORM}>
            Click and drag to draw freeform characters. Press any key on the
            keyboard to change the character that will be drawn.
          </ToolHelp>
          <ToolHelp tool={ToolMode.TEXT}>
            Click on any square and start typing. Press{" "}
            <ShortcutChip label={"enter"} /> to save your changes. Press either{" "}
            <ShortcutChip label={"shift + enter"} /> or{" "}
            <ShortcutChip label={"ctrl + enter"} /> to start a new line without
            committing your changes. Use the{" "}
            <ShortcutChip label={"arrow keys"} /> to move around.
          </ToolHelp>
          <br />
          Pan around the canvas by holding <ShortcutChip label="space" /> and
          dragging with the mouse. Use <ShortcutChip label="ctrl + z" /> to undo
          and <ShortcutChip label="ctrl + shift + z" /> to redo.
        </div>
      </Paper>
    );
  });
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
  return !store.drawings
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
  let defaultNewDrawingName = drawingId.localId;
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
          helperText={
            !validDrawingName && "Drawing name must be unique and different."
          }
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
            DrawingId.share(store.canvas(drawingId).shareSpec).href
          })`
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
