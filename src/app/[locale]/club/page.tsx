import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/types";

export async function generateMetadata() {
  return { title: "О клубе" };
}

const TIMELINE = [
  { year: "2022", title: "Основание клуба", desc: "Unwanted Boys FC основан в Ташкенте. Первый матч сыгран, YouTube-канал запущен." },
  { year: "2023", title: "Первые трофеи", desc: "Команда завоёвывает первые титулы в медиафутболе Узбекистана. Аудитория достигает 100K подписчиков." },
  { year: "2024", title: "Рост и признание", desc: "Unwanted Boys становится самым популярным медиафутбольным клубом страны. 200K+ подписчиков на YouTube." },
  { year: "2025", title: "Новая эра", desc: "Официальный сайт, профессиональный штаб, международные матчи. 400K+ YouTube-подписчиков." },
];

const VALUES = [
  {
    icon: "🔥",
    titleKey: "club.passion" as const,
    descKey: "club.passionDesc" as const,
    color: "border-accent/30 bg-accent/5",
  },
  {
    icon: "⚡",
    titleKey: "club.character" as const,
    descKey: "club.characterDesc" as const,
    color: "border-blue-500/30 bg-blue-500/5",
  },
  {
    icon: "🤝",
    titleKey: "club.community" as const,
    descKey: "club.communityDesc" as const,
    color: "border-green-500/30 bg-green-500/5",
  },
];

async function getClubPage(locale: Locale) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", "club")
      .eq("is_published", true)
      .single();
    return data;
  } catch {
    return null;
  }
}

async function getStats() {
  try {
    const supabase = await createClient();
    const [{ count: playerCount }, { count: matchCount }] = await Promise.all([
      supabase.from("players").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "finished"),
    ]);
    return { players: playerCount ?? 0, matches: matchCount ?? 0 };
  } catch {
    return { players: 0, matches: 0 };
  }
}

export default async function ClubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const loc = locale as Locale;
  const [clubPage, stats] = await Promise.all([getClubPage(loc), getStats()]);

  const aboutText = clubPage
    ? ((clubPage as any)[`content_${loc}`] || (clubPage as any).content_ru)
    : "Unwanted Boys — самый популярный медиафутбольный клуб Узбекистана, основанный в 2022 году в Ташкенте. Мы — команда, которая живёт футболом и вдохновляет тысячи болельщиков своей страстью, характером и комьюнити.";

  const STAT_ITEMS = [
    { value: "400K+", label: "YouTube" },
    { value: "9", label: t("club.trophies") },
    { value: "3+", label: t("club.years") },
    { value: `${stats.players}+`, label: t("player.players") },
    { value: "Tashkent", label: t("club.base") },
    { value: "3", label: t("club.languages") },
  ];

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-secondary min-h-[60vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/50 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#e94560_0%,_transparent_50%)] opacity-15" />

        <div className="relative z-20 w-full max-w-[1440px] mx-auto px-4 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left text */}
            <div>
              <p className="text-accent text-xs font-bold tracking-[0.4em] uppercase mb-3">{t("club.title")}</p>
              <h1 className="font-bebas leading-none">
                <span className="block text-white text-6xl lg:text-8xl">{t("club.title")}</span>
                <span className="block text-accent text-6xl lg:text-8xl">{t("club.subtitle")}</span>
              </h1>
              <p className="text-white/50 mt-4 max-w-md">{t("club.passionDesc")}</p>
            </div>

            {/* Right: UB logo + info */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-24 h-24 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                <span className="font-bebas text-4xl text-accent">UB</span>
              </div>
              <div>
                <p className="text-white text-xs font-bold tracking-widest">EST. 2022</p>
                <p className="text-white/40 text-xs">TASHKENT, UZ</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {[
                  { label: "YT", href: "http://www.youtube.com/@IslomAbdujabborov" },
                  { label: "IG", href: "https://instagram.com/unwantedboys.uz" },
                  { label: "TG", href: "https://t.me/unwantedboys" },
                ].map(({ label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-accent flex items-center justify-center text-white/50 hover:text-white text-[10px] font-bold transition-colors">
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-primary border-y border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-5">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
            {STAT_ITEMS.map(({ value, label }) => (
              <div key={label}>
                <p className="font-bebas text-3xl text-white">{value}</p>
                <p className="text-white/40 text-[10px] uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <p className="text-accent text-xs font-bold tracking-[0.3em] uppercase mb-3">{t("club.aboutUs")}</p>
            <h2 className="font-bebas text-4xl text-white mb-5">{t("club.ourHistory")}</h2>
            <p className="text-white/60 leading-relaxed">{aboutText}</p>

            <div className="mt-6 flex items-center gap-6">
              <a
                href="http://www.youtube.com/@IslomAbdujabborov"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-xs font-bold rounded transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                YouTube
              </a>
              <p className="text-white/30 text-xs">400K+ подписчиков</p>
            </div>
          </div>

          {/* Right: stats block */}
          <div className="lg:w-72 grid grid-cols-2 gap-3">
            {[
              { v: stats.matches, l: "Матчей сыграно", c: "text-accent" },
              { v: stats.players, l: "Игроков в составе", c: "text-win" },
              { v: "400K+", l: "Подписчиков YouTube", c: "text-accent2" },
              { v: "2022", l: "Год основания", c: "text-white" },
            ].map(({ v, l, c }) => (
              <div key={l} className="bg-secondary rounded-xl border border-white/5 p-4 text-center">
                <p className={`font-bebas text-3xl leading-none ${c}`}>{v}</p>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mt-1 leading-tight">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="bg-secondary border-y border-white/5 py-16">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <h2 className="font-bebas text-4xl text-white text-center mb-10">НАШИ ЦЕННОСТИ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {VALUES.map(({ icon, titleKey, descKey, color }) => (
              <div key={titleKey} className={`rounded-xl border p-6 ${color}`}>
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-bebas text-2xl text-white mb-2">{t(titleKey)}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16" id="club">
        <h2 className="font-bebas text-4xl text-white mb-10">{t("club.ourPath")}</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />

          <div className="space-y-10">
            {TIMELINE.map((item, i) => {
              const isRight = i % 2 === 1;
              return (
                <div
                  key={item.year}
                  className={`relative flex ${isRight ? "sm:flex-row-reverse" : "sm:flex-row"} items-start gap-6`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 sm:left-1/2 w-3 h-3 rounded-full bg-accent border-2 border-primary -translate-x-1/2 mt-1 z-10" />

                  {/* Spacer (desktop) */}
                  <div className="hidden sm:block sm:flex-1" />

                  {/* Content */}
                  <div className={`pl-10 sm:pl-0 sm:flex-1 ${isRight ? "sm:pr-10" : "sm:pl-10"}`}>
                    <div className="bg-secondary rounded-xl border border-white/5 p-5 hover:border-accent/30 transition-colors">
                      <p className="text-accent font-bebas text-3xl leading-none mb-1">{item.year}</p>
                      <h3 className="text-white font-bold text-sm mb-2">{item.title}</h3>
                      <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CONTACTS ── */}
      <section className="bg-secondary border-t border-white/5 py-12" id="contacts">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-bebas text-3xl text-white mb-2">{t("footer.contacts")}</h2>
          <p className="text-white/40 text-sm mb-6">Свяжитесь с нами в социальных сетях</p>
          <div className="flex justify-center gap-4">
            {[
              { label: "YouTube", href: "http://www.youtube.com/@IslomAbdujabborov", color: "bg-red-600 hover:bg-red-700" },
              { label: "Instagram", href: "https://instagram.com/unwantedboys.uz", color: "bg-pink-600 hover:bg-pink-700" },
              { label: "Telegram", href: "https://t.me/unwantedboys", color: "bg-blue-500 hover:bg-blue-600" },
            ].map(({ label, href, color }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className={`px-5 py-2 rounded-lg text-white text-xs font-bold transition-colors ${color}`}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
