import React, {useState} from 'react';
import {
    Checkbox,
    Collapse,
    IconButton,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Stack,
    TableCell,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import {
    ContentCopy,
    Delete,
    DeleteForever,
    DownloadForOffline,
    FolderOpen,
    KeyboardArrowDown, KeyboardArrowUp,
    Link,
    LiveTvOutlined,
    OndemandVideo,
    PauseCircle,
    PlayCircleOutline
} from "@mui/icons-material";
import {copyToClipboard, humanFileSize, toTime} from "./../utils";
import {LinearProgressWithLabel} from "./../components/LinearProgressWithLabel";
import FileElement from "./../components/FileElement";


function TorrentTableRow(props) {
    let {openSnackbar, remote, client, torrent, index, isRowSelected, onChangeRowSelection} = props;

    const [rowOpened, setRowOpened] = useState(false)

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
    return (<>
        <TableRow key={torrent.infoHash || ("VALUE-" + index)} sx={{borderBottom: 'unset'}}>
            <TableCell key={"checkbox-child"} padding={"checkbox"} component="th" scope="row">
                <Checkbox
                    color="primary"
                    checked={isRowSelected}
                    onClick={() => onChangeRowSelection(torrent.infoHash)}
                />
            </TableCell>
            <TableCell sx={{maxWidth:"250px"}} key={"name-child"} component="th" scope="row">
                <Typography sx={{wordWrap: "break-word"}} variant={"body2"}>{torrent.name}</Typography>
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
                    {humanFileSize(torrent.size)}
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
                            <LiveTvOutlined color={"primary"}/>
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
                        copyToClipboard("https://tndsite.gitlab.io/quix-player/?magnet=" + torrent.infoHash, openSnackbar)
                    }}>
                        <Link color={"primary"}/>
                    </IconButton>
                </Tooltip>
                <Tooltip key={"pause"} title={torrent.paused ? "Start" : "Pause"}>
                    <IconButton onClick={() => {
                        if (torrent.paused) {
                            client.addTorrent({magnet: torrent.magnet, path: torrent.path})
                        } else {
                            client.pauseTorrent({magnet: torrent.magnet})
                        }
                    }}>
                        {torrent.paused ? <PlayCircleOutline color={"primary"}/> :
                            <PauseCircle color={"primary"}/>}
                    </IconButton>
                </Tooltip>
                <Tooltip key={"delete"} title={"Remove element only from the list"}>
                    <IconButton onClick={() => {
                        client.removeTorrent({magnet: torrent.magnet})
                    }}>
                        <Delete color={"primary"}/>
                    </IconButton>
                </Tooltip>
                <Tooltip key={"delete-forever"} title={"Remove element from list and from the memory"}>
                    <IconButton onClick={() => {
                        client.destroyTorrent({magnet: torrent.magnet})
                    }}>
                        <DeleteForever color={"primary"}/>
                    </IconButton>
                </Tooltip>
                <Tooltip key={"magnet-copy"} title={"Copy magnet to the clipboard"}>
                    <IconButton onClick={() => {
                        copyToClipboard(torrent.magnet, openSnackbar)
                    }}>
                        <ContentCopy color={"primary"}/>
                    </IconButton>
                </Tooltip>
                <Tooltip key={"open-detail"} title={"Expand the list of file in the torrent"}>
                    <IconButton onClick={() => {
                        setRowOpened(!rowOpened);
                    }}>
                        {rowOpened ? <KeyboardArrowUp color={"primary"}/> : <KeyboardArrowDown color={"primary"}/>}
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
        <TableRow key={"secondary-" + torrent.infoHash}>
            <TableCell key={"secondary-checkbox"} padding={"checkbox"}
                       sx={{paddingBottom: 0, paddingTop: 0}}
                       colSpan={6}>
                <Collapse in={rowOpened} timeout="auto" unmountOnExit>
                    {torrent.files.map(f => {
                        return <FileElement key={"file-" + f.id}
                                            torrentMagnet={torrent.magnet}
                                            remote={remote}
                                            file={f}
                                            client={client}
                                            torrent={torrent}
                        />
                    })}
                </Collapse>
            </TableCell>
        </TableRow>
    </>);
}


export default TorrentTableRow;
