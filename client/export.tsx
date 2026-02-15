import { ASCII, UNICODE } from "#asciiflow/client/constants";
import styles from "#asciiflow/client/export.module.css";
import { DrawingId, store, useAppStore } from "#asciiflow/client/store";
import { layerToText } from "#asciiflow/client/text_utils";
import {
  Button,
  Dialog,
  Select,
  Toast,
} from "#asciiflow/client/ui/components";
import * as React from "react";

export interface IExportConfig {
  wrapper?: "star" | "star-filled" | "triple-quotes" | "hash" | "slash" | "three-slashes" | "dash" | "apostrophe" | "semicolon" | "backticks" | "four-spaces";
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
  const [open, setOpen] = React.useState(false);
  const exportConfig = useAppStore((s) => s.exportConfig);
  const darkMode = useAppStore((s) => s.darkMode);
  const canvasVersion = useAppStore((s) => s.canvasVersion);

  const drawingText = open
    ? applyConfig(layerToText(store.canvas(drawingId).committed), exportConfig)
    : "";
  return (
    <>
      <span onClick={() => setOpen(true)}>{button}</span>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Export drawing"
        testId="export-dialog"
        actions={
          <>
            <CopyToClipboardButton text={drawingText} />
            <Button onClick={() => setOpen(false)}>Close</Button>
          </>
        }
      >
        <div className={styles.formRow}>
          <Select
            label="Character set"
            value={exportConfig.characters ?? "extended"}
            onChange={(v) =>
              store.setExportConfig({
                ...exportConfig,
                characters: v as any,
              })
            }
          >
            <option value="extended">ASCII Extended</option>
            <option value="basic">ASCII Basic</option>
          </Select>
        </div>
        <div className={styles.formRow}>
          <Select
            label="Comment type"
            value={exportConfig.wrapper || "none"}
            onChange={(v) =>
              store.setExportConfig({
                ...exportConfig,
                wrapper: v === "none" ? undefined : (v as any),
              })
            }
          >
            <option value="none">None</option>
            <option value="star">/* */ standard multi-line</option>
            <option value="star-filled">/***/ filled multi-line</option>
            <option value="triple-quotes">{`""" """`} quotes</option>
            <option value="hash"># hashes</option>
            <option value="slash">// slashes</option>
            <option value="three-slashes">/// three slashes</option>
            <option value="dash">-- dashes</option>
            <option value="apostrophe">' apostrophe</option>
            <option value="backticks">``` backticks</option>
            <option value="four-spaces">{"    "} four spaces</option>
            <option value="semicolon">; semicolons</option>
          </Select>
        </div>
        <textarea
          readOnly
          value={drawingText}
          className={styles.textArea}
          data-testid="export-text"
        />
      </Dialog>
    </>
  );
}

function CopyToClipboardButton({ text }: { text: string }) {
  const [toastOpen, setToastOpen] = React.useState(false);
  return (
    <>
      <Button
        variant="primary"
        data-testid="copy-to-clipboard"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setToastOpen(true);
        }}
      >
        Copy to clipboard
      </Button>
      <Toast
        open={toastOpen}
        message="Copied to clipboard"
        onClose={() => setToastOpen(false)}
      />
    </>
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
    if (
      exportConfig.wrapper === "star" ||
      exportConfig.wrapper === "star-filled"
    ) {
      setLines([
        "/*",
        ...lines().map((line) =>
          exportConfig.wrapper === "star-filled" ? ` * ${line}` : line
        ),
        " */",
      ]);
    }
    if (exportConfig.wrapper === "triple-quotes") {
      setLines([
        exportConfig.characters === "basic" ? "\"\"\"" : "u\"\"\"",
        ...lines(),
        "\"\"\"",
      ]);
    }
    if (exportConfig.wrapper === "hash") {
      setLines(lines().map((line) => `# ${line}`));
    }
    if (exportConfig.wrapper === "slash") {
      setLines(lines().map((line) => `// ${line}`));
    }
    if (exportConfig.wrapper === "three-slashes") {
      setLines(lines().map((line) => `/// ${line}`));
    }
    if (exportConfig.wrapper === "dash") {
      setLines(lines().map((line) => `-- ${line}`));
    }
    if (exportConfig.wrapper === "apostrophe") {
      setLines(lines().map((line) => `' ${line}`));
    }
    if (exportConfig.wrapper === "backticks") {
      setLines([
        "```",
        ...lines(),
        "```",
      ]);
    }
    if (exportConfig.wrapper === "four-spaces") {
      setLines(lines().map((line) => `    ${line}`));
    }
    if (exportConfig.wrapper === "semicolon") {
      setLines(lines().map((line) => `; ${line}`));
    }
  }
  return text;
}
