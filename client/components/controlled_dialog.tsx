import * as React from "react";
import { Button, Dialog, DialogActions, DialogProps } from "@material-ui/core";

export function ControlledDialog({
  button,
  confirmButton,
  children,
  ...rest
}: Omit<DialogProps, "open"> & {
  button: React.ReactNode;
  confirmButton?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <span onClick={(e) => setOpen(true)}>{button}</span>
      <Dialog {...rest} open={Boolean(open)} onClose={() => setOpen(null)}>
        {children}
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          {confirmButton && (
            <span onClick={() => setOpen(false)}>{confirmButton}</span>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
