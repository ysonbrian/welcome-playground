"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_WHEEL_ITEMS, useWheelItems } from "~/app/_components/WheelItemsProvider";

const API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#F0B27A",
];

const SIZE = 420;
const RADIUS = SIZE / 2 - 20;

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

export function SpinWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { items, loading, addItem: storeAdd, removeItem: storeRemove, clearItems: storeClear } = useWheelItems();
  const [newItem,       setNewItem]       = useState("");
  const [spinning,      setSpinning]      = useState(false);
  const [result,        setResult]        = useState<string | null>(null);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [nearbyStatus,  setNearbyStatus]  = useState<string | null>(null);
  const angleRef = useRef(0);
  const rafRef   = useRef<number | null>(null);

  const draw = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current;
      if (!canvas || items.length === 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cx = SIZE / 2;
      const cy = SIZE / 2;
      const n  = items.length;
      const seg = (2 * Math.PI) / n;

      ctx.clearRect(0, 0, SIZE, SIZE);

      // Outer shadow ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur  = 18;
      ctx.beginPath();
      ctx.arc(0, 0, RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.restore();

      // Segments
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      for (let i = 0; i < n; i++) {
        const startAngle = -Math.PI / 2 + i * seg;
        const endAngle   = startAngle + seg;
        const color      = COLORS[i % COLORS.length]!;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, RADIUS, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle   = color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth   = 2;
        ctx.stroke();

        ctx.save();
        ctx.rotate(startAngle + seg / 2);
        ctx.textAlign  = "right";
        ctx.fillStyle  = "#fff";
        ctx.font       = `bold ${n > 7 ? 12 : 14}px sans-serif`;
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur  = 4;
        ctx.fillText(items[i] ?? "", RADIUS - 15, 5, RADIUS - 35);
        ctx.restore();
      }

      // Center circle
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, 2 * Math.PI);
      ctx.fillStyle   = "#fff";
      ctx.shadowColor = "rgba(0,0,0,0.15)";
      ctx.shadowBlur  = 6;
      ctx.fill();
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth   = 2;
      ctx.stroke();
      ctx.restore();

      // Pointer triangle at top
      ctx.save();
      ctx.translate(cx, cy - RADIUS - 2);
      ctx.beginPath();
      ctx.moveTo(0, 14);
      ctx.lineTo(-11, -7);
      ctx.lineTo(11, -7);
      ctx.closePath();
      ctx.fillStyle   = "#ef4444";
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur  = 4;
      ctx.fill();
      ctx.restore();
    },
    [items],
  );

  useEffect(() => {
    if (!spinning && items.length > 0) draw(angleRef.current);
  }, [draw, spinning, items.length]);

  const spin = useCallback(() => {
    if (spinning || items.length < 2) return;

    const snapshot = [...items];
    setSpinning(true);
    setResult(null);

    const extraSpins  = 5 + Math.floor(Math.random() * 5);
    const extraAngle  = Math.random() * 2 * Math.PI;
    const totalDelta  = extraSpins * 2 * Math.PI + extraAngle;
    const startAngle  = angleRef.current;
    const targetAngle = startAngle + totalDelta;
    const duration    = 4000;
    const startTime   = performance.now();

    const animate = (now: number) => {
      const t     = Math.min((now - startTime) / duration, 1);
      const angle = startAngle + totalDelta * easeOut(t);
      angleRef.current = angle;
      draw(angle);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        const seg      = (2 * Math.PI) / snapshot.length;
        const ptrLocal = ((-Math.PI / 2 - targetAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const relAngle = ((ptrLocal + Math.PI / 2) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const idx      = Math.floor(relAngle / seg) % snapshot.length;
        setResult(snapshot[idx] ?? null);
        setSpinning(false);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [spinning, items, draw]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const addNearbyRestaurants = async () => {
    if (spinning || loadingNearby) return;

    const available = MAX_WHEEL_ITEMS - items.length;
    if (available <= 0) { setNearbyStatus("돌림판이 가득 찼어요"); return; }

    setLoadingNearby(true);
    setNearbyStatus(null);

    try {
      // 1. Kakao SDK 로드
      await new Promise<void>((resolve, reject) => {
        if (!API_KEY) { reject(new Error("no_key")); return; }
        const init = () => window.kakao.maps.load(() => resolve());
        if (window.kakao?.maps) { init(); return; }
        const script = document.createElement("script");
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&libraries=services&autoload=false`;
        script.async = true;
        script.onload = init;
        script.onerror = () => reject(new Error("sdk_failed"));
        document.head.appendChild(script);
      });

      // 2. 현재 위치 가져오기
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) { reject(new Error("no_geo")); return; }
        navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error("denied")), {
          enableHighAccuracy: true, timeout: 10000,
        });
      });

      // 3. 주변 음식점 검색
      const places = await new Promise<kakao.maps.services.PlaceResult[]>((resolve, reject) => {
        const ps  = new window.kakao.maps.services.Places();
        const loc = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        ps.categorySearch(
          "FD6",
          (data, status) => {
            if (status === window.kakao.maps.services.Status.OK) resolve(data);
            else reject(new Error("no_results"));
          },
          { location: loc, radius: 1000 },
        );
      });

      // 4. 이미 추가된 항목 제외 후 셔플, 슬롯만큼 추가
      // seenNames: 현재 wheel 항목 + 이번 배치에서 추가될 이름 모두 추적 (중복 방지)
      const seenNames = new Set(items.map((n) => n.slice(0, 8)));
      const deduped = places
        .filter((p) => {
          const name = p.place_name.slice(0, 8);
          if (seenNames.has(name)) return false;
          seenNames.add(name);
          return true;
        })
        .sort(() => Math.random() - 0.5)
        .slice(0, available);

      if (deduped.length === 0) {
        setNearbyStatus("주변 음식점이 이미 모두 추가되어 있어요");
        return;
      }

      let count = 0;
      for (const place of deduped) {
        if (storeAdd(place.place_name) === "added") count++;
      }

      setNearbyStatus(`${count}개 추가됐어요 🎉`);
      setTimeout(() => setNearbyStatus(null), 3000);

    } catch (err) {
      const msgMap: Record<string, string> = {
        no_key:     "카카오 API 키가 없어요",
        no_geo:     "위치 서비스를 지원하지 않아요",
        denied:     "위치 권한을 허용해주세요",
        sdk_failed: "지도 SDK 로드에 실패했어요",
        no_results: "주변 음식점을 찾을 수 없어요",
      };
      const key = err instanceof Error ? err.message : "";
      setNearbyStatus(msgMap[key] ?? "오류가 발생했어요");
    } finally {
      setLoadingNearby(false);
    }
  };

  const addItem = () => {
    if (spinning) return;
    storeAdd(newItem);
    setNewItem("");
    setResult(null);
  };

  const removeItem = (index: number) => {
    if (spinning) return;
    storeRemove(index);
    setResult(null);
  };

  const canSpin   = items.length >= 2;
  const spinLabel = spinning ? "돌리는 중..." : canSpin ? "돌리기!" : items.length === 0 ? "항목을 추가해주세요" : "1개 더 추가하면 돌릴 수 있어요";

  return (
    <div className="flex flex-col items-center gap-8 p-4 md:flex-row md:flex-wrap md:items-start md:gap-10 md:p-6">

      {/* 돌림판 */}
      <div className="flex w-full max-w-[420px] flex-col items-center gap-5 md:w-auto">
        {items.length === 0 ? (
          <div className="flex w-full items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-gray-50 drop-shadow-sm" style={{ aspectRatio: "1/1" }}>
            {loading ? (
              <p className="text-sm text-gray-300">불러오는 중...</p>
            ) : (
              <div className="text-center">
                <p className="text-5xl">🎯</p>
                <p className="mt-3 text-sm font-medium text-gray-400">항목을 추가해보세요</p>
              </div>
            )}
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="w-full cursor-pointer drop-shadow-lg"
            onClick={spin}
          />
        )}

        <button
          onClick={spin}
          disabled={spinning || !canSpin}
          className="w-full rounded-xl bg-blue-600 px-12 py-3 text-lg font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {spinLabel}
        </button>

        {result && !spinning && (
          <div className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50 px-10 py-5 text-center shadow-sm">
            <p className="text-sm font-medium text-blue-400">오늘의 메뉴는</p>
            <p className="mt-1 text-3xl font-extrabold text-blue-700">{result}</p>
          </div>
        )}
      </div>

      {/* 메뉴 목록 */}
      <div className="flex w-full flex-col gap-4 md:w-56">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">메뉴 목록</h2>
          {items.length > 0 && (
            <button
              onClick={() => { if (confirm("전체 삭제할까요?")) storeClear(); }}
              disabled={spinning}
              className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
            >
              전체삭제
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="메뉴 추가..."
            maxLength={8}
            disabled={items.length >= MAX_WHEEL_ITEMS || spinning}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            onClick={addItem}
            disabled={items.length >= MAX_WHEEL_ITEMS || !newItem.trim() || spinning}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            추가
          </button>
        </div>

        {/* 주변 음식점 랜덤 추가 */}
        <button
          onClick={() => void addNearbyRestaurants()}
          disabled={spinning || loadingNearby || items.length >= MAX_WHEEL_ITEMS}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
        >
          {loadingNearby ? (
            <><span className="inline-block animate-spin">⟳</span> 검색 중...</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>주변 음식점 랜덤 추가</>
          )}
        </button>
        {nearbyStatus && (
          <p className="text-center text-xs text-gray-500">{nearbyStatus}</p>
        )}

        {items.length === 0 && !loading ? (
          <p className="py-6 text-center text-sm text-gray-300">아직 메뉴가 없어요</p>
        ) : (
          <ul className="space-y-1.5">
            {items.map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: `${COLORS[i % COLORS.length]}2e` }}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="truncate text-gray-800">{item}</span>
                </div>
                <button
                  onClick={() => removeItem(i)}
                  disabled={spinning}
                  className="ml-2 flex-shrink-0 text-gray-300 transition-colors hover:text-red-400 disabled:cursor-not-allowed"
                  aria-label="삭제"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-gray-400">
          {items.length}/{MAX_WHEEL_ITEMS}
          {items.length === 1 && " · 1개 더 추가하면 돌릴 수 있어요"}
        </p>
      </div>
    </div>
  );
}
