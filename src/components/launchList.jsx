import React from 'react';

function LaunchList(props) {
    const [selected, setSelected] = React.useState([]);

    const handleClick = (launch) => {
        if (selected.includes(launch.id)) {
            setSelected(selected.filter(id => id !== launch.id));
        } else {
            setSelected([...selected, launch.id]);
            props.onHoverEnter(launch.launchpad);
        }
    };
    
    return (
        <aside className="aside" id="launchesContainer">
            <h3>Launches</h3>
            <div id="listContainer">
                <ul>
                    {props.launches.map(launch => (
                        <li key={launch.id}>
                            <button
                                className={selected.includes(launch.id) ? 'selected' : ''}
                                onClick={() => handleClick(launch)}
                            >
                                {launch.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    )
}

export {LaunchList}