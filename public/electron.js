const electron = require("electron");
const app = electron.app;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
const Dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");
const cp = require("child_process");
const {autoUpdater} = require("electron-updater");
const {writeFileSyncRecursive} = require("../routes/classes/utility");
const fs = require('fs');
const os = require('os')
const log = require('electron-log');
const package = require("./../package.json")
const unhandled = require('electron-unhandled');
const {Octokit} = require("octokit");

const octokit = new Octokit({
    auth: "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"
})


const userDataPath = path.join(os.homedir(), "Crawfish");
log.transports.file.level = 'info';
log.transports.file.resolvePath = () => userDataPath + "/crawfish.log";
console.log = log.log;
Object.assign(console, log.functions);

let mainWindow;
const createWindow = () => {
    //Setup menu
    let menu = Menu.getApplicationMenu(); // get default menu
    let items = []
    menu.items.forEach((item) => {
        console.log("Menu voice: ", item.role)
        if (item.role === "filemenu") {
            items.push(item)
        }
    })
    Menu.setApplicationMenu(Menu.buildFromTemplate(items));
    Menu.getApplicationMenu().append(new MenuItem({
        label: 'Update option',
        submenu: [
            {
                label: "Search for beta update",
                click: () => {
                    autoUpdater.channel = "beta";
                    autoUpdater.checkForUpdates().then((r) => {
                        if (r) {
                            let output = Dialog.showMessageBoxSync({
                                title: "Beta available",
                                message: "Do you want to update the solution to beta version (It will have new feature, but even new bug)?",
                                type: "question",
                                buttons: ["Yes, update at the next start!", "No, Thanks!"]
                            })
                            switch (output) {
                                case 0:
                                    autoUpdater.channel = "beta";
                                    autoUpdater.checkForUpdatesAndNotify();
                                    break;
                                default:
                            }
                        }
                    })
                }
            }, {
                label: "Search for stable update",
                click: () => {
                    autoUpdater.channel = "latest";
                    autoUpdater.checkForUpdates().then((r) => {
                        if (r) {
                            let output = Dialog.showMessageBoxSync({
                                title: "Stable available",
                                message: "Do you want to update the solution to stable version?",
                                type: "question",
                                buttons: ["Yes, update at the next start!", "No, Thanks!"]
                            })
                            switch (output) {
                                case 0:
                                    autoUpdater.channel = "latest";
                                    autoUpdater.checkForUpdatesAndNotify();
                                    break;
                                default:
                            }
                        }
                    })
                }
            },
        ]
    }))
    unhandled({
        showDialog: true,
        logger: console.error,
        reportButton: (error) => {
            octokit.request('POST /repos/drakonkat/crawfish/issues', {
                owner: 'drakonkat',
                repo: 'crawfish',
                title: 'Error launching electron app',
                body: `\`\`\`\n${error.stack}\n\`\`\`\n\n---\n\n`,
                assignees: [
                    'drakonkat'
                ],
                milestone: null,
                labels: [
                    'automatic-bug-report'
                ]
            }).catch(console.error)
        }
    });

    let title = "CrawFish - " + package.version;
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
    // mainWindow.setMenuBarVisibility(false)


    /**
     * Controllo di versione TODO Better handling
     */
    let subprocess;
    // let pathConfig = "/home/mm/Crawfish/config_db/LOCK"
    let pathConfig = path.join(userDataPath, "config_db", "LOCK") + "";
    if (!fs.existsSync(pathConfig)) {
        writeFileSyncRecursive(pathConfig)
    }
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
                            "http://localhost:" + port + "/crawfish-official/index.html"
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
                        setTimeout(() => {
                            throw new Error("SOME ERROR HERE")
                        }, 3000)
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
                            "http://localhost:" + port + "/crawfish-official/index.html"
                        );
                        mainWindow.on("closed", () => {
                            try {
                                subprocess.kill('SIGHUP');
                            } catch (e) {
                                console.log("Exception closing process, probably already closed by Operating system")
                            }
                            return (mainWindow = null)
                        });
                        autoUpdater.channel = package.version.includes("beta") ? "beta" : "latest";
                        autoUpdater.checkForUpdates().then((r) => {
                            if (r) {
                                let output = Dialog.showMessageBoxSync({
                                    title: "New update available",
                                    message: "Is ok to update :) Click yes to proceed",
                                    type: "question",
                                    buttons: ["Yes, update at the next start!", "No, update can break everything!"]
                                })
                                switch (output) {
                                    case 0:
                                        autoUpdater.checkForUpdatesAndNotify().then(r => console.log("Update check: ", r));
                                        break;
                                    default:
                                }
                            }

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
}

app.on("ready", createWindow)
app.on("window-all-closed", () => {
    process.platform !== "darwin" && app.quit()
})
app.on("activate", () => {
    mainWindow === null && createWindow()
})


