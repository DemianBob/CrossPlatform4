import { useState, useEffect, useCallback, useMemo } from 'react';
import { LaunchList } from './LaunchList';
import { Map } from './Map';
import { SpaceX } from '../api/spacex';

function App() {
    const [launches, setLaunches] = useState([]);
    const [launchpads, setLaunchpads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapFunctions, setMapFunctions] = useState(null);
    
    const spacex = useMemo(() => new SpaceX(), []);

    // Загрузка данных
    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const [launchesData, launchpadsData] = await Promise.all([
                    spacex.launches(),
                    spacex.launchpads()
                ]);
                
                if (isMounted) {
                    setLaunches(launchesData);
                    setLaunchpads(launchpadsData);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to load SpaceX data');
                    console.error('Error:', err);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();
        
        return () => {
            isMounted = false;
        };
    }, [spacex]);

    // Обработчики событий с useCallback
    const handleLaunchHoverEnter = useCallback((launchpadId) => {
        mapFunctions?.highlightLaunchpad?.(launchpadId);
    }, [mapFunctions]);

    const handleLaunchHoverEnd = useCallback(() => {
        mapFunctions?.resetHighlight?.();
    }, [mapFunctions]);

    const handleMapReady = useCallback((functions) => {
        setMapFunctions(functions);
        if (launchpads.length > 0) {
            functions.drawLaunchpads?.(launchpads);
        }
    }, [launchpads]);

    // Состояния загрузки и ошибок
    if (isLoading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading SpaceX launches...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <main className="app">
            <header className="app-header">
                <h1>SpaceX Launch Tracker</h1>
                <p>Track SpaceX launches and their launchpads</p>
            </header>
            
            <div className="content">
                <LaunchList 
                    launches={launches}
                    onHoverEnter={handleLaunchHoverEnter}
                    onHoverEnd={handleLaunchHoverEnd}
                />
                <Map 
                    launchpads={launchpads}
                    onMapReady={handleMapReady}
                />
            </div>
            
            <footer className="app-footer">
                <p>Data provided by SpaceX API</p>
            </footer>
        </main>
    );
}

export { App };