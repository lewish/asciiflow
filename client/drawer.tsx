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
} from "@material-ui/core";
import * as Icons from "@material-ui/icons";
import { useObserver } from "mobx-react";
import { store, ToolMode } from "asciiflow/client/store";

export function Drawer() {
  return useObserver(() => {
    return (
      <MaterialDrawer
        variant="persistent"
        anchor="left"
        open={true}
        className={styles.drawer}
      >
        <div className={styles.header}>
          <img src="/public/logo_full.svg" className={styles.logo} />
          <IconButton onClick={() => {}}>
            <Icons.ChevronLeft />
          </IconButton>
        </div>
        <List>
          <ListItem button={true} selected={store.toolMode === ToolMode.BOX}>
            <ListItemIcon>
              <Icons.CheckBoxOutlineBlank />
            </ListItemIcon>
            <ListItemText primary={"Boxes"} />
          </ListItem>
          <ListItem
            button={true}
            onClick={() => store.setToolMode(ToolMode.SELECT)}
          >
            <ListItemIcon>
              <Icons.NearMe />
            </ListItemIcon>
            <ListItemText primary={"Select & Move"} />
          </ListItem>
          <ListItem button={true}>
            <ListItemIcon>
              <Icons.Gesture />
            </ListItemIcon>
            <ListItemText primary={"Freeform draw"} />
          </ListItem>
          <ListItem
            button={true}
            onClick={() => store.setToolMode(ToolMode.LINES)}
          >
            <ListItemIcon>
              <Icons.TrendingDown />
            </ListItemIcon>
            <ListItemText primary={"Arrows & Lines"} />
            {store.toolMode === ToolMode.LINES ? (
              <Icons.ExpandLess />
            ) : (
              <Icons.ExpandMore />
            )}
          </ListItem>
          <Collapse
            in={store.toolMode === ToolMode.LINES}
            timeout="auto"
            unmountOnExit={true}
          >
            <List component="div" disablePadding={true}>
              <ListItem button={true}>
                <ListItemIcon>
                  <Icons.TrendingUp />
                </ListItemIcon>
                <ListItemText primary={"Arrow"} />
              </ListItem>
              <ListItem button={true}>
                <ListItemIcon>
                  <Icons.ShowChart />
                </ListItemIcon>
                <ListItemText primary={"Line"} />
              </ListItem>
            </List>
          </Collapse>
          <ListItem button={true}>
            <ListItemIcon>
              <Icons.TextFields />
            </ListItemIcon>
            <ListItemText primary={"Text"} />
          </ListItem>
        </List>
      </MaterialDrawer>
    );
  });
}
