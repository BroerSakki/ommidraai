"use client";

import { HomeButton } from "@/app/components/navigation/home-menu";
import { LanguageSwitcher } from "@/app/components/navigation/language-switcher";
import { useTranslations } from "next-intl";

export function ProfileHeader() {
    const t = useTranslations("profile");

    return (
        <header className="h-20 bg-[#3d3461] shadow-lg flex items-center justify-between px-8">

            <HomeButton />

            <LanguageSwitcher isGreen={true} />

            <button className="rounded-lg bg-[#a8be8f] px-5 py-2 font-semibold text-[#3d3461] transition hover:scale-105 hover:bg-[#b6cfc6]">
                {t("inviteFriends")}
            </button>

        </header>
    );
}