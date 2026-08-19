"use client";

import { useLanguage, type Locale } from "@/app/providers/language-provider";

const OPTIONS: { code: Locale; label: string }[] = [
  { code: "af", label: "Afrikaans" },
  { code: "en", label: "English" },
];

/**
 * Global language switcher. Reads the active locale from the shared
 * LanguageProvider context, updates it on click and persists the new
 * preference to browser storage (localStorage + cookie).
 */
export function LanguageSwitcher() {
  const { locale, changeLocale } = useLanguage();

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-[#3d3461]/20 bg-[#3d3461]/10 p-1"
      aria-label="Language / Taal"
    >
      {OPTIONS.map(({ code, label }) => {
        const isActive = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => changeLocale(code)}
            aria-pressed={isActive}
            title={label}
            className={
              isActive
                ? "rounded-full bg-[#3d3461] px-3 py-1 text-xs font-semibold text-white"
                : "rounded-full px-3 py-1 text-xs font-medium text-[#3d3461] transition hover:bg-[#3d3461]/15"
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}