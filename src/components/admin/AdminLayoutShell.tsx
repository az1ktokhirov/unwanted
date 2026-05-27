"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface Props {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export default function AdminLayoutShell({ children, userName, userEmail, userRole }: Props) {
  const pathname = usePathname();

  // Login page renders standalone without the shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar userName={userName} userEmail={userEmail} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader userName={userName} userRole={userRole} />
        <main className="flex-1 overflow-y-auto bg-admin-bg p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
