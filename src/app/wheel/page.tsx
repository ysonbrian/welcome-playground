import { SpinWheel } from "./SpinWheel";

export default function WheelPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-1 text-xl font-bold text-gray-900 md:text-2xl">돌림판</h1>
      <p className="mb-4 text-sm text-gray-500 md:mb-6">
        항목을 추가하고 돌려서 결과를 정해보세요. 캔버스를 클릭해도 돌아갑니다.
      </p>
      <SpinWheel />
    </div>
  );
}
