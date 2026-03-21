"use client";
import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { useSessionKey } from "@/hooks/useSessionKey";
import { usePriceFeed } from "@/hooks/usePriceFeed";
import { useUserOp } from "@/hooks/useUserOp";
import AnimatedGenerateButton from "@/components/ui/animated-generate-button-shadcn-tailwind";

type TradeFeedItem = {
    side: "BUY" | "SELL";
    qty: number;
    price: number;
    ts: number;
    status: "confirmed" | "pending";
};

const PAIRS = ["INJ/USDT", "ETH/USDT", "BTC/USDT"];

export default function Terminal() {
    const { session, remainingText } = useSessionKey();
    const [pair, setPair] = useState("INJ/USDT");
    const [buyQty, setBuyQty] = useState("10");
    const [sellQty, setSellQty] = useState("5");
    const [feed, setFeed] = useState<TradeFeedItem[]>([]);
    const [tradesToday, setTradesToday] = useState(0);

    const { prices, midPrice, change24h } = usePriceFeed(pair);
    const { pending, submitTrade } = useUserOp();

    const sparkline = useMemo(() => {
        if (!prices.length) return "";
        const max = Math.max(...prices);
        const min = Math.min(...prices);
        return prices
            .map((p, i) => {
                const x = (i / Math.max(prices.length - 1, 1)) * 100;
                const y = 30 - ((p - min) / Math.max(max - min, 1)) * 30;
                return `${x},${y}`;
            })
            .join(" ");
    }, [prices]);

    async function runTrade(side: 0 | 1, qtyText: string) {
        const eth = (window as any).ethereum;
        if (!eth || !session) {
            alert("Complete setup first");
            return;
        }

        const provider = new ethers.BrowserProvider(eth);
        const qty = Number(qtyText || "0");
        const result = await submitTrade({
            eoaProvider: provider,
            pair,
            qty,
            side,
            sessionPrivateKey: session.privateKey
        });

        const item: TradeFeedItem = {
            side: side === 0 ? "BUY" : "SELL",
            qty,
            price: midPrice,
            ts: Date.now(),
            status: result.txHash ? "confirmed" : "pending"
        };

        setTradesToday((x) => x + 1);
        setFeed((prev) => [item, ...prev].slice(0, 8));

        const history = JSON.parse(sessionStorage.getItem("phantom_trade_history") || "[]");
        history.unshift({ ...item, pair, txHash: result.txHash, gas: 0 });
        sessionStorage.setItem("phantom_trade_history", JSON.stringify(history.slice(0, 100)));
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-20">
            {/* Top Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-accent animate-pulse shadow-[0_0_10px_var(--accent-blue)]" />
                        <span className="font-bold tracking-tight text-lg">Phantom <span className="text-accent">DEX</span></span>
                    </div>
                    <div className="h-4 w-[1px] bg-muted/30" />
                    <select
                        value={pair}
                        onChange={(e) => setPair(e.target.value)}
                        className="bg-transparent font-bold text-accent cursor-pointer focus:outline-none"
                    >
                        {PAIRS.map((p) => (
                            <option key={p} value={p} className="bg-background text-foreground">
                                {p}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-6 overflow-x-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price</span>
                        <span className="font-mono text-accent text-lg">${midPrice.toFixed(4)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">24h Change</span>
                        <span className={`font-mono text-lg ${change24h >= 0 ? "text-accent" : "text-danger"}`}>
                            {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Gas (Sponsored)</span>
                        <span className="font-mono text-accent text-lg">$0.00</span>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2 rounded-full bg-amber-400/10 px-4 py-1.5 border border-amber-400/20">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-amber-200 uppercase tracking-tighter">Session Active • {remainingText}</span>
                </div>
            </div>

            {/* Main Trading Area */}
            <div className="grid gap-6 lg:grid-cols-4 lg:grid-rows-[auto_1fr]">
                
                {/* Chart Area */}
                <div className="lg:col-span-3 glass-card p-6 flex flex-col min-h-[400px]">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Market Activity</h3>
                        <div className="flex gap-2">
                            {["1M", "5M", "15M", "1H", "1D"].map((t) => (
                                <button key={t} className={`px-2 py-1 text-[10px] font-bold rounded ${t === "15M" ? "bg-accent/20 text-accent" : "text-muted-foreground hover:bg-white/5"}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 relative bg-black/20 rounded-2xl border border-white/5 p-4 overflow-hidden">
                        <svg viewBox="0 0 100 32" className="w-full h-full preserve-3d">
                            <defs>
                                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {sparkline && (
                                <>
                                    <polyline 
                                        fill="none" 
                                        stroke="var(--accent-blue)" 
                                        strokeWidth="0.5" 
                                        points={sparkline} 
                                        className="drop-shadow-[0_0_8px_var(--accent-blue)]"
                                    />
                                    <path
                                        d={`M 0 32 L ${sparkline} L 100 32 Z`}
                                        fill="url(#chartFill)"
                                    />
                                </>
                            )}
                        </svg>
                    </div>
                </div>

                {/* Order Controls */}
                <div className="space-y-6">
                    <div className="glass-card p-6 flex flex-col gap-6">
                        <div className="flex rounded-xl bg-black/40 p-1">
                            <button className="flex-1 py-1 text-[10px] font-bold bg-accent rounded-lg text-white uppercase tracking-tighter">Limit</button>
                            <button className="flex-1 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Market</button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                    <span>Amount</span>
                                    <span>Available</span>
                                </div>
                                <div className="relative">
                                    <input
                                        value={buyQty}
                                        onChange={(e) => setBuyQty(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-lg focus:border-accent outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">INJ</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <AnimatedGenerateButton
                                className="w-full h-12"
                                labelIdle="FAST BUY"
                                labelActive="EXECUTING..."
                                generating={pending}
                                highlightHueDeg={215}
                                showIcon={false}
                                disabled={pending}
                                onClick={() => runTrade(0, buyQty)}
                            />
                            <AnimatedGenerateButton
                                className="w-full h-12"
                                labelIdle="FAST SELL"
                                labelActive="EXECUTING..."
                                generating={pending}
                                highlightHueDeg={350}
                                showIcon={false}
                                disabled={pending}
                                onClick={() => runTrade(1, sellQty)}
                            />
                        </div>

                        <div className="flex flex-col gap-2 p-3 bg-accent/5 rounded-xl border border-accent/10">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                <span className="text-muted-foreground">Total</span>
                                <span className="text-foreground font-mono">${(Number(buyQty || 0) * midPrice).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                <span className="text-muted-foreground">Fee</span>
                                <span className="text-accent">SPONSORED</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trade Feed */}
                <div className="lg:col-span-4 glass-card p-6 overflow-hidden">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recent Activity</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-tighter">
                            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                            Live Network
                        </div>
                    </div>
                    
                    <div className="grid gap-2">
                        {feed.map((row, idx) => (
                            <div
                                key={`${row.ts}-${idx}`}
                                className="grid grid-cols-6 items-center gap-4 rounded-xl bg-black/20 p-4 text-xs border border-white/5 hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${row.side === "BUY" ? "bg-accent" : "bg-danger"}`} />
                                    <span className={`font-bold uppercase tracking-tighter ${row.side === "BUY" ? "text-accent" : "text-danger"}`}>{row.side}</span>
                                </div>
                                <div className="flex">
                                    <span className="rounded-full bg-accent/10 border border-accent/20 px-3 py-0.5 text-[10px] font-bold text-accent uppercase">Gasless</span>
                                </div>
                                <div className="font-mono text-foreground font-bold">{row.qty.toFixed(4)} INJ</div>
                                <div className="font-mono text-muted-foreground">@ {row.price.toFixed(4)}</div>
                                <div className="text-muted-foreground text-opacity-30 font-medium">{new Date(row.ts).toLocaleTimeString()}</div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold tracking-widest text-accent uppercase">Success</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
