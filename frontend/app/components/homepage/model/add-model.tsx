"use client";

import { useEffect, useState } from "react";

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (value: string) => void;

  title?: string;
  description?: string;
  label?: string;
  placeholder?: string;
  confirmText?: string;
}

export function AddGroupModal({
  isOpen,
  onClose,
  onCreate,

  title = "Create a Group",
  description = "Enter a name for your new group.",
  label = "Group Name",
  placeholder = "Enter group name",
  confirmText = "OK",
}: AddGroupModalProps) {
  const [value, setValue] = useState("");

  /*
   * Clear the input whenever the modal opens.
   */
  useEffect(() => {
    if (isOpen) {
      setValue("");
    }
  }, [isOpen]);

  /*
   * Don't render anything when the modal is closed.
   */
  if (!isOpen) {
    return null;
  }

  /*
   * Submit button
   */
  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedValue = value.trim();

    // Don't allow empty input
    if (!trimmedValue) {
      return;
    }

    // Send the value back to the page
    onCreate(trimmedValue);

    // Clear input
    setValue("");
  };

  /*
   * Close the modal
   */
  const handleClose = () => {
    setValue("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-4"
      onClick={handleClose}
    >
      {/* Modal box */}
      <div
        className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#3d3461]">
              {title}
            </h2>

            <p className="mt-1 text-gray-500">
              {description}
            </p>
          </div>

          {/* X button */}
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl px-3 py-2 text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* ========================================= */}
        {/* FORM */}
        {/* ========================================= */}

        <form onSubmit={handleSubmit}>
          {/* Input */}
          <div className="mb-6">
            <label
              htmlFor="modal-input"
              className="mb-2 block font-semibold text-[#3d3461]"
            >
              {label}
            </label>

            <input
              id="modal-input"
              type="text"
              value={value}
              onChange={(event) =>
                setValue(event.target.value)
              }
              placeholder={placeholder}
              required
              autoFocus
              className="w-full rounded-xl border-2 border-[#b6cfc6] px-4 py-3 text-gray-700 outline-none transition focus:border-[#3d3461]"
            />
          </div>

          {/* ========================================= */}
          {/* BUTTONS */}
          {/* ========================================= */}

          <div className="flex justify-end gap-3">
            {/* Cancel */}
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border-2 border-[#b6cfc6] px-6 py-3 font-semibold text-[#3d3461] transition hover:bg-[#eef5f1]"
            >
              Cancel
            </button>

            {/* Confirm */}
            <button
              type="submit"
              className="rounded-xl bg-[#3d3461] px-6 py-3 font-semibold text-white transition hover:bg-[#544a85]"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}