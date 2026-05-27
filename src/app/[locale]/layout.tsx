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

export const metadata: Metadata = {
  title: {
    default: "Unwanted Boys",
    template: "%s | Unwanted Boys",
  },
  description:
    "Самый популярный медиафутбольный клуб Узбекистана. Страсть. Характер. Движение.",
  openGraph: {
    siteName: "Unwanted Boys",
    locale: "ru_RU",
  },
};

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
