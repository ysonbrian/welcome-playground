import { KakaoMap } from "./KakaoMap";

export default function MapPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="border-b border-gray-200 bg-white px-4 py-3 md:px-6 md:py-4">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">장소 검색</h1>
        <p className="mt-0.5 hidden text-sm text-gray-500 sm:block">
          카테고리를 선택하고 검색어를 입력하면 지도에 표시됩니다.
        </p>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <KakaoMap />
      </div>
    </div>
  );
}
