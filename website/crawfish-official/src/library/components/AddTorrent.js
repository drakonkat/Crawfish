import React, {Component} from 'react';
import {
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {Save} from "@mui/icons-material";

class AddTorrent extends Component {
    state = {
        path: this.props.defaultPath
    }

    render() {
        let {open, onSubmit, onClose} = this.props;
        let {path, magnet, files} = this.state;
        return (
            <Dialog open={open} onClose={() => {
                onClose()
            }}>
                <DialogTitle>Add a torrent</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Here you can add a magnet address, or upload a file
                    </DialogContentText>
                    <Stack spacing={2}>
                        <Typography variant={"body1"}>
                            Magnet
                        </Typography>
                        {files ? <Chip label={files[0].name} variant="outlined"
                                       onDelete={() => {
                                           this.setState({files: null})
                                       }}
                            />
                            :
                            <TextField
                                id={"magnet"}
                                type="text"
                                variant={"outlined"}
                                value={magnet}
                                onChange={(e) => {
                                    this.setState({magnet: e.target.value})
                                }}
                                // InputProps={{
                                //     endAdornment: (
                                //         <InputAdornment position="end">
                                //             <IconButton variant="contained"
                                //                         component="label">
                                //                 <FileUploadOutlined/>
                                //                 <input
                                //                     type="file"
                                //                     hidden
                                //                     accept={".torrent"}
                                //                     onChange={(e) => {
                                //                         this.setState({files: e.target.files, magnet: null})
                                //                     }}
                                //                 />
                                //             </IconButton>
                                //         </InputAdornment>
                                //     )
                                // }}
                            />}
                        <br/>

                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        onClose()
                    }}>Cancel</Button>
                    <Button startIcon={<Save/>} variant={"contained"} onClick={() => {
                        onSubmit(path, magnet || files[0])
                        this.setState({
                            magnet: null,
                            files: null,
                            path: null
                        })
                    }}>
                        Save and close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

AddTorrent.defaultProps = {
    open: false,
    onSubmit: () => {
    },
    onClose: () => {
    },
    defaultPath: null
}
export default AddTorrent;
