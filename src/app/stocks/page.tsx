import { StocksView, type StockItem } from "./StocksView";

const US_STOCKS = [
  // 빅테크
  { symbol: "NVDA",  nameKr: "엔비디아",          name: "NVIDIA",           tvSymbol: "NASDAQ:NVDA"  },
  { symbol: "AAPL",  nameKr: "애플",               name: "Apple",            tvSymbol: "NASDAQ:AAPL"  },
  { symbol: "MSFT",  nameKr: "마이크로소프트",     name: "Microsoft",        tvSymbol: "NASDAQ:MSFT"  },
  { symbol: "GOOGL", nameKr: "알파벳",             name: "Alphabet",         tvSymbol: "NASDAQ:GOOGL" },
  { symbol: "META",  nameKr: "메타",               name: "Meta",             tvSymbol: "NASDAQ:META"  },
  { symbol: "AMZN",  nameKr: "아마존",             name: "Amazon",           tvSymbol: "NASDAQ:AMZN"  },
  { symbol: "TSLA",  nameKr: "테슬라",             name: "Tesla",            tvSymbol: "NASDAQ:TSLA"  },
  // 반도체
  { symbol: "AMD",   nameKr: "AMD",                name: "AMD",              tvSymbol: "NASDAQ:AMD"   },
  { symbol: "AVGO",  nameKr: "브로드컴",           name: "Broadcom",         tvSymbol: "NASDAQ:AVGO"  },
  { symbol: "INTC",  nameKr: "인텔",               name: "Intel",            tvSymbol: "NASDAQ:INTC"  },
  { symbol: "QCOM",  nameKr: "퀄컴",               name: "Qualcomm",         tvSymbol: "NASDAQ:QCOM"  },
  { symbol: "MU",    nameKr: "마이크론",            name: "Micron",           tvSymbol: "NASDAQ:MU"    },
  { symbol: "AMAT",  nameKr: "어플라이드머티리얼즈", name: "Applied Materials",tvSymbol: "NASDAQ:AMAT"  },
  { symbol: "ARM",   nameKr: "ARM홀딩스",           name: "Arm Holdings",     tvSymbol: "NASDAQ:ARM"   },
  { symbol: "TSM",   nameKr: "TSMC",               name: "TSMC",             tvSymbol: "NYSE:TSM"     },
  { symbol: "SMCI",  nameKr: "슈퍼마이크로",       name: "Super Micro",      tvSymbol: "NASDAQ:SMCI"  },
  // AI·클라우드·소프트웨어
  { symbol: "PLTR",  nameKr: "팔란티어",           name: "Palantir",         tvSymbol: "NYSE:PLTR"    },
  { symbol: "ORCL",  nameKr: "오라클",             name: "Oracle",           tvSymbol: "NYSE:ORCL"    },
  { symbol: "CRM",   nameKr: "세일즈포스",         name: "Salesforce",       tvSymbol: "NYSE:CRM"     },
  { symbol: "ADBE",  nameKr: "어도비",             name: "Adobe",            tvSymbol: "NASDAQ:ADBE"  },
  { symbol: "NOW",   nameKr: "서비스나우",         name: "ServiceNow",       tvSymbol: "NYSE:NOW"     },
  { symbol: "SNOW",  nameKr: "스노우플레이크",     name: "Snowflake",        tvSymbol: "NYSE:SNOW"    },
  { symbol: "NET",   nameKr: "클라우드플레어",     name: "Cloudflare",       tvSymbol: "NYSE:NET"     },
  { symbol: "CRWD",  nameKr: "크라우드스트라이크", name: "CrowdStrike",      tvSymbol: "NASDAQ:CRWD"  },
  { symbol: "DDOG",  nameKr: "데이터독",           name: "Datadog",          tvSymbol: "NASDAQ:DDOG"  },
  { symbol: "IBM",   nameKr: "IBM",                name: "IBM",              tvSymbol: "NYSE:IBM"     },
  // 금융
  { symbol: "JPM",   nameKr: "JP모건",             name: "JPMorgan Chase",   tvSymbol: "NYSE:JPM"     },
  { symbol: "BAC",   nameKr: "뱅크오브아메리카",   name: "Bank of America",  tvSymbol: "NYSE:BAC"     },
  { symbol: "GS",    nameKr: "골드만삭스",         name: "Goldman Sachs",    tvSymbol: "NYSE:GS"      },
  { symbol: "MS",    nameKr: "모건스탠리",         name: "Morgan Stanley",   tvSymbol: "NYSE:MS"      },
  { symbol: "V",     nameKr: "비자",               name: "Visa",             tvSymbol: "NYSE:V"       },
  { symbol: "MA",    nameKr: "마스터카드",         name: "Mastercard",       tvSymbol: "NYSE:MA"      },
  { symbol: "COIN",  nameKr: "코인베이스",         name: "Coinbase",         tvSymbol: "NASDAQ:COIN"  },
  { symbol: "PYPL",  nameKr: "페이팔",             name: "PayPal",           tvSymbol: "NASDAQ:PYPL"  },
  // 헬스케어
  { symbol: "LLY",   nameKr: "일라이릴리",         name: "Eli Lilly",        tvSymbol: "NYSE:LLY"     },
  { symbol: "UNH",   nameKr: "유나이티드헬스",     name: "UnitedHealth",     tvSymbol: "NYSE:UNH"     },
  { symbol: "JNJ",   nameKr: "존슨앤존슨",         name: "Johnson & Johnson",tvSymbol: "NYSE:JNJ"     },
  { symbol: "PFE",   nameKr: "화이자",             name: "Pfizer",           tvSymbol: "NYSE:PFE"     },
  { symbol: "MRNA",  nameKr: "모더나",             name: "Moderna",          tvSymbol: "NASDAQ:MRNA"  },
  // 소비·미디어·커머스
  { symbol: "NFLX",  nameKr: "넷플릭스",           name: "Netflix",          tvSymbol: "NASDAQ:NFLX"  },
  { symbol: "DIS",   nameKr: "디즈니",             name: "Disney",           tvSymbol: "NYSE:DIS"     },
  { symbol: "SPOT",  nameKr: "스포티파이",         name: "Spotify",          tvSymbol: "NYSE:SPOT"    },
  { symbol: "UBER",  nameKr: "우버",               name: "Uber",             tvSymbol: "NYSE:UBER"    },
  { symbol: "ABNB",  nameKr: "에어비앤비",         name: "Airbnb",           tvSymbol: "NASDAQ:ABNB"  },
  // 에너지·산업
  { symbol: "XOM",   nameKr: "엑슨모빌",           name: "ExxonMobil",       tvSymbol: "NYSE:XOM"     },
  { symbol: "CVX",   nameKr: "쉐브론",             name: "Chevron",          tvSymbol: "NYSE:CVX"     },
  // 해외 상장
  { symbol: "ASML",  nameKr: "ASML",               name: "ASML",             tvSymbol: "NASDAQ:ASML"  },
  { symbol: "BABA",  nameKr: "알리바바",           name: "Alibaba",          tvSymbol: "NYSE:BABA"    },
  { symbol: "NIO",   nameKr: "니오",               name: "NIO",              tvSymbol: "NYSE:NIO"     },
  { symbol: "RKLB",  nameKr: "로켓랩",             name: "Rocket Lab",       tvSymbol: "NASDAQ:RKLB"  },
];

const KOREAN_STOCKS = [
  // IT·반도체
  { symbol: "005930.KS", name: "삼성전자",        tvSymbol: "KRX:005930" },
  { symbol: "000660.KS", name: "SK하이닉스",       tvSymbol: "KRX:000660" },
  { symbol: "066570.KS", name: "LG전자",           tvSymbol: "KRX:066570" },
  // 배터리·소재
  { symbol: "373220.KS", name: "LG에너지솔루션",   tvSymbol: "KRX:373220" },
  { symbol: "006400.KS", name: "삼성SDI",          tvSymbol: "KRX:006400" },
  { symbol: "051910.KS", name: "LG화학",           tvSymbol: "KRX:051910" },
  { symbol: "003670.KS", name: "포스코퓨처엠",     tvSymbol: "KRX:003670" },
  // 자동차
  { symbol: "005380.KS", name: "현대차",           tvSymbol: "KRX:005380" },
  { symbol: "000270.KS", name: "기아",             tvSymbol: "KRX:000270" },
  { symbol: "012330.KS", name: "현대모비스",       tvSymbol: "KRX:012330" },
  // 인터넷·플랫폼
  { symbol: "035420.KS", name: "NAVER",            tvSymbol: "KRX:035420" },
  { symbol: "035720.KS", name: "카카오",           tvSymbol: "KRX:035720" },
  { symbol: "323410.KS", name: "카카오뱅크",       tvSymbol: "KRX:323410" },
  // 바이오·제약
  { symbol: "207940.KS", name: "삼성바이오로직스", tvSymbol: "KRX:207940" },
  { symbol: "068270.KS", name: "셀트리온",         tvSymbol: "KRX:068270" },
  // 금융
  { symbol: "105560.KS", name: "KB금융",           tvSymbol: "KRX:105560" },
  { symbol: "055550.KS", name: "신한지주",         tvSymbol: "KRX:055550" },
  { symbol: "086790.KS", name: "하나금융지주",     tvSymbol: "KRX:086790" },
  { symbol: "316140.KS", name: "우리금융지주",     tvSymbol: "KRX:316140" },
  { symbol: "000810.KS", name: "삼성화재",         tvSymbol: "KRX:000810" },
  { symbol: "032830.KS", name: "삼성생명",         tvSymbol: "KRX:032830" },
  // 통신
  { symbol: "017670.KS", name: "SK텔레콤",         tvSymbol: "KRX:017670" },
  { symbol: "030200.KS", name: "KT",               tvSymbol: "KRX:030200" },
  // 산업·에너지
  { symbol: "005490.KS", name: "포스코홀딩스",     tvSymbol: "KRX:005490" },
  { symbol: "096770.KS", name: "SK이노베이션",     tvSymbol: "KRX:096770" },
  { symbol: "028260.KS", name: "삼성물산",         tvSymbol: "KRX:028260" },
  { symbol: "010950.KS", name: "S-Oil",            tvSymbol: "KRX:010950" },
  { symbol: "034020.KS", name: "두산에너빌리티",   tvSymbol: "KRX:034020" },
  { symbol: "003490.KS", name: "대한항공",         tvSymbol: "KRX:003490" },
  { symbol: "011200.KS", name: "HMM",              tvSymbol: "KRX:011200" },
  // 엔터·게임
  { symbol: "352820.KS", name: "HYBE",             tvSymbol: "KRX:352820" },
  { symbol: "259960.KS", name: "크래프톤",         tvSymbol: "KRX:259960" },
  { symbol: "036570.KS", name: "NC소프트",         tvSymbol: "KRX:036570" },
  { symbol: "251270.KS", name: "넷마블",           tvSymbol: "KRX:251270" },
  // 유통
  { symbol: "139480.KS", name: "이마트",           tvSymbol: "KRX:139480" },
];

async function fetchYahooStock(
  symbol: string,
  name: string,
  tvSymbol: string,
  formatPrice: (n: number) => string,
  nameKr?: string,
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
      nameKr: nameKr ?? null,
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
    US_STOCKS.map(({ symbol, name, tvSymbol, nameKr }) =>
      fetchYahooStock(symbol, name, tvSymbol, (n) => `$${n.toFixed(2)}`, nameKr),
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
