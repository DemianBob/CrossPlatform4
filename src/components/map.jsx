import * as d3 from "d3";
import * as Geo from "../geo.json";
import {useRef, useEffect} from "react";

function Map(props){
    const width = 1000;
    const height = 600;
    const margin = {
        top: 30,
        right: 30,
        bottom: 30,
        left: 120
    };

    const containerRef = useRef(null);
    const launchpadPointsRef = useRef(null);
    const projectionRef = useRef(null);

    const showMap = (launchpads) => {
        if (!launchpads || !launchpadPointsRef.current || !projectionRef.current) return;
        launchpadPointsRef.current.selectAll("circle").remove();
        
        launchpadPointsRef.current.selectAll("circle")
            .data(launchpads)
            .enter()
            .append("circle")
            .attr("cx", d => projectionRef.current([d.longitude, d.latitude])[0])
            .attr("cy", d => projectionRef.current([d.longitude, d.latitude])[1])
            .attr("r", 6)
            .style("fill", "red")
            .style("opacity", 1)
            .attr("class", "launchpad-point")
            .attr("data-id", d => d.id);
    };

    const showLaunchpad = (launchpadId) => {
        if (!launchpadPointsRef.current) return;
        launchpadPointsRef.current
            .selectAll("circle")
            .style("fill", "red")
            .attr("r", 6)
            .filter(d => d.id === launchpadId)
            .style("fill", "orange")
            .attr("r", 10);
    };

    const reset = () => {
        if (!launchpadPointsRef.current) return;
        launchpadPointsRef.current
            .selectAll("circle")
            .style("fill", "red")
            .attr("r", 6);
    };

    useEffect(() => {
        if (!props.onMapReady) return;
        props.onMapReady({
            showLaunchpad,
            reset,
            showMap
        });
    }, []);

    useEffect(() => {
        if (props.launchpads && launchpadPointsRef.current && projectionRef.current) {
            showMap(props.launchpads);
        }
    }, [props.launchpads]);

    useEffect(()=> { 
        const svg = d3.select(containerRef.current).append("svg");
        svg.selectAll("*").remove();
        svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom )
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)

        const projection = d3.geoMercator()
            .scale(80)
            .center([0, 20])
            .translate([width/2 - margin.left, height/2 - margin.top]);
        
        projectionRef.current = projection;

        const g = svg.append("g");
        g.selectAll("path")
            .data(Geo.features)
            .enter()
            .append("path")
            .attr("class", "topo")
            .attr("d", d3.geoPath().projection(projection))
            .style("opacity", .7);
        
        launchpadPointsRef.current = g.append("g").attr("class", "launchpads");
        
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', function(event) {
                g.selectAll('path')
                    .attr('transform', event.transform);
                g.selectAll('.launchpads circle')
                    .attr('transform', event.transform);
            });

        svg.call(zoom);
    }, []);

    return(
        <div className="mapContainer map" ref={containerRef}>
        </div>
    )
}

export {Map}