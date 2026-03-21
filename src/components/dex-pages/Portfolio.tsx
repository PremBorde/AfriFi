"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { SMART_ACCOUNT_FACTORY, factoryAbi, smartAccountAbi } from "@/lib/contracts";
import { useSessionKey } from "@/hooks/useSessionKey";
import { useRouter } from "next/navigation";

type HistoryRow = {
    pair: string;
    side: "BUY" | "SELL";
    qty: number;
    price: number;
    ts: number;
    status: "confirmed" | "pending";
    txHash?: string | null;
};

export default function Portfolio() {
    const router = useRouter();
    const { session, remainingText, clearSession } = useSessionKey();
    const [history, setHistory] = useState<HistoryRow[]>([]);
    const [sessionAddress, setSessionAddress] = useState("");

    useEffect(() => {
        const rows = JSON.parse(sessionStorage.getItem("phantom_trade_history") || "[]");
        setHistory(rows);
    }, []);

    const pnl = useMemo(() => history.reduce((a, x) => a + (x.side === "BUY" ? -x.qty * x.price * 0.01 : x.qty * x.price * 0.01), 0), [history]);

    async function revoke() {
        const eth = (window as any).ethereum;
        if (!eth || !session) return;

        try {
            const provider = new ethers.BrowserProvider(eth);
            const signer = await provider.getSigner();
            const owner = await signer.getAddress();

            const factory = new ethers.Contract(SMART_ACCOUNT_FACTORY, factoryAbi, signer);
            const account = await factory.accountOf(owner);
            if (account === ethers.ZeroAddress) {
                alert("No smart account found");
                return;
            }

            const smart = new ethers.Contract(account, [
                "function revokeSessionKey(address key) external"
            ], signer);
            
            const tx = await smart.revokeSessionKey(session.address);
            await tx.wait();
            clearSession();
            alert("Session revoked successfully");
        } catch (err: any) {
            console.error("Revoke failed:", err);
            alert(`Revoke failed: ${err.message}`);
        }
    }

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-20">
            {/* Main Header */}
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    Your <span className="text-accent">Portfolio</span>
                </h1>
                <p className="mt-2 text-muted-foreground">Manage your session, track performance, and view trade history.</p>
            </div>

            {/* Top Summaries */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="glass-card p-6 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Balance</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-bold font-mono tracking-tighter text-foreground">$10,482</span>
                        <span className="text-xs font-bold text-accent uppercase font-mono">.91</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-accent bg-accent/10 self-start px-2 py-0.5 rounded-full font-bold">
                        <span>↑</span>
                        <span>12.5%</span>
                    </div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Estimated P&L</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className={`text-4xl font-bold font-mono tracking-tighter ${pnl >= 0 ? "text-accent" : "text-danger"}`}>
                            {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                        </span>
                    </div>
                    <div className="mt-4 text-[10px] font-bold text-muted-foreground uppercase">From local session history</div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-between border-dashed">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Session</span>
                        <div className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent-blue)]" />
                    </div>
                    <div className="mt-2 space-y-1">
                        <div className="font-mono text-xs text-foreground truncate">{sessionAddress || session?.address || "ACTIVE"}</div>
                        <div className="text-xs font-bold text-accent uppercase">{remainingText} LEFT</div>
                    </div>
                    <button
                        onClick={revoke}
                        className="mt-6 w-full py-2 bg-danger/10 text-danger border border-danger/20 rounded-xl text-[10px] font-bold hover:bg-danger/20 transition-all uppercase tracking-widest"
                    >
                        Force Revoke
                    </button>
                </div>
            </div>

            {/* Trade History */}
            <div className="glass-card p-8">
                <div className="mb-8 flex items-center justify-between">
                    <h3 className="text-xl font-bold">Trade <span className="text-accent">Registry</span></h3>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{history.length} Transactions</div>
                </div>

                <div className="space-y-4">
                    {history.map((tx, idx) => (
                        <div
                            key={`${tx.ts}-${idx}`}
                            className="group relative flex items-center justify-between rounded-2xl bg-black/20 p-5 hover:bg-white/5 transition-all border border-white/5"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tx.side === "BUY" ? "bg-accent/20 text-accent" : "bg-danger/20 text-danger"}`}>
                                    <span className="text-2xl font-bold">{tx.side === "BUY" ? "↓" : "↑"}</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{tx.pair}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.side === "BUY" ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"}`}>
                                            {tx.side}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-50">
                                        {new Date(tx.ts).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="text-right space-y-1">
                                    <div className="font-mono font-bold">{tx.qty.toFixed(4)} INJ</div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-50">
                                        Amount
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="font-mono font-bold">${tx.price.toFixed(2)}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-50">
                                        Execution Price
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="text-accent font-bold text-[10px] uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-lg">
                                        FREE GAS
                                    </div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-0 group-hover:opacity-50 transition-opacity">
                                        SPONSORED BY INJ
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {history.length === 0 && (
                        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground bg-black/10 rounded-3xl border border-dashed border-white/10">
                            <div className="text-5xl mb-6 opacity-20">🗂</div>
                            <p className="text-sm font-bold uppercase tracking-widest">No trading history found</p>
                            <button 
                                onClick={() => router.push("/trade")}
                                className="mt-6 text-accent text-xs font-bold uppercase hover:underline"
                            >
                                Start Trading →
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="text-center opacity-30 text-[10px] font-bold uppercase tracking-[0.2em]">
                Securely managed by Injective Smart Vaults
            </div>
        </div>
    );
}
