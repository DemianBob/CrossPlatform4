import {LaunchList} from "./launchList";
import {Map} from "./map";
import {useEffect, useState, useRef} from "react";
import {SpaceX} from "../api/spacex";

function App(){
    const [launches, setLaunches] = useState([]);
    const [launchpads, setLaunchpads] = useState([]);
    const mapFunctionsRef = useRef(null);
    const spacex = new SpaceX();

    useEffect(()=>{
        spacex.launches().then(data =>{
            setLaunches(data);
        })
        spacex.launchpads().then(data =>{
            setLaunchpads(data);
        })
    },[])

    useEffect(() => {
        if (mapFunctionsRef.current?.showMap && launchpads.length > 0) {
            mapFunctionsRef.current.showMap(launchpads);
        }
    }, [launchpads]);

    const onMapReady = (mapFunctions) => {
        mapFunctionsRef.current = mapFunctions;
    }

    const handleLaunchInteraction = (launchpadId) => {

    if (launchpadId) {
        mapFunctionsRef.current.showLaunchpad(launchpadId);
    } else {
        if (mapFunctionsRef.current?.reset) {
            mapFunctionsRef.current.reset();
        }
    }
};

return(
    <main className='main'>
        <LaunchList 
            launches={launches} 
            onHoverEnter={(id) => handleLaunchInteraction(id)}
            onHoverEnd={() => handleLaunchInteraction(null)}
        />
        <Map launchpads={launchpads} onMapReady={onMapReady}/>
    </main>
)
}

export {App};