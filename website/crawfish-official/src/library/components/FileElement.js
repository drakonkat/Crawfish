import React from 'react';
import {IconButton, ListItemButton, Stack, Tooltip, Typography} from "@mui/material";
import {OpenInNew, PauseCircle, PlayCircleOutline} from "@mui/icons-material";
import {LinearProgressWithLabel} from "./LinearProgressWithLabel";
import {humanFileSize} from "../utils";

function FileElement(props) {
    let {client, file, remote, torrentMagnet, torrent} = props;
    if (!remote) {
        remote = false;
    }
    let onClick = () => {
        if (file.streamable && remote) {
            window.open("https://tndsite.gitlab.io/quix-player/?magnet=" + torrentMagnet, "_blank")
            // window.open("https://btorrent.xyz/view#" + torrentMagnet, "_blank");
        } else if (remote) {
            let a = document.createElement("a");
            a.href = client.fileStreamLink(file.id, file.name, remote);
            a.download = file.name;
            a.click();
        } else {
            client.fileOpen(file.id);
        }
    }
    let color = "primary";

    if (file.paused) {
        color = "warning";
    } else if (file.progress === 1) {
        color = "success";
    }
    return (
        <Tooltip
            title={remote ? "Stream file if in a compatible format, if not when is completed can be downloaded" : "Open file locally (Even if download is not complete)"}>
            <ListItemButton disabled={(!file.streamable && remote && !file.done)} alignItems={"center"}
                            sx={{width: "100%", gap: 3}}
                            direction={"row"} onClick={onClick}>
                {/*<IconButton*/}
                {/*    disabled={(!file.streamable && remote && !file.done)}*/}
                {/*    color={"primary"}*/}
                {/*>*/}
                <OpenInNew/>
                {/*</IconButton>*/}
                <Typography variant={"body1"}>{file.name}</Typography>
                <Stack flex={1} direction={"row"} gap={1} justifyContent={"flex-end"} alignItems={"center"}>
                    <Typography variant={"body2"}>
                        {humanFileSize(file.length)}
                    </Typography>
                    <LinearProgressWithLabel color={color}
                                             value={file.progress * 100}/>
                    {!torrent.paused && <IconButton onClick={() => {
                        if (file.paused) {
                            client.selectTorrent({
                                magnet: torrentMagnet,
                                fileName: file.name
                            })
                        } else {
                            client.deselectTorrent({
                                magnet: torrentMagnet,
                                fileName: file.name
                            })
                        }
                    }}>
                        {file.paused ? <PlayCircleOutline color={"primary"}/> :
                            <PauseCircle color={"primary"}/>}
                    </IconButton>}
                </Stack>
            </ListItemButton>
        </Tooltip>
    )
        ;
}

export default FileElement;
