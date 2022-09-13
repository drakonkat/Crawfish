import React from 'react';
import {ListItemButton, Tooltip, Typography} from "@mui/material";
import {OpenInNew} from "@mui/icons-material";

function FileElement(props) {
    let {client, file, remote, torrentMagnet} = props;
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
    return (
        <Tooltip
            title={remote ? "Stream file if in a compatible format, if not when is completed can be downloaded" : "Open file locally (Even if download is not complete)"}>
            <ListItemButton disabled={(!file.streamable && remote && !file.done)} alignItems={"center"}
                            sx={{width: "100%", gap: 10}}
                            direction={"row"} onClick={onClick}>
                {/*<IconButton*/}
                {/*    disabled={(!file.streamable && remote && !file.done)}*/}
                {/*    color={"primary"}*/}
                {/*>*/}
                <OpenInNew/>
                {/*</IconButton>*/}
                <Typography variant={"body1"}>{file.name}</Typography>
            </ListItemButton>
        </Tooltip>
    )
        ;
}

export default FileElement;
