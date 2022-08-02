const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");
const cp = require("child_process");
const {autoUpdater} = require("electron-updater")

let mainWindow;
const createWindow = () => {
    let title = "CrawFish - 1.7.4"
    let port = 3000;
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        title: title,
        webPreferences: {}
    });
    mainWindow.on('page-title-updated', (evt) => {
        evt.preventDefault();
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
        subprocess.on('message', result => {
            if (result) {
                let {message} = result
                switch (message) {
                    case "READY":
                        mainWindow.loadURL(
                            "http://localhost:" + port + "/build/index.html?port=" + port
                        );
                        mainWindow.webContents.openDevTools();
                        mainWindow.on("closed", () => {
                            try {
                                subprocess.kill('SIGHUP');
                            } catch (e) {
                                console.log("Exception closing process, probably already closed by Operating system")
                            }
                            return (mainWindow = null)
                        });
                        break;
                    case "PORT":
                        if (result.data) {
                            port = result.data;
                        }
                        break;
                    default:
                        console.error("Error in server process " + message)

                }
            }

        });
    } else {
        subprocess = cp.fork(
            `${path.join(__dirname, "../bin/www")}`
        );
        subprocess.on('message', result => {
            if (result) {
                let {message} = result
                switch (message) {
                    case "READY":
                        mainWindow.loadURL(
                            "http://localhost:" + port + "/build/index.html?port=" + port
                        );
                        mainWindow.on("closed", () => {
                            try {
                                subprocess.kill('SIGHUP');
                            } catch (e) {
                                console.log("Exception closing process, probably already closed by Operating system")
                            }
                            return (mainWindow = null)
                        });
                        break;
                    case "PORT":
                        if (result.data) {
                            port = result.data;
                        }
                        break;
                    default:
                        console.error("Error in server process " + message)

                }
            }
        });
    }


    autoUpdater.checkForUpdatesAndNotify().then(r => console.log("Update: ", r))
}

app.on("ready", createWindow)
app.on("window-all-closed", () => {
    process.platform !== "darwin" && app.quit()
})
app.on("activate", () => {
    mainWindow === null && createWindow()
})


