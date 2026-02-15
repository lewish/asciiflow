import { ASCII, UNICODE } from "#asciiflow/client/constants";
import styles from "#asciiflow/client/toolbar.module.css";
import { DrawingId, store, useAppStore } from "#asciiflow/client/store";
import { layerToText } from "#asciiflow/client/text_utils";
import {
  Toast,
} from "#asciiflow/client/ui/components";
import * as React from "react";

export interface IExportConfig {
  wrapper?: "star" | "star-filled" | "triple-quotes" | "hash" | "slash" | "three-slashes" | "dash" | "apostrophe" | "semicolon" | "backticks" | "four-spaces";
  indent?: number;
  characters?: "basic" | "extended";
}

// ---------------------------------------------------------------------------
// Custom terminal-style dropdown
// ---------------------------------------------------------------------------

function TermSelect({
  label,
  color,
  value,
  options,
  onChange,
}: {
  label: string;
  color?: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div className={styles.exportSelect}>
      <span className={styles.exportSelectLabel}>{label}</span>
      <div className={styles.customSelect} ref={ref}>
        <button
          className={styles.customSelectTrigger}
          style={color ? { color } : undefined}
          onClick={() => setOpen(!open)}
        >
          {current ? current.label : value}{" "}
          <span className={styles.customSelectChevron} style={color ? { color } : undefined}>{open ? "\u25b2" : "\u25bc"}</span>
        </button>
        {open && (
          <div className={styles.customSelectPanel}>
            {options.map((opt) => (
              <button
                key={opt.value}
                className={[
                  styles.customSelectOption,
                  opt.value === value ? styles.customSelectOptionActive : "",
                ].filter(Boolean).join(" ")}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.value === value ? "> " : "  "}{opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export panel
// ---------------------------------------------------------------------------

export function ExportPanel({
  drawingId,
}: {
  drawingId: DrawingId;
}) {
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [toastOpen, setToastOpen] = React.useState(false);
  const exportConfig = useAppStore((s) => s.exportConfig);
  const canvasVersion = useAppStore((s) => s.canvasVersion);

  const drawingText = applyConfig(
    layerToText(store.canvas(drawingId).committed),
    exportConfig
  );

  return (
    <>
      <div className={styles.exportPanel} data-testid="export-dialog">
        <div className={styles.exportRow}>
          <div className={styles.exportOptions}>
            <TermSelect
              label="character set:"
              color="var(--color-cyan)"
              value={exportConfig.characters ?? "extended"}
              options={[
                { value: "extended", label: "extended" },
                { value: "basic", label: "basic" },
              ]}
              onChange={(v) =>
                store.setExportConfig({
                  ...exportConfig,
                  characters: v as any,
                })
              }
            />
            <TermSelect
              label="wrap:"
              color="var(--color-purple)"
              value={exportConfig.wrapper || "none"}
              options={[
                { value: "none", label: "none" },
                { value: "star", label: "/* */" },
                { value: "star-filled", label: "/***/" },
                { value: "triple-quotes", label: '""" """' },
                { value: "hash", label: "# hash" },
                { value: "slash", label: "// slash" },
                { value: "three-slashes", label: "/// triple" },
                { value: "dash", label: "-- dash" },
                { value: "apostrophe", label: "' apostrophe" },
                { value: "backticks", label: "``` backticks" },
                { value: "four-spaces", label: "    indent" },
                { value: "semicolon", label: "; semicolon" },
              ]}
              onChange={(v) =>
                store.setExportConfig({
                  ...exportConfig,
                  wrapper: v === "none" ? undefined : (v as any),
                })
              }
            />
          </div>
          <div className={styles.exportActions}>
            <button
              className={styles.actionBtn}
              style={{ color: "var(--color-success)" }}
              data-testid="copy-to-clipboard"
              onClick={async () => {
                await navigator.clipboard.writeText(drawingText);
                setToastOpen(true);
              }}
            >
              [copy to clipboard]
            </button>
            <button
              className={styles.actionBtn}
              style={{ color: "var(--color-accent)" }}
              onClick={() => setPreviewOpen(!previewOpen)}
            >
              [{previewOpen ? "close preview" : "preview"}]
            </button>
          </div>
        </div>
        {previewOpen && (
          <div className={styles.exportPreview}>
            <pre
              className={styles.exportPreviewText}
              data-testid="export-text"
            >
              {drawingText}
            </pre>
          </div>
        )}
      </div>
      <Toast
        open={toastOpen}
        message="copied to clipboard"
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
