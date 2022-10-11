import {createTheme} from "@mui/material";

const defaultTheme = createTheme();
const options = {
    typography: {
        fontSize: 12,
    },
    palette: {
        mode: 'dark',
        background: {
            default: "#303030",
            paper: "#424242"
        }
    },
    components: {
        MuiTab: {
            root: {
                padding: "0px"
            }
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: "10px"
                }
            }
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: "20px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                }
            }
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    height: "100%",
                },
            },
        },
        MuiContainer: {
            styleOverrides: {
                root: {
                    overflow:"hidden",
                    paddingLeft: "0px",
                    paddingRight: "0px",
                    height: "100%",
                    [defaultTheme.breakpoints.up('xs')]: {
                        paddingLeft: "0px",
                        paddingRight: "0px",
                        paddingTop: "5px",
                    }
                },
            },
        },
    },
};
export const createAppStore = () => {
    return {
        loading: {
            get: true,
            set(data) {
                if (data !== this.get) {
                    this.get = data;
                }
            },
        },
        error: {
            get: false,
            set(data) {
                if (data !== this.get) {
                    this.get = data;
                }
            },
        },
        conf:
            {
                get: {},
                set(data) {
                    if (data !== this.get) {
                        this.get = data;
                    }
                },
            },
        status:
            {
                get: [],
                set(data) {
                    if (JSON.stringify(data) !== JSON.stringify(this.get)) {
                        this.get = data;
                    }
                },
            },
        theme: {
            get: createTheme(options),
            options: options,
            getDefaultTheme() {
                return createTheme(options)
            },
            set(themeOptions) {
                this.get = createTheme(themeOptions)
            }

        }
    }
}
