import { memo, useCallback } from 'react';

const LaunchItem = memo(({ launch, onMouseEnter, onMouseLeave }) => {
    const handleMouseEnter = useCallback(() => {
        onMouseEnter(launch.launchpad);
    }, [launch.launchpad, onMouseEnter]);

    return (
        <li 
            className="launch-item"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="launch-info">
                <h4 className="launch-name">{launch.name}</h4>
                {launch.date_utc && (
                    <time className="launch-date">
                        {new Date(launch.date_utc).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </time>
                )}
                {launch.details && (
                    <p className="launch-details">{launch.details.substring(0, 100)}...</p>
                )}
            </div>
            {launch.success !== undefined && (
                <div className={`launch-status ${launch.success ? 'success' : 'failed'}`}>
                    {launch.success ? '✓ Success' : '✗ Failed'}
                </div>
            )}
        </li>
    );
});

LaunchItem.displayName = 'LaunchItem';

function LaunchList({ launches, onHoverEnter, onHoverEnd }) {
    const handleMouseLeave = useCallback(() => {
        onHoverEnd();
    }, [onHoverEnd]);

    if (!launches || launches.length === 0) {
        return (
            <aside className="launch-list empty">
                <h2>Launches</h2>
                <div className="empty-state">
                    <p>No launches available</p>
                </div>
            </aside>
        );
    }

    return (
        <aside className="launch-list">
            <header className="list-header">
                <h2>Recent Launches ({launches.length})</h2>
                <p className="hint">Hover over a launch to see its launchpad on the map</p>
            </header>
            
            <div className="list-container">
                <ul className="launches">
                    {launches.map((launch) => (
                        <LaunchItem
                            key={launch.id}
                            launch={launch}
                            onMouseEnter={onHoverEnter}
                            onMouseLeave={handleMouseLeave}
                        />
                    ))}
                </ul>
            </div>
        </aside>
    );
}

export { LaunchList };