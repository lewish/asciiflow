import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("asciiflow.open", () => {
      Asciiflow2Panel.createOrShow(context.extensionPath);
    })
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(Asciiflow2Panel.viewType, {
      async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
        state: any
      ) {
        console.log(`Got state: ${state}`);
        Asciiflow2Panel.revive(webviewPanel, context.extensionPath);
      },
    });
  }
}

class Asciiflow2Panel {
  public static currentPanel: Asciiflow2Panel | undefined;

  public static readonly viewType = "asciiflow2";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _resourcesPath: string;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionPath: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (Asciiflow2Panel.currentPanel) {
      Asciiflow2Panel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      Asciiflow2Panel.viewType,
      "ASCIIFlow Infinity",
      column || vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    Asciiflow2Panel.currentPanel = new Asciiflow2Panel(panel, extensionPath);
  }

  public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
    Asciiflow2Panel.currentPanel = new Asciiflow2Panel(panel, extensionPath);
  }

  private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
    this._panel = panel;

    this._resourcesPath = path.join(extensionPath, "asciiflow2");

    this._panel.webview.html = this._getHtmlForWebview();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  private _getHtmlForWebview() {
    let html = fs.readFileSync(
      path.join(this._resourcesPath, "index.html"),
      "utf-8"
    );

    // fix path
    html = html.replace(
      /(<link.+?href="|<script.+?src="|<img.+?src="|url\(")(.+?)"/g,
      (m, $1, $2) => {
        return (
          $1 +
          vscode.Uri.file(path.resolve(this._resourcesPath, $2))
            .with({ scheme: "vscode-resource" })
            .toString() +
          '"'
        );
      }
    );
    return html;
  }

  public dispose() {
    Asciiflow2Panel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
