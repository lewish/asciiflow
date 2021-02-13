import {
  DialogTitle,
  FormControlLabel,
  FormGroup,
  TextareaAutosize,
  Checkbox,
  DialogContent,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@material-ui/core";

import { ControlledDialog } from "asciiflow/client/components/controlled_dialog";
import { DrawingId, store } from "asciiflow/client/store";
import * as styles from "asciiflow/client/export.css";
import * as React from "react";

import { useObserver } from "mobx-react";

export interface IExportConfig {
  wrapper?: "star" | "hash" | "slash" | "dash";
  indent?: number;
  basic?: boolean;
}

export function ExportDialog({
  button,
  drawingId,
}: {
  button: React.ReactNode;
  drawingId: DrawingId;
}) {
  return useObserver(() => {
    const exportConfig = store.exportConfig.get();
    const drawingText = applyConfig(
      store.canvas(drawingId).outputText(),
      exportConfig
    );
    return (
      <ControlledDialog button={button}>
        <DialogTitle>Export drawing</DialogTitle>
        <DialogContent>
          <InputLabel>Comment block type</InputLabel>
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

          <TextareaAutosize value={drawingText} className={styles.textArea} />
        </DialogContent>
      </ControlledDialog>
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
