"use client";

import { Bell } from "lucide-react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function AdminHeader({ userName, userRole }: { userName?: string; userRole?: string }) {
  return (
    <header className="h-14 border-b border-admin-border bg-admin-sidebar flex items-center justify-between px-6 flex-shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <LanguageSwitcher variant="admin" />

        <button className="relative p-1.5 text-[#9ca3af] hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-admin-accent rounded-full" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-admin-accent/20 flex items-center justify-center">
            <span className="text-admin-accent text-xs font-bold">
              {userName ? userName.charAt(0).toUpperCase() : "A"}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-white text-xs font-semibold leading-none">{userName ?? "Admin"}</p>
            <p className="text-admin-muted text-[10px] leading-none mt-0.5 capitalize">{userRole ?? "admin"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
