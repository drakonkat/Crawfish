import React from 'react';
import {Box, Stack, Tab, Tabs, Typography} from "@mui/material";
import {Lock} from "@mui/icons-material";
import General from "./SettingsSections/General";
import Category from "./SettingsSections/Category";

function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{p: 3}}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `tab-${index}`,
        'aria-controls': `tabpanel-${index}`,
    };
}

export function SettingsPage(props) {

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };


    return <Stack sx={{padding: "0px", backgroundColor: "background.paper", height: "100%", overflow: "auto"}}
                  spacing={2}>
        <Tabs variant="fullWidth"
              value={value} onChange={handleChange}>
            <Tab label="General" {...a11yProps(0)} />
            <Tab label="Category" {...a11yProps(1)} />
            <Tab disabled icon={<Lock/>} label="Indexer" {...a11yProps(2)} />
        </Tabs>
        <TabPanel value={value} index={0}>
            <General
                {...props}
            />
        </TabPanel>
        <TabPanel value={value} index={1}>
            <Category
                {...props}
            />
        </TabPanel>
        <TabPanel value={value} index={2}>
            Item Three
        </TabPanel>
    </Stack>
}
;
