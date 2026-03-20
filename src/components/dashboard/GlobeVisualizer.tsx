"use client";
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Globe from "react-globe.gl";
import { useTheme } from "../layout/ThemeContext";

export interface Arc {
  id: string;
  from: { lat: number; lng: number; city: string };
  to: { lat: number; lng: number; city: string };
  amount: string;
  status: "COMPLETED" | "PENDING";
  color: string;
}

const CITIES = [
  // ── African Hubs (0-10) ──
  { lat: 6.5244, lng: 3.3792, city: "Lagos", isAfrica: true },
  { lat: -1.2921, lng: 36.8219, city: "Nairobi", isAfrica: true },
  { lat: 5.6037, lng: -0.1870, city: "Accra", isAfrica: true },
  { lat: -26.2041, lng: 28.0473, city: "Johannesburg", isAfrica: true },
  { lat: 30.0444, lng: 31.2357, city: "Cairo", isAfrica: true },
  { lat: -6.7924, lng: 39.2083, city: "Dar es Salaam", isAfrica: true },
  { lat: 9.0250, lng: 38.7469, city: "Addis Ababa", isAfrica: true },
  { lat: -1.9403, lng: 29.8739, city: "Kigali", isAfrica: true },
  { lat: 14.7167, lng: -17.4677, city: "Dakar", isAfrica: true },
  { lat: 33.5731, lng: -7.5898, city: "Casablanca", isAfrica: true },
  { lat: 0.3476, lng: 32.5825, city: "Kampala", isAfrica: true },
  // ── Europe (11-14) ──
  { lat: 51.5074, lng: -0.1278, city: "London", isAfrica: false },
  { lat: 48.8566, lng: 2.3522, city: "Paris", isAfrica: false },
  { lat: 41.0082, lng: 28.9784, city: "Istanbul", isAfrica: false },
  { lat: 52.5200, lng: 13.4050, city: "Berlin", isAfrica: false },
  // ── Americas (15-18) ──
  { lat: 40.7128, lng: -74.0060, city: "New York", isAfrica: false },
  { lat: -23.5505, lng: -46.6333, city: "São Paulo", isAfrica: false },
  { lat: 43.6532, lng: -79.3832, city: "Toronto", isAfrica: false },
  { lat: 34.0522, lng: -118.2437, city: "Los Angeles", isAfrica: false },
  // ── South & West Asia (19-22) ──
  { lat: 19.0760, lng: 72.8777, city: "Mumbai", isAfrica: false },
  { lat: 28.6139, lng: 77.2090, city: "Delhi", isAfrica: false },
  { lat: 25.2048, lng: 55.2708, city: "Dubai", isAfrica: false },
  { lat: 24.7136, lng: 46.6753, city: "Riyadh", isAfrica: false },
  // ── Southeast Asia (23-26) ──
  { lat: 14.5995, lng: 120.9842, city: "Manila", isAfrica: false },
  { lat: 1.3521, lng: 103.8198, city: "Singapore", isAfrica: false },
  { lat: 13.7563, lng: 100.5018, city: "Bangkok", isAfrica: false },
  { lat: -6.2088, lng: 106.8456, city: "Jakarta", isAfrica: false },
  // ── East Asia (27-30) ──
  { lat: 35.6762, lng: 139.6503, city: "Tokyo", isAfrica: false },
  { lat: 37.5665, lng: 126.9780, city: "Seoul", isAfrica: false },
  { lat: 31.2304, lng: 121.4737, city: "Shanghai", isAfrica: false },
  { lat: 22.3193, lng: 114.1694, city: "Hong Kong", isAfrica: false },
  // ── Oceania (31) ──
  { lat: -33.8688, lng: 151.2093, city: "Sydney", isAfrica: false },
];

const AFRICA_COUNT = 11;  // indices 0-10
const GLOBAL_COUNT = 21;  // indices 11-31

const INITIAL_ARCS: Arc[] = [
  // ── Africa → Europe ──
  { id: "a1",  from: CITIES[0],  to: CITIES[11], amount: "$5,000", status: "COMPLETED", color: "#0EA5E9" },
  { id: "a2",  from: CITIES[2],  to: CITIES[12], amount: "$1,400", status: "COMPLETED", color: "#0EA5E9" },
  { id: "a3",  from: CITIES[9],  to: CITIES[12], amount: "$2,100", status: "PENDING",   color: "#F59E0B" },
  { id: "a4",  from: CITIES[4],  to: CITIES[13], amount: "$3,800", status: "COMPLETED", color: "#10B981" },
  // ── Africa → Americas ──
  { id: "a5",  from: CITIES[0],  to: CITIES[15], amount: "$2,500", status: "PENDING",   color: "#10B981" },
  { id: "a6",  from: CITIES[3],  to: CITIES[16], amount: "$4,300", status: "COMPLETED", color: "#10B981" },
  { id: "a7",  from: CITIES[1],  to: CITIES[17], amount: "$1,900", status: "COMPLETED", color: "#0EA5E9" },
  { id: "a8",  from: CITIES[8],  to: CITIES[18], amount: "$800",   status: "PENDING",   color: "#F59E0B" },
  // ── Africa → India ──
  { id: "a9",  from: CITIES[0],  to: CITIES[19], amount: "$4,200", status: "COMPLETED", color: "#8B5CF6" },
  { id: "a10", from: CITIES[1],  to: CITIES[20], amount: "$2,800", status: "COMPLETED", color: "#8B5CF6" },
  { id: "a11", from: CITIES[4],  to: CITIES[19], amount: "$3,600", status: "PENDING",   color: "#F59E0B" },
  { id: "a12", from: CITIES[5],  to: CITIES[20], amount: "$1,800", status: "COMPLETED", color: "#8B5CF6" },
  // ── Africa → Middle East ──
  { id: "a13", from: CITIES[3],  to: CITIES[21], amount: "$6,100", status: "COMPLETED", color: "#10B981" },
  { id: "a14", from: CITIES[1],  to: CITIES[21], amount: "$5,500", status: "COMPLETED", color: "#10B981" },
  { id: "a15", from: CITIES[6],  to: CITIES[22], amount: "$2,200", status: "COMPLETED", color: "#0EA5E9" },
  // ── Africa → Southeast Asia ──
  { id: "a16", from: CITIES[1],  to: CITIES[23], amount: "$1,200", status: "COMPLETED", color: "#10B981" },
  { id: "a17", from: CITIES[0],  to: CITIES[24], amount: "$3,000", status: "COMPLETED", color: "#0EA5E9" },
  { id: "a18", from: CITIES[5],  to: CITIES[25], amount: "$900",   status: "PENDING",   color: "#F59E0B" },
  { id: "a19", from: CITIES[3],  to: CITIES[26], amount: "$2,700", status: "COMPLETED", color: "#10B981" },
  // ── Africa → East Asia ──
  { id: "a20", from: CITIES[0],  to: CITIES[27], amount: "$7,500", status: "COMPLETED", color: "#8B5CF6" },
  { id: "a21", from: CITIES[4],  to: CITIES[28], amount: "$4,800", status: "COMPLETED", color: "#0EA5E9" },
  { id: "a22", from: CITIES[1],  to: CITIES[29], amount: "$3,200", status: "PENDING",   color: "#F59E0B" },
  { id: "a23", from: CITIES[3],  to: CITIES[30], amount: "$5,100", status: "COMPLETED", color: "#10B981" },
  // ── Africa → Oceania ──
  { id: "a24", from: CITIES[3],  to: CITIES[31], amount: "$2,400", status: "COMPLETED", color: "#10B981" },
  { id: "a25", from: CITIES[1],  to: CITIES[31], amount: "$1,600", status: "PENDING",   color: "#F59E0B" },
  // ── Africa ↔ Africa internal ──
  { id: "a26", from: CITIES[0],  to: CITIES[4],  amount: "$2,000", status: "COMPLETED", color: "#10B981" },
  { id: "a27", from: CITIES[6],  to: CITIES[1],  amount: "$950",   status: "COMPLETED", color: "#10B981" },
  { id: "a28", from: CITIES[8],  to: CITIES[9],  amount: "$1,100", status: "PENDING",   color: "#F59E0B" },
  { id: "a29", from: CITIES[10], to: CITIES[3],  amount: "$3,500", status: "COMPLETED", color: "#0EA5E9" },
  { id: "a30", from: CITIES[7],  to: CITIES[5],  amount: "$700",   status: "COMPLETED", color: "#10B981" },
  // ── Cross-regional (Global ↔ Global via Injective) ──
  { id: "a31", from: CITIES[27], to: CITIES[15], amount: "$12,000", status: "COMPLETED", color: "#8B5CF6" },
  { id: "a32", from: CITIES[28], to: CITIES[24], amount: "$8,400",  status: "COMPLETED", color: "#10B981" },
  { id: "a33", from: CITIES[19], to: CITIES[21], amount: "$6,200",  status: "COMPLETED", color: "#8B5CF6" },
  { id: "a34", from: CITIES[31], to: CITIES[27], amount: "$9,100",  status: "COMPLETED", color: "#0EA5E9" },
  { id: "a35", from: CITIES[11], to: CITIES[19], amount: "$4,700",  status: "PENDING",   color: "#F59E0B" },
];

interface Props {
  flashTrigger?: number;
  onArcClick?: (arc: Arc) => void;
}

// ── Stable accessor functions (never recreated) ──
const arcStartLat = (d: any) => d.from.lat;
const arcStartLng = (d: any) => d.from.lng;
const arcEndLat   = (d: any) => d.to.lat;
const arcEndLng   = (d: any) => d.to.lng;
const arcColor    = (d: any) => [d.color, d.color];
const ringColor   = (d: any) => d.color;
const ringMaxR    = (d: any) => d.maxR;
const ringSpeed   = () => 0.8;
const ringPeriod  = () => 2500;
const labelLat    = (d: any) => d.lat;
const labelLng    = (d: any) => d.lng;
const labelText   = (d: any) => d.city;

export default function GlobeVisualizer({ flashTrigger = 0, onArcClick }: Props) {
  const { theme } = useTheme();
  const globeRef = useRef<any>(null);
  const [arcsData, setArcsData] = useState<Arc[]>(INITIAL_ARCS);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const prevFlash = useRef(0);

  // Throttled resize (fires at most once per 250ms)
  useEffect(() => {
    if (!containerRef.current) return;
    let timeout: ReturnType<typeof setTimeout>;
    const updateSize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (containerRef.current) {
          setDimensions({
            width: containerRef.current.clientWidth || 300,
            height: containerRef.current.clientHeight || 300,
          });
        }
      }, 250);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => { window.removeEventListener("resize", updateSize); clearTimeout(timeout); };
  }, []);

  // Globe init — set auto-rotate + POV once
  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom = false;      
    controls.enablePan = false;       
    globeRef.current.pointOfView({ lat: 5, lng: 25, altitude: 2.2 });

    // Perf: Limit pixel ratio on high-DPI screens to reduce GPU load
    const renderer = globeRef.current.renderer();
    if (renderer) renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }, []);

  // Flash: random Africa → random Global arc
  // FIX: slice(-48) instead of slice(-12) to prevent initial 35-arc drop "pop"
  useEffect(() => {
    if (flashTrigger > 0 && flashTrigger !== prevFlash.current) {
      prevFlash.current = flashTrigger;
      const colors = ["#10B981", "#0EA5E9", "#8B5CF6", "#F59E0B"];
      const newArc: Arc = {
        id: `arc-${Date.now()}`,
        from: CITIES[Math.floor(Math.random() * AFRICA_COUNT)],
        to: CITIES[AFRICA_COUNT + Math.floor(Math.random() * GLOBAL_COUNT)],
        amount: `$${Math.floor(Math.random() * 4000) + 100}`,
        status: "PENDING",
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      // Keep at least 48 arcs to ensure the initial 35 are preserved
      setArcsData(prev => [...prev, newArc].slice(-48));
    }
  }, [flashTrigger]);

  // Rings — reduced maxR and increased period for performance
  const ringsData = useMemo(() => {
    return CITIES.filter(c => c.isAfrica).map(c => ({
      lat: c.lat,
      lng: c.lng,
      maxR: 1.5,
    }));
  }, []);

  const handleArcClick = useCallback(
    (arc: object) => {
      onArcClick?.(arc as Arc);
    },
    [onArcClick]
  );
  const labelColor = useCallback(
    (d: any) => (d.isAfrica ? "#10B981" : theme === "light" ? "#2563EB" : "#0EA5E9"),
    [theme]
  );
  const atmosphereColor = theme === "light" ? "#60A5FA" : "#6366F1";

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        cursor: onArcClick ? "pointer" : "default",
      }}
    >
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}

          /* Visuals — removed bumpImageUrl & backgroundImageUrl for perf */
          globeImageUrl={theme === "light" ? "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg" : "//unpkg.com/three-globe/example/img/earth-night.jpg"}
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor={atmosphereColor}
          atmosphereAltitude={0.15}

          /* Arcs */
          arcsData={arcsData}
          arcStartLat={arcStartLat}
          arcStartLng={arcStartLng}
          arcEndLat={arcEndLat}
          arcEndLng={arcEndLng}
          arcColor={arcColor}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={3000}
          arcAltitudeAutoScale={0.35}
          arcStroke={1.2}
          onArcClick={onArcClick ? handleArcClick : undefined}

          /* City Rings */
          ringsData={ringsData}
          ringColor={ringColor}
          ringMaxRadius={ringMaxR}
          ringPropagationSpeed={ringSpeed}
          ringRepeatPeriod={ringPeriod}

          /* City Labels */
          labelsData={CITIES}
          labelLat={labelLat}
          labelLng={labelLng}
          labelText={labelText}
          labelSize={1.2}
          labelDotRadius={0.4}
          labelColor={labelColor}
          labelResolution={1}
          labelAltitude={0.01}
        />
      )}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "10px",
          color: "var(--text-muted)",
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          pointerEvents: "none"
        }}
      >
        Injective Global Settlement
      </div>
    </div>
  );
}
