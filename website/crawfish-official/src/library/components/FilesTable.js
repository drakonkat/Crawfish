import React, {Component} from "react";
import {Alert, IconButton, LinearProgress, Snackbar, Stack, Tooltip, Typography} from "@mui/material";
import {Attachment, CloudDownload, Download, Upload} from "@mui/icons-material";
import {humanFileSize} from "../utils";


class FilesTable extends Component {
    state = {
        loading: true,
        files: [],
        snackbar: false,
        snackbarMessage: "Adding torrent..."
    }


    componentDidMount() {
        let search = this.props
        this.refreshStatus(search);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.search !== this.props.search) {
            if (this.timeoutId) {
                clearTimeout(this.timeoutId)
            }
            this.timeoutId = setTimeout(this.refreshStatus, 1000);
        }
    }

    refreshStatus = async () => {
        try {
            let {client, search, torrents, category, searchApi} = this.props
            this.setState({loading: true})
            let elaboratedSearch = []
            if (!search || search === " " || search === "") {
                elaboratedSearch.push(category.defaultSearch)
            } else {
                elaboratedSearch.push(search)
            }
            if (category && category.tag) {
                elaboratedSearch.push(...category.tag.split(","))
            }
            let res = await searchApi(category.type, elaboratedSearch.join(" "));
            this.setState({
                files: res.data.map((file, index) => {
                    let disabled = torrents.some(t => {
                        return t.name.includes(file.title)
                    })
                    return (<Stack
                        key={"FILES_" + index}
                        alignItems={"center"}
                        justifyContent={"center"}
                        direction={"row"}
                        spacing={0}
                        sx={{
                            borderRadius: "10px",
                            padding: "10px",
                            backgroundColor: "background.default",
                            width: "100%"
                        }}>
                        <Stack
                            spacing={0}
                            sx={{
                                width: "100%"
                            }}
                            alignItems={"flex-start"}
                            justifyContent={"flex-start"}
                        >
                            <Typography variant={"body1"}>{file.name}</Typography>
                            {(file.seeders || file.peers) && <Stack
                                direction={"row"}
                                alignItems={"center"}
                                spacing={0.5}
                                justifyContent={"flex-start"}
                            >
                                <Upload color={"success"} fontSize={"small"}/>
                                <Typography variant={"body1"}>Seed: {file.seeders}</Typography>
                                <Download color={"success"} fontSize={"small"}/>
                                <Typography variant={"body1"}>Leech: {file.peers}</Typography>
                            </Stack>}
                            <Stack
                                direction={"row"}
                                spacing={0.5}
                                alignItems={"center"}
                                justifyContent={"flex-start"}
                            >
                                <Attachment color={"success"} fontSize={"small"}/>
                                <Typography variant={"body1"}>{humanFileSize(file.size)}</Typography>
                                {file.repackSize && <Typography
                                    variant={"body1"}>repacked {humanFileSize(file.repackSize)}</Typography>}
                            </Stack>
                        </Stack>
                        <Tooltip title={file.name}>
                            <IconButton
                                disabled={disabled}
                                size={"medium"}
                                onClick={() => {
                                    this.setState({
                                        snackbar: true,
                                        snackbatMessage: "Adding torrent..."
                                    }, () => {
                                        client.addTorrent({magnet: file.magnet, path: category.path})
                                            .then((res) => {
                                                this.setState({
                                                    snackbar: true,
                                                    snackbarMessage: "Added torrent " + file.name
                                                }, () => {
                                                    setTimeout(() => {
                                                        this.setState(p => {
                                                            return {
                                                                snackbar: false,
                                                                snackbarMessage: "Adding torrent..."
                                                            }
                                                        })
                                                    }, 2000)
                                                })
                                            })
                                            .catch((e) => {
                                                this.setState({
                                                    snackbar: true,
                                                    snackbarMessage: "Error adding torrent: " + e.message
                                                }, () => {
                                                    setTimeout(() => {
                                                        this.setState(p => {
                                                            return {
                                                                snackbar: false,
                                                                snackbarMessage: "Adding torrent..."
                                                            }
                                                        })
                                                    }, 2000)
                                                })
                                            })
                                    })
                                }}
                            >
                                <CloudDownload fontSize={"large"} color={disabled ? "disabled" : "success"}/>
                            </IconButton>
                        </Tooltip>
                    </Stack>)
                }), loading: false
            })
        } catch (e) {
            console.error(e)
        } finally {
            if (this.state.loading) {
                this.setState({loading: false})
            }
        }

    }

    render() {
        let {files, loading, snackbar, snackbarMessage} = this.state
        return <Stack sx={{padding: "10px", backgroundColor: "background.paper", height: "100%", overflow: "auto"}}
                      spacing={2}>
            <Snackbar
                anchorOrigin={{vertical: "top", horizontal: "right"}}
                open={snackbar}
                onClose={() => {
                    this.setState({snackbar: false})
                }}
                key={"snackabr"}
                autoHideDuration={null}
            >
                <Alert severity="success" sx={{width: '100%'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            {loading && <LinearProgress variant={"indeterminate"} color={"success"}/>}
            {!loading && files}
        </Stack>;
    }
}

FilesTable.defaultProps = {
    navigateBack: () => {
        console.log("NOT IMPLEMENTED navigateBack")
    },
    torrents: [],
    client: {},
    search: null
};

export default FilesTable
