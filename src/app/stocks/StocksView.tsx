"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Minus } from "./icons";

export interface StockItem {
  symbol: string;
  name: string;
  nameKr: string | null;
  price: string;
  changePercent: string;
  sign: "up" | "down" | "flat";
  tvSymbol: string;
}

function ChangeCell({ sign, changePercent }: { sign: StockItem["sign"]; changePercent: string }) {
  const Icon = sign === "up" ? ArrowUp : sign === "down" ? ArrowDown : Minus;
  const color = sign === "up" ? "text-red-500" : sign === "down" ? "text-blue-600" : "text-gray-400";
  return (
    <span className={`flex items-center justify-end gap-0.5 text-xs font-semibold ${color}`}>
      <Icon />{changePercent}
    </span>
  );
}

function ChartModal({ stock, onClose }: { stock: StockItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-base font-bold text-gray-900">
              {stock.name}
              {stock.nameKr && <span className="ml-2 text-sm font-medium text-gray-400">{stock.nameKr}</span>}
            </p>
            <p className="text-xs text-gray-400">{stock.symbol}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">{stock.price}</span>
            <span className={`text-sm font-bold ${stock.sign === "up" ? "text-red-500" : stock.sign === "down" ? "text-blue-600" : "text-gray-400"}`}>
              {stock.changePercent}
            </span>
            <button onClick={onClose} className="ml-2 text-gray-300 hover:text-gray-600">✕</button>
          </div>
        </div>
        <iframe
          src={`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(stock.tvSymbol)}&interval=D&theme=light&style=1&locale=ko&toolbar_bg=%23f1f3f6&hide_side_toolbar=0&allow_symbol_change=false`}
          className="h-[460px] w-full"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function StocksView({ usStocks, krStocks }: { usStocks: StockItem[]; krStocks: StockItem[] }) {
  const [tab, setTab] = useState<"us" | "kr">("us");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<StockItem | null>(null);

  const handleTabChange = (next: "us" | "kr") => {
    setTab(next);
    setQuery("");
  };

  const stocks = tab === "us" ? usStocks : krStocks;
  const q = query.trim().toLowerCase();
  const filtered = q
    ? stocks.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.symbol.toLowerCase().includes(q) ||
          (s.nameKr ?? "").includes(query.trim()),
      )
    : stocks;

  const displaySymbol = (symbol: string) => symbol.replace(/\.(KS|KQ)$/, "");

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* 탭 + 검색 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex shrink-0 rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => handleTabChange("us")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === "us" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              🇺🇸 미국
            </button>
            <button
              onClick={() => handleTabChange("kr")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === "kr" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              🇰🇷 한국
            </button>
          </div>

          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder={
                tab === "us"
                  ? "종목명·티커 검색 (AAPL, Apple…)"
                  : "종목명·코드 검색 (삼성전자, 005930…)"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* 종목 수 */}
        <p className="text-xs text-gray-400">
          {filtered.length}개 종목{q && ` · "${query}" 검색 결과`}
        </p>

        {/* 리스트 */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-400">
            <span>종목</span>
            <span className="w-24 text-right md:w-28">가격</span>
            <span className="w-16 text-right md:w-20">등락</span>
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">검색 결과가 없어요</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((stock) => (
                <li key={stock.symbol}>
                  <button
                    onClick={
                      stock.tvSymbol.startsWith("KRX:")
                        ? () =>
                            window.open(
                              `https://www.tradingview.com/chart/?symbol=${stock.tvSymbol}`,
                              "_blank",
                            )
                        : () => setSelected(stock)
                    }
                    className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-x-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <span className="min-w-0">
                      <span className="text-sm font-semibold text-gray-900">{stock.name}</span>
                      {stock.nameKr && (
                        <span className="ml-1.5 text-xs text-gray-400">{stock.nameKr}</span>
                      )}
                      <span className="ml-1.5 text-xs text-gray-300">{displaySymbol(stock.symbol)}</span>
                    </span>
                    <span className="w-24 text-right text-sm font-medium text-gray-700 md:w-28">
                      {stock.price}
                    </span>
                    <span className="w-16 md:w-20">
                      <ChangeCell sign={stock.sign} changePercent={stock.changePercent} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {selected && (
        <ChartModal stock={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
