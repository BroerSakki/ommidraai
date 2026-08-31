"use client";

import { useEffect, useRef, useState } from "react";
import type {
    Map as LeafletMap,
    Marker as LeafletMarker,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";
import { renderToString } from "react-dom/server";
import LocationIcon from "./ui/Location";

const DEFAULT_CENTER: [number, number] = [-25.8587, 28.1891];
const DEFAULT_ZOOM = 12;

type SearchResult = {
    lat: string;
    lon: string;
    display_name: string;
};

type LeafletModule = typeof import("leaflet");

type AddLocationModalProps = {
    groupId: string;
    onClose: () => void;
    onSuccess: () => void;
};

export function AddLocationModal({
    groupId,
    onClose,
    onSuccess,
}: AddLocationModalProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const markerRef = useRef<LeafletMarker | null>(null);
    const leafletRef = useRef<LeafletModule | null>(null);

    const [ready, setReady] = useState(false);
    const [selected, setSelected] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");

    const t = useTranslations("group");
    const tMap = useTranslations("map");
    const tCommon = useTranslations("common");
    const tModal = useTranslations("modal");

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

            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    maxZoom: 19,
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }
            ).addTo(map);

            map.on("click", (event) => {
                const { lat, lng } = event.latlng;
                dropMarker(lat, lng);
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
            markerRef.current = null;
        };
    }, []);

    function dropMarker(latitude: number, longitude: number) {
        const L = leafletRef.current;
        const map = mapRef.current;
        if (!L || !map) {
            return;
        }

        setSelected({ latitude, longitude });
        setError("");

        if (markerRef.current) {
            markerRef.current.remove();
        }

        const icon = L.divIcon({
            className: "",
            html: renderToString(<LocationIcon color="#e74c3c"/>),
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
                { headers: { Accept: "application/json" } }
            );

            if (!response.ok) {
                throw new Error(`Search failed with status ${response.status}`);
            }

            const data = (await response.json()) as SearchResult[];
            setResults(data);

            if (data.length > 0) {
                goToResult(data[0]);
            } else {
                setSearchError(tMap("noPlacesFound"));
            }
        } catch (err) {
            setSearchError(
                tMap("searchFailed", {
                    error:
                        err instanceof Error
                            ? err.message
                            : tCommon("unknownError"),
                })
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
        dropMarker(latitude, longitude);
        map.flyTo([latitude, longitude], 13);

        // Auto-fill the name field with the place's display name when the user
        // has not typed a custom name yet.
        if (!name.trim()) {
            setName(result.display_name);
        }
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError(t("addLocationNoName"));
            return;
        }

        if (!selected) {
            setError(t("addLocationNoSelection"));
            return;
        }

        setSaving(true);
        setError("");

        try {
            const response = await fetch(
                `/api/backend/groups/${groupId}/location/add?display_name=${encodeURIComponent(trimmedName)}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        latitude: selected.latitude,
                        longitude: selected.longitude,
                    }),
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.detail || tCommon("somethingWentWrong"));
            }

            onSuccess();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : tCommon("unknownError")
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4"
            onClick={onClose}
        >
            {/* Modal box */}
            <div
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                {/* ========================================= */}
                {/* HEADER */}
                {/* ========================================= */}

                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[#3d3461]">
                            {t("addLocationTitle")}
                        </h2>

                        <p className="mt-1 text-gray-500">
                            {t("addLocationDescription")}
                        </p>
                    </div>

                    {/* X button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-3 py-2 text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        aria-label={tModal("closeModal")}
                    >
                        ×
                    </button>
                </div>

                {/* ========================================= */}
                {/* FORM */}
                {/* ========================================= */}

                <form onSubmit={handleSubmit}>
                    {/* Search the map */}
                    <div className="mb-4 flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={tMap("searchPlaceholder")}
                            className="flex-1 rounded border border-[#b6cfc6] bg-white px-3 py-2 text-sm text-[#3d3461] outline-none focus:border-[#3d3461]"
                        />
                        <button
                            type="button"
                            onClick={handleSearch}
                            disabled={searching || !query.trim()}
                            className="rounded bg-[#3d3461] px-5 py-2 text-sm text-white transition hover:bg-[#3d3461]/80 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {searching
                                ? tCommon("searching")
                                : tCommon("search")}
                        </button>
                    </div>

                    {searchError && (
                        <p className="mb-2 text-sm font-medium text-red-600">
                            {searchError}
                        </p>
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

                    {/* Map */}
                    <div className="relative mb-4">
                        <div
                            ref={mapContainerRef}
                            className="z-0 h-64 w-full rounded-xl"
                        />
                        {!ready && (
                            <div className="absolute inset-0 z-10 animate-pulse rounded-xl bg-[#dcebe3]" />
                        )}
                    </div>

                    {selected && (
                        <p className="mb-4 text-sm text-[#3d3461]">
                            {tMap("selectedCoords", {
                                latitude: selected.latitude.toFixed(6),
                                longitude: selected.longitude.toFixed(6),
                            })}
                        </p>
                    )}

                    {/* Location name */}
                    <div className="mb-6">
                        <label
                            htmlFor="add-location-name"
                            className="mb-2 block font-semibold text-[#3d3461]"
                        >
                            {t("location")}
                        </label>

                        <input
                            id="add-location-name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder={t("locationPlaceholder")}
                            required
                            className="w-full rounded-xl border-2 border-[#b6cfc6] px-4 py-3 text-gray-700 outline-none transition focus:border-[#3d3461]"
                        />
                    </div>

                    {/* API / validation errors */}
                    {error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm font-medium text-red-600">
                                {error}
                            </p>
                        </div>
                    )}

                    {!selected && !error && (
                        <p className="mb-6 text-sm text-[#3d3461]">
                            {tMap("selectHint")}
                        </p>
                    )}

                    {/* ========================================= */}
                    {/* BUTTONS */}
                    {/* ========================================= */}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border-2 border-[#b6cfc6] px-6 py-3 font-semibold text-[#3d3461] transition hover:bg-[#eef5f1]"
                        >
                            {tCommon("cancel")}
                        </button>

                        <button
                            type="submit"
                            disabled={!selected || saving}
                            className="rounded-xl bg-[#3d3461] px-6 py-3 font-semibold text-white transition hover:bg-[#544a85] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? tCommon("saving") : tCommon("add")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}