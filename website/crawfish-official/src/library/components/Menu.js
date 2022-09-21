import {
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Stack,
    Switch,
    Tooltip
} from "@mui/material";
import {
    DarkMode,
    Download,
    Home,
    LibraryMusic,
    ManageSearch,
    Movie,
    Settings,
    Tv,
    Upload,
    VideogameAsset
} from "@mui/icons-material";
import React from "react";
import {CLIENT, CLIENT_DOWNLOAD, CLIENT_SEEDING, GAMES, MOVIES, MUSIC, SETTINGS, TVSHOW} from "../types";


Menu.defaultProps = {
    defaultMenu: []
}

export function Menu(props) {
    let {logo, defaultMenu, changeView, enabledView, category} = props;
    return <Stack
        sx={{
            paddingLeft: "10px",
            paddingRight: "10px",
        }}
    >
        <Stack sx={{height: "100%"}} justifyContent={"space-between"}>
            <Stack sx={{height: "80%"}}>
                {logo && <img style={{maxWidth: "250px"}} src={logo} alt={"logo"}/>}
                <List dense={true}>
                    <ListItem>
                        <ListItemText
                            primary="Overview"
                        />
                    </ListItem>
                    <ListItemButton
                        selected={enabledView === CLIENT}
                        onClick={() => {
                            props.filterHome()
                            changeView(CLIENT, null)
                        }}
                    >
                        <ListItemAvatar>
                            <Stack alignItems={"center"} justifyContent={"center"}>
                                <Home/>
                            </Stack>
                        </ListItemAvatar>
                        <ListItemText
                            primary="Home"
                        />
                    </ListItemButton>
                    <ListItemButton
                        selected={enabledView === CLIENT_DOWNLOAD}
                        onClick={() => {
                            props.filterDownload()
                            changeView(CLIENT_DOWNLOAD, null)
                        }}

                    >
                        <ListItemAvatar>
                            <Stack alignItems={"center"} justifyContent={"center"}>
                                <Download/>
                            </Stack>
                        </ListItemAvatar>
                        <ListItemText
                            primary="Downloading"
                        />
                    </ListItemButton>
                    <ListItemButton
                        selected={enabledView === CLIENT_SEEDING}
                        onClick={() => {
                            props.filterSeeding()
                            changeView(CLIENT_SEEDING, null)
                        }}

                    >
                        <ListItemAvatar>
                            <Stack alignItems={"center"} justifyContent={"center"}>
                                <Upload/>
                            </Stack>
                        </ListItemAvatar>
                        <ListItemText
                            primary="Seeding"
                        />
                    </ListItemButton>
                </List>
                <Divider/>
                <List dense={true} sx={{overflowY: "auto"}}>
                    <ListItem>
                        <ListItemText
                            primary="Explore"
                        />
                    </ListItem>
                    {defaultMenu.map((x, index) => {
                        let {tooltip, type, label, id} = x
                        let icon;
                        switch (type) {
                            case MOVIES:
                                icon = <Movie/>;
                                break;
                            case GAMES:
                                icon = <VideogameAsset/>;
                                break;
                            case TVSHOW:
                                icon = <Tv/>;
                                break;
                            case MUSIC:
                                icon = <LibraryMusic/>;
                                break;
                            default:
                                icon = <ManageSearch/>
                                break;
                        }
                        return <Tooltip key={"MENU_VOICE_" + index} open={tooltip ? undefined : false}
                                        title={tooltip || ""}>
                            <ListItemButton
                                onClick={() => {
                                    changeView(type, id)
                                }}
                                selected={category && category.id === id}
                            >
                                <ListItemAvatar>
                                    <Stack alignItems={"center"} justifyContent={"center"}>
                                        {icon}
                                    </Stack>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={label}
                                />
                            </ListItemButton>
                        </Tooltip>
                    })}
                </List>
                <Divider/>
            </Stack>
            <Stack sx={{maxHeight: "20%"}}>
                <ListItem>
                    <ListItemText
                        primary="Configuration"
                    />
                </ListItem>
                <ListItemButton
                    selected={enabledView === SETTINGS}
                    onClick={() => {
                        changeView(SETTINGS)
                    }}>
                    <ListItemAvatar>
                        <Stack alignItems={"center"} justifyContent={"center"}>
                            <Settings/>
                        </Stack>
                    </ListItemAvatar>
                    <ListItemText
                        primary="Settings"
                    />
                </ListItemButton>
                <ListItem>
                    <ListItemAvatar>
                        <Stack alignItems={"center"} justifyContent={"center"}>
                            <DarkMode/>
                        </Stack>
                    </ListItemAvatar>
                    <ListItemText
                        primary="Dark theme"
                    />
                    <Switch defaultChecked={true} onChange={props.onChange}/>
                </ListItem>
            </Stack>
        </Stack>
    </Stack>;
}
