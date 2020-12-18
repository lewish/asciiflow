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
          />
          <ListItem
            button={true}
            onClick={() => store.setToolMode(ToolMode.LINES)}
          >
            <ListItemIcon>
              <Icons.TrendingDown />
            </ListItemIcon>
            <ListItemText primary={"Arrows & Lines1"} />
            {store.toolMode === ToolMode.LINES ? (
              <Icons.ExpandLess />
            ) : (
              <Icons.ExpandMore />
            )}
          </ListItem>
          <Collapse
            in={
              store.toolMode === ToolMode.LINES ||
              store.toolMode === ToolMode.ARROWS
            }
            timeout="auto"
            unmountOnExit={false}
          >
            <List component="div" disablePadding={true}>
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
            </List>
          </Collapse>
          <ToolControl
            name="Text"
            tool={ToolMode.TEXT}
            icon={<Icons.TextFields />}
          />
        </List>
      </MaterialDrawer>
    );
  });
}

function ToolControl(
  props: React.PropsWithChildren<{
    tool: ToolMode;
    name: string;
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
        {props.children && (
          <Collapse
            in={store.toolMode === props.tool}
            timeout="auto"
            unmountOnExit={true}
          >
            {props.children}
          </Collapse>
        )}
      </ListItem>
    );
  });
}
