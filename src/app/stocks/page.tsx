import { ArrowDown, ArrowUp, Minus } from "./icons";

const KEY = process.env.ALPHA_VANTAGE_API_KEY;

const KOREAN_STOCKS = [
  { symbol: "005930.KS", name: "삼성전자" },
  { symbol: "000660.KS", name: "SK하이닉스" },
  { symbol: "005380.KS", name: "현대차" },
  { symbol: "035420.KS", name: "NAVER" },
  { symbol: "035720.KS", name: "카카오" },
  { symbol: "000270.KS", name: "기아" },
  { symbol: "006400.KS", name: "삼성SDI" },
  { symbol: "051910.KS", name: "LG화학" },
  { symbol: "068270.KS", name: "셀트리온" },
  { symbol: "105560.KS", name: "KB금융" },
];

interface StockItem {
  symbol: string;
  name: string;
  price: string;
  changePercent: string;
  sign: "up" | "down" | "flat";
}

async function fetchUSStocks(): Promise<StockItem[]> {
  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${KEY}`,
      { next: { revalidate: 86400 } },
    );
    const data = (await res.json()) as Record<string, unknown>;
    const list = (data.most_actively_traded ?? []) as Record<string, string>[];
    return list.slice(0, 10).map((s) => {
      const pct = s.change_percentage ?? "0%";
      const num = parseFloat(pct);
      return {
        symbol: s.ticker ?? "",
        name: s.ticker ?? "",
        price: `$${Number(s.price).toFixed(2)}`,
        changePercent: pct.replace("%", "") + "%",
        sign: num > 0 ? "up" : num < 0 ? "down" : "flat",
      };
    });
  } catch {
    return [];
  }
}

async function fetchKoreanStock(symbol: string, name: string): Promise<StockItem | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`,
      { next: { revalidate: 86400 }, headers: { "User-Agent": "Mozilla/5.0" } },
    );
    const data = (await res.json()) as {
      chart: {
        result?: {
          meta: {
            regularMarketPrice: number;
            chartPreviousClose?: number;
            previousClose?: number;
            regularMarketPreviousClose?: number;
          };
          indicators: { quote: { close: (number | null)[] }[] };
        }[];
      };
    };
    const result = data.chart.result?.[0];
    if (!result) return null;
    const { meta, indicators } = result;
    const current = meta.regularMarketPrice;
    const prev =
      meta.chartPreviousClose ??
      meta.previousClose ??
      meta.regularMarketPreviousClose ??
      [...(indicators.quote[0]?.close ?? [])].reverse().find((v): v is number => v != null) ??
      null;
    if (!prev || prev === 0) return null;
    const num = ((current - prev) / prev) * 100;
    return {
      symbol,
      name,
      price: `₩${current.toLocaleString("ko-KR")}`,
      changePercent: (num >= 0 ? "+" : "") + num.toFixed(2) + "%",
      sign: num > 0 ? "up" : num < 0 ? "down" : "flat",
    };
  } catch {
    return null;
  }
}

async function fetchKoreanStocks(): Promise<StockItem[]> {
  const results = await Promise.all(
    KOREAN_STOCKS.map(({ symbol, name }) => fetchKoreanStock(symbol, name)),
  );
  return results.filter(Boolean) as StockItem[];
}

function StockRow({ stock }: { stock: StockItem }) {
  const colors = {
    up:   { text: "text-blue-600",  bg: "bg-blue-50",   border: "border-blue-100"  },
    down: { text: "text-red-500",   bg: "bg-red-50",    border: "border-red-100"   },
    flat: { text: "text-gray-400",  bg: "bg-gray-50",   border: "border-gray-100"  },
  }[stock.sign];

  const Icon = stock.sign === "up" ? ArrowUp : stock.sign === "down" ? ArrowDown : Minus;

  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${colors.bg} ${colors.border}`}>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">{stock.name}</p>
        <p className="text-xs text-gray-400">{stock.symbol}</p>
      </div>
      <div className="ml-4 flex flex-col items-end gap-0.5 shrink-0">
        <p className="text-sm font-medium text-gray-700">{stock.price}</p>
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${colors.text}`}>
          <Icon />
          {stock.changePercent}
        </span>
      </div>
    </div>
  );
}

function Section({ title, flag, stocks, empty }: {
  title: string; flag: string; stocks: StockItem[]; empty: string;
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
          {stocks.map((s) => <StockRow key={s.symbol} stock={s} />)}
        </div>
      )}
    </section>
  );
}

export default async function StocksPage() {
  const [usStocks, krStocks] = await Promise.all([fetchUSStocks(), fetchKoreanStocks()]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">주식</h1>
        <p className="mt-1 text-sm text-gray-500">
          오늘 주목할 만한 미국·한국 주요 종목의 등락률을 한눈에 확인하세요.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Section
          flag="🇺🇸" title="미국 시장 (거래량 상위 10)"
          stocks={usStocks}
          empty="미국 시장 데이터를 불러올 수 없어요"
        />
        <Section
          flag="🇰🇷" title="한국 시장 (시가총액 상위 10)"
          stocks={krStocks}
          empty="한국 시장 데이터를 불러올 수 없어요"
        />
      </div>
    </div>
  );
}
