"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Minus } from "../stocks/icons";

export interface CryptoItem {
  rank: number;
  symbol: string;
  name: string;
  nameKr: string | null;
  price: string;
  priceKrw: string;
  changePercent: string;
  sign: "up" | "down" | "flat";
  tvSymbol: string;
}

function ChangeCell({ sign, changePercent }: { sign: CryptoItem["sign"]; changePercent: string }) {
  const Icon = sign === "up" ? ArrowUp : sign === "down" ? ArrowDown : Minus;
  const color = sign === "up" ? "text-red-500" : sign === "down" ? "text-blue-600" : "text-gray-400";
  return (
    <span className={`flex items-center justify-end gap-0.5 text-xs font-semibold ${color}`}>
      <Icon />{changePercent}
    </span>
  );
}

function ChartModal({ coin, onClose }: { coin: CryptoItem; onClose: () => void }) {
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
              {coin.name}
              {coin.nameKr && <span className="ml-2 text-sm font-medium text-gray-400">{coin.nameKr}</span>}
            </p>
            <p className="text-xs text-gray-400">{coin.symbol}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">{coin.price}</p>
              <p className="text-xs text-gray-400">{coin.priceKrw}</p>
            </div>
            <ChangeCell sign={coin.sign} changePercent={coin.changePercent} />
            <button onClick={onClose} className="ml-2 text-gray-300 hover:text-gray-600">✕</button>
          </div>
        </div>
        <iframe
          src={`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(coin.tvSymbol)}&interval=D&theme=light&style=1&locale=ko&toolbar_bg=%23f1f3f6&hide_side_toolbar=0&allow_symbol_change=false`}
          className="h-[460px] w-full"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export function CryptoView({ coins }: { coins: CryptoItem[] }) {
  const [selected, setSelected] = useState<CryptoItem | null>(null);

  if (coins.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
        암호화폐 데이터를 불러올 수 없어요
      </p>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* 헤더 */}
        <div className="grid grid-cols-[2rem_1fr_auto_auto] gap-x-3 border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-400 md:grid-cols-[2.5rem_1fr_auto_auto]">
          <span>#</span>
          <span>코인</span>
          <span className="w-24 text-right md:w-32">가격</span>
          <span className="w-16 text-right md:w-20">24h</span>
        </div>

        {/* 목록 */}
        <ul className="divide-y divide-gray-100">
          {coins.map((coin) => (
            <li key={coin.symbol}>
              <button
                onClick={() => setSelected(coin)}
                className="grid w-full grid-cols-[2rem_1fr_auto_auto] items-center gap-x-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 md:grid-cols-[2.5rem_1fr_auto_auto]"
              >
                <span className="text-xs text-gray-400">{coin.rank}</span>
                <span className="min-w-0">
                  <span className="text-sm font-semibold text-gray-900">{coin.name}</span>
                  {coin.nameKr && (
                    <span className="ml-1.5 text-xs text-gray-400">{coin.nameKr}</span>
                  )}
                  <span className="ml-1.5 text-xs text-gray-300">{coin.symbol}</span>
                </span>
                <span className="w-24 text-right md:w-32">
                  <span className="block text-sm font-medium text-gray-700">{coin.price}</span>
                  <span className="block text-xs text-gray-400">{coin.priceKrw}</span>
                </span>
                <span className="w-16 md:w-20">
                  <ChangeCell sign={coin.sign} changePercent={coin.changePercent} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selected && <ChartModal coin={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
