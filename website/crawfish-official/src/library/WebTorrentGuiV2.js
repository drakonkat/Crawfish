import React, {Component} from 'react';
import {observer} from "mobx-react";
import {WebTorrentHelper} from "./WebTorrentHelper";
import {Button, Divider, InputAdornment, LinearProgress, Snackbar, Stack, TextField, Tooltip} from "@mui/material";
import {AddCircle, Delete, DeleteForever, PauseCircle, PlayCircle, Search} from "@mui/icons-material";

import {Menu} from "./components/Menu";
import AddTorrent from "./components/AddTorrent";

import TorrentClientTable from "./components/TorrentClientTable";
import FilesTable from "./components/FilesTable";
import {grey} from "@mui/material/colors";
import {CLIENT, CLIENT_DOWNLOAD, CLIENT_SEEDING, GAMES, MOVIES, SETTINGS, TVSHOW} from "./types";
import {SettingsPage} from "./components/SettingsPage";
import SpeedMeter from "./components/SpeedMeter";
import TorrentTableRow from "./components/TorrentTableRow";

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
        defaultMenu: [],
        order:'asc',
        orderBy:'name'
    }

    componentDidMount() {
        let {host, port, baseUrl, store} = this.props
        let {loading} = store;
        this.setState({client: new WebTorrentHelper(baseUrl ? {baseUrl} : {baseUrl: host + ":" + port}, store)}, async () => {
            await this.refreshCategory();
            loading.set(false);
            // this.setState({
            //     enabledView: SETTINGS
            // })
        })
    }

    componentWillUnmount() {
        clearInterval(this.interval)
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
                    client.addTorrent({magnet: x.magnet, path: x.path})
                }
            })
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
        } catch (e) {
            console.error(e)
        }
    }

    descendingComparator(a, b, orderBy) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    getComparator(order, orderBy) {
        return order === 'desc'
            ? (a, b) => this.descendingComparator(a, b, orderBy)
            : (a, b) => -this.descendingComparator(a, b, orderBy);
    }

    openSnackbar = () => {
        this.setState({snackbar: true})
    }
    handleRequestSort = (event, property) => {
        let {order, orderBy} = this.state;
        const isAsc = orderBy === property && order === 'asc';
        this.setState({
            order:isAsc ? 'desc' : 'asc',
            orderBy:property
        })
    };
    renderBody = () => {
        let {enabledView, enabledCategory, filterTorrent, client, search, selectedTorrent, order, orderBy} = this.state;
        let {remote, store} = this.props;
        let {status} = store;
        let torrents = status.get.filter(filterTorrent);

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
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={this.handleRequestSort}
                    torrents={torrents.sort(this.getComparator(order, orderBy))}
                    predicate={x => selectedTorrent.includes(x.infoHash)}
                    callbackfn={(torrent, index) => {
                        return <TorrentTableRow isRowSelected={this.isRowSelected(torrent.infoHash)}
                                                onChangeRowSelection={this.onChangeRowSelection}
                                                remote={remote}
                                                client={client}
                                                torrent={torrent}
                                                index={index}
                                                openSnackbar={this.openSnackbar}
                        />
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
                            })
                        }}
                        filterSeeding={() => {
                            this.setState({
                                filterTorrent: (x) => {
                                    return x.paused === false && x.progress >= 1;
                                },
                                enabledView: CLIENT_SEEDING
                            })
                        }}
                        filterHome={() => {
                            this.setState({
                                filterTorrent: () => {
                                    return true;
                                },
                                enabledView: CLIENT
                            })
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
