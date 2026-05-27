"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export default function SlidePanel({ open, onClose, title, children, width = "w-[480px]" }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className={`${width} max-w-full bg-admin-sidebar border-l border-admin-border flex flex-col h-full overflow-hidden shadow-2xl`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-admin-border flex-shrink-0">
          <h2 className="text-white font-semibold text-sm">{title}</h2>
          <button onClick={onClose} className="p-1.5 text-admin-muted hover:text-white rounded hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
