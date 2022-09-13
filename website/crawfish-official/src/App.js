import './App.css';
import TorrentManager from "./screen/TorrentManager";
import {useAppStore} from "./MobxContext/AppContext";

function App() {
    let store = useAppStore();

    return (
        <TorrentManager store={store}/>
    );
}

export default App;
