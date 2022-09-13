import React, {Component} from "react";
import {
    Checkbox,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";

class TorrentClientTable extends Component {
    render() {
        let {onClick, torrents, predicate, callbackfn} = this.props
        return <TableContainer key={"table-container"} component={Paper}>
            <Table key={"table-intern"} sx={{minWidth: 650}} size="small">
                <TableHead key={"table-head"}>
                    <TableRow key={"table-row"}>
                        <TableCell key={"checkbox"} padding={"checkbox"}>
                            <Checkbox
                                key={"checkbox_child"}
                                onClick={onClick}
                                checked={torrents.every(predicate)}
                                color={"primary"}/>
                        </TableCell>
                        <TableCell key={"name"}>
                            <Typography variant={"subtitle2"}>
                                Name
                            </Typography>
                        </TableCell>
                        <TableCell key={"progress"} align="right">
                            <Typography variant={"subtitle2"}>
                                Progress
                            </Typography>
                        </TableCell>
                        <TableCell key={"time-left"} align="left">
                            <Typography variant={"subtitle2"}>
                                Time left
                            </Typography>
                        </TableCell>
                        <TableCell key={"size"} align="left">
                            <Typography variant={"subtitle2"}>
                                Size
                            </Typography>
                        </TableCell>
                        <TableCell key={"action"} align="right">
                            <Typography variant={"subtitle2"}>
                                Actions
                            </Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody key={"table-body"}>
                    {torrents && torrents.map(callbackfn)}
                </TableBody>
            </Table>
        </TableContainer>;
    }
}

TorrentClientTable.defaultProps = {
    onClick: () => {
    },
    torrents: [],
    predicate: () => {

    },
    callbackfn: () => {

    }
};

export default TorrentClientTable
