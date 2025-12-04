import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import worldGeoJson from '../geo.json';

// Конфигурация карты
const MAP_CONFIG = {
    width: 1000,
    height: 600,
    margin: { top: 20, right: 20, bottom: 20, left: 100 },
    zoom: {
        min: 1,
        max: 8,
        initialScale: 70
    },
    launchpads: {
        defaultRadius: 6,
        highlightedRadius: 10,
        defaultOpacity: 0.4,
        highlightedOpacity: 1,
        defaultColor: '#E31A1C',
        highlightedColor: '#FF6B6B'
    },
    projection: {
        center: [0, 20],
        translateOffset: 100
    }
};

function Map({ launchpads = [], onMapReady }) {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const gRef = useRef(null);
    const launchpadsGroupRef = useRef(null);
    const projectionRef = useRef(null);
    const zoomRef = useRef(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Создание проекции
    const createProjection = useCallback(() => {
        return d3.geoMercator()
            .scale(MAP_CONFIG.zoom.initialScale)
            .center(MAP_CONFIG.projection.center)
            .translate([
                MAP_CONFIG.width / 2 - MAP_CONFIG.margin.left,
                MAP_CONFIG.height / 2 - MAP_CONFIG.margin.top
            ]);
    }, []);

    // Инициализация карты
    const initializeMap = useCallback(() => {
        if (!containerRef.current || svgRef.current) return;

        // Очистка
        d3.select(containerRef.current).selectAll('*').remove();

        // Создание SVG
        const svg = d3.select(containerRef.current)
            .append('svg')
            .attr('width', MAP_CONFIG.width + MAP_CONFIG.margin.left + MAP_CONFIG.margin.right)
            .attr('height', MAP_CONFIG.height + MAP_CONFIG.margin.top + MAP_CONFIG.margin.bottom)
            .attr('class', 'world-map');

        svgRef.current = svg.node();

        // Основная группа
        const g = svg.append('g')
            .attr('transform', `translate(${MAP_CONFIG.margin.left}, ${MAP_CONFIG.margin.top})`)
            .attr('class', 'map-group');

        gRef.current = g.node();

        // Проекция
        projectionRef.current = createProjection();

        // Отрисовка стран
        const geoPath = d3.geoPath().projection(projectionRef.current);
        
        g.selectAll('.country')
            .data(worldGeoJson.features)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('d', geoPath)
            .attr('fill', '#e8e8e8')
            .attr('stroke', '#cccccc')
            .attr('stroke-width', 0.5);

        // Группа для космодромов
        launchpadsGroupRef.current = g.append('g')
            .attr('class', 'launchpads-layer')
            .node();

        // Настройка зума
        zoomRef.current = d3.zoom()
            .scaleExtent([MAP_CONFIG.zoom.min, MAP_CONFIG.zoom.max])
            .on('zoom', (event) => {
                d3.select(gRef.current).attr('transform', event.transform);
            });

        svg.call(zoomRef.current);
        
        setIsInitialized(true);
    }, [createProjection]);

    // Отрисовка космодромов
    const drawLaunchpads = useCallback((pads = []) => {
        if (!launchpadsGroupRef.current || !projectionRef.current || pads.length === 0) {
            return;
        }

        const selection = d3.select(launchpadsGroupRef.current);
        
        // Очистка
        selection.selectAll('*').remove();

        // Создание точек
        const points = selection.selectAll('circle')
            .data(pads)
            .enter()
            .append('circle')
            .attr('cx', d => {
                const coords = projectionRef.current([d.longitude, d.latitude]);
                return coords ? coords[0] : 0;
            })
            .attr('cy', d => {
                const coords = projectionRef.current([d.longitude, d.latitude]);
                return coords ? coords[1] : 0;
            })
            .attr('r', MAP_CONFIG.launchpads.defaultRadius)
            .attr('fill', MAP_CONFIG.launchpads.defaultColor)
            .attr('opacity', MAP_CONFIG.launchpads.defaultOpacity)
            .attr('class', 'launchpad-point')
            .attr('data-id', d => d.id)
            .attr('data-name', d => d.name);

        // Добавление тултипов
        points.append('title')
            .text(d => `${d.name}\nLat: ${d.latitude.toFixed(4)}, Lon: ${d.longitude.toFixed(4)}`);
    }, []);

    // Подсветка космодрома
    const highlightLaunchpad = useCallback((launchpadId) => {
        if (!launchpadsGroupRef.current) return;

        const selection = d3.select(launchpadsGroupRef.current);
        
        selection.selectAll('.launchpad-point')
            .attr('r', MAP_CONFIG.launchpads.defaultRadius)
            .attr('fill', MAP_CONFIG.launchpads.defaultColor)
            .attr('opacity', MAP_CONFIG.launchpads.defaultOpacity)
            .filter(d => d.id === launchpadId)
            .attr('r', MAP_CONFIG.launchpads.highlightedRadius)
            .attr('fill', MAP_CONFIG.launchpads.highlightedColor)
            .attr('opacity', MAP_CONFIG.launchpads.highlightedOpacity);
    }, []);

    // Сброс подсветки
    const resetHighlight = useCallback(() => {
        if (!launchpadsGroupRef.current) return;

        d3.select(launchpadsGroupRef.current)
            .selectAll('.launchpad-point')
            .attr('r', MAP_CONFIG.launchpads.defaultRadius)
            .attr('fill', MAP_CONFIG.launchpads.defaultColor)
            .attr('opacity', MAP_CONFIG.launchpads.defaultOpacity);
    }, []);

    // Функции для родительского компонента
    const mapFunctions = useMemo(() => ({
        drawLaunchpads,
        highlightLaunchpad,
        resetHighlight
    }), [drawLaunchpads, highlightLaunchpad, resetHighlight]);

    // Инициализация
    useEffect(() => {
        initializeMap();
        
        return () => {
            if (containerRef.current) {
                d3.select(containerRef.current).selectAll('*').remove();
            }
        };
    }, [initializeMap]);

    // Оповещение о готовности
    useEffect(() => {
        if (isInitialized && onMapReady) {
            onMapReady(mapFunctions);
        }
    }, [isInitialized, onMapReady, mapFunctions]);

    // Обновление космодромов
    useEffect(() => {
        if (isInitialized && launchpads.length > 0) {
            drawLaunchpads(launchpads);
        }
    }, [launchpads, isInitialized, drawLaunchpads]);

    // Легенда карты
    const MapLegend = () => (
        <div className="map-legend">
            <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: MAP_CONFIG.launchpads.defaultColor }}></div>
                <span>SpaceX Launchpad</span>
            </div>
            <div className="legend-item">
                <div className="legend-color highlighted"></div>
                <span>Selected Launchpad</span>
            </div>
        </div>
    );

    return (
        <section className="map-container">
            <header className="map-header">
                <h2>Launchpads Map</h2>
                <p>Click and drag to pan, scroll to zoom</p>
            </header>
            
            <div className="map-wrapper">
                <div 
                    ref={containerRef}
                    className="world-map-container"
                    role="img"
                    aria-label="World map showing SpaceX launchpad locations"
                />
                <MapLegend />
            </div>
            
            <div className="map-stats">
                <p>Showing {launchpads.length} launchpad{launchpads.length !== 1 ? 's' : ''}</p>
            </div>
        </section>
    );
}

export { Map };