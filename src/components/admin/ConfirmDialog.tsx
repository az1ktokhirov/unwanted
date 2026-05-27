"use client";

import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
  danger?: boolean;
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading, danger = true }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-admin-sidebar border border-admin-border rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${danger ? "bg-accent/20" : "bg-blue-500/20"}`}>
          <AlertTriangle size={18} className={danger ? "text-accent" : "text-blue-400"} />
        </div>
        <h3 className="text-white font-semibold mb-2">{title}</h3>
        <p className="text-admin-muted text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2 border border-admin-border text-admin-muted hover:text-white rounded-lg text-sm transition-colors">
            Отмена
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${danger ? "bg-accent hover:bg-accent/90" : "bg-blue-600 hover:bg-blue-700"} disabled:opacity-50`}>
            {loading ? "..." : "Подтвердить"}
          </button>
        </div>
      </div>
    </div>
  );
}
