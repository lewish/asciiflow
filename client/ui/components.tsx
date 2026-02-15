import * as React from "react";
import styles from "#asciiflow/client/ui/components.module.css";

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

export function Button({
  variant = "default",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "danger" | "ghost";
}) {
  return (
    <button
      className={[styles.btn, styles[`btn-${variant}`], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------

export function Dialog({
  open,
  onClose,
  title,
  children,
  actions,
  testId,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  testId?: string;
}) {
  // Close on Escape.
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={styles.dialogOverlay} onMouseDown={onClose}>
      <div
        className={styles.dialog}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        data-testid={testId}
      >
        {title && <div className={styles.dialogTitle}>{title}</div>}
        <div className={styles.dialogContent}>{children}</div>
        {actions && <div className={styles.dialogActions}>{actions}</div>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ControlledDialog — wraps Dialog with open/close state tied to a trigger.
// ---------------------------------------------------------------------------

export function ControlledDialog({
  button,
  confirmButton,
  title,
  children,
}: {
  button: React.ReactNode;
  confirmButton?: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <span onClick={() => setOpen(true)}>{button}</span>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        actions={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            {confirmButton && (
              <span onClick={() => setOpen(false)}>{confirmButton}</span>
            )}
          </>
        }
      >
        {children}
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Menu / Dropdown
// ---------------------------------------------------------------------------

export function Menu({
  trigger,
  children,
  align = "left",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click.
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

  return (
    <div className={styles.menuRoot} ref={ref}>
      <span onClick={() => setOpen(!open)}>{trigger}</span>
      {open && (
        <div
          className={[
            styles.menuPanel,
            align === "right" ? styles.menuRight : "",
          ].join(" ")}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItemButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={[styles.menuItem, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}

export function MenuDivider() {
  return <div className={styles.menuDivider} />;
}

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------

export function Select({
  label,
  value,
  onChange,
  children,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className={styles.selectLabel}>
      {label && <span className={styles.selectLabelText}>{label}</span>}
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

// ---------------------------------------------------------------------------
// TextField
// ---------------------------------------------------------------------------

export function TextField({
  label,
  error,
  helperText,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: boolean;
  helperText?: React.ReactNode;
}) {
  return (
    <label className={styles.textFieldLabel}>
      {label && <span className={styles.textFieldLabelText}>{label}</span>}
      <input
        className={[styles.textField, error ? styles.textFieldError : ""]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
      {helperText && (
        <span
          className={[
            styles.textFieldHelper,
            error ? styles.textFieldHelperError : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {helperText}
        </span>
      )}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

export function Toast({
  open,
  message,
  onClose,
  duration = 3000,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}) {
  const [visible, setVisible] = React.useState(false);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [open, duration]);

  if (!visible) return null;
  return (
    <div
      className={[styles.toast, closing ? styles.toastClosing : ""].filter(Boolean).join(" ")}
      onClick={onClose}
    >
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kbd — keyboard shortcut badge
// ---------------------------------------------------------------------------

export function Kbd({
  children,
  hideUntilAlt,
  altPressed,
}: {
  children: React.ReactNode;
  hideUntilAlt?: boolean;
  altPressed?: boolean;
}) {
  if (hideUntilAlt && !altPressed) return null;
  return <kbd className={styles.kbd}>{children}</kbd>;
}
