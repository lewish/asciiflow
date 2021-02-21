import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextareaAutosize,
} from "@material-ui/core";
import { ControlledDialog } from "asciiflow/client/components/controlled_dialog";
import { ASCII, UNICODE } from "asciiflow/client/constants";
import * as styles from "asciiflow/client/export.css";
import { DrawingId, store } from "asciiflow/client/store";
import { layerToText } from "asciiflow/client/text_utils";
import { useObserver } from "mobx-react";
import * as React from "react";

export interface IExportConfig {
  wrapper?: "star" | "hash" | "slash" | "dash";
  indent?: number;
  characters?: "basic" | "extended";
}

export function ExportDialog({
  button,
  drawingId,
}: {
  button: React.ReactNode;
  drawingId: DrawingId;
}) {
  return useObserver(() => {
    const [open, setOpen] = React.useState(false);
    const exportConfig = store.exportConfig.get();
    // Only compute the text if the dialog is open.
    const drawingText = open
      ? applyConfig(layerToText(store.canvas(drawingId).rendered), exportConfig)
      : "";
    return (
      <>
        <span onClick={(e) => setOpen(true)}>{button}</span>
        <Dialog open={Boolean(open)} onClose={() => setOpen(null)}>
          <DialogTitle>Export drawing</DialogTitle>
          <DialogContent>
            <div>
              <FormControl>
                <InputLabel>Character set</InputLabel>
                <Select
                  value={exportConfig.characters ?? "extended"}
                  onChange={(e) =>
                    store.exportConfig.set({
                      ...exportConfig,
                      characters: e.target.value as any,
                    })
                  }
                >
                  <MenuItem value={"extended"}>ASCII Extended</MenuItem>
                  <MenuItem value={"basic"}>ASCII Basic</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div>
              <FormControl>
                <InputLabel>Comment type</InputLabel>
                <Select
                  value={exportConfig.wrapper || "none"}
                  onChange={(e) =>
                    store.exportConfig.set({
                      ...exportConfig,
                      wrapper: e.target.value as any,
                    })
                  }
                >
                  <MenuItem value={"none"}>None</MenuItem>
                  <MenuItem value={"star"}>
                    Standard multi-line <CommentTypeChip label="/* */" />
                  </MenuItem>
                  <MenuItem value={"hash"}>
                    Hashes <CommentTypeChip label="#" />
                  </MenuItem>
                  <MenuItem value={"slash"}>
                    Slashes <CommentTypeChip label="//" />
                  </MenuItem>
                  <MenuItem value={"dash"}>
                    Dashes <CommentTypeChip label="--" />
                  </MenuItem>
                </Select>
              </FormControl>
            </div>
            <TextareaAutosize value={drawingText} className={styles.textArea} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  });
}

function CommentTypeChip({ label }: { label: React.ReactNode }) {
  return (
    <Chip
      style={{ marginLeft: "5px" }}
      label={
        <span style={{ fontFamily: "monospace", fontSize: 12 }}>{label}</span>
      }
      size="small"
    />
  );
}

function applyConfig(text: string, exportConfig: IExportConfig) {
  function lines() {
    return text.split("\n");
  }
  function setLines(lines: string[]) {
    text = lines.join("\n");
  }
  if (exportConfig.characters === "basic") {
    const unicodeToAscii = new Map(
      Object.entries(UNICODE).map(([key, value]) => [
        value,
        (ASCII as any)[key],
      ])
    );
    text = [...text]
      .map((value) => unicodeToAscii.get(value) || value)
      .join("");
  }
  if (exportConfig.indent) {
    setLines(
      lines().map((line) => `${Array(exportConfig.indent).fill(" ")}${line}`)
    );
  }
  if (exportConfig.wrapper) {
    if (exportConfig.wrapper === "star") {
      setLines(["/*", ...lines().map((line) => ` * ${line}`), " */"]);
    }
    if (exportConfig.wrapper === "hash") {
      setLines(lines().map((line) => `# ${line}`));
    }
    if (exportConfig.wrapper === "slash") {
      setLines(lines().map((line) => `// ${line}`));
    }
    if (exportConfig.wrapper === "dash") {
      setLines(lines().map((line) => `-- ${line}`));
    }
  }
  return text;
}
