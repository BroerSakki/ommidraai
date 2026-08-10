"use client";

import Link from "next/link";

interface HomeButtonProps {
    className?: string;
}

export function HomeButton({ className = "" }: HomeButtonProps) {
    return (
        <Link
            href="/"
            className={`inline-flex items-center justify-center rounded-xl bg-[#3d3461] p-3 text-white transition hover:scale-105 hover:bg-[#544a85] ${className}`}
            aria-label="Go to Home"
            title="Home"
        >
            <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M5 12l4-4m-4 4 4 4"
                />
            </svg>
        </Link>
    );
}