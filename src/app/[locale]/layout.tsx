import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter, Bebas_Neue, Roboto_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter-ub",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://unwantedboys.uz";

export const metadata: Metadata = {
  title: {
    default: "Unwanted Boys FC",
    template: "%s | Unwanted Boys",
  },
  description:
    "Самый популярный медиафутбольный клуб Узбекистана. Страсть. Характер. Движение. 400K+ YouTube подписчиков.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    siteName: "Unwanted Boys FC",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Unwanted Boys FC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@unwantedboys",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "uz": `${BASE_URL}/uz`,
      "ru": `${BASE_URL}/ru`,
      "en": `${BASE_URL}/en`,
    },
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${bebasNeue.variable} ${robotoMono.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="pt-[68px]">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
