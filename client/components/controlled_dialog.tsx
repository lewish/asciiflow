import * as React from "react";
import { Dialog, DialogProps } from "@material-ui/core";

export function ControlledDialog({
  button,
  ...rest
}: Omit<DialogProps, "open"> & { button: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <span onClick={(e) => setOpen(true)}>{button}</span>
      <Dialog {...rest} open={Boolean(open)} onClose={() => setOpen(null)} />
    </>
  );
}
