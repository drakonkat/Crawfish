import React, {useEffect, useState} from 'react';
import {Container, CssBaseline, Stack, ThemeProvider, Typography} from "@mui/material";
import logo from "../asset/default-nomargin.svg"
import WebTorrentGuiV2 from "../library/WebTorrentGuiV2";
import {observer} from "mobx-react";
import ErrorBoundary from "./ErrorBoundary";


function TorrentManager(props) {
    let {store} = props;
    let {theme} = store;
    const [path, setPath] = useState(null);
    useEffect(() => {
        (async () => {
            let port = process.env.REACT_APP_CUSTOM_API_PORT || new URLSearchParams(window.location.search).get("port") || window.location.port;
            let protocol = window.location.protocol;
            let domain = window.location.hostname;
            let path = `${protocol}//${domain}${port ? (":" + port) : ""}` + process.env.REACT_APP_BASE_PATH
            console.info("Setting at startup api path: ", path)
            setPath(path);
        })()
    }, [])
    console.debug("Using path: ", path)
    return (
        <ThemeProvider theme={theme.get}>
            <CssBaseline/>
            <ErrorBoundary>
                <Container maxWidth="false">
                    <Stack id={"outer_stack_container"} sx={{height: "100%", width: "100%"}} spacing={2}
                           alignItems={"center"}>
                        {path ? <WebTorrentGuiV2 store={store} logo={logo}
                                                 remote={!((path).includes("localhost") || (path).includes("127.0.0.1"))}
                                                 key={path} baseUrl={path}/> : <Typography variant={"body1"}>
                            Something got wrong attach the request.log file and open an issue on github
                        </Typography>}
                    </Stack>
                </Container>
            </ErrorBoundary>
        </ThemeProvider>
    );
}

export default observer(TorrentManager);
