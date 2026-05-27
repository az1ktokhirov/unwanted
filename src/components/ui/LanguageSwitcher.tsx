"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTransition } from "react";

const locales = [
  { code: "uz", label: "UZ" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
] as const;

interface Props {
  variant?: "public" | "admin";
}

export default function LanguageSwitcher({ variant = "public" }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  if (variant === "admin") {
    return (
      <div className="flex items-center gap-1 bg-[#374151] rounded px-2 py-1">
        {locales.map(({ code, label }, i) => (
          <span key={code} className="flex items-center gap-1">
            <button
              onClick={() => switchLocale(code)}
              disabled={isPending}
              className={`text-xs font-semibold tracking-wider transition-colors ${
                locale === code
                  ? "text-white"
                  : "text-[#9ca3af] hover:text-white"
              }`}
            >
              {label}
            </button>
            {i < locales.length - 1 && (
              <span className="text-[#4b5563] text-xs">|</span>
            )}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {locales.map(({ code, label }, i) => (
        <span key={code} className="flex items-center gap-1">
          <button
            onClick={() => switchLocale(code)}
            disabled={isPending}
            className={`font-semibold tracking-widest transition-colors ${
              locale === code
                ? "text-white"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            {label}
          </button>
          {i < locales.length - 1 && (
            <span className="text-white/20 text-xs">|</span>
          )}
        </span>
      ))}
    </div>
  );
}
