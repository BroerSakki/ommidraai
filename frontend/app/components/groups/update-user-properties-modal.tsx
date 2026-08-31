"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

interface UpdateUserPropertiesModalProps {
  isOpen: boolean;
  carCapacity: number;
  isPassenger: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (carCapacity: number, isPassenger: boolean) => Promise<void>;
}

export function UpdateUserPropertiesModal({
  isOpen,
  carCapacity,
  isPassenger,
  isSaving,
  onClose,
  onSave,
}: UpdateUserPropertiesModalProps) {
  const t = useTranslations("group");
  const tCommon = useTranslations("common");
  const [capacity, setCapacity] = useState(String(carCapacity));
  const [passenger, setPassenger] = useState(isPassenger);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedCapacity = Number(capacity);

    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 0) {
      setError(t("carCapacityInvalid"));
      return;
    }

    setError(null);

    try {
      await onSave(parsedCapacity, passenger);
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("unknownError"));
    }
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4"
      onClick={isSaving ? undefined : onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#3d3461]">
              {t("updateUserPropertiesTitle")}
            </h2>
            <p className="mt-1 text-gray-500">
              {t("updateUserPropertiesDescription")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl px-3 py-2 text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={tCommon("closeModal")}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="car-capacity"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              {t("carCapacity")}
            </label>
            <input
              id="car-capacity"
              type="number"
              min="0"
              step="1"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              disabled={isSaving}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#3d3461] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={passenger}
              onChange={(event) => setPassenger(event.target.checked)}
              disabled={isSaving}
              className="h-4 w-4 accent-[#3d3461]"
            />
            {t("isPassenger")}
          </label>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border-2 border-[#b6cfc6] px-6 py-3 font-semibold text-[#3d3461] transition hover:bg-[#eef5f1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#3d3461] px-6 py-3 font-semibold text-white shadow transition hover:bg-[#30294d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? tCommon("saving") : tCommon("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
