import { useTranslations } from "next-intl";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#1a1a2e] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-bebas text-6xl text-white tracking-widest">
          WE ARE <span className="text-[#e94560]">UNWANTED BOYS</span>
        </h1>
        <p className="mt-4 text-gray-400">Stage 1 complete — scaffolding ready</p>
      </div>
    </main>
  );
}
