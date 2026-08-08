"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export function ProfileMenu() {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    return (
        <div
            ref={menuRef}
            className="relative"
        >
            <button
                onClick={() => setOpen(!open)}
                className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-[#a8be8f]
                    text-[#3d3461]
                    font-bold
                    transition
                    hover:scale-105
                "
            >
                U
            </button>

            {open && (
                <div
                    className="
                        absolute
                        right-0
                        mt-3
                        w-56
                        rounded-2xl
                        bg-white
                        shadow-xl
                        border
                        border-[#b6cfc6]
                        overflow-hidden
                    "
                >
                    <Link
                        href="/user/profile"
                        className="
                            block
                            px-5
                            py-3
                            hover:bg-[#eef5f1]
                        "
                    >
                         Profile
                    </Link>

                    {/*<Link
                        href="/groups"
                        className="
                            block
                            px-5
                            py-3
                            hover:bg-[#eef5f1]
                        "
                    >
                         Groups
                    </Link>*/}

                    <hr />

                    <button
                        className="
                            w-full
                            text-left
                            px-5
                            py-3
                            text-red-600
                            hover:bg-red-50
                        "
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}