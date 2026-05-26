import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unwanted Boys",
  description: "Самый популярный медиафутбольный клуб Узбекистана",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
