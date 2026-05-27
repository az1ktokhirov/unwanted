import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import EmailSubscribeForm from "@/components/public/EmailSubscribeForm";

// Social icon SVGs
function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

async function getSocialLinks() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value_ru")
      .in("key", [
        "social_youtube",
        "social_instagram",
        "social_telegram",
        "social_tiktok",
        "copyright_text",
      ]);
    if (!data) return null;
    return Object.fromEntries(data.map((r) => [r.key, r.value_ru]));
  } catch {
    return null;
  }
}

export default async function Footer() {
  const t = await getTranslations();
  const settings = await getSocialLinks();

  const youtube   = settings?.social_youtube   ?? "http://www.youtube.com/@IslomAbdujabborov";
  const instagram = settings?.social_instagram ?? "https://instagram.com/unwantedboys.uz";
  const telegram  = settings?.social_telegram  ?? "https://t.me/unwantedboys";
  const tiktok    = settings?.social_tiktok    ?? "https://tiktok.com/@unwantedboys";
  const copyright = settings?.copyright_text   ?? `© ${new Date().getFullYear()} UNWANTED BOYS. ${t("footer.copyright")}`;

  const socialLinks = [
    { href: youtube,   icon: <YoutubeIcon />,   label: "YouTube" },
    { href: instagram, icon: <InstagramIcon />, label: "Instagram" },
    { href: telegram,  icon: <TelegramIcon />,  label: "Telegram" },
    { href: tiktok,    icon: <TikTokIcon />,    label: "TikTok" },
  ];

  return (
    <footer className="bg-secondary border-t border-white/5 mt-20">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bebas text-2xl leading-none">
                <span className="text-white">UNWANTED</span>
                <br />
                <span className="text-accent">BOYS</span>
              </span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed max-w-[180px]">
              Unwanted Boys — самый популярный медиафутбольный клуб Узбекистана.
              Страсть. Характер. Движение.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {socialLinks.map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-accent flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Клуб */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-white/60 uppercase mb-4">
              {t("footer.club")}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/club", label: t("footer.about") },
                { href: "/club#partners", label: t("footer.partners") },
                { href: "/club#contacts", label: t("footer.contacts") },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/40 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Инфо */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-white/60 uppercase mb-4">
              {t("footer.info")}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/news",  label: t("footer.news") },
                { href: "/media", label: t("footer.media") },
                { href: "/team",  label: t("nav.team") },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/40 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Поддержка */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-white/60 uppercase mb-4">
              {t("footer.support")}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/faq",     label: t("footer.faq") },
                { href: "/rules",   label: t("footer.rules") },
                { href: "/privacy", label: t("footer.privacy") },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/40 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subscribe */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-white/60 uppercase mb-2">
              {t("footer.subscribe")}
            </h4>
            <p className="text-white/30 text-xs mb-4 leading-relaxed">
              {t("footer.subscribeDesc")}
            </p>
            <EmailSubscribeForm placeholder={t("footer.email")} />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            {socialLinks.map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-white/20 hover:text-white/60 transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>
          <p className="text-white/25 text-xs text-center">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}

