"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { Menu, X } from "lucide-react";

function YoutubeButtonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function UBShieldLogo({ size = 40 }: { size?: number }) {
  const s = size;
  return (
    <svg
      width={s * 0.85}
      height={s}
      viewBox="0 0 34 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 1L33 7V22C33 31.5 26 37.5 17 40C8 37.5 1 31.5 1 22V7L17 1Z"
        fill="#111827"
        stroke="#E94560"
        strokeWidth="1.5"
      />
      <path
        d="M17 4.5L29.5 9.5V22C29.5 29.5 24 34.5 17 36.5C10 34.5 4.5 29.5 4.5 22V9.5L17 4.5Z"
        fill="#1A1A2E"
      />
      <text
        x="17"
        y="15"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#9CA3AF"
        fontSize="5"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
        letterSpacing="1.5"
      >
        UNWANTED
      </text>
      <text
        x="17"
        y="27"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="13"
        fontWeight="900"
        fontFamily="Inter, sans-serif"
      >
        UB
      </text>
      <text
        x="17"
        y="35.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#E94560"
        fontSize="5"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
        letterSpacing="1.5"
      >
        BOYS
      </text>
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/matches", key: "nav.matches" },
  { href: "/team", key: "nav.team" },
  { href: "/stats", key: "nav.stats" },
  { href: "/news", key: "nav.news" },
  { href: "/media", key: "nav.media" },
  { href: "/club", key: "nav.club" },
] as const;

export default function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-[68px] flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <UBShieldLogo size={40} />
            <span className="font-bebas text-xl leading-none tracking-widest hidden sm:block">
              <span className="text-white">UNWANTED </span>
              <span className="text-accent">BOYS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={`relative px-3 py-1.5 text-xs font-semibold tracking-widest uppercase transition-colors ${
                  isActive(href)
                    ? "text-white"
                    : "text-white/50 hover:text-white/90"
                }`}
              >
                {t(key)}
                {isActive(href) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="hidden sm:block">
              <LanguageSwitcher variant="public" />
            </div>
            <a
              href="http://www.youtube.com/@IslomAbdujabborov"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-accent text-accent rounded text-xs font-bold tracking-wider hover:bg-accent hover:text-white transition-colors"
            >
              <YoutubeButtonIcon />
              YOUTUBE
            </a>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-1.5 text-white/70 hover:text-white"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute top-0 left-0 bottom-0 w-72 bg-secondary flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-[68px] border-b border-white/10">
              <div className="flex items-center gap-3">
                <UBShieldLogo size={36} />
                <span className="font-bebas text-lg tracking-widest">
                  <span className="text-white">UNWANTED </span>
                  <span className="text-accent">BOYS</span>
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-white/50 hover:text-white"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 py-4 overflow-y-auto">
              {NAV_LINKS.map(({ href, key }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-5 py-3.5 text-sm font-semibold tracking-widest uppercase border-l-2 transition-colors ${
                    isActive(href)
                      ? "border-accent text-white bg-white/5"
                      : "border-transparent text-white/50 hover:text-white hover:border-white/20"
                  }`}
                >
                  {t(key)}
                </Link>
              ))}
            </nav>

            {/* Drawer footer */}
            <div className="px-5 pb-6 pt-4 border-t border-white/10 space-y-4">
              <LanguageSwitcher variant="public" />
              <a
                href="http://www.youtube.com/@IslomAbdujabborov"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-accent text-accent rounded text-sm font-bold tracking-wider hover:bg-accent hover:text-white transition-colors"
              >
                <YoutubeButtonIcon />
                YOUTUBE
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
