"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_WHEEL_ITEMS, useWheelItems } from "~/app/_components/WheelItemsProvider";

const API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

type PlaceResult = kakao.maps.services.PlaceResult;


const MY_LOCATION_DOT = `<div style="width:18px;height:18px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(59,130,246,0.6)"></div>`;

export function KakaoMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<kakao.maps.Map | null>(null);
  const markersRef      = useRef<kakao.maps.Marker[]>([]);
  const myOverlayRef    = useRef<kakao.maps.CustomOverlay | null>(null);
  const userLocationRef = useRef<kakao.maps.LatLng | null>(null);

  const { items: wheelItems, addItem: addToWheel } = useWheelItems();

  const [toast,          setToast]          = useState<string | null>(null);
  const [ready,          setReady]          = useState(false);
  const [locating,       setLocating]       = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [query,          setQuery]          = useState("");
  const [places,         setPlaces]         = useState<PlaceResult[]>([]);
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [noResult,       setNoResult]       = useState(false);
  // 마커 클릭 시 보여줄 플로팅 카드용 상태
  const [activePlace,    setActivePlace]    = useState<PlaceResult | null>(null);

  /* ── 토스트 ── */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  /* ── 돌림판 추가 ── */
  const handleAddToWheel = useCallback((place: PlaceResult) => {
    const result = addToWheel(place.place_name);
    if      (result === "added")     showToast(`"${place.place_name}" 돌림판에 추가됨`);
    else if (result === "duplicate") showToast("이미 돌림판에 있어요");
    else                             showToast(`돌림판이 가득 찼어요 (최대 ${MAX_WHEEL_ITEMS}개)`);
  }, [addToWheel, showToast]);

  /* ── 내 위치 마커 ── */
  const moveToMyLocation = useCallback((latLng: kakao.maps.LatLng) => {
    if (!mapRef.current) return;
    mapRef.current.setCenter(latLng);
    mapRef.current.setLevel(4);
    if (myOverlayRef.current) {
      myOverlayRef.current.setPosition(latLng);
    } else {
      myOverlayRef.current = new window.kakao.maps.CustomOverlay({
        position: latLng, content: MY_LOCATION_DOT,
        xAnchor: 0.5, yAnchor: 0.5, zIndex: 10,
      });
      myOverlayRef.current.setMap(mapRef.current);
    }
  }, []);

  /* ── 위치 요청 ── */
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocationDenied(true); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latLng = new window.kakao.maps.LatLng(coords.latitude, coords.longitude);
        userLocationRef.current = latLng;
        moveToMyLocation(latLng);
        setLocating(false);
      },
      () => { setLocating(false); setLocationDenied(true); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [moveToMyLocation]);

  /* ── 카카오맵 SDK 로드 ── */
  useEffect(() => {
    if (!API_KEY) return;
    const init = () => {
      window.kakao.maps.load(() => {
        if (!mapContainerRef.current) return;
        const map = new window.kakao.maps.Map(mapContainerRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 5,
        });
        mapRef.current = map;
        // 지도 빈 곳 클릭 시 플로팅 카드 닫기
        window.kakao.maps.event.addListener(map, "click", () => setActivePlace(null));
        setReady(true);
        requestLocation();
      });
    };
    if (window.kakao?.maps) { init(); return; }
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = init;
    document.head.appendChild(script);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 마커 초기화 ── */
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    setActivePlace(null);
  }, []);

  useEffect(() => () => clearMarkers(), [clearMarkers]);

  /* ── 검색 ── */
  const search = useCallback(() => {
    if (!query.trim() || !mapRef.current) return;
    const ps = new window.kakao.maps.services.Places();
    const options: kakao.maps.services.PlacesSearchOptions = {};
    if (userLocationRef.current) { options.location = userLocationRef.current; options.radius = 2000; }
    setNoResult(false);

    ps.keywordSearch(query, (data, status) => {
      if (status !== window.kakao.maps.services.Status.OK) {
        clearMarkers(); setPlaces([]); setSelectedId(null); setNoResult(true); return;
      }
      clearMarkers(); setPlaces(data); setSelectedId(null);
      const bounds = new window.kakao.maps.LatLngBounds();

      data.forEach((place) => {
        const position = new window.kakao.maps.LatLng(Number(place.y), Number(place.x));
        const marker = new window.kakao.maps.Marker({ map: mapRef.current!, position, title: place.place_name });

        // ★ 마커 클릭 → React 상태만 업데이트 (InfoWindow 없음)
        window.kakao.maps.event.addListener(marker, "click", () => {
          setSelectedId(place.id);
          setActivePlace(place);
        });

        markersRef.current.push(marker);
        bounds.extend(position);
      });
      mapRef.current!.setBounds(bounds);
    }, options);
  }, [query, clearMarkers]);

  /* ── 목록 클릭 ── */
  const handlePlaceClick = useCallback((place: PlaceResult, index: number) => {
    if (!mapRef.current) return;
    setSelectedId(place.id);
    setActivePlace(place);
    mapRef.current.panTo(new window.kakao.maps.LatLng(Number(place.y), Number(place.x)));
    // 해당 마커로 스크롤 효과만 (InfoWindow 없음)
    void markersRef.current[index];
  }, []);

  /* ── API 키 없음 안내 ── */
  if (!API_KEY) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-5xl">🗺</div>
        <h2 className="text-xl font-bold text-gray-800">API 키 설정이 필요합니다</h2>
        <pre className="rounded-lg bg-gray-900 px-6 py-3 text-sm text-green-400">
          NEXT_PUBLIC_KAKAO_MAP_API_KEY=발급받은_키
        </pre>
        <p className="text-xs text-gray-400">저장 후 dev 서버를 재시작하세요.</p>
      </div>
    );
  }

  /* ── 렌더 ── */
  return (
    <div className="absolute inset-0 flex flex-col">

      {/* 검색 바 */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 md:px-4 md:py-3">
        {/* 모바일: 1줄 */}
        <div className="flex gap-2 md:hidden">
          <input
            type="text" value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder={!ready ? "지도 로딩 중..." : userLocationRef.current ? "검색 (내 위치 기반)" : "검색어 입력..."}
            disabled={!ready}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50"
          />
          <button
            onClick={requestLocation} disabled={!ready || locating}
            title={locationDenied ? "위치 권한이 거부되었습니다" : "내 위치로 이동"}
            className={`flex shrink-0 items-center justify-center rounded-lg border px-3 py-2 transition-colors disabled:opacity-50 ${userLocationRef.current ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 bg-white text-gray-600"}`}
          >
            {locating
              ? <span className="animate-spin text-sm">⟳</span>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
            }
          </button>
          <button
            onClick={search} disabled={!ready || !query.trim()}
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >검색</button>
        </div>
        {/* 데스크톱: 1줄 */}
        <div className="hidden items-center gap-2 md:flex">
          <input
            type="text" value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder={!ready ? "지도 로딩 중..." : locating ? "위치 확인 중..." : userLocationRef.current ? "검색 (내 위치 기반, 반경 2km)" : "검색어를 입력하세요"}
            disabled={!ready}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50"
          />
          <button
            onClick={requestLocation} disabled={!ready || locating}
            title={locationDenied ? "위치 권한이 거부되었습니다" : "내 위치로 이동"}
            className={`flex items-center justify-center rounded-lg border px-3 py-2 transition-colors disabled:opacity-50 ${userLocationRef.current ? "border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100" : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            {locating
              ? <span className="animate-spin text-sm">⟳</span>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
            }
          </button>
          <button
            onClick={search} disabled={!ready || !query.trim()}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >검색</button>
        </div>
      </div>

      {locationDenied && (
        <div className="shrink-0 bg-yellow-50 px-4 py-2 text-xs text-yellow-700">
          위치 권한이 거부되었습니다. 브라우저 주소창 옆 자물쇠 아이콘에서 위치 권한을 허용해주세요.
        </div>
      )}

      {/* 지도 + 오버레이 */}
      <div className="relative flex-1">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* ★ 마커 클릭 시 플로팅 카드 (순수 React → 버튼 정상 동작) */}
        {activePlace && (
          <div className="absolute left-3 right-3 top-3 z-20 rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 md:left-4 md:right-auto md:top-auto md:bottom-5 md:w-64">
            <div className="flex items-start justify-between px-4 pt-4 pb-1">
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-gray-900">{activePlace.place_name}</p>
                <p className="mt-0.5 truncate text-xs text-gray-400">{activePlace.category_name.split(" > ").pop()}</p>
              </div>
              <button onClick={() => setActivePlace(null)} className="ml-2 mt-0.5 shrink-0 text-gray-300 hover:text-gray-500">✕</button>
            </div>
            <div className="px-4 pb-1 text-xs text-gray-600">
              {activePlace.road_address_name || activePlace.address_name}
            </div>
            {activePlace.phone && (
              <div className="px-4 pb-1 text-xs text-blue-500">{activePlace.phone}</div>
            )}
            {activePlace.distance && (
              <div className="px-4 pb-1 text-xs text-blue-400">
                {Number(activePlace.distance) >= 1000
                  ? `${(Number(activePlace.distance) / 1000).toFixed(1)}km`
                  : `${activePlace.distance}m`}
              </div>
            )}
            <div className="px-4 pb-4 pt-2">
              <button
                onClick={() => handleAddToWheel(activePlace)}
                className={`w-full rounded-lg py-2 text-sm font-semibold transition-colors ${
                  wheelItems.includes(activePlace.place_name.slice(0, 8))
                    ? "bg-green-100 text-green-700"
                    : wheelItems.length >= MAX_WHEEL_ITEMS
                      ? "bg-gray-100 text-gray-400"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {wheelItems.includes(activePlace.place_name.slice(0, 8))
                  ? "✓ 돌림판에 추가됨"
                  : wheelItems.length >= MAX_WHEEL_ITEMS
                    ? "돌림판이 가득 찼어요"
                    : "+ 돌림판에 추가"}
              </button>
            </div>
          </div>
        )}

        {/* 토스트 */}
        {toast && (
          <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-800 px-5 py-2.5 text-sm text-white shadow-lg">
            {toast}
          </div>
        )}

        {/* 결과 패널: 모바일=하단 시트, 데스크톱=우측 패널 */}
        {(places.length > 0 || noResult) && (
          <div className="absolute bottom-0 left-0 right-0 flex h-52 flex-col overflow-hidden border-t border-gray-200 bg-white shadow-lg md:bottom-0 md:left-auto md:right-0 md:top-0 md:h-auto md:w-64 md:border-l md:border-t-0">
            {noResult ? (
              <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-gray-400">검색 결과가 없습니다.</div>
            ) : (
              <>
                <div className="shrink-0 border-b border-gray-100 px-3 py-2 text-xs text-gray-400">
                  검색 결과 {places.length}개{userLocationRef.current && " · 내 위치 기반"}
                </div>
                <ul className="flex-1 overflow-y-auto">
                  {places.map((place, i) => {
                    const inWheel  = wheelItems.includes(place.place_name.trim());
                    const isFull   = wheelItems.length >= MAX_WHEEL_ITEMS;
                    return (
                      <li
                        key={place.id}
                        onClick={() => handlePlaceClick(place, i)}
                        className={`cursor-pointer border-b border-gray-100 px-3 py-3 transition-colors hover:bg-gray-50 ${selectedId === place.id ? "bg-blue-50" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="truncate text-sm font-medium text-gray-900">{place.place_name}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAddToWheel(place); }}
                            title={inWheel ? "이미 추가됨" : isFull ? "가득 참" : "돌림판에 추가"}
                            className={`ml-1 shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors ${inWheel ? "bg-green-100 text-green-600" : isFull ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                          >
                            {inWheel ? "✓" : "+"}
                          </button>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-gray-400">{place.category_name.split(" > ").pop()}</p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">{place.road_address_name || place.address_name}</p>
                        {place.distance && (
                          <p className="mt-0.5 text-xs text-blue-400">
                            {Number(place.distance) >= 1000 ? `${(Number(place.distance) / 1000).toFixed(1)}km` : `${place.distance}m`}
                          </p>
                        )}
                        {place.phone && <p className="mt-0.5 text-xs text-blue-500">{place.phone}</p>}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
