import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-bebas text-[120px] lg:text-[200px] leading-none text-accent/20 select-none">404</p>
      <h1 className="font-bebas text-4xl lg:text-6xl text-white -mt-4">Страница не найдена</h1>
      <p className="text-white/50 mt-3 mb-8 max-w-md">
        Похоже, эта страница ушла в офсайд. Вернитесь на главную или выберите раздел.
      </p>
      <Link href="/" className="px-6 py-3 bg-accent hover:bg-accent/90 text-white font-bold rounded-lg transition-colors">
        На главную
      </Link>
    </div>
  );
}
