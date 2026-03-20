"use client";
import { useState } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";

// Fix 2 — 3 datasets for the chart tabs
const CHART_DATA = {
  "7D": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data:   [18400, 24200, 19800, 31500, 27300, 38900, 42100],
  },
  "30D": {
    labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7", "Wk 8"],
    data:   [92000, 118000, 134000, 98000, 145000, 167000, 189000, 210000],
  },
  All: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    data:   [45000, 89000, 134000, 198000, 267000, 312000],
  },
};

type TabKey = keyof typeof CHART_DATA;

const PIE_DATA = [
  { name: "NGN", value: 60, color: "var(--accent-blue)" },
  { name: "KES", value: 25, color: "#10B981" },
  { name: "GHS", value: 10, color: "#F59E0B" },
  { name: "UGX", value: 5, color: "var(--accent-cyan)" },
];

const BAR_DATA = [
  { label: "AfriFi", fee: 1.0, color: "#10B981" },
  { label: "Standard DEX", fee: 4.0, color: "#F43F5E" },
  { label: "Mobile wallet flow", fee: 5.0, color: "#F59E0B" },
  { label: "Gas token blocked", fee: 2.0, color: "#94A3B8" },
];

type TooltipPayload = {
  value: number;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-light)",
      borderRadius: "8px",
      padding: "10px 14px",
      fontSize: "12px",
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>{label}</div>
      <div style={{ color: "var(--accent-blue)", fontWeight: 600 }}>
        ${payload[0].value.toLocaleString("en-US")}
      </div>
    </div>
  );
}

export default function ChartRow() {
  const [activeTab, setActiveTab] = useState<TabKey>("7D");
  const dataset = CHART_DATA[activeTab];

  const chartData = dataset.labels.map((label, i) => ({
    label,
    volume: dataset.data[i],
  }));

  return (
    <div
      className="grid gap-4 xl:grid-cols-[2fr_1fr_1fr]"
      style={{ marginTop: "16px" }}
    >
      {/* CHART 1: Volume Line Chart (with tabs) */}
      <div className="card anim-chart-1" style={{ padding: "22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px" }}>Trading Volume</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Total notional simulated through the terminal
            </div>
          </div>
          {/* Fix 2: Tab controls */}
          <div style={{ display: "flex", gap: "4px" }}>
            {(Object.keys(CHART_DATA) as TabKey[]).map((tab) => (
              <button
                key={tab}
                className={`tab-pill ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--accent-blue)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="var(--accent-blue)"
              strokeWidth={2.5}
              fill="url(#volumeGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "var(--accent-blue)", stroke: "var(--bg-deep)", strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* CHART 2: Execution Mix Pie (manual SVG) */}
      <div className="card anim-chart-2" style={{ padding: "22px" }}>
        <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>Execution Mix</div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>Representative stable-denominated flow</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <PieChart data={PIE_DATA} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {PIE_DATA.map((d) => (
            <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, display: "inline-block" }} />
                {d.name}
              </div>
              <span className="mono" style={{ fontSize: "13px", color: "var(--text-muted)" }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* CHART 3: Friction vs Traditional (bar) */}
      <div className="card anim-chart-3" style={{ padding: "22px" }}>
        <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>Friction Comparison</div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>Prompts or blockers before execution</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {BAR_DATA.map((d) => (
            <div key={d.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "12px", color: d.label === "AfriFi" ? d.color : "var(--text-muted)", fontWeight: d.label === "AfriFi" ? 700 : 400 }}>
                  {d.label}
                </span>
                <span className="mono" style={{ fontSize: "12px", color: d.color, fontWeight: 600 }}>
                  {d.fee.toFixed(0)} {d.fee === 1 ? "step" : "steps"}
                </span>
              </div>
              <div style={{ background: "var(--surface-strong)", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(d.fee / 5) * 100}%`,
                    height: "100%",
                    background: d.color,
                    borderRadius: "999px",
                    transition: "width 1s ease-out",
                    minWidth: "3px",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: "16px",
            padding: "10px",
            background: "var(--glow-green)",
            borderRadius: "8px",
            textAlign: "center",
            fontSize: "12px",
            color: "var(--accent-green)",
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            border: "1px solid var(--glow-green)",
          }}
        >
          Cut the first trade from four prompts to one click
        </div>
      </div>
    </div>
  );
}

// Manual SVG pie chart for the execution mix
function PieChart({ data }: { data: typeof PIE_DATA }) {
  const size = 110;
  const r = 42;
  const cx = size / 2;
  const cy = size / 2;
  let cumulative = 0;

  const f = (n: number) => n.toFixed(6);

  const slices = data.map((d) => {
    const startAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = d.value > 50 ? 1 : 0;
    return {
      path: `M ${f(cx)} ${f(cy)} L ${f(x1)} ${f(y1)} A ${f(r)} ${f(r)} 0 ${largeArc} 1 ${f(x2)} ${f(y2)} Z`,
      color: d.color,
      name: d.name,
    };
  });

  return (
    <svg width={size} height={size}>
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} opacity={0.85} stroke="var(--bg-card)" strokeWidth={2} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--bg-card)" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
        NGN 60%
      </text>
    </svg>
  );
}
