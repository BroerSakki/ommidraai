"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";
import ArrowIcon from "./ui/Arrow";
import { renderToString } from "react-dom/server";
import DriverIcon from "./ui/Driver";
import PassengerIcon from "./ui/Passenger";

const DEFAULT_CENTER: [number, number] = [-25.8587, 28.1891];
const DEFAULT_ZOOM = 6;

// OSRM polylines are encoded with precision 5 by default.
const POLYLINE_PRECISION = 5;

type Position = [number, number];

type MapNode = {
    latitude: number;
    longitude: number;
};

const ROUTE_STYLE = {
    color: "#3b82f6",
    weight: 5,
    opacity: 0.7,
};

// One colour per leg of the journey. Because every leg is drawn in its own
// colour, a road that is travelled more than once appears as distinct bands
// (and arrow sets) instead of a single overlapping line.
const LEG_COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
];

// Bearing between two points in degrees (0 = north, clockwise), used to
// orient each direction arrow.
function bearingDeg(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const toRad = (deg: number): number => (deg * Math.PI) / 180;
    const toDeg = (rad: number): number => (rad * 180) / Math.PI;

    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const dLng = toRad(lng2 - lng1);

    const y = Math.sin(dLng) * Math.cos(phi2);
    const x =
        Math.cos(phi1) * Math.sin(phi2) -
        Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);

    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function squaredDistance(
    position: Position,
    latitude: number,
    longitude: number
): number {
    const dLat = position[0] - latitude;
    const dLng = position[1] - longitude;
    return dLat * dLat + dLng * dLng;
}

// Finds the decoded-shape-point index closest to a route node, so a path's
// stop order can be mapped onto the continuous OSRM geometry.
function nearestIndex(
    positions: Position[],
    latitude: number,
    longitude: number
): number {
    let bestIndex = 0;
    let bestDistance = Infinity;

    for (let i = 0; i < positions.length; i++) {
        const distance = squaredDistance(
            positions[i],
            latitude,
            longitude
        );
        if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = i;
        }
    }

    return bestIndex;
}

// Splits the decoded geometry into one polyline leg per consecutive pair of
// route nodes (start -> pickup_1 -> ... -> pickup_n -> destination). This is
// what lets repeated roads be shown as separate coloured bands.
function buildLegs(positions: Position[], points: MapNode[]): Position[][] {
    const legs: Position[][] = [];

    if (points.length < 2) {
        return legs;
    }

    // Without geometry, fall back to straight lines between the nodes.
    if (!positions || positions.length === 0) {
        for (let i = 0; i < points.length - 1; i++) {
            legs.push([
                [points[i].latitude, points[i].longitude],
                [points[i + 1].latitude, points[i + 1].longitude],
            ]);
        }
        return legs;
    }

    // Map each route node onto the decoded geometry, enforcing monotonic
    // stop order along the line.
    const nodeIndexes: number[] = [];
    let previousIndex = -1;

    for (let i = 0; i < points.length; i++) {
        let index = nearestIndex(
            positions,
            points[i].latitude,
            points[i].longitude
        );

        if (index < previousIndex) {
            index = previousIndex;
        }

        index = Math.min(index, positions.length - 1);
        nodeIndexes.push(index);
        previousIndex = index;
    }

    for (let i = 0; i < nodeIndexes.length - 1; i++) {
        const start = nodeIndexes[i];
        let end = nodeIndexes[i + 1];

        // Guard against consecutive nodes snapping to the same shape point.
        if (end <= start) {
            if (end + 1 < positions.length) {
                end = start + 1;
            } else {
                continue;
            }
        }

        legs.push(positions.slice(start, end + 1));
    }

    return legs;
}

// Adds arrowheads along a single leg to indicate the direction of travel.
function addArrows(
    L: LeafletModule,
    leg: Position[],
    color: string,
    layer: LayerGroup
): void {
    if (leg.length < 2) {
        return;
    }

    // Aim for roughly three arrows along the leg, regardless of its length.
    const step = Math.max(1, Math.floor(leg.length / 3));

    for (let i = step; i < leg.length; i += step) {
        const [lat1, lng1] = leg[i - 1];
        const [lat2, lng2] = leg[i];
        const rotation = bearingDeg(lat1, lng1, lat2, lng2);

        L.marker([lat2, lng2], {
            icon: L.divIcon({
                className: "",
                html: renderToString(<ArrowIcon rotation={rotation} color={color} className="w-5 h-5"/>),
                iconSize: [20, 20],
                iconAnchor: [10, 10],
            }),
            interactive: false,
        }).addTo(layer);
    }
}

const END_MARKER_HTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="#e74c3c" stroke="#ffffff" stroke-width="1">
        <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/>
        <circle cx="12" cy="9" r="3" fill="#ffffff" stroke="none"/>
    </svg>
`;

type MapPoint = {
    label: string;
    latitude: number;
    longitude: number;
};

type WorldMapRoute = {
    id: string;
    ranking: number;
    destination: string;
    distance: number | null;
    geometry: string | null;
    // Every node along the path in order: driver start, any passengers, destination.
    points: MapPoint[];
};

type WorldMapProps = {
    routes: WorldMapRoute[];
    passengerDriver: string | null;
};

type LeafletModule = typeof import("leaflet");

export function WorldMap({ routes, passengerDriver }: WorldMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const routeLayerRef = useRef<LayerGroup | null>(null);
    const leafletRef = useRef<LeafletModule | null>(null);

    const [ready, setReady] = useState(false);
    const [prevRoutes, setPrevRoutes] = useState(routes);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const t = useTranslations("group");

    // A passenger has no route of their own to draw, so show a notice instead.
    const passengerMessage = passengerDriver
        ? t("worldMapPassenger", { driver: passengerDriver })
        : null;

    // Default back to the best-ranked (first) destination whenever a new
    // route list is received. Adjusted during render (not in an effect) to
    // avoid the extra render cycle a setState-in-effect would cause.
    if (prevRoutes !== routes) {
        setPrevRoutes(routes);
        setSelectedIndex(0);
    }

    const selectedRoute = routes[selectedIndex] ?? null;

    // Decode the selected route's encoded OSRM polyline into
    // [latitude, longitude] pairs.
    const routePositions = useMemo(() => {
        if (!selectedRoute?.geometry) {
            return null;
        }

        try {
            return polyline.decode(selectedRoute.geometry, POLYLINE_PRECISION);
        } catch {
            return null;
        }
    }, [selectedRoute]);

    useEffect(() => {
        let cancelled = false;

        async function initMap() {
            // Leaflet depends on `window`, so it is only loaded on the client
            // (this keeps the component SSR-safe).
            const L = (await import("leaflet")).default;

            if (cancelled || !mapContainerRef.current || mapRef.current) {
                return;
            }

            leafletRef.current = L;

            const map = L.map(mapContainerRef.current, {
                center: DEFAULT_CENTER,
                zoom: DEFAULT_ZOOM,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            routeLayerRef.current = L.layerGroup().addTo(map);

            mapRef.current = map;

            requestAnimationFrame(() => {
                if (!cancelled) {
                    map.invalidateSize();
                    setReady(true);
                }
            });
        }

        initMap();

        return () => {
            cancelled = true;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            routeLayerRef.current = null;
        };
    }, []);

    useEffect(() => {
        const L = leafletRef.current;
        const layer = routeLayerRef.current;

        if (!ready || !L || !layer || !mapRef.current) {
            return;
        }

        layer.clearLayers();

        const positions = routePositions ?? [];
        const points = selectedRoute?.points ?? [];

        // A faint underlay of the whole journey keeps overall continuity.
        if (positions.length > 0) {
            L.polyline(positions, {
                color: ROUTE_STYLE.color,
                weight: 6,
                opacity: 0.25,
            }).addTo(layer);
        }

        // Draw each leg in its own colour (so a road travelled more than once
        // appears as distinct bands) and add arrowheads showing direction.
        const legs = buildLegs(positions, points);

        legs.forEach((leg, index) => {
            const color = LEG_COLORS[index % LEG_COLORS.length];

            L.polyline(leg, {
                color,
                weight: 5,
                opacity: 0.9,
            }).addTo(layer);

            addArrows(L, leg, color, layer);
        });

        // Drop a pin for every node along the path: start (green), any
        // passengers picked up in between (amber), and the destination (red).
        points.forEach((point, index) => {
            const isStart = index === 0;
            const isEnd = index === points.length - 1;
            const markerHtml = isStart
                ? renderToString(<DriverIcon color="#16a34a"/>)
                : isEnd
                  : renderToString(<PassengerIcon color="#f59e0b"/>);
            const markerConfig = isEnd
                ? {
                    size: [48, 44.5] as [number, number],       // Proportional bounding size (un-squashed)
                    anchor: [24, 35.15] as [number, number],  // [Width / 2, Height * 0.77] points perfectly to the bottom tip
                  }
                : {
                    size: [30, 47.5] as [number, number],     // Original profile for Driver / Passenger
                    anchor: [15, 23.75] as [number, number], 
                  };

            L.marker([point.latitude, point.longitude], {
                icon: L.divIcon({
                    html: markerHtml,
                    className: "",
                    iconSize: markerConfig.size,
                    iconAnchor: markerConfig.anchor,
                }),
                title: point.label,
            }).addTo(layer);
        });

        const hasGeometry = positions.length > 0;
        const hasPoints = points.length > 0;

        if (hasGeometry) {
            const bounds = L.latLngBounds(positions);
            if (bounds.isValid()) {
                mapRef.current.fitBounds(bounds, { padding: [40, 40] });
            }
        } else if (hasPoints) {
            const bounds = L.latLngBounds(
                points.map((point) => [point.latitude, point.longitude])
            );
            if (bounds.isValid()) {
                mapRef.current.fitBounds(bounds, { padding: [40, 40] });
            }
        }
    }, [ready, selectedRoute, routePositions]);

    return (
        <div className="relative flex h-[350px] w-full flex-col overflow-hidden rounded-2xl border border-gray-300">
            {!passengerMessage && routes.length > 0 && (
                <div className="relative z-[500] flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
                    <label
                        htmlFor="world-map-destination"
                        className="text-xs font-semibold text-gray-600"
                    >
                        {t("worldMapDestination")}
                    </label>

                    <select
                        id="world-map-destination"
                        value={selectedIndex}
                        onChange={(event) =>
                            setSelectedIndex(Number(event.target.value))
                        }
                        className="flex-1 rounded border border-[#c7c7cc] bg-white px-3 py-2 text-sm text-[#3d3461] outline-none focus:border-[#3d3461]"
                    >
                        {routes.map((route, index) => (
                            <option key={route.id} value={index}>
                                {route.ranking}. {route.destination}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="relative z-0 min-h-0 flex-1">
                {!ready && (
                    <div className="absolute inset-0 z-10 animate-pulse rounded-2xl bg-gray-200" />
                )}

                {passengerMessage && (
                    <div className="absolute inset-0 z-[1000] flex items-center justify-center rounded-2xl bg-gray-100/85 px-4">
                        <p className="text-center text-[15px] font-medium text-gray-700">
                            {passengerMessage}
                        </p>
                    </div>
                )}

                {ready &&
                    !passengerMessage &&
                    (!routePositions || routePositions.length === 0) && (
                        <div className="absolute inset-0 z-[1000] flex items-center justify-center rounded-2xl bg-gray-100/80">
                            <div className="text-center">
                                <div className="mb-3 text-5xl">🌍</div>

                                <p className="text-sm text-gray-500">
                                    {t("worldMapNoRoute")}
                                </p>
                            </div>
                        </div>
                    )}

                <div
                    ref={mapContainerRef}
                    className="z-0 h-full w-full rounded-2xl"
                />
            </div>
        </div>
    );
}