"use client";

import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { useSessionKey } from "../hooks/useSessionKey";
import { usePriceFeed } from "../hooks/usePriceFeed";
import { useUserOp } from "../hooks/useUserOp";
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
        <div className="space-y-4 animate-rise">
            <section className="panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-lg font-bold">
                        <span className="h-2.5 w-2.5 animate-pulseDot rounded-full bg-accent" />
                        Phantom DEX · inEVM
                    </div>
                    <div className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-sm text-amber-200">
                        SESSION KEY · {remainingText} remaining
                    </div>
                </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Live price" value={midPrice.toFixed(4)} valueClass="text-accent" />
                <StatCard label="24h change" value={`${change24h.toFixed(4)}%`} valueClass={change24h >= 0 ? "text-accent" : "text-danger"} />
                <StatCard label="Gas paid" value="$0.00" valueClass="text-accent" />
                <StatCard label="Trades today" value={String(tradesToday)} valueClass="text-[var(--text-primary)]" />
            </section>

            <section className="panel p-4">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Price chart</h3>
                    <select
                        value={pair}
                        onChange={(e) => setPair(e.target.value)}
                        className="rounded-lg border border-[var(--card-border)] bg-[var(--bg-card)] px-2 py-1"
                    >
                        {PAIRS.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                </div>
                <svg viewBox="0 0 100 32" className="h-24 w-full rounded-xl bg-[var(--bg-card)] p-2">
                    <polyline fill="none" stroke="#24d98c" strokeWidth="1.5" points={sparkline} />
                </svg>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <TradePanel
                    side="BUY"
                    amount={buyQty}
                    onAmount={setBuyQty}
                    estimate={(Number(buyQty || 0) * midPrice).toFixed(2)}
                    buttonLabel="1-CLICK BUY"
                    colorClass="text-accent"
                    onSubmit={() => runTrade(0, buyQty)}
                    pending={pending}
                />
                <TradePanel
                    side="SELL"
                    amount={sellQty}
                    onAmount={setSellQty}
                    estimate={(Number(sellQty || 0) * midPrice).toFixed(2)}
                    buttonLabel="1-CLICK SELL"
                    colorClass="text-danger"
                    onSubmit={() => runTrade(1, sellQty)}
                    pending={pending}
                />
            </section>

            <section className="panel p-4">
                <h3 className="mb-3 font-semibold">Trade feed</h3>
                <div className="space-y-2">
                    {feed.map((row, idx) => (
                        <div
                            key={`${row.ts}-${idx}`}
                            className="grid grid-cols-6 items-center gap-2 rounded-lg bg-[var(--bg-card)] px-3 py-2 text-sm border border-[var(--card-border)]"
                        >
                            <span className={row.side === "BUY" ? "text-accent" : "text-danger"}>{row.side}</span>
                            <span className="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent">gasless</span>
                            <span>{row.qty.toFixed(4)}</span>
                            <span className="font-mono">{row.price.toFixed(4)}</span>
                            <span>{new Date(row.ts).toLocaleTimeString()}</span>
                            <span className="text-accent">● confirmed</span>
                        </div>
                    ))}
                    {!feed.length && <p className="text-sm text-[var(--text-dimmed)]">No trades yet.</p>}
                </div>
            </section>
        </div>
    );
}

function StatCard(props: { label: string; value: string; valueClass?: string }) {
    return (
        <div className="panel p-4">
            <p className="text-xs uppercase tracking-widest text-[var(--text-dimmed)]">{props.label}</p>
            <p className={`mt-2 font-mono text-2xl ${props.valueClass || ""}`}>{props.value}</p>
        </div>
    );
}

function TradePanel(props: {
    side: "BUY" | "SELL";
    amount: string;
    onAmount: (next: string) => void;
    estimate: string;
    buttonLabel: string;
    colorClass: string;
    onSubmit: () => void;
    pending: boolean;
}) {
    return (
        <div className="panel p-4">
            <h3 className={`mb-3 text-lg font-semibold ${props.colorClass}`}>{props.side}</h3>
            <label className="text-sm text-[var(--text-muted)]">Amount ({props.side === "BUY" ? "INJ" : "INJ"})</label>
            <input
                value={props.amount}
                onChange={(e) => props.onAmount(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg-card)] px-3 py-2 font-mono"
            />
            <p className="mt-2 text-sm text-[var(--text-muted)]">
                USDT estimate: <span className="font-mono">{Number(props.estimate).toFixed(2)}</span>
            </p>
            <div className="mt-4 flex items-center gap-3">
                <AnimatedGenerateButton
                    className="flex-1"
                    labelIdle={props.buttonLabel}
                    labelActive={props.side === "BUY" ? "BUYING..." : "SELLING..."}
                    generating={props.pending}
                    highlightHueDeg={props.side === "BUY" ? 215 : 350}
                    disabled={props.pending}
                    onClick={() => props.onSubmit()}
                />
                <span className="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent shrink-0">
                    no popup
                </span>
            </div>
        </div>
    );
}
