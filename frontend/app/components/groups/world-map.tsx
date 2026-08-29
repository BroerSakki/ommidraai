"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, LatLngBounds, LayerGroup } from "leaflet";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";
import ArrowIcon from "./ui/Arrow";
import { renderToString } from "react-dom/server";
import DriverIcon from "./ui/Driver";
import LocationIcon from "./ui/Location";

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
	"#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
];

// One colour per driver, used when the owner enables "show all routes".
const DRIVER_COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
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

type MapPoint = {
    label: string;
    latitude: number;
    longitude: number;
};

type WorldMapRoute = {
    id: string;
    driver: string;
    ranking: number;
    destination: string;
    distance: number | null;
    geometry: string | null;
    // Every node along the path in order: driver start, any passengers, destination.
    points: MapPoint[];
};

type WorldMapProps = {
    routes: WorldMapRoute[];
    allRoutes: WorldMapRoute[];
    passengerDriver: string | null;
    isOwner: boolean;
};

type LeafletModule = typeof import("leaflet");

export function WorldMap({
    routes,
    allRoutes,
    passengerDriver,
    isOwner,
}: WorldMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const routeLayerRef = useRef<LayerGroup | null>(null);
    const leafletRef = useRef<LeafletModule | null>(null);

    const [ready, setReady] = useState(false);
    const [prevRoutes, setPrevRoutes] = useState(routes);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showAllRoutes, setShowAllRoutes] = useState(false);
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

    // The routes to draw: either just the current user's route to the
    // selected destination, or every driver's route to that destination
    // (the owner's "show all routes" toggle).
    const renderList = useMemo(() => {
        if (showAllRoutes) {
            const destination =
                selectedRoute?.destination ?? allRoutes[0]?.destination ?? null;

            if (!destination) {
                return [];
            }

            return allRoutes.filter(
                (route) => route.destination === destination
            );
        }

        return selectedRoute ? [selectedRoute] : [];
    }, [showAllRoutes, allRoutes, selectedRoute]);

    // Decode every route that is currently being drawn into
    // [latitude, longitude] pairs.
    const decodedByRoute = useMemo(() => {
        const decoded = new Map<string, Position[]>();

        for (const route of renderList) {
            if (!route.geometry) {
                decoded.set(route.id, []);
                continue;
            }

            try {
                decoded.set(
                    route.id,
                    polyline.decode(route.geometry, POLYLINE_PRECISION)
                );
            } catch {
                decoded.set(route.id, []);
            }
        }

        return decoded;
    }, [renderList]);

    // Give every driver a stable colour. The current user always gets the
    // first colour so their own route stays easy to spot in the overview.
    const driverColors = useMemo(() => {
        const colors = new Map<string, string>();
        const currentDriver = routes[0]?.driver;

        if (currentDriver) {
            colors.set(currentDriver, DRIVER_COLORS[0]);
        }

        for (const route of renderList) {
            if (colors.has(route.driver)) {
                continue;
            }

            colors.set(
                route.driver,
                DRIVER_COLORS[colors.size % DRIVER_COLORS.length]
            );
        }

        return colors;
    }, [renderList, routes]);

    const hasVisibleRoute =
        renderList.length > 0 &&
        renderList.some((route) => {
            const positions = decodedByRoute.get(route.id);

            return (
                (positions && positions.length > 0) ||
                (route.points && route.points.length > 0)
            );
        });

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

        let combinedBounds: LatLngBounds | null = null;

        renderList.forEach((route) => {
            const positions = decodedByRoute.get(route.id) ?? [];
            const points = route.points ?? [];
            let driverIconColor = LEG_COLORS[0];

            let bounds: LatLngBounds | null = null;

            if (positions.length > 0) {
                bounds = L.latLngBounds(positions);
            } else if (points.length >= 2) {
                bounds = L.latLngBounds(
                    points.map((point) => [
                        point.latitude,
                        point.longitude,
                    ])
                );
            }

            if (showAllRoutes) {
                // Overview mode: draw the whole route in the driver's colour
                // so every driver can be told apart at a glance.
                const color =
                    driverColors.get(route.driver) ?? ROUTE_STYLE.color;

                driverIconColor = color;
                const drawable =
                    positions.length > 1
                        ? positions
                        : points.length >= 2
                          ? (points.map(
                                (point) =>
                                    [point.latitude, point.longitude] as Position
                            ) as Position[])
                          : ([] as Position[]);

                if (drawable.length > 1) {
                    L.polyline(drawable, {
                        color,
                        weight: 5,
                        opacity: 0.9,
                    }).addTo(layer);

                    addArrows(L, drawable, color, layer);
                }
            } else {
                // Single-user mode: a faint underlay of the whole journey
                // keeps overall continuity.
                if (positions.length > 0) {
                    L.polyline(positions, {
                        color: ROUTE_STYLE.color,
                        weight: 6,
                        opacity: 0.25,
                    }).addTo(layer);
                }

                // Draw each leg in its own colour (so a road travelled more
                // than once appears as distinct bands) and add arrows showing
                // the direction of travel.
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
            }

            // Drop a pin for every node along the path: start (green), any
            // passengers picked up in between (amber), and the destination (red).
            points.forEach((point, index) => {
                const isStart = index === 0;
                const isEnd = index === points.length - 1;
                const markerHtml = isStart
                    ? renderToString(<DriverIcon color={driverIconColor}/>)
                    : isEnd
                      ? renderToString(<LocationIcon color="#e74c3c"/>)
                      : renderToString(<LocationIcon color="#f59e0b"/>);

                L.marker([point.latitude, point.longitude], {
                    icon: L.divIcon({
                        html: markerHtml,
                        className: "",
                        iconSize: [30, 30],
                        iconAnchor: [15, 30],
                    }),
                    title: point.label,
                }).addTo(layer);
            });

            if (bounds && bounds.isValid()) {
                combinedBounds = combinedBounds
                    ? combinedBounds.extend(bounds)
                    : bounds;
            }
        });

        if (combinedBounds) {
            mapRef.current.fitBounds(combinedBounds, { padding: [40, 40] });
        }
    }, [ready, renderList, decodedByRoute, driverColors, showAllRoutes]);

    return (
        <div className="relative flex h-[350px] w-full flex-col overflow-hidden rounded-2xl border border-gray-300">
            {!passengerMessage && (routes.length > 0 || isOwner) && (
                <div className="relative z-[500] flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
                    {routes.length > 0 && (
                        <>
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
                        </>
                    )}

                    {isOwner && (
                        <button
                            type="button"
                            role="switch"
                            aria-checked={showAllRoutes}
                            onClick={() => setShowAllRoutes((value) => !value)}
                            className="ml-auto flex shrink-0 items-center gap-2 text-xs font-semibold text-gray-600"
                        >
                            <span
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    showAllRoutes
                                        ? "bg-[#3d3461]"
                                        : "bg-gray-300"
                                }`}
                            >
                                <span
                                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                        showAllRoutes
                                            ? "translate-x-[22px]"
                                            : "translate-x-1"
                                    }`}
                                />
                            </span>

                            {showAllRoutes
                                ? t("worldMapShowMyRoute")
                                : t("worldMapShowAllRoutes")}
                        </button>
                    )}
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

                {ready && !passengerMessage && !hasVisibleRoute && (
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