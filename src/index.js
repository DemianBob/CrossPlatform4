import * as d3 from "d3"
import * as Geo from "./geo.json"

import {React} from 'react'
import ReactDOM from 'react-dom/client'
import {App} from "./components/app";

document.addEventListener("DOMContentLoaded", setup)

function setup(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    const element = <App />;
    root.render(element);

}