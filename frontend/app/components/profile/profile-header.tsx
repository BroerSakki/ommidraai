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

        </header>
    );
}