const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");
const cp = require("child_process");

let mainWindow;
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        title: "CrawFish",
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.setMenuBarVisibility(false)
    /**
     * Controllo di versione
     */
    if (isDev) {
        cp.fork(
            "bin/www"
        );
        mainWindow.loadURL(
            "http://localhost:3000/build/index.html"
        );
        mainWindow.webContents.openDevTools();
    } else {
        cp.fork(
            `${path.join(__dirname, "../bin/www")}`
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


