const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 780,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.setMenuBarVisibility(false)
    /**
     * Controllo di versione
     */
    if (isDev) {
        require("child_process").fork(
            "../bin/www",
            [],
            {
                stdio: ["pipe", "pipe", "pipe", "ipc"],
            }
        );
        mainWindow.loadURL(
            "http://localhost:3000/build/index.html"
        );
    } else {
        require("child_process").fork(
            `${path.join(__dirname, "../bin/www")}`,
            [],
            {
                stdio: ["pipe", "pipe", "pipe", "ipc"],
            }
        );
        mainWindow.loadURL(
            "http://localhost:3000/build/index.html"
        );
    }

    mainWindow.on("closed", () => (
        mainWindow = null
    ))
}

app.on("ready", createWindow)
app.on("window-all-closed", () => {
    process.platform !== "darwin" && app.quit()
})
app.on("activate", () => {
    mainWindow === null && createWindow()
})


