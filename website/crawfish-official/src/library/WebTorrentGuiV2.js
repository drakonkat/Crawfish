import React, {Component} from 'react';
import {observer} from "mobx-react";
import {WebTorrentHelper} from "./WebTorrentHelper";
import {
    Button,
    Checkbox,
    Collapse,
    Divider,
    IconButton,
    InputAdornment,
    LinearProgress,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Snackbar,
    Stack,
    TableCell,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {
    AddCircle,
    ContentCopy,
    Delete,
    DeleteForever,
    DownloadForOffline,
    FolderOpen,
    Link,
    OndemandVideo,
    PauseCircle,
    PlayCircle,
    PlayCircleOutline,
    Search
} from "@mui/icons-material";
import {copyToClipboard, humanFileSize, toTime} from "./utils";
import {LinearProgressWithLabel} from "./components/LinearProgressWithLabel";

import {Menu} from "./components/Menu";
import AddTorrent from "./components/AddTorrent";

import TorrentClientTable from "./components/TorrentClientTable";
import FilesTable from "./components/FilesTable";
import {grey} from "@mui/material/colors";
import FileElement from "./components/FileElement";
import {CLIENT, CLIENT_DOWNLOAD, CLIENT_SEEDING, GAMES, MOVIES, SETTINGS, TVSHOW} from "./types";
import {SettingsPage} from "./components/SettingsPage";
import SpeedMeter from "./components/SpeedMeter";

class WebTorrentGuiV2 extends Component {

    state = {
        selectedTorrent: [],
        filterTorrent: () => {
            return true
        },
        showAddTorrent: false,
        enabledView: CLIENT,
        search: "",
        severity: "success",
        snackbar: false,
        snackbarMessage: "Copied to clipboard",
        defaultMenu: []

    }

    componentDidMount() {
        let {host, port, baseUrl, store} = this.props
        let {loading} = store;
        this.setState({client: new WebTorrentHelper(baseUrl ? {baseUrl} : {baseUrl: host + ":" + port}, store)}, async () => {
            await this.refreshStatus();
            await this.refreshCategory();
            loading.set(false);
            // this.setState({
            //     enabledView: SETTINGS
            // })
        })
        this.interval = setInterval(this.refreshStatus, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    refreshStatus = async () => {
        try {
            let {client, filterTorrent} = this.state
            await client.checkStatusWs();
        } catch (e) {
            console.error(e)
        }
    }
    refreshCategory = async () => {
        try {
            let {client} = this.state
            let res = await client.getCategory();
            this.setState({defaultMenu: res.data})

        } catch (e) {
            console.error(e)
        }
    }

    removeAll = () => {
        try {
            let {client, selectedTorrent} = this.state;
            let {store} = this.props;
            let {status} = store;
            let torrents = status.get;
            torrents.forEach(x => {
                if (selectedTorrent == null || selectedTorrent.length < 1 || selectedTorrent.includes(x.infoHash)) {
                    client.removeTorrent({magnet: x.magnet})
                }
            })
            this.refreshStatus().catch(console.error)
        } catch (e) {
            console.error(e)
        }
    }

    destroyAll = () => {
        try {
            let {client, selectedTorrent} = this.state;
            let {store} = this.props;
            let {status} = store;
            let torrents = status.get;
            torrents.forEach(x => {
                if (selectedTorrent == null || selectedTorrent.length < 1 || selectedTorrent.includes(x.infoHash)) {
                    client.destroyTorrent({magnet: x.magnet})
                }
            })
            this.refreshStatus().catch(console.error)
        } catch (e) {
            console.error(e)
        }
    }

    resumeAll = () => {
        try {
            let {client, selectedTorrent} = this.state;
            let {store} = this.props;
            let {status} = store;
            let torrents = status.get;
            torrents.forEach(x => {
                if (selectedTorrent == null || selectedTorrent.length < 1 || selectedTorrent.includes(x.infoHash)) {
                    client.addTorrent({magnet: x.magnet})
                }
            })
            this.refreshStatus().catch(console.error)
        } catch (e) {
            console.error(e)
        }
    }
    pauseAll = () => {
        try {
            let {client, selectedTorrent} = this.state;
            let {store} = this.props;
            let {status} = store;
            let torrents = status.get;
            torrents.forEach(x => {
                if (selectedTorrent == null || selectedTorrent.length < 1 || selectedTorrent.includes(x.infoHash)) {
                    client.pauseTorrent({magnet: x.magnet})
                }
            })
            this.refreshStatus().catch(console.error)
        } catch (e) {
            console.error(e)
        }
    }

    openSnackbar = () => {
        this.setState({snackbar: true})
    }

    renderBody = () => {
        let {enabledView, enabledCategory, client, search, selectedTorrent} = this.state;
        let {remote, store} = this.props;
        let {status} = store;
        let torrents = status.get;

        switch (enabledView) {
            case SETTINGS:
                return <SettingsPage
                    key={"VIEW_" + enabledView.toString()}
                    client={client}
                    refreshCategory={this.refreshCategory}
                />;
            case CLIENT:
            case CLIENT_DOWNLOAD:
            case CLIENT_SEEDING:
                return <TorrentClientTable
                    key={"TORRENT_CLIENT_TABLE"}
                    search={search}
                    onClick={(event) => {
                        if (event.target.checked) {
                            this.setState({selectedTorrent: torrents.map(x => x.infoHash)})
                        } else {
                            this.setState({selectedTorrent: []})
                        }
                    }}
                    torrents={torrents}
                    predicate={x => selectedTorrent.includes(x.infoHash)}
                    callbackfn={(torrent, index) => {
                        let videoFiles = [];
                        torrent.files.forEach(f => {
                            if (f.mime && f.mime.includes("video")) {
                                videoFiles.push(f)
                            }
                        })
                        let state;
                        let color = "primary";
                        if (torrent.paused) {
                            state = "paused";
                            color = "warning";
                        } else if (torrent.progress === 1) {
                            state = "completed";
                            color = "success";
                        } else if (torrent.timeRemaining > 0) {
                            state = toTime(torrent.timeRemaining)
                        } else {
                            state = "--:--"
                        }
                        let size = 0;
                        torrent.files.forEach(file => {
                            size = size + file.length
                        })
                        let isRowSelected = this.isRowSelected(torrent.infoHash)
                        let output = [];
                        output.push(<TableRow key={torrent.infoHash || ("VALUE-" + index)} sx={{borderBottom: 'unset'}}>
                            <TableCell key={"checkbox-child"} padding={"checkbox"} component="th" scope="row">
                                <Checkbox
                                    color="primary"
                                    checked={isRowSelected}
                                    onClick={() => this.onChangeRowSelection(torrent.infoHash)}
                                />
                            </TableCell>
                            <TableCell key={"name-child"} component="th" scope="row">
                                <Typography variant={"body2"}>{torrent.name}</Typography>
                            </TableCell>
                            <TableCell key={"progress-child"} align="right">
                                <LinearProgressWithLabel color={color}
                                                         value={torrent.progress * 100}/>
                            </TableCell>
                            <TableCell key={"state"} align="left">
                                <Typography variant={"body2"}>
                                    {state}
                                </Typography>
                            </TableCell>
                            <TableCell key={"size-child"} align="left">
                                <Typography variant={"body2"}>
                                    {humanFileSize(size)}
                                </Typography>
                            </TableCell>
                            <TableCell key={"files-child"} align="right">
                                {videoFiles.length > 0 &&
                                    <Tooltip key={"tooltip-video"}
                                             title={videoFiles.length === 1 ? "Reproduce video file" :
                                                 <List
                                                     sx={{maxWidth: "200px", maxHeight: "400px", overflow: "auto"}}>
                                                     {videoFiles.map((file, index) => {
                                                         return <ListItemButton key={"TO_PLAY_ELEMENT_" + index}
                                                                                onClick={() => {
                                                                                    if (remote) {
                                                                                        let a = document.createElement("a");
                                                                                        a.href = client.fileStreamLink(file.id, file.name, remote);
                                                                                        a.download = file.name;
                                                                                        a.click();
                                                                                    } else {
                                                                                        client.fileOpen(file.id);
                                                                                    }
                                                                                }
                                                                                }
                                                         >
                                                             <ListItemAvatar>
                                                                 <Stack alignItems={"center"}
                                                                        justifyContent={"center"}>
                                                                     {`${Math.round(
                                                                         file.progress * 100,
                                                                     )}%`}
                                                                     <OndemandVideo/>
                                                                 </Stack>
                                                             </ListItemAvatar>
                                                             <ListItemText
                                                                 primary={file.name}
                                                             />
                                                         </ListItemButton>
                                                     })}
                                                 </List>}>
                                        <IconButton key={"play"} onClick={() => {
                                            if (videoFiles.length === 1) {
                                                let file = videoFiles[0]
                                                if (remote) {
                                                    let a = document.createElement("a");
                                                    a.href = client.fileStreamLink(file.id, file.name, remote);
                                                    a.download = file.name;
                                                    a.click();
                                                } else {
                                                    client.fileOpen(file.id);
                                                }
                                            }
                                        }}>
                                            <PlayCircleOutline color={"primary"}/>
                                        </IconButton>
                                    </Tooltip>}
                                {!remote && <Tooltip key={"open-torrent-folder"} title={"Open torrent folder"}>
                                    <IconButton onClick={() => {
                                        client.folderOpen(torrent.infoHash);
                                    }}>
                                        <FolderOpen color={"primary"}/>
                                    </IconButton>
                                </Tooltip>}
                                <Tooltip key={"download-torrent-file"} title={"Download torrent file"}>
                                    <IconButton onClick={() => {
                                        let a = document.createElement("a");
                                        a.href = client.getTorrentFile(torrent.infoHash, torrent.name + ".torrent", remote);
                                        a.download = torrent.name + ".torrent";
                                        a.click();
                                    }}>
                                        <DownloadForOffline color={"primary"}/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip key={"copy-clipboard"} title={"Copy a link to share with friends!"}>
                                    <IconButton onClick={() => {
                                        copyToClipboard("https://tndsite.gitlab.io/quix-player/?magnet=" + torrent.infoHash, this.openSnackbar)
                                        // copyToClipboard("https://btorrent.xyz/download#" + torrent.infoHash, this.openSnackbar)
                                    }}>
                                        <Link color={"primary"}/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip key={"magnet-copy"} title={"Copy magnet to the clipboard"}>
                                    <IconButton onClick={() => {
                                        copyToClipboard(torrent.magnet, this.openSnackbar)
                                    }}>
                                        <ContentCopy color={"primary"}/>
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>)
                        output.push(<TableRow key={"Secondary-" + torrent.infoHash}>
                            <TableCell key={"secondary-checkbox"} padding={"checkbox"}
                                       sx={{paddingBottom: 0, paddingTop: 0}}
                                       colSpan={6}>
                                <Collapse in={isRowSelected} timeout="auto" unmountOnExit>
                                    {torrent.files.map(f => {
                                        return <FileElement key={"file-" + f.id}
                                                            torrentMagnet={torrent.magnet}
                                                            remote={remote} file={f} client={client}/>
                                    })}
                                </Collapse>
                            </TableCell>
                        </TableRow>)
                        return (output)
                    }}/>
            case TVSHOW:
            case GAMES:
            case MOVIES:
            default:
                return <FilesTable
                    key={"FILES_TABLE_" + (enabledCategory ? enabledCategory.id : enabledView.toString())}
                    client={client}
                    torrents={torrents}
                    search={search}
                    searchApi={client.searchIndexer}
                    category={enabledCategory}
                />

        }
    }


    render() {
        let {
            client,
            showAddTorrent,
            enabledView,
            search,
            severity,
            snackbar,
            snackbarMessage,
            defaultMenu,
            enabledCategory
        } = this.state;
        let {logo, store} = this.props;
        let {loading} = store;
        let disabledToolbar = enabledView === SETTINGS;
        if (loading.get) {
            return <Stack id={"main_stack"} sx={{
                width: "100%",
                height: "100%"
            }}>
                <LinearProgress variant={"indeterminate"} color={"success"}/>
            </Stack>
        }
        return (
            <Stack id={"main_stack"} sx={{
                width: "100%",
                height: "100%"
            }}>
                <Snackbar
                    anchorOrigin={{vertical: "top", horizontal: "right"}}
                    open={snackbar}
                    onClose={() => {
                        this.setState({snackbar: false})
                    }}
                    severity={severity}
                    message={snackbarMessage}
                    key={"snackabr"}
                    autoHideDuration={5000}
                />
                <Stack
                    sx={{height: "100%"}}
                    direction={"row"}>
                    <Menu
                        defaultMenu={defaultMenu}
                        logo={logo}
                        enabledView={enabledView}
                        category={enabledCategory}
                        changeView={(enabledView, id) => {
                            let categoryIndex = defaultMenu.findIndex(x => x.id === id);
                            if (categoryIndex !== -1) {
                                this.setState({
                                    enabledView,
                                    enabledCategory: defaultMenu[categoryIndex]
                                })
                            } else {
                                this.setState({
                                    enabledView,
                                    enabledCategory: undefined
                                })
                            }
                        }}
                        onChange={this.darkLightMode}
                        filterDownload={() => {
                            this.setState({
                                filterTorrent: (x) => {
                                    return x.paused === false && x.progress !== 1;
                                },
                                enabledView: CLIENT_DOWNLOAD
                            }, this.refreshStatus)
                        }}
                        filterSeeding={() => {
                            this.setState({
                                filterTorrent: (x) => {
                                    return x.paused === false && x.progress >= 1;
                                },
                                enabledView: CLIENT_SEEDING
                            }, this.refreshStatus)
                        }}
                        filterHome={() => {
                            this.setState({
                                filterTorrent: () => {
                                    return true;
                                },
                                enabledView: CLIENT
                            }, this.refreshStatus)
                        }}
                    />
                    <Divider orientation={"vertical"}/>
                    <Stack sx={{width: "100%"}} direction={"column"}>
                        <Stack sx={{width: "100%", padding: "5px"}} alignItems={"center"} spacing={1}
                               direction={"row"}>
                            <Button disabled={disabledToolbar} size={"small"} color={"primary"}
                                    variant={"contained"}
                                    startIcon={<AddCircle/>} onClick={() => {
                                this.setState({showAddTorrent: true})
                            }}>Add</Button>
                            <Button disabled={disabledToolbar} size={"small"} color={"primary"}
                                    variant={"contained"}
                                    startIcon={<PauseCircle/>} onClick={this.pauseAll}>pause</Button>
                            <Button disabled={disabledToolbar} size={"small"} color={"primary"}
                                    variant={"contained"}
                                    startIcon={<PlayCircle/>} onClick={this.resumeAll}>Resume</Button>
                            <Tooltip title={"Remove element only from the list"}>
                                <Button disabled={disabledToolbar} size={"small"} color={"primary"}
                                        variant={"contained"}
                                        startIcon={<Delete/>} onClick={this.removeAll}>Remove</Button>
                            </Tooltip>
                            <Tooltip title={"Remove element from list and from the memory"}>
                                <Button disabled={disabledToolbar} size={"small"} color={"primary"}
                                        variant={"contained"}
                                        startIcon={<DeleteForever/>} onClick={this.destroyAll}>Delete</Button>
                            </Tooltip>
                            {/*TODO Enable when sorting is working                                */}
                            {/*<Divider orientation={"vertical"}/>*/}
                            {/*<IconButton disabled color={"primary"}><KeyboardArrowUp/></IconButton>*/}
                            {/*<IconButton disabled color={"primary"}><KeyboardArrowDown/></IconButton>*/}
                            {![CLIENT, CLIENT_DOWNLOAD, CLIENT_SEEDING, SETTINGS].includes(enabledView) && <>
                                <Divider
                                    orientation={"vertical"}/>
                                <TextField disabled={disabledToolbar} size={"small"} variant={"outlined"}
                                           label={"Search"}
                                           InputProps={{
                                               startAdornment: (
                                                   <InputAdornment position="start">
                                                       <Search/>
                                                   </InputAdornment>
                                               )
                                           }}
                                           value={search}
                                           onChange={(e) => {
                                               let text = e.target.value;
                                               this.setState({search: text})
                                           }}
                                /></>}
                            {client && <SpeedMeter
                                client={client}
                                store={store}
                            />}
                        </Stack>
                        <Divider/>
                        {this.renderBody()}
                    </Stack>
                </Stack>
                <AddTorrent
                    open={showAddTorrent}
                    onSubmit={(path, magnet) => {
                        client.addTorrent({magnet, path})
                            .then(this.refreshStatus)
                            .catch(console.error)
                        this.setState({showAddTorrent: false})
                    }}
                    onClose={() => {
                        this.setState({showAddTorrent: false})
                    }}
                />
            </Stack>
        );
    }


    isRowSelected = (infoHash) => {
        let {selectedTorrent} = this.state;
        return selectedTorrent.includes(infoHash);
    }
    onChangeRowSelection = (infoHash) => {
        let {selectedTorrent} = this.state;
        if (this.isRowSelected(infoHash)) {
            this.setState({
                selectedTorrent: selectedTorrent.filter(x => x !== infoHash)
            })
        } else {
            selectedTorrent.push(infoHash)
            this.setState({
                selectedTorrent
            })
        }
    }

    darkLightMode = (e, checked) => {
        let {store} = this.props;
        let {theme} = store;
        let mode = checked ? "dark" : "light";
        let background = {
            default: "#303030",
            paper: "#424242"
        }
        if (mode === "light") {
            background = {
                default: grey[300],
                paper: grey[200]
            }
        }
        theme.set({
            ...theme.options,
            palette: {
                ...theme.options.palette,
                mode,
                background
            }
        })
    }
}

export default observer(WebTorrentGuiV2);
