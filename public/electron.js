const electron = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const cp = require("child_process");
const log = require('electron-log');


const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;
const createWindow = () => {
    log.transports.file.resolvePath = () => "main.log";
    console.log = log.log;
    log.catchErrors({
        showDialog: true,
        onError: (error, versions, submitIssue) => {
            log.error(error)
        }
    });
    log.info("HERE IT IS")
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
            "bin/www.js"
        );
        mainWindow.loadURL(
            "http://localhost:3000/build/index.html"
        );
        mainWindow.webContents.openDevTools();
    } else {
        log.info("HERE IT IS: " + `${path.join(__dirname, "../bin/www.js")}`)
        const childProcess = cp.fork(
            `${path.join(__dirname, "../bin/www.js")}`, [], { silent: false }
        );

        childProcess.on('error', function (data) {
            //throw errors
            log.error('stderr: ' + data);
        });

        childProcess.on('close', function (code) {
            log.warn('child process exited with code ' + code);
        });

        mainWindow.loadURL(
            "http://localhost:3000/build/index.html"
        );
    }

    mainWindow.on("closed", () => (
        mainWindow = null
    ))
    log.info("HERE IT IS2")
}

app.on("ready", createWindow)
app.on("window-all-closed", () => {
    process.platform !== "darwin" && app.quit()
})
app.on("activate", () => {
    mainWindow === null && createWindow()
})


