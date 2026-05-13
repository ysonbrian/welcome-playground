import Link from "next/link";

const SERVICES = [
  {
    href: "/map",
    emoji: "🗺",
    title: "장소 검색",
    desc: "원하는 장소를 검색하고 지도에서 확인하세요",
  },
  {
    href: "/wheel",
    emoji: "🎡",
    title: "돌림판",
    desc: "항목을 추가하고 돌려서 결과를 정해보세요",
  },
  {
    href: "/stocks",
    emoji: "📈",
    title: "주식",
    desc: "미국·한국 주요 종목의 등락률을 한눈에 확인하세요",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center p-8">
      <h1 className="mb-2 text-4xl font-bold text-gray-900">Randoo</h1>
      <p className="mb-10 text-center text-base text-gray-400">
        다양한 기능을 자유롭게 즐겨보세요 — 당신만의 놀이터입니다
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-4xl">{s.emoji}</span>
            <h2 className="text-xl font-semibold text-gray-900">{s.title}</h2>
            <p className="text-sm text-gray-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
