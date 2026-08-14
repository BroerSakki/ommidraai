"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export function ProfileMenu() {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

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

    const handleLogout = async () => {
        try {
            const response = await fetch(`/api/backend/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Something went wrong');
            }

            router.refresh();

            router.push('/login');
        } catch (err) {
            alert(err);
        }
    };

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
                            text-gray-500
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

                    <Link
                        href="/login"
                        className="
                            block
                            px-5
                            py-3
                            hover:bg-red-50
                            text-red-600
                        "
                        onClick={handleLogout}
                    >
                        Logout
                    </Link>
                </div>
            )}
        </div>
    );
}