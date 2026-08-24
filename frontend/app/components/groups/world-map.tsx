"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";

const DEFAULT_CENTER: [number, number] = [-25.8587, 28.1891];
const DEFAULT_ZOOM = 6;

// OSRM polylines are encoded with precision 5 by default.
const POLYLINE_PRECISION = 5;

const ROUTE_STYLE = {
    color: "#3b82f6",
    weight: 5,
    opacity: 0.7,
};

const START_MARKER_HTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="#16a34a" stroke="#ffffff" stroke-width="1">
        <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/>
        <circle cx="12" cy="9" r="3" fill="#ffffff" stroke="none"/>
    </svg>
`;

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
    start: MapPoint | null;
    end: MapPoint | null;
};

type WorldMapProps = {
    routes: WorldMapRoute[];
};

type LeafletModule = typeof import("leaflet");

export function WorldMap({ routes }: WorldMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const routeLayerRef = useRef<LayerGroup | null>(null);
    const leafletRef = useRef<LeafletModule | null>(null);

    const [ready, setReady] = useState(false);
    const [prevRoutes, setPrevRoutes] = useState(routes);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const t = useTranslations("group");

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

        if (routePositions && routePositions.length > 0) {
            const routeLine = L.polyline(routePositions, ROUTE_STYLE);
            routeLine.addTo(layer);

            const bounds = routeLine.getBounds();
            if (bounds.isValid()) {
                mapRef.current.fitBounds(bounds, { padding: [40, 40] });
            }
        }

        if (selectedRoute?.start) {
            L.marker([selectedRoute.start.latitude, selectedRoute.start.longitude], {
                icon: L.divIcon({
                    html: START_MARKER_HTML,
                    className: "",
                    iconSize: [30, 30],
                    iconAnchor: [15, 30],
                }),
                title: selectedRoute.start.label,
            }).addTo(layer);
        }

        if (selectedRoute?.end) {
            L.marker([selectedRoute.end.latitude, selectedRoute.end.longitude], {
                icon: L.divIcon({
                    html: END_MARKER_HTML,
                    className: "",
                    iconSize: [30, 30],
                    iconAnchor: [15, 30],
                }),
                title: selectedRoute.end.label,
            }).addTo(layer);
        }
    }, [ready, selectedRoute, routePositions]);

    return (
        <div className="relative flex h-[350px] w-full flex-col overflow-hidden rounded-2xl border border-gray-300">
            {routes.length > 0 && (
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

                {ready && (!routePositions || routePositions.length === 0) && (
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