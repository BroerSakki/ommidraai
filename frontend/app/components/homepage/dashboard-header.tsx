"use client";

import { ProfileMenu } from "@/app/components/navigation/profile-menu";
import { useTranslations } from "next-intl";

export function DashboardHeader() {
  const t = useTranslations("home");

  return (
    <header className="mb-10 rounded-3xl bg-[#3d3461] p-8 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">{t("groups")}</h1>
          <p className="mt-2 text-gray-200">{t("manageSubtitle")}</p>
        </div>

        <ProfileMenu />
      </div>
    </header>
  );
}