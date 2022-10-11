import React from "react";
import {
    Box,
    Checkbox,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Typography
} from "@mui/material";
import {visuallyHidden} from '@mui/utils';


const headCells = [
    {
        id: 'name',
        label: 'Name',
        align: 'left',
        sortable:true
    },
    {
        id: 'progress',
        label: 'Progress',
        sortable:true
    }, {
        id: 'timeRemaining',
        label: 'Time left',
        align: 'align',
        sortable: true
    }, {
        id: 'size',
        label: 'Size',
        align: 'left',
        sortable: true
    }, {
        id: 'actions',
        label: 'Actions',
        sortable: false
    }

];

function TorrentClientTable(props) {
    let {onClick, torrents, predicate, callbackfn, onRequestSort, orderBy, order} = props
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };
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
                    {headCells.map((cell) => {
                        if (cell.sortable) {
                            return <TableCell key={cell.id} align={cell.align || "right"}>
                                <TableSortLabel
                                    active={orderBy === cell.id}
                                    direction={orderBy === cell.id ? order : 'asc'}
                                    onClick={createSortHandler(cell.id)}
                                >
                                    <Typography variant={"subtitle2"}>
                                        {cell.label}
                                    </Typography>
                                    {orderBy === cell.id ? (
                                        <Box component="span" sx={visuallyHidden}>
                                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                        </Box>
                                    ) : null}
                                </TableSortLabel>
                            </TableCell>
                        } else {
                            return <TableCell key={cell.id} align={cell.align || "right"}>
                                <Typography variant={"subtitle2"}>
                                    {cell.label}
                                </Typography>
                            </TableCell>
                        }
                    })}
                </TableRow>
            </TableHead>
            <TableBody key={"table-body"}>
                {torrents && torrents.map(callbackfn)}
            </TableBody>
        </Table>
    </TableContainer>;
}

TorrentClientTable.defaultProps = {
    onClick: () => {
    },
    torrents: [],
    predicate: () => {

    },
    callbackfn: () => {
    },
    onRequestSort: () => {
        console.log("Sorting not implemented")
    }
};

export default TorrentClientTable
