"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

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

type LeafletModule = typeof import("leaflet");

export function LocationMap() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const markerRef = useRef<LeafletMarker | null>(null);
    const leafletRef = useRef<LeafletModule | null>(null);

    const [ready, setReady] = useState(false);
    const [selected, setSelected] = useState<{ latitude: number; longitude: number } | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");

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

        return () => {
            cancelled = true;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

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
                setSearchError("No places found for that search.");
            }
        } catch (err) {
            setSearchError(
                `Search failed: ${err instanceof Error ? err.message : "Unknown error"}`,
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

        try {
            const response = await fetch(`${API_URL}/locations/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selected),
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            setMessage("Location saved.");
        } catch (err) {
            setMessage(
                `Save failed: ${err instanceof Error ? err.message : "Unknown error"}`,
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
                    placeholder="Search for a place (e.g. Centurion, Pretoria)"
                    className="flex-1 rounded border border-[#b6cfc6] bg-white px-3 py-2 text-sm text-[#3d3461] outline-none focus:border-[#3d3461]"
                />
                <button
                    type="submit"
                    disabled={searching || !query.trim()}
                    className="rounded bg-black px-5 py-2 text-sm text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {searching ? "Searching…" : "Search"}
                </button>
            </form>

            {searchError && (
                <p className="mb-2 text-sm font-medium text-red-600">{searchError}</p>
            )}

            {results.length > 0 && (
                <ul className="mb-4 space-y-1">
                    {results.map((result) => (
                        <li key={result.display_name}>
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
                        Selected: {selected.latitude.toFixed(6)}, {selected.longitude.toFixed(6)}
                    </p>
                ) : (
                    <p className="text-sm text-[#3d3461]">
                        Search above or click anywhere on the map to pick a location.
                    </p>
                )}

                <button
                    onClick={handleSave}
                    disabled={!selected || saving}
                    className="ml-auto rounded bg-black px-8 py-3 text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {saving ? "Saving…" : "Save"}
                </button>
            </div>

            {message && <p className="mt-2 text-sm font-medium text-[#3d3461]">{message}</p>}
        </div>
    );
}
