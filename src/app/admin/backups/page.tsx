import { Database, HardDrive, Clock, CheckCircle } from "lucide-react";
import StatWidget from "@/components/admin/StatWidget";

export const dynamic = "force-dynamic";

const MOCK_BACKUPS = [
  { name: "backup_2026-05-27_auto.sql.gz", type: "auto", created: "2026-05-27T03:00:00Z", size: "4.2 MB", status: "success", creator: "System" },
  { name: "backup_2026-05-26_manual.sql.gz", type: "manual", created: "2026-05-26T14:22:00Z", size: "4.1 MB", status: "success", creator: "Admin" },
  { name: "backup_2026-05-26_auto.sql.gz", type: "auto", created: "2026-05-26T03:00:00Z", size: "4.1 MB", status: "success", creator: "System" },
  { name: "backup_2026-05-25_auto.sql.gz", type: "auto", created: "2026-05-25T03:00:00Z", size: "4.0 MB", status: "success", creator: "System" },
  { name: "backup_2026-05-24_auto.sql.gz", type: "auto", created: "2026-05-24T03:00:00Z", size: "3.9 MB", status: "success", creator: "System" },
];

export default function AdminBackupsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-xl">Резервные копии</h1>
          <p className="text-admin-muted text-sm">Автоматическое резервирование каждые 24 часа</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-admin-accent hover:bg-admin-accent/90 text-white text-sm font-semibold rounded-lg transition-colors">
          <Database size={16} /> Создать бэкап
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatWidget icon={<Database size={16} />} value={MOCK_BACKUPS.length} label="Всего копий" />
        <StatWidget icon={<HardDrive size={16} />} value="20.3 MB" label="Общий размер" />
        <StatWidget icon={<Clock size={16} />} value={MOCK_BACKUPS.filter((b) => b.type === "auto").length} label="Авто-бэкапов" color="text-blue-400" />
        <StatWidget icon={<CheckCircle size={16} />} value="27.05.26" label="Последний бэкап" color="text-win" />
      </div>

      <div className="bg-admin-card border border-admin-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border">
              {["Имя файла", "Тип", "Создан", "Размер", "Статус", "Создатель", ""].map((h) => (
                <th key={h} className="text-left text-admin-muted text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_BACKUPS.map((b) => (
              <tr key={b.name} className="border-b border-admin-border last:border-0 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-white text-xs font-mono">{b.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${b.type === "auto" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {b.type === "auto" ? "Авто" : "Ручной"}
                  </span>
                </td>
                <td className="px-4 py-3 text-admin-muted text-xs">{new Date(b.created).toLocaleString("ru")}</td>
                <td className="px-4 py-3 text-admin-muted text-xs">{b.size}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] text-win font-semibold">{b.status}</span>
                </td>
                <td className="px-4 py-3 text-admin-muted text-xs">{b.creator}</td>
                <td className="px-4 py-3">
                  <button className="text-admin-muted hover:text-admin-accent text-xs transition-colors">Скачать</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
