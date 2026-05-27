interface Props {
  children: React.ReactNode;
  variant?: "win" | "loss" | "draw" | "upcoming" | "live" | "default";
  className?: string;
}

const VARIANTS: Record<string, string> = {
  win: "bg-win/20 text-win border-win/30",
  loss: "bg-accent/20 text-accent border-accent/30",
  draw: "bg-draw/20 text-draw border-draw/30",
  upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  live: "bg-accent/30 text-accent border-accent/50 animate-pulse",
  default: "bg-white/10 text-white/70 border-white/10",
};

export default function Badge({ children, variant = "default", className = "" }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  );
}
