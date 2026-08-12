"use client";

import { useState } from "react";

interface AddGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (groupName: string) => void;
}

export function AddGroupModal({
                                  isOpen,
                                  onClose,
                                  onCreate,
                              }: AddGroupModalProps) {
    const [groupName, setGroupName] = useState("");

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!groupName.trim()) {
            return;
        }

        onCreate(groupName.trim());
        setGroupName("");
    };

    const handleClose = () => {
        setGroupName("");
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[#3d3461]">
                            Create a Group
                        </h2>

                        <p className="mt-1 text-gray-500">
                            Enter a name for your new group.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-xl px-3 py-2 text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label
                            htmlFor="modal-group-name"
                            className="mb-2 block font-semibold text-[#3d3461]"
                        >
                            Group Name
                        </label>

                        <input
                            id="modal-group-name"
                            type="text"
                            value={groupName}
                            onChange={(event) => setGroupName(event.target.value)}
                            placeholder="Enter group name"
                            required
                            autoFocus
                            className="w-full rounded-xl border-2 border-[#b6cfc6] px-4 py-3 text-gray-700 outline-none transition focus:border-[#3d3461]"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-xl border-2 border-[#b6cfc6] px-6 py-3 font-semibold text-[#3d3461] transition hover:bg-[#eef5f1]"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-xl bg-[#3d3461] px-6 py-3 font-semibold text-white transition hover:bg-[#544a85]"
                        >
                            Create Group
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}