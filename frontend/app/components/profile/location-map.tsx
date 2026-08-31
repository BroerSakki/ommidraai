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
    const [defaultCords, setDefaultCords] = useState<{latitude: number; longitude: number} | null>(null);
    const [defaultName, setDefaultName] = useState<string | null>(null)
    const [updatingName, setUpdatingName] = useState<string | null>(null);

    useEffect(() => {
        async function getDefault() {
            try {
                const response = await fetch(
                    "/api/backend/user/location/default",
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch default location (status ${response.status})`
                    );
                }

                const data = await response.json();

                setDefaultCords({
                    longitude: data.longitude,
                    latitude: data.latitude,
                });

                setDefaultName(data.name);
            } catch (err) {
                console.error("Failed to fetch default location:", err);
            }
        }

        getDefault();
    }, []);

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
            console.log("Fetching saved locations...");

            const response = await fetch("/api/backend/user/locations", {
                cache: "no-store",
            });

            console.log("GET /locations:", response.status);

            if (!response.ok) {
                const text = await response.text();
                console.error("GET /locations failed:", text);
                throw new Error(
                    `Failed to fetch locations (status ${response.status})`
                );
            }

            const data = (await response.json()) as SavedLocation[];

            console.log("Locations from API:", data);

            setSavedLocations(data);
        } catch (err) {
            console.error("Failed to fetch saved locations:", err);
        }
    }

    async function handleDeleteLocation(name: string) {
        if (name === defaultName) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${name}"?`
        );

        if (!confirmed) return;

        setMessage("");

        try {
            const response = await fetch(
                `/api/backend/user/location/delete/${encodeURIComponent(name)}`,
                {
                    method: "DELETE",
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                const contentType = response.headers.get("content-type");

                if (contentType?.includes("application/json")) {
                    const errData = await response.json();

                    throw new Error(
                        `${errData.detail || "Request failed"} (status ${response.status})`
                    );
                }

                const errorText = await response.text();

                throw new Error(
                    `${errorText || "Request failed"} (status ${response.status})`
                );
            }

            setMessage(`Location "${name}" deleted.`);
            await fetchSavedLocations();
        } catch (err) {
            console.error("Failed to delete location:", err);

            setMessage(
                `Failed to delete location: ${
                    err instanceof Error ? err.message : tCommon("unknownError")
                }`
            );
        }
    }

    async function handleSetDefault(name: string) {
        if (name === defaultName || updatingName) return;
        console.log(`${name} =====================================================================================`)
        const previous = defaultName;
        setDefaultName(name);
        setUpdatingName(name);
        setMessage("");

        try {
            const response = await fetch(`/api/backend/user/location/edit`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) {
                throw new Error(`Failed to update default location (status ${response.status})`);
            }
            setMessage(t("defaultUpdated", { name }));
        } catch (err) {
            console.error("Failed to update default location:", err);
            setDefaultName(previous);
            setMessage(t("defaultUpdateError"));
        } finally {
            setUpdatingName(null);
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
                cache:"no-store",
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
                const contentType = response.headers.get("content-type");
            
                if (contentType?.includes("application/json")) {
                    const errData = await response.json();
                
                    throw new Error(
                        `${errData.detail || "Request failed"} (status ${response.status})`
                    );
                }
            
                const errorText = await response.text();
            
                throw new Error(
                    `${errorText || "Request failed"} (status ${response.status})`
                );
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

            <section className="mt-6">
                <h3 className="text-base font-semibold text-[#3d3461]">{t("savedLocations")}</h3>

                <ul className="mt-3 divide-y divide-[#b6cfc6]/60">
                    {savedLocations.map((loc) => {
                        const isDefault = loc.name === defaultName;
                        const isUpdating = loc.name === updatingName;
                    
                        return (
                            <li
                                key={loc.name}
                                className="flex items-center gap-2"
                            >
                                {/* Location / set-default button */}
                                <button
                                    type="button"
                                    onClick={() => handleSetDefault(loc.name)}
                                    disabled={isUpdating}
                                    aria-pressed={isDefault}
                                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-[#b6cfc6]/50 disabled:cursor-wait focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d3461]"
                                >
                                    <span className="shrink-0">
                                        {isUpdating ? (
                                            <svg
                                                className="h-5 w-5 animate-spin text-[#3d3461]/50"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className={
                                                    isDefault
                                                        ? "h-5 w-5 text-[#3d3461]"
                                                        : "h-5 w-5 text-[#b6cfc6]"
                                                }
                                                viewBox="0 0 24 24"
                                                fill={isDefault ? "currentColor" : "none"}
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 21s-7-6.1-7-11.2A7 7 0 0112 2a7 7 0 017 7.8C19 14.9 12 21 12 21z"
                                                />
                                                <circle
                                                    cx="12"
                                                    cy="9.5"
                                                    r="2.5"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                    
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-[#3d3461]">
                                            {loc.name}
                                        </span>
                                    
                                        <span className="block truncate text-xs text-[#3d3461]/60">
                                            {loc.latitude.toFixed(4)},{" "}
                                            {loc.longitude.toFixed(4)}
                                        </span>
                                    </span>
                                    
                                    {isDefault && (
                                        <span className="shrink-0 text-xs font-medium text-[#3d3461]">
                                            {t("default")}
                                        </span>
                                    )}
                                </button>
                                
                                {!isDefault && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteLocation(loc.name)}
                                        disabled={isUpdating}
                                        aria-label={`Delete ${loc.name}`}
                                        title="Delete location"
                                        className="shrink-0 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 6h18"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M8 6V4h8v2"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19 6l-1 14H6L5 6"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M10 11v5M14 11v5"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
                
                {message && <p className="mt-2 text-sm text-[#3d3461]/70">{message}</p>}
            </section>
        </div>
    );
}
