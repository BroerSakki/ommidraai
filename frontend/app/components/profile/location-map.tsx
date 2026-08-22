"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";

const DEFAULT_CENTER: [number, number] = [-25.8587, 28.1891];
const DEFAULT_ZOOM = 12;

const MARKER_HTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="#e74c3c" stroke="#ffffff" stroke-width="1">
        <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/>
        <circle cx="12" cy="9" r="3" fill="#ffffff" stroke="none"/>
    </svg>
`;

type SearchResult = {
    lat: string;
    lon: string;
    display_name: string;
};

type SavedLocation = {
    name: string;
    latitude: number;
    longitude: number;
};

type LeafletModule = typeof import("leaflet");

export function LocationMap() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const markerRef = useRef<LeafletMarker | null>(null);
    const savedMarkersRef = useRef<LayerGroup | null>(null);
    const leafletRef = useRef<LeafletModule | null>(null);

    const [ready, setReady] = useState(false);
    const [selected, setSelected] = useState<{ latitude: number; longitude: number } | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    const t = useTranslations("map");
    const tCommon = useTranslations("common");

    const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);

    useEffect(() => {
        let cancelled = false;

        async function initMap() {
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

            map.on("click", (event) => {
                const { lat, lng } = event.latlng;
                dropMarker(map, lat, lng);
            });

            mapRef.current = map;

            requestAnimationFrame(() => {
                if (!cancelled) {
                    map.invalidateSize();
                    setReady(true);
                }
            });
        }

        initMap();

        fetchSavedLocations();

        return () => {
            cancelled = true;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    async function fetchSavedLocations() {
        try {
            const response = await fetch(`/api/backend/user/locations`);
            if (!response.ok) {
                throw new Error(`Failed to fetch locations (status ${response.status})`);
            }
            const data = (await response.json()) as SavedLocation[];
            setSavedLocations(data);
        } catch (err) {
            console.error("Failed to fetch saved locations:", err);
        }
    }

    const addSavedLocationMarkers = useCallback(() => {
        const map = mapRef.current;
        const L = leafletRef.current;
        if (!map || !L) return;

        if (savedMarkersRef.current) {
            savedMarkersRef.current.clearLayers();
        }

        const layerGroup = L.layerGroup().addTo(map);
        savedMarkersRef.current = layerGroup;

        savedLocations.forEach((loc) => {
            const icon = L.divIcon({
                className: "",
                html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#3498db" stroke="#ffffff" stroke-width="1">
                    <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/>
                    <circle cx="12" cy="9" r="3" fill="#ffffff" stroke="none"/>
                </svg>`,
                iconSize: [24, 24],
                iconAnchor: [12, 24],
            });

            L.marker([loc.latitude, loc.longitude], { icon }).addTo(layerGroup).bindPopup(
                `<div style="font-size: 13px;"><strong>${loc.name}</strong><br/>${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}</div>`
            );
        });
    }, [savedLocations]);

    useEffect(() => {
        addSavedLocationMarkers();
    }, [addSavedLocationMarkers]);

    function dropMarker(map: LeafletMap, latitude: number, longitude: number) {
        const L = leafletRef.current;
        if (!L) {
            return;
        }

        setSelected({ latitude, longitude });
        setMessage("");

        if (markerRef.current) {
            markerRef.current.remove();
        }

        const icon = L.divIcon({
            className: "",
            html: MARKER_HTML,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
        });

        markerRef.current = L.marker([latitude, longitude], { icon }).addTo(map);
    }

    async function handleSearch(event: React.FormEvent) {
        event.preventDefault();
        const q = query.trim();
        if (!q || !mapRef.current) {
            return;
        }

        setSearching(true);
        setSearchError("");
        setResults([]);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`,
                { headers: { Accept: "application/json" } },
            );

            if (!response.ok) {
                throw new Error(`Search failed with status ${response.status}`);
            }

            const data = (await response.json()) as SearchResult[];
            setResults(data);

            if (data.length > 0) {
                goToResult(data[0]);
            } else {
                setSearchError(t("noPlacesFound"));
            }
        } catch (err) {
            setSearchError(
                t("searchFailed", {
                    error:
                        err instanceof Error ? err.message : tCommon("unknownError"),
                }),
            );
        } finally {
            setSearching(false);
        }
    }

    function goToResult(result: SearchResult) {
        const map = mapRef.current;
        if (!map) {
            return;
        }

        const latitude = parseFloat(result.lat);
        const longitude = parseFloat(result.lon);
        dropMarker(map, latitude, longitude);
        map.flyTo([latitude, longitude], 13);
    }

    async function handleSave() {
        if (!selected) {
            return;
        }

        setSaving(true);
        setMessage("");

        const locationName = prompt("Enter a name for this location:");
        if (!locationName || !locationName.trim()) {
            setSaving(false);
            return;
        }

        try {
            const response = await fetch(`/api/backend/user/location/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: locationName.trim(),
                    location: {
                        latitude: selected.latitude,
                        longitude: selected.longitude,
                    },
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(`${errData.detail || "Request failed"} (status ${response.status})`);
            }

            setMessage(t("locationSaved"));
            setMessage("Location saved.");
            await fetchSavedLocations();
        } catch (err) {
            setMessage(
                t("saveFailed", {
                    error:
                        err instanceof Error ? err.message : tCommon("unknownError"),
                }),
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="flex-1 rounded border border-[#b6cfc6] bg-white px-3 py-2 text-sm text-[#3d3461] outline-none focus:border-[#3d3461]"
                />
                <button
                    type="submit"
                    disabled={searching || !query.trim()}
                    className="rounded bg-black px-5 py-2 text-sm text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {searching ? tCommon("searching") : tCommon("search")}
                </button>
            </form>

            {searchError && (
                <p className="mb-2 text-sm font-medium text-red-600">{searchError}</p>
            )}

            {results.length > 0 && (
                <ul className="mb-4 space-y-1">
                    {results.map((result) => (
                        <li key={result.lat + result.lon}>
                            <button
                                type="button"
                                onClick={() => goToResult(result)}
                                className="w-full rounded bg-white px-3 py-2 text-left text-sm text-[#3d3461] transition hover:bg-[#dcebe3]"
                            >
                                {result.display_name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="relative">
                <div
                    ref={mapContainerRef}
                    className="z-0 h-64 w-full rounded-xl"
                />
                {!ready && (
                    <div className="absolute inset-0 z-10 animate-pulse rounded-xl bg-[#dcebe3]" />
                )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
                {selected ? (
                    <p className="text-sm text-[#3d3461]">
                        {t("selectedCoords", {
                            latitude: selected.latitude.toFixed(6),
                            longitude: selected.longitude.toFixed(6),
                        })}
                    </p>
                ) : (
                    <p className="text-sm text-[#3d3461]">
                        {t("selectHint")}
                    </p>
                )}

                <button
                    onClick={handleSave}
                    disabled={!selected || saving}
                    className="ml-auto rounded bg-black px-8 py-3 text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {saving ? tCommon("saving") : tCommon("save")}
                </button>
            </div>

            {savedLocations.length > 0 && (
                <div className="mt-4">
                    <p className="text-sm font-medium text-[#3d3461] mb-2">Saved Locations</p>
                    <ul className="space-y-1">
                        {savedLocations.map((loc) => (
                            <li key={loc.name} className="text-sm text-[#3d3461]">
                                {loc.name} ({loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {message && <p className="mt-2 text-sm font-medium text-[#3d3461]">{message}</p>}
        </div>
    );
}
