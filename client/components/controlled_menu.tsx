import * as React from "react";
import { Menu, MenuProps } from "@material-ui/core";

export function ControlledMenu({
  button,
  ...rest
}: Omit<MenuProps, "open"> & { button: React.ReactNode }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  return (
    <>
      <span onClick={(e) => setAnchorEl(e.currentTarget)}>{button}</span>
      <Menu
        {...rest}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      />
    </>
  );
}
