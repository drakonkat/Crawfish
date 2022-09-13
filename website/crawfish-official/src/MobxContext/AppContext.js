import {createContext, useContext} from "react";
import {createAppStore} from "./appStore";
import {useLocalObservable} from "mobx-react";

const AppContext = createContext(null)

export const AppProvider = ({children}) => {
    const appStore = useLocalObservable(createAppStore)

    return <AppContext.Provider value={appStore}>
        {children}
    </AppContext.Provider>
}

export const useAppStore = () => useContext(AppContext)

