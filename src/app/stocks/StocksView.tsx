"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Minus } from "./icons";

export interface StockItem {
  symbol: string;
  name: string;
  price: string;
  changePercent: string;
  sign: "up" | "down" | "flat";
  tvSymbol: string;
}

function StockCard({ stock, onClick }: { stock: StockItem; onClick: () => void }) {
  const colors = {
    up:   { text: "text-blue-600", bg: "bg-blue-50",  border: "border-blue-100"  },
    down: { text: "text-red-500",  bg: "bg-red-50",   border: "border-red-100"   },
    flat: { text: "text-gray-400", bg: "bg-gray-50",  border: "border-gray-100"  },
  }[stock.sign];
  const Icon = stock.sign === "up" ? ArrowUp : stock.sign === "down" ? ArrowDown : Minus;
  const isKrx = stock.tvSymbol.startsWith("KRX:");

  return (
    <button
      onClick={isKrx
        ? () => window.open(`https://www.tradingview.com/chart/?symbol=${stock.tvSymbol}`, "_blank")
        : onClick
      }
      className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition-opacity hover:opacity-80 ${colors.bg} ${colors.border}`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">{stock.name}</p>
        <p className="text-xs text-gray-400">{stock.symbol}</p>
      </div>
      <div className="ml-4 flex shrink-0 flex-col items-end gap-0.5">
        <p className="text-sm font-medium text-gray-700">{stock.price}</p>
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${colors.text}`}>
          <Icon />{stock.changePercent}
        </span>
      </div>
    </button>
  );
}

function Section({ flag, title, stocks, empty, onSelect }: {
  flag: string; title: string; stocks: StockItem[];
  empty: string; onSelect: (s: StockItem) => void;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
        <span>{flag}</span>{title}
      </h2>
      {stocks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">{empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {stocks.map((s) => <StockCard key={s.symbol} stock={s} onClick={() => onSelect(s)} />)}
        </div>
      )}
    </section>
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
            <p className="text-base font-bold text-gray-900">{stock.name}</p>
            <p className="text-xs text-gray-400">{stock.symbol}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">{stock.price}</span>
            <span className={`text-sm font-bold ${stock.sign === "up" ? "text-blue-600" : stock.sign === "down" ? "text-red-500" : "text-gray-400"}`}>
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

export function StocksView({ usStocks, krStocks }: { usStocks: StockItem[]; krStocks: StockItem[] }) {
  const [selected, setSelected] = useState<StockItem | null>(null);

  return (
    <>
      <div className="flex flex-col gap-8">
        <Section flag="🇺🇸" title="미국 시장 (거래량 상위 10)"
          stocks={usStocks} empty="미국 시장 데이터를 불러올 수 없어요"
          onSelect={setSelected}
        />
        <Section flag="🇰🇷" title="한국 시장 (시가총액 상위 10)"
          stocks={krStocks} empty="한국 시장 데이터를 불러올 수 없어요"
          onSelect={setSelected}
        />
      </div>
      {selected && <ChartModal stock={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
