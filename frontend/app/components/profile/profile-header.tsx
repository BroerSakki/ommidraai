"use client";

import { HomeButton } from "@/app/components/navigation/home-menu";
import { LanguageSwitcher } from "@/app/components/navigation/language-switcher";
import { useTranslations } from "next-intl";

export function ProfileHeader() {
    const t = useTranslations("profile");

    return (
        <header className="h-20 bg-[#3d3461] shadow-lg flex items-center justify-between px-8">

            <HomeButton />

            <div className="absolute right-4 top-4 z-50">
              <LanguageSwitcher />
            </div>

            <div className="flex items-center gap-3">
                <button className="rounded-lg bg-[#a8be8f] px-5 py-2 font-semibold text-[#3d3461] transition hover:scale-105 hover:bg-[#b6cfc6]">
                    {t("inviteFriends")}
                </button>
            </div>

        </header>
    );
}