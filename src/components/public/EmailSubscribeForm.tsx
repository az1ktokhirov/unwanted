"use client";

export default function EmailSubscribeForm({ placeholder }: { placeholder: string }) {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex">
      <input
        type="email"
        placeholder={placeholder}
        className="flex-1 bg-white/5 border border-white/10 rounded-l px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors"
      />
      <button
        type="submit"
        className="px-3 py-2 bg-accent hover:bg-accent/90 rounded-r transition-colors"
        aria-label="Subscribe"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          className="w-4 h-4"
        >
          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  );
}
