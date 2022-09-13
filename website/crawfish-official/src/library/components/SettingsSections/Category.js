import React, {useEffect, useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Collapse,
    Grid,
    IconButton,
    LinearProgress,
    MenuItem,
    Select,
    Stack,
    TextField
} from "@mui/material";
import {Add, Cancel, DeleteForever, ExpandMore, ModeEdit, Save, SettingsBackupRestore} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import ConfirmationButton from "../SupportComponent/ConfirmationButton";

function TextIcon(props) {
    return (<IconButton onClick={props.onClick}>
            {props.icon}
        </IconButton>
        // <Stack justifyContent={"center"} alignItems={"center"}>
        //    {/*<Button sx={{textTransform: "Capitalize"}} onClick={props.onClick}>*/}
        //    {/*    <Typography variant={"body1"}>{props.text}</Typography>*/}
        //    {/*</Button>*/}
        // </Stack>
    )

}


function CategoryItem(props) {
    let [category, setCategory] = useState(props.category);
    let [edit, setEdit] = useState(false);
    return (
        <Accordion sx={{width: "100%"}}>
            <AccordionSummary
                expandIcon={<ExpandMore/>}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography sx={{width: '33%', flexShrink: 0}}>{category.label}</Typography>
                <Typography sx={{color: 'text.secondary'}}>{category.type}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack direction={"row"} sx={{width: "100%"}}>
                    <Grid sx={{width: "90%"}} container spacing={2} justifyContent={"space-around"}>
                        <Grid item>
                            <Typography variant={"subtitle2"}>Path:</Typography>
                            <TextField
                                disabled={!edit}
                                multiline
                                id={"path"}
                                type="text"
                                variant={"outlined"}
                                value={category.path}
                                onChange={(e) => setCategory({...category, path: e.target.value})}
                            />
                        </Grid>
                        <Grid item>
                            <Typography variant={"subtitle2"}>Menu label:</Typography>
                            <TextField
                                disabled={!edit}
                                multiline
                                id={"label"}
                                type="text"
                                variant={"outlined"}
                                value={category.label}
                                onChange={(e) => setCategory({...category, label: e.target.value})}
                            />
                        </Grid>
                        <Grid item>
                            <Typography variant={"subtitle2"}>Tag (included in the search):</Typography>
                            <TextField
                                disabled={!edit}
                                multiline
                                id={"tag"}
                                type="text"
                                variant={"outlined"}
                                value={category.tag}
                                onChange={(e) => setCategory({...category, tag: e.target.value})}
                            />
                        </Grid>
                        <Grid item>
                            <Typography variant={"subtitle2"}>Default search:</Typography>
                            <TextField
                                disabled={!edit}
                                id={"defaultSearch"}
                                type="text"
                                variant={"outlined"}
                                value={category.defaultSearch}
                                onChange={(e) => setCategory({...category, defaultSearch: e.target.value})}
                            />
                        </Grid>
                        <Grid item>
                            <Typography variant={"subtitle2"}>Indexer:</Typography>
                            <Select
                                disabled={!edit}
                                id="indexer"
                                value={category.type}
                                onChange={(e) => setCategory({...category, type: e.target.value})}
                            >
                                {props.indexers.map((i) => <MenuItem value={i}>{i}</MenuItem>)}
                            </Select>
                        </Grid>
                    </Grid>
                    <Stack direction={"column"} justifyContent={"center"} alignItems={"center"} sx={{width: "10%"}}>
                        {!edit && <TextIcon key={"EDIT"} icon={<ModeEdit onClick={() => {
                            setEdit(true)
                        }
                        } color={"primary"}/>} text={"Edit"}/>}
                        {!edit && <TextIcon key={"DELETE"} onClick={async () => {
                            if (category.id) {
                                await props.client.deleteCategory(category.id)
                            }
                            props.refreshCategory();
                        }} icon={<DeleteForever color={"primary"}/>} text={"Delete"}/>}
                        {edit && <TextIcon key={"SAVE"} onClick={async () => {
                            if (category.id) {
                                await props.client.editCategory(category.id, category)
                            } else {
                                await props.client.addCategory(category)
                            }
                            setEdit(!edit)
                            props.refreshCategory();
                        }} icon={<Save color={"primary"}/>} text={"Save"}/>}
                        {edit && <TextIcon key={"CANCEL"} onClick={() => {
                            setEdit(!edit);
                            setCategory(props.category)
                        }} icon={<Cancel color={"primary"}/>} text={"Cancel"}/>}
                    </Stack>
                </Stack>
            </AccordionDetails>
        </Accordion>
    );
}

function Category(props) {
    let [loading, setLoading] = useState(true);
    let [categories, setCategories] = useState([]);
    let [indexers, setIndexers] = useState([]);
    const refreshStatus = async () => {
        setLoading(true)
        try {
            let {client} = props
            let res = await client.getCategory();
            setCategories(res.data)
            await props.refreshCategory();
        } catch (e) {
            console.error(e)
        }
        try {
            let {client} = props
            let res = await client.getIndexer();
            setIndexers(res.data)
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }
    useEffect(() => {
        refreshStatus().then(() => {
            setLoading(false)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    if (loading) {
        return <LinearProgress variant={"indeterminate"} color={"success"}/>
    }
    return (<Stack
        key={"Container_Content"}
        spacing={2}
        sx={{
            width: "100%"
        }}>
        <Button onClick={async () => {
            setLoading(true)
            try {
                let newCategoryDefault = {
                    label: "Generic",
                    type: indexers[0]
                }
                categories.push(newCategoryDefault)
                await props.client.addCategory(newCategoryDefault)
                await refreshStatus()
            } catch (e) {
                console.error("Error creating category")
            } finally {
                setLoading(false)
            }
        }} startIcon={<Add/>} variant={"outlined"} fullWidth>ADD</Button>
        {categories.map((category, index) => (
            <Collapse key={category.label + index} in={category.show || true}>
                <CategoryItem key={category.label + index} refreshCategory={refreshStatus} category={category}
                              indexers={indexers} client={props.client}/>
            </Collapse>
        )).reverse()}
        <ConfirmationButton
            onClick={async () => {
                setLoading(true)
                try {
                    await props.client.restoreCategory()
                    await refreshStatus()
                } catch (e) {
                    console.error("Error creating category")
                } finally {
                    setLoading(false)
                }
            }}
            dialogContent={"Clicking 'Ok' all the categories will be restored to default"}
            startIcon={<SettingsBackupRestore/>} variant={"outlined"} fullWidth>Restore default</ConfirmationButton>
    </Stack>);
}

export default Category;
