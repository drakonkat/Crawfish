import React from 'react';
import './index.css';
import App from './App';
import {createRoot} from 'react-dom/client';
import {AppProvider} from "./MobxContext/AppContext";


const container = document.getElementById('root');
const root = createRoot(container);


root.render(<AppProvider><App/></AppProvider>);



