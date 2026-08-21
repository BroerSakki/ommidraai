"use client";

import { useLanguage, type Locale } from "@/app/providers/language-provider";

const OPTIONS: { code: Locale; label: string }[] = [
  { code: "af", label: "Afrikaans" },
  { code: "en", label: "English" },
];

interface LanguageSwitcherProps {
    isGreen?: boolean;
}

export function LanguageSwitcher({ isGreen = false } : LanguageSwitcherProps) {
  const { locale, changeLocale } = useLanguage();
  const colorCode = isGreen ? "#a8be8f" : "#3d3461";

  return (
    <div
      className={`flex items-center gap-1 rounded-full border border-[${colorCode}]/20 bg-[${colorCode}]/10 p-1`}
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
                ? `rounded-full bg-[${colorCode}] px-3 py-1 text-xs font-semibold text-white`
                : `rounded-full px-3 py-1 text-xs font-medium text-[${colorCode}] transition hover:bg-[${colorCode}]/15`
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}