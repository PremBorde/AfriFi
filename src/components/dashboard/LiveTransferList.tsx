"use client";
import { motion, AnimatePresence } from "framer-motion";

interface Transfer {
  id:     string;
  from:   { city: string; flag: string; user: string; color: string };
  to:     { city: string; flag: string; user: string };
  amount: string;
  status: "COMPLETED" | "PENDING";
}

const TRANSFERS: Transfer[] = [
  { id:"t1", from:{ city:"Lagos",   flag:"🇳🇬", user:"OA", color:"bg-emerald-500" }, to:{ city:"London",   flag:"🇬🇧", user:"JD" }, amount:"$5,000", status:"COMPLETED" },
  { id:"t2", from:{ city:"Lagos",   flag:"🇳🇬", user:"EK", color:"bg-blue-500" },    to:{ city:"New York", flag:"🇺🇸", user:"MR" }, amount:"$2,500", status:"PENDING"   },
  { id:"t3", from:{ city:"Nairobi", flag:"🇰🇪", user:"MW", color:"bg-purple-500" },  to:{ city:"Manila",   flag:"🇵🇭", user:"AL" }, amount:"$1,200", status:"COMPLETED" },
  { id:"t4", from:{ city:"Nairobi", flag:"🇰🇪", user:"JD", color:"bg-amber-500" },   to:{ city:"Singapore",flag:"🇸🇬", user:"TY" }, amount:"$3,000", status:"COMPLETED" },
  { id:"t5", from:{ city:"Accra",   flag:"🇬🇭", user:"KM", color:"bg-rose-500" },    to:{ city:"London",   flag:"🇬🇧", user:"SB" }, amount:"$800",   status:"PENDING"   },
];

interface Props {
  latestTransfer?: Transfer | null;
}

export default function LiveTransferList({ latestTransfer }: Props) {
  const list = latestTransfer ? [latestTransfer, ...TRANSFERS.slice(0, 4)] : TRANSFERS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
        Active Orders
      </div>
      <div className="flex flex-col gap-2 relative">
        <AnimatePresence initial={false}>
          {list.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
              style={{
                padding: "12px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                background: "var(--surface-strong)",
                border: "1px solid var(--card-border)",
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)",
              }}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shrink-0 ${tx.from.color || "bg-primary"}`}>
                {tx.from.user}
              </div>

              {/* Transfer Details */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                  <span className="text-foreground">{tx.from.city}</span>
                  <span className="text-muted-foreground text-[10px]">→</span>
                  <span className="text-muted-foreground">{tx.to.city}</span>
                </div>
                <div className="flex justify-between items-end mt-1">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {tx.amount}
                  </span>
                  {tx.status === "COMPLETED"
                    ? <div className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-500/20">FILLED</div>
                    : <div className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-500/20 animate-pulse">PENDING</div>}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
