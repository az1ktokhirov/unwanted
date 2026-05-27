import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import NewsCard from "@/components/public/NewsCard";
import type { News } from "@/types";
import type { Locale } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  match: "bg-accent/20 text-accent",
  club: "bg-blue-500/20 text-blue-400",
  interview: "bg-purple-500/20 text-purple-400",
  media: "bg-yellow-500/20 text-yellow-400",
  announcement: "bg-green-500/20 text-green-400",
  tournament: "bg-orange-500/20 text-orange-400",
};

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-white mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-10 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-accent font-mono text-sm">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent/80">$1</a>')
    .split(/\n\n+/)
    .map((para) => {
      if (para.startsWith("<h") || para.startsWith("<ul") || para.startsWith("<ol")) return para;
      return `<p class="text-white/65 leading-relaxed mb-4">${para.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");
}

async function getArticle(slug: string): Promise<News | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("news")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
    return data as News | null;
  } catch {
    return null;
  }
}

async function getRelated(category: string, excludeId: string, locale: Locale): Promise<News[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("news")
      .select("*")
      .eq("status", "published")
      .eq("category", category)
      .neq("id", excludeId)
      .order("published_at", { ascending: false })
      .limit(3);
    return (data ?? []) as News[];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Не найдено" };
  const title = (article as any)[`title_${locale}`] || article.title_ru;
  const desc = (article as any)[`excerpt_${locale}`] || article.excerpt_ru || undefined;
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: "article",
      publishedTime: article.published_at ?? undefined,
      images: article.cover_url ? [{ url: article.cover_url, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: article.cover_url ? [article.cover_url] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const t = await getTranslations();
  const loc = locale as Locale;

  const article = await getArticle(slug);
  if (!article) notFound();

  const related = await getRelated(article.category, article.id, loc);

  const title = article[`title_${loc}`] || article.title_ru;
  const body = article[`body_${loc}`] || article.body_ru;
  const catColor = CATEGORY_COLORS[article.category] ?? "bg-white/10 text-white/60";
  const catLabel = article.category;
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  return (
    <>
      {/* Cover */}
      {article.cover_url && (
        <div className="relative h-72 sm:h-96 bg-surface overflow-hidden">
          <Image src={article.cover_url} alt={title} fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Article */}
          <article className="flex-1 min-w-0">
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-xs mb-6 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("nav.news")}
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${catColor}`}>{catLabel}</span>
              {date && <span className="text-white/30 text-xs">{date}</span>}
              <span className="text-white/20 text-xs">👁 {article.views}</span>
            </div>

            <h1 className="font-bebas text-4xl sm:text-5xl text-white leading-tight mb-6">{title}</h1>

            {article.cover_url && (
              <div className="relative rounded-xl overflow-hidden mb-8 h-64 bg-surface">
                <Image src={article.cover_url} alt={title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 65vw" />
              </div>
            )}

            {/* Body */}
            <div
              className="prose-custom"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
            />

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/5">
                {article.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-white/40 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0 space-y-6">
            {related.length > 0 && (
              <div>
                <h3 className="text-xs font-bold tracking-widest text-white/50 uppercase mb-4">{t("news.related")}</h3>
                <div className="space-y-4">
                  {related.map((n) => (
                    <NewsCard key={n.id} news={n} locale={loc} variant="compact" />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
