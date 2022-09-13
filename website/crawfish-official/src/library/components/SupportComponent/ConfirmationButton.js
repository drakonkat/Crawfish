import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function ConfirmationButton(props) {
    const [open, setOpen] = React.useState(false);

    let {children, onClick, dialogTitle, dialogContent} = props;
    let buttonProps = {
        ...props,
        onClick: undefined,
        dialogContent: undefined,
        dialogTitle: undefined,
        children: undefined
    }
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Button {...buttonProps} onClick={handleClickOpen}>
                {children}
            </Button>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{dialogTitle}</DialogTitle>
                {dialogContent && <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {dialogContent}
                    </DialogContentText>
                </DialogContent>}
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={() => {
                        handleClose()
                        if (onClick) {
                            onClick();
                        }
                    }}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}


ConfirmationButton.defaultProps = {
    onClick: () => {
        alert("Not implemented yet")
    },
    children: "Not implemented",
    dialogTitle: "Are you sure?"
};

export default ConfirmationButton;
