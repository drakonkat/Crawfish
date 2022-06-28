const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");
const cp = require("child_process");
const { autoUpdater } = require("electron-updater")

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
     * Controllo di versione TODO Better handling 
     */
    let subprocess;
    if (isDev) {
        subprocess = cp.fork(
            "bin/www"
        );
        subprocess.on('message', message => {
            switch (message) {
                case "READY":
                    mainWindow.loadURL(
                        "http://localhost:3000/build/index.html"
                    );
                    mainWindow.webContents.openDevTools();
                    mainWindow.on("closed", () => {
                        subprocess.kill('SIGHUP');
                        return (mainWindow = null)
                    });
                    break;
                default:
                    console.error("Error in server process " + message)

            }

        });
    } else {
        subprocess = cp.fork(
            `${path.join(__dirname, "../bin/www")}`
        );
        subprocess.on('message', message => {
            console.log("Message received: ", message)
            switch (message) {
                case "READY":
                    mainWindow.loadURL(
                        "http://localhost:3000/build/index.html"
                    );
                    mainWindow.on("closed", () => {
                        subprocess.kill('SIGHUP');
                        return (mainWindow = null)
                    });
                    break;
                default:
                    console.error("Error in server process " + message)

            }
        });
    }


    // autoUpdater.checkForUpdatesAndNotify().then(r => console.log("Update: ", r))
}

app.on("ready", createWindow)
app.on("window-all-closed", () => {
    process.platform !== "darwin" && app.quit()
})
app.on("activate", () => {
    mainWindow === null && createWindow()
})


