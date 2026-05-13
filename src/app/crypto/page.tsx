import { CryptoView, type CryptoItem } from "./CryptoView";
import { getKrName } from "./krNames";

interface CoinGeckoItem {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap_rank: number;
}

function formatPrice(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 1)    return `$${n.toFixed(3)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(6)}`;
}

function formatPriceKrw(krw: number): string {
  if (krw >= 100_000_000) return `₩${(krw / 100_000_000).toFixed(1)}억`;
  if (krw >= 10_000)      return `₩${(krw / 10_000).toFixed(0)}만`;
  if (krw >= 1)           return `₩${Math.round(krw).toLocaleString("ko-KR")}`;
  if (krw >= 0.01)        return `₩${krw.toFixed(2)}`;
  return `₩${krw.toFixed(4)}`;
}

async function getKrwRate(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 86400 },
    });
    const data = (await res.json()) as { rates: Record<string, number> };
    return data.rates.KRW ?? 1380;
  } catch {
    return 1380;
  }
}

export default async function CryptoPage() {
  let coins: CryptoItem[] = [];

  try {
    const [res, krwRate] = await Promise.all([
      fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h",
        { next: { revalidate: 86400 }, headers: { "Accept": "application/json" } },
      ),
      getKrwRate(),
    ]);
    const data = (await res.json()) as CoinGeckoItem[];

    coins = data.map((coin) => {
      const num = coin.price_change_percentage_24h ?? 0;
      const tvSymbol = `BINANCE:${coin.symbol.toUpperCase()}USDT`;
      return {
        rank: coin.market_cap_rank,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        nameKr: getKrName(coin.id, coin.symbol),
        price: formatPrice(coin.current_price),
        priceKrw: formatPriceKrw(coin.current_price * krwRate),
        changePercent: (num >= 0 ? "+" : "") + num.toFixed(2) + "%",
        sign: num > 0.01 ? "up" : num < -0.01 ? "down" : "flat",
        tvSymbol,
      } satisfies CryptoItem;
    });
  } catch {
    coins = [];
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">암호화폐</h1>
        <p className="mt-1 text-sm text-gray-500">
          시가총액 상위 100개 코인의 등락률을 한눈에 확인하세요.
        </p>
      </div>
      <CryptoView coins={coins} />
    </div>
  );
}
