// Very simple electron wrapper script that allows us to use asciiflow2 as a desktop application

const electron = require("electron");

const path = require("path");
const url = require("url");

function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 1024,
    height: 768,
    icon: path.join(
      process.env.RUNFILES,
      "asciiflow",
      "client",
      "public",
      "images",
      "favicon.png"
    ),
    webPreferences: {
      nodeIntegration: false,
    },
  });
  mainWindow.setMenu(null);
  mainWindow.loadURL(
    url.format({
      pathname: path.join(
        process.env.RUNFILES,
        "asciiflow",
        "client",
        "index.html"
      ),
      protocol: "file:",
      slashes: true,
    })
  );
}

electron.app.on("ready", createWindow);

electron.app.on("window-all-closed", function () {
  electron.app.quit();
});
