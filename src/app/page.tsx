import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">FoodPicker</h1>
      <p className="mb-10 text-lg text-gray-500">
        오늘 뭐 먹을지 고민될 때 사용해보세요
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href="/map"
          className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="text-4xl">🗺</span>
          <h2 className="text-xl font-semibold text-gray-900">음식점 지도</h2>
          <p className="text-sm text-gray-500">
            근처 음식점을 검색하고 지도에서 확인하세요
          </p>
        </Link>
        <Link
          href="/wheel"
          className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="text-4xl">🎡</span>
          <h2 className="text-xl font-semibold text-gray-900">돌림판</h2>
          <p className="text-sm text-gray-500">
            항목을 추가하고 돌려서 결과를 정해보세요
          </p>
        </Link>
      </div>
    </div>
  );
}
