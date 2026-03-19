"use client";
import React from "react";
import type { Tx } from "./LiveFeedTable";
import { CheckCircle2, Copy, ExternalLink, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  tx: Tx | null;
  onClose: () => void;
}

export default function TxModal({ tx, onClose }: Props) {
  if (!tx) return null;

  const explorerUrl = `https://inevm.explorer.injective.network/tx/${tx.txHash}`;
  const blockNumber = Math.floor(Math.random() * 9000000) + 1000000;
  const claimCode   = `AFFI-${tx.id}-${tx.txHash.slice(2, 8).toUpperCase()}`;

  const handleCopy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[400px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button float */}
          <button 
            onClick={onClose} 
            className="absolute -top-12 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            ✕
          </button>

          {/* Receipt Top Edge (Perforated) */}
          <div className="w-full h-3 bg-card" style={{ maskImage: "radial-gradient(circle at 6px 0, transparent 4px, black 5px)", maskSize: "12px 12px", maskPosition: "bottom" }} />

          {/* Receipt Body */}
          <div className="bg-card px-8 py-6 shadow-2xl flex flex-col items-center">
            
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]">
              <QrCode className="w-8 h-8 text-primary/80" />
            </div>

            <h2 className="text-xl font-bold font-['Geist_Sans'] text-foreground tracking-tight mb-1">Transaction Receipt</h2>
            <p className="text-xs text-muted-foreground font-mono mb-6">{new Date().toLocaleString()}</p>

            <div className="w-full border-t-2 border-dashed border-white/10 my-4" />

            <div className="flex flex-col items-center w-full gap-1 mb-6">
              <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Amount Sent</span>
              <span className="text-4xl font-black font-mono tracking-tighter text-foreground">${tx.amount.toLocaleString()}</span>
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded mt-1 font-mono">0.00 INJ GAS</span>
            </div>

            <div className="w-full flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-emerald-400 text-sm">SETTLED IN &lt;1s</span>
              </div>
              <span className="text-xs font-mono text-emerald-500/70">Block #{blockNumber}</span>
            </div>

            {/* Line Items */}
            <div className="w-full flex flex-col gap-3 font-mono text-[11px]">
               <div className="flex justify-between">
                 <span className="text-muted-foreground">SENDER</span>
                 <span className="text-foreground">{tx.sender}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">RECIPIENT</span>
                 <span className="text-foreground">{tx.recipient}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">LOCAL FIAT</span>
                 <span className="text-foreground">{tx.fiatValue.toLocaleString()} {tx.fiatCur}</span>
               </div>
               <div className="flex justify-between items-center group cursor-pointer" onClick={() => handleCopy(claimCode)}>
                 <span className="text-muted-foreground">CLAIM CODE</span>
                 <span className="text-primary font-bold flex items-center gap-1 group-hover:underline">
                   {claimCode} <Copy className="w-3 h-3" />
                 </span>
               </div>
               <div className="flex justify-between flex-col gap-1 mt-2">
                 <span className="text-muted-foreground">NETWORK HASH</span>
                 <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-white/5 cursor-pointer group" onClick={() => handleCopy(tx.txHash)}>
                   <span className="text-foreground/80 truncate pr-4">{tx.txHash}</span>
                   <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                 </div>
               </div>
            </div>

            <div className="w-full border-t-2 border-dashed border-white/10 my-6" />

            <div className="text-center w-full">
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-foreground font-semibold rounded-xl text-sm transition-colors group">
                View on Explorer <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
            </div>

          </div>
          
          {/* Receipt Bottom Edge (Perforated) */}
          <div className="w-full h-3 bg-card" style={{ maskImage: "radial-gradient(circle at 6px 12px, transparent 4px, black 5px)", maskSize: "12px 12px", maskPosition: "top" }} />

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
