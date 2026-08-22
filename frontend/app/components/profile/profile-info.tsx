"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
    username: string;
    email: string;
    onUpdateUsername: (newUsername: string) => void;
}

export function ProfileInfo({
    username,
    email,
    onUpdateUsername,
}: Props) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(username);
    const t = useTranslations("profile");

    function handleConfirm() {
        const trimmed = draft.trim();
        if (!trimmed || trimmed === username) {
            setEditing(false);
            return;
        }
        onUpdateUsername(trimmed);
        setEditing(false);
    }

    return (
        <section className="mt-8">

            <div className="mt-6 flex items-center gap-4">

                {editing ? (
                    <>
                        <input
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleConfirm();
                                }
                                if (e.key === "Escape") {
                                    setDraft(username);
                                    setEditing(false);
                                }
                            }}
                            className="flex-1 rounded-lg border-2 border-[#b6cfc6] bg-white px-4 py-3 text-3xl font-bold text-[#3d3461] outline-none transition focus:border-[#3d3461]"
                        />

                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="rounded-xl bg-[#3d3461] px-6 py-3 font-semibold text-white transition hover:bg-[#544a85]"
                        >
                            Confirm
                        </button>
                    </>
                ) : (
                    <>
                        <h2
                            onClick={() => setEditing(true)}
                            className="cursor-pointer text-3xl font-bold text-[#3d3461] hover:text-[#544a85]"
                        >
                            {username || t("clickToEnterUsername")}
                        </h2>
                    </>
                )}

            </div>

            <p className="mt-2 text-gray-500">
                {email}
            </p>

        </section>
    );
}