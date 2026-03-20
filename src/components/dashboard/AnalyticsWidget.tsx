"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const data = [
  { name: "Mon", savings: 1200 },
  { name: "Tue", savings: 2400 },
  { name: "Wed", savings: 1800 },
  { name: "Thu", savings: 4500 },
  { name: "Fri", savings: 3200 },
  { name: "Sat", savings: 5100 },
  { name: "Sun", savings: 6800 },
];

export default function AnalyticsWidget() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="card h-full flex flex-col p-[20px] relative overflow-hidden group">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-foreground font-semibold font-['Geist_Sans'] text-lg">Execution Friction Removed</h3>
          <p className="text-muted-foreground text-[13px] mt-1">Compared with standard approval-heavy DEX flows</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          +$6,800
        </div>
      </div>

      <div className="flex-1 w-full min-h-[140px] relative z-10">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--bg-card)", 
                  backdropFilter: "blur(12px)",
                  borderColor: "var(--card-border)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontFamily: "'IBM Plex Mono', monospace"
                }} 
                itemStyle={{ color: "var(--accent-blue)", fontWeight: "bold" }}
              />
              <Area 
                type="monotone" 
                dataKey="savings" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSavings)" 
                animationDuration={2000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex justify-between items-center relative z-10">
        <div className="text-xs text-muted-foreground font-['Geist_Sans']">
          Based on avoided popups, approvals, and gas-token setup.
        </div>
        <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
          View Report →
        </button>
      </div>
    </div>
  );
}
