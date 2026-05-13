import { StocksView, type StockItem } from "./StocksView";

const US_STOCKS = [
  { symbol: "NVDA",  name: "NVIDIA",    tvSymbol: "NASDAQ:NVDA"  },
  { symbol: "AAPL",  name: "Apple",     tvSymbol: "NASDAQ:AAPL"  },
  { symbol: "MSFT",  name: "Microsoft", tvSymbol: "NASDAQ:MSFT"  },
  { symbol: "TSLA",  name: "Tesla",     tvSymbol: "NASDAQ:TSLA"  },
  { symbol: "META",  name: "Meta",      tvSymbol: "NASDAQ:META"  },
  { symbol: "AMZN",  name: "Amazon",    tvSymbol: "NASDAQ:AMZN"  },
  { symbol: "GOOGL", name: "Alphabet",  tvSymbol: "NASDAQ:GOOGL" },
  { symbol: "AMD",   name: "AMD",       tvSymbol: "NASDAQ:AMD"   },
  { symbol: "NFLX",  name: "Netflix",   tvSymbol: "NASDAQ:NFLX"  },
  { symbol: "PLTR",  name: "Palantir",  tvSymbol: "NYSE:PLTR"    },
];

const KOREAN_STOCKS = [
  { symbol: "005930.KS", name: "삼성전자",   tvSymbol: "KRX:005930" },
  { symbol: "000660.KS", name: "SK하이닉스", tvSymbol: "KRX:000660" },
  { symbol: "005380.KS", name: "현대차",     tvSymbol: "KRX:005380" },
  { symbol: "035420.KS", name: "NAVER",     tvSymbol: "KRX:035420" },
  { symbol: "035720.KS", name: "카카오",     tvSymbol: "KRX:035720" },
  { symbol: "000270.KS", name: "기아",       tvSymbol: "KRX:000270" },
  { symbol: "006400.KS", name: "삼성SDI",    tvSymbol: "KRX:006400" },
  { symbol: "051910.KS", name: "LG화학",     tvSymbol: "KRX:051910" },
  { symbol: "068270.KS", name: "셀트리온",   tvSymbol: "KRX:068270" },
  { symbol: "105560.KS", name: "KB금융",     tvSymbol: "KRX:105560" },
];

async function fetchYahooStock(
  symbol: string,
  name: string,
  tvSymbol: string,
  formatPrice: (n: number) => string,
): Promise<StockItem | null> {
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
      tvSymbol,
      price: formatPrice(current),
      changePercent: (num >= 0 ? "+" : "") + num.toFixed(2) + "%",
      sign: num > 0 ? "up" : num < 0 ? "down" : "flat",
    };
  } catch {
    return null;
  }
}

async function fetchUSStocks(): Promise<StockItem[]> {
  const results = await Promise.all(
    US_STOCKS.map(({ symbol, name, tvSymbol }) =>
      fetchYahooStock(symbol, name, tvSymbol, (n) => `$${n.toFixed(2)}`),
    ),
  );
  return results.filter(Boolean) as StockItem[];
}

async function fetchKoreanStocks(): Promise<StockItem[]> {
  const results = await Promise.all(
    KOREAN_STOCKS.map(({ symbol, name, tvSymbol }) =>
      fetchYahooStock(symbol, name, tvSymbol, (n) => `₩${Math.round(n).toLocaleString("ko-KR")}`),
    ),
  );
  return results.filter(Boolean) as StockItem[];
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
      <StocksView usStocks={usStocks} krStocks={krStocks} />
    </div>
  );
}
