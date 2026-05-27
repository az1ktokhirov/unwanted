import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter-ub",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin Panel", template: "%s | UB Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let userName: string | undefined;
  let userEmail: string | undefined;
  let userRole: string | undefined;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("full_name, role")
        .eq("id", user.id)
        .single();
      userEmail = user.email ?? undefined;
      userName = adminUser?.full_name ?? user.email?.split("@")[0];
      userRole = adminUser?.role ?? "admin";
    }
  } catch {
    // unauthenticated — login page will handle
  }

  return (
    <html lang="ru" className={inter.variable}>
      <body className="admin-layout">
        <AdminLayoutShell userName={userName} userEmail={userEmail} userRole={userRole}>
          {children}
        </AdminLayoutShell>
      </body>
    </html>
  );
}
