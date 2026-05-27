interface Props {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  change?: number;
  color?: string;
}

export default function StatWidget({ icon, value, label, change, color = "text-white" }: Props) {
  return (
    <div className="bg-admin-card border border-admin-border rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-admin-accent flex-shrink-0">
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 text-[10px] font-bold ${change >= 0 ? "text-win" : "text-accent"}`}>
            <span>{change >= 0 ? "↑" : "↓"}</span>
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className={`font-bebas text-3xl leading-none mt-3 ${color}`}>{value}</p>
      <p className="text-admin-muted text-xs uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
