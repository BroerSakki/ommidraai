"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
    username: string;
    bio: string;
    avatarUrl: string;
}

export function ProfileInfo({
                                username,
                                bio,
                                avatarUrl,
                            }: Props) {

    const [name, setName] = useState(username);
    const [editing, setEditing] = useState(false);

    return (
        <section className="mt-8">

            <Image
                src={avatarUrl}
                alt="Profile"
                width={140}
                height={140}
                className="rounded-full border-4 border-[#a8be8f] shadow-xl"
            />

            <div className="mt-6">

                {editing ? (
                    <input
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => setEditing(false)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setEditing(false);
                            }
                        }}
                        className="w-80 rounded-lg border-2 border-[#a8be8f] bg-white px-4 py-3 text-3xl font-bold text-[#3d3461] outline-none"
                    />
                ) : (
                    <div
                        onClick={() => setEditing(true)}
                        className="w-80 cursor-pointer rounded-lg bg-[#eef5f1] px-4 py-3 transition hover:bg-[#dcebe3]"
                    >
                        <h2 className="text-3xl font-bold text-[#3d3461]">
                            {name || "Click to enter username"}
                        </h2>
                    </div>
                )}

            </div>

        </section>
    );
}