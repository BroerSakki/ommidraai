"use client";

import { useTranslations } from "next-intl";

interface SaveLocationModalProps {
    isOpen: boolean;
    name: string;
    saving: boolean;
    error: string;
    onNameChange: (name: string) => void;
    onClose: () => void;
    onSave: () => void;
}

export function SaveLocationModal({
    isOpen,
    name,
    saving,
    error,
    onNameChange,
    onClose,
    onSave,
}: SaveLocationModalProps) {
    const tMap = useTranslations("map");
    const tCommon = useTranslations("common");

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4"
            onClick={saving ? undefined : onClose}
        >
            {/* Modal box */}
            <div
                className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSave();
                    }}
                >
                    {/* ========================================= */}
                    {/* HEADER */}
                    {/* ========================================= */}

                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-[#3d3461]">
                                {tMap("saveLocationTitle")}
                            </h2>

                            <p className="mt-1 text-gray-500">
                                {tMap("saveLocationDescription")}
                            </p>
                        </div>

                        {/* X button */}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl px-3 py-2 text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={tCommon("closeModal")}
                        >
                            ×
                        </button>
                    </div>

                    {/* Location name */}
                    <div className="mb-6">
                        <label
                            htmlFor="save-location-name"
                            className="mb-2 block font-semibold text-[#3d3461]"
                        >
                            {tMap("locationName")}
                        </label>

                        <input
                            id="save-location-name"
                            type="text"
                            value={name}
                            onChange={(event) => onNameChange(event.target.value)}
                            placeholder={tMap("locationNamePlaceholder")}
                            autoFocus
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

                    {/* ========================================= */}
                    {/* BUTTONS */}
                    {/* ========================================= */}

                    <div className="flex justify-end gap-3">
                        {/* Cancel */}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border-2 border-[#b6cfc6] px-6 py-3 font-semibold text-[#3d3461] transition hover:bg-[#eef5f1] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {tCommon("cancel")}
                        </button>

                        {/* Save */}
                        <button
                            type="submit"
                            disabled={saving || !name.trim()}
                            className="rounded-xl bg-[#3d3461] px-6 py-3 font-semibold text-white transition hover:bg-[#544a85] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? tCommon("saving") : tCommon("save")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}