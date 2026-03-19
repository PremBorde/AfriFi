"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowRight, Zap, Shield, Globe2, TrendingUp, Clock, DollarSign, Send, CheckCircle2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

/* ──────────────────────────────────────────
   REUSABLE ANIMATION VARIANTS
   ────────────────────────────────────────── */
const fadeInUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const scaleUp: any = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const wordVariant: any = {
  hidden: { opacity: 0, y: "60%", rotateX: 12 },
  visible: { opacity: 1, y: "0%", rotateX: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const paraWordVariant: any = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

/* ──────────────────────────────────────────
   ANIMATED TEXT COMPONENTS
   ────────────────────────────────────────── */
function AnimText({ children, className, delay = 0 }: { children: string; className?: string; delay?: number }) {
  const words = children.split(" ");
  return (
    <motion.span
      className={`inline-flex flex-wrap gap-x-[0.3em] ${className ?? ""}`}
      style={{ perspective: "800px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: delay } } } as any}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={wordVariant} style={{ display: "inline-block", transformOrigin: "bottom center" }}>
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

function AnimParagraph({ children, className, delay = 0 }: { children: string; className?: string; delay?: number }) {
  const words = children.split(" ");
  return (
    <motion.p
      className={`inline-flex flex-wrap gap-x-[0.25em] gap-y-[0.1em] ${className ?? ""}`}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.025, delayChildren: delay } } } as any}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={paraWordVariant} style={{ display: "inline-block" }}>
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}

/* ──────────────────────────────────────────
   NAVBAR
   ────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-xl shadow-lg shadow-black/20" : ""}`}>
      <div className="w-full py-4 px-8 flex flex-row items-center justify-between max-w-[1400px] mx-auto">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground font-['Geist_Sans'] hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 bg-primary rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center">
            <span className="text-primary-foreground text-lg font-bold">A</span>
          </div>
          AfriFi
        </Link>
        <div className="hidden md:flex flex-row items-center gap-0.5 font-['Geist_Sans']">
          {["Features", "How It Works", "Corridors", "Docs"].map((item) => (
            <Button key={item} variant="ghost" className="text-foreground/80 text-[15px] font-normal hover:bg-white/5 hover:text-foreground h-10 px-4 transition-colors">
              {item} {["Features", "Docs"].includes(item) && <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-40" />}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="heroSecondary" size="sm" className="rounded-full px-5 py-2 text-sm">Open App</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="hero" size="sm" className="rounded-full px-5 py-2 text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              Connect Wallet
            </Button>
          </Link>
        </div>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
    </nav>
  );
}

/* ──────────────────────────────────────────
   ANIMATED COUNTER
   ────────────────────────────────────────── */
function AnimCounter({ target, prefix = "", suffix = "", duration = 2000 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - t, 4);
          setValue(Math.round(ease * target));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{prefix}{value.toLocaleString()}{suffix}</span>;
}

/* ──────────────────────────────────────────
   LIVE TICKER
   ────────────────────────────────────────── */
function LiveTicker() {
  const cities = [
    "Lagos → London · $5,200 USDC · 0.8s",
    "Nairobi → Dubai · $1,800 USDC · 0.6s",
    "Accra → Toronto · $3,400 USDC · 0.7s",
    "Dar es Salaam → Mumbai · $900 USDC · 0.5s",
    "Johannesburg → Sydney · $7,100 USDC · 0.9s",
    "Kampala → Berlin · $2,600 USDC · 0.4s",
  ];
  return (
    <div className="w-full overflow-hidden border-y border-white/[0.06] bg-white/[0.01] py-3">
      <div className="flex animate-marquee w-max">
        {[...cities, ...cities, ...cities].map((c, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0 mx-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse" />
            <span className="text-[13px] text-foreground/60 font-mono whitespace-nowrap tracking-wide">{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   HERO SECTION
   ────────────────────────────────────────── */
function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let rafId: number;
    const fade = 0.5;
    const tick = () => {
      if (!video.duration || isNaN(video.duration)) return (rafId = requestAnimationFrame(tick));
      const { currentTime, duration } = video;
      video.style.opacity = currentTime < fade ? (currentTime / fade).toString() : duration - currentTime < fade ? Math.max(0, (duration - currentTime) / fade).toString() : "1";
      rafId = requestAnimationFrame(tick);
    };
    const onEnded = () => { video.style.opacity = "0"; setTimeout(() => { video.currentTime = 0; video.play().catch(() => {}); }, 100); };
    video.addEventListener("ended", onEnded);
    rafId = requestAnimationFrame(tick);
    video.play().catch(() => {});
    return () => { cancelAnimationFrame(rafId); video.removeEventListener("ended", onEnded); };
  }, []);

  return (
    <section className="relative w-full overflow-hidden pt-[72px]">
      {/* Animated Video Background */}
      <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0 }} src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260308_114720_3dabeb9e-2c39-4907-b747-bc3544e2d5b7.mp4" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/90 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-[200px] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(14,165,233,0.08)_0%,transparent_60%)] pointer-events-none" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="relative z-10">
        <LiveTicker />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center pt-12 md:pt-16 px-4 text-center max-w-[900px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="liquid-glass rounded-full px-5 py-2 mb-6 flex items-center gap-2.5 text-sm"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
          <span className="text-foreground/70 font-['Geist_Sans']">Powered by Injective inEVM · Zero Gas Fees</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="text-[56px] md:text-[80px] lg:text-[96px] font-bold leading-[1.02] tracking-[-0.03em] pb-2 text-transparent bg-clip-text"
          style={{ fontFamily: "'General Sans', 'Geist Sans', sans-serif", backgroundImage: "linear-gradient(160deg, #FFFFFF 0%, #E8E8E9 30%, #8B5CF6 70%, #3A7BBF 100%)" }}
        >
          Send Money<br />Across Africa
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          className="text-hero-sub text-lg md:text-xl leading-relaxed max-w-xl mt-4 opacity-90 font-['Geist_Sans'] font-light"
        >
          The first DeFi-native remittance platform on <strong className="text-foreground font-medium">Injective</strong>. 
          Replace Western Union&apos;s 8% tax with <strong className="text-emerald-400 font-semibold">$0.00 fees</strong> and <strong className="text-foreground font-medium">sub-second settlement</strong>.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-8 mb-6"
        >
          <Link href="/dashboard"><Button variant="hero" className="px-8 py-6 text-base shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-shadow"><Send className="mr-2 h-5 w-5" /> Start Sending Now</Button></Link>
          <Link href="/dashboard"><Button variant="heroSecondary" className="px-8 py-6 text-base group">Explore Dashboard <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Button></Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-wrap justify-center items-center gap-3 text-[13px] text-foreground/50 font-['Geist_Sans'] mb-12"
        >
          {[
            { icon: <Shield className="h-3.5 w-3.5" />, label: "Non-custodial" },
            { icon: <Zap className="h-3.5 w-3.5" />, label: "< 1s Finality" },
            { icon: <Globe2 className="h-3.5 w-3.5" />, label: "54 African Countries" },
          ].map(({ icon, label }) => (
            <div key={label} className="liquid-glass rounded-full px-4 py-1.5 flex items-center gap-1.5">
              {icon}{label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   STATS STRIP
   ────────────────────────────────────────── */
function StatsStrip() {
  const stats = [
    { value: 1714330, prefix: "$", suffix: "+", label: "Volume Transferred", icon: <TrendingUp className="h-5 w-5 text-primary" /> },
    { value: 0, prefix: "$", suffix: ".00", label: "Gas Fee Per Transfer", icon: <DollarSign className="h-5 w-5 text-emerald-400" /> },
    { value: 54, prefix: "", suffix: "", label: "Countries Covered", icon: <Globe2 className="h-5 w-5 text-sky-400" /> },
    { value: 234, prefix: "", suffix: "+", label: "Successful Settlements", icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" /> },
  ];

  return (
    <section className="w-full py-16 px-4">
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((s, i) => (
          <motion.div 
            key={i} 
            variants={fadeInUp}
            className="liquid-glass rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:bg-white/[0.03] transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:scale-110 transition-transform">
              {s.icon}
            </div>
            <div className="text-3xl md:text-4xl font-bold font-mono text-foreground tracking-tight">
              <AnimCounter target={s.value} prefix={s.prefix} suffix={s.suffix} />
            </div>
            <div className="text-[13px] text-muted-foreground font-['Geist_Sans']">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ──────────────────────────────────────────
   HOW IT WORKS
   ────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { num: "01", title: "Connect Your Wallet", desc: "Link any EVM wallet. No KYC required.", icon: <Shield className="h-6 w-6" /> },
    { num: "02", title: "Enter USDC Amount", desc: "On-chain oracle instantly shows live fiat conversion.", icon: <DollarSign className="h-6 w-6" /> },
    { num: "03", title: "Confirm & Settle", desc: "Consensus confirms in under 1s with $0.00 gas fee.", icon: <Zap className="h-6 w-6" /> },
    { num: "04", title: "Recipient Claims", desc: "Funds received instantly in USDC or local fiat.", icon: <CheckCircle2 className="h-6 w-6" /> },
  ];

  return (
    <section className="w-full py-20 px-4">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5 text-xs text-foreground/60 font-mono uppercase tracking-widest mb-6 border border-white/5">
            <Clock className="h-3 w-3" /> How It Works
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-['General_Sans',sans-serif] text-foreground block">
            <AnimText>Four steps. Zero fees.</AnimText>
          </h2>
          <AnimParagraph className="text-muted-foreground mt-4 text-lg max-w-lg mx-auto font-['Geist_Sans']" delay={0.3}>
            From wallet connect to settlement — the entire flow takes under 10 seconds.
          </AnimParagraph>
        </div>

        <motion.div 
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {steps.map((step, i) => (
            <motion.div 
              key={i} variants={scaleUp}
              className="liquid-glass rounded-2xl p-6 flex flex-col gap-4 group hover:bg-white/[0.03] transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_8px_30px_rgba(139,92,246,0.1)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-5xl font-bold text-foreground/[0.06] font-mono leading-none">{step.num}</span>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground font-['Geist_Sans'] leading-snug">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-['Geist_Sans']">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   WHY AFRFI (FEATURE CARDS)
   ────────────────────────────────────────── */
function WhyAfriFi() {
  const features = [
    { icon: <DollarSign className="h-7 w-7" />, title: "Zero Gas Fees", desc: "Injective's inEVM eliminates gas costs entirely. You pay exactly $0.00 in fees.", highlight: "$0.00", highlightColor: "text-emerald-400" },
    { icon: <Zap className="h-7 w-7" />, title: "Sub-Second Settlement", desc: "Injective achieves finality in under 1 second. No waiting 3–5 business days.", highlight: "< 1 second", highlightColor: "text-sky-400" },
    { icon: <Shield className="h-7 w-7" />, title: "Non-Custodial", desc: "We never hold your funds. Smart contracts handle the entire transfer flow.", highlight: "100% on-chain", highlightColor: "text-primary" },
    { icon: <Globe2 className="h-7 w-7" />, title: "Oracle Rates", desc: "Live, manipulation-resistant USD/NGN and USD/KES exchange rates.", highlight: "Live rates", highlightColor: "text-amber-400" },
    { icon: <TrendingUp className="h-7 w-7" />, title: "Inflation Hedge", desc: "Hold USDC instead of volatile currencies to preserve your savings value.", highlight: "USDC-native", highlightColor: "text-emerald-400" },
    { icon: <Send className="h-7 w-7" />, title: "Mobile Claiming", desc: "Recipients can claim funds directly to mobile money apps instantly.", highlight: "M-Pesa ready", highlightColor: "text-sky-400" },
  ];

  return (
    <section className="w-full py-20 px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_60%)] pointer-events-none" />
      
      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5 text-xs text-foreground/60 font-mono uppercase tracking-widest mb-6">
            <Zap className="h-3 w-3" /> Why AfriFi
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-['General_Sans',sans-serif] text-foreground block">
            <AnimText>Built for Africa. Powered by Injective.</AnimText>
          </h2>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeInUp} className="liquid-glass rounded-2xl p-7 flex flex-col gap-4 group hover:bg-white/[0.03] transition-all duration-300 hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground font-['Geist_Sans']">
                <AnimText>{f.title}</AnimText>
              </h3>
              <AnimParagraph className="text-sm text-muted-foreground leading-relaxed font-['Geist_Sans'] flex-1" delay={0.1}>{f.desc}</AnimParagraph>
              <div className={`text-sm font-mono font-semibold ${f.highlightColor} flex items-center gap-1.5`}>
                <ArrowUpRight className="h-3.5 w-3.5" /> {f.highlight}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   FEE COMPARISON
   ────────────────────────────────────────── */
function FeeComparison() {
  const providers = [
    { name: "Western Union", fee: 8.0, time: "3-5 days", color: "bg-red-500/80" },
    { name: "MoneyGram", fee: 5.5, time: "1-3 days", color: "bg-amber-500/80" },
    { name: "Bank Wire", fee: 12.0, time: "5-7 days", color: "bg-slate-500/80" },
    { name: "WorldRemit", fee: 3.9, time: "1-2 days", color: "bg-orange-500/80" },
    { name: "AfriFi", fee: 0.0, time: "< 1 second", color: "bg-emerald-500", special: true },
  ];

  return (
    <section className="w-full py-20 px-4">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-14">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5 text-xs text-foreground/60 font-mono uppercase tracking-widest mb-6">
            <DollarSign className="h-3 w-3" /> Fee Comparison
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-['General_Sans',sans-serif] text-foreground block">
            <AnimText>See the difference.</AnimText>
          </h2>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="liquid-glass rounded-2xl p-8 flex flex-col gap-5">
          {providers.map((p, i) => (
            <motion.div key={p.name} variants={fadeInUp} className={`flex items-center gap-4 ${p.special ? "bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-4 -mx-2" : "px-2"}`}>
              <div className="w-[140px] shrink-0">
                <div className={`text-sm font-semibold font-['Geist_Sans'] ${p.special ? "text-emerald-400" : "text-foreground/70"}`}>{p.name}</div>
              </div>
              <div className="flex-1 h-8 bg-white/[0.03] rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: p.fee === 0 ? "3%" : `${(p.fee / 12) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.1 }}
                  className={`h-full rounded-lg ${p.color} flex items-center justify-end pr-3`}
                  style={{ minWidth: p.fee === 0 ? "40px" : undefined }}
                >
                  <span className="text-xs font-mono font-bold text-white drop-shadow-sm">
                    {p.fee === 0 ? "$0" : `$${(p.fee * 10).toFixed(0)}`}
                  </span>
                </motion.div>
              </div>
              <div className="w-[100px] text-right shrink-0">
                <span className={`text-xs font-mono ${p.special ? "text-emerald-400 font-bold" : "text-muted-foreground"}`}>{p.time}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   SUPPORTED CORRIDORS
   ────────────────────────────────────────── */
function Corridors() {
  const corridors = [
    { from: "🇺🇸 USD", to: "🇳🇬 NGN", pair: "USD → Naira" },
    { from: "🇬🇧 GBP", to: "🇰🇪 KES", pair: "GBP → Shilling" },
    { from: "🇪🇺 EUR", to: "🇬🇭 GHS", pair: "EUR → Cedi" },
    { from: "🇨🇦 CAD", to: "🇺🇬 UGX", pair: "CAD → Shilling" },
    { from: "🇦🇪 AED", to: "🇹🇿 TZS", pair: "AED → Shilling" },
    { from: "🇦🇺 AUD", to: "🇿🇦 ZAR", pair: "AUD → Rand" },
  ];

  return (
    <section className="w-full py-20 px-4">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-['General_Sans',sans-serif] text-foreground block">
            <AnimText>54 countries. One protocol.</AnimText>
          </h2>
        </div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {corridors.map((c, i) => (
            <motion.div key={i} variants={scaleUp} className="liquid-glass rounded-2xl p-5 flex items-center gap-4 group hover:bg-white/[0.03]">
              <div className="flex items-center gap-2.5 flex-1">
                <span className="text-2xl">{c.from.split(" ")[0]}</span>
                <ArrowRight className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
                <span className="text-2xl">{c.to.split(" ")[0]}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-foreground font-['Geist_Sans']">{c.pair}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   VIDEO + SOCIAL PROOF
   ────────────────────────────────────────── */
function SocialProofSection() {
  const logos = [{ name: "Injective", letter: "I" }, { name: "Flutterwave", letter: "F" }, { name: "M-Pesa", letter: "M" }, { name: "Binance", letter: "B" }, { name: "Circle", letter: "C" }, { name: "Airtel", letter: "A" }];

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative z-10 flex flex-col items-center pt-8 pb-24 px-4 w-full">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-8 md:gap-12 overflow-hidden border-t border-white/10 pt-16 mt-8">
          <div className="text-foreground/50 text-sm whitespace-nowrap shrink-0 font-['Geist_Sans'] text-center md:text-left">Building with the best<br className="hidden md:block" /> protocols & partners</div>
          <div className="flex-1 overflow-hidden relative flex" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
            <div className="flex animate-marquee w-max">
              {[...logos, ...logos, ...logos, ...logos].map((b, i) => (
                <div key={i} className="flex items-center gap-3 shrink-0 mx-8">
                  <div className="liquid-glass w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm">{b.letter}</div>
                  <span className="text-[15px] font-semibold text-foreground font-['Geist_Sans'] tracking-tight">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   CTA FOOTER
   ────────────────────────────────────────── */
function CTAFooter() {
  return (
    <section className="w-full py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1)_0%,transparent_60%)] pointer-events-none" />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="max-w-[700px] mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-['General_Sans',sans-serif] text-foreground mb-5 block">
          <AnimText>Ready to send money without the middleman?</AnimText>
        </h2>
        <AnimParagraph className="text-muted-foreground text-lg mb-10 font-['Geist_Sans']" delay={0.3}>Join thousands of users who trust AfriFi for instant, free cross-border transfers on Injective.</AnimParagraph>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard"><Button variant="hero" className="px-10 py-6 text-base shadow-[0_0_30px_rgba(139,92,246,0.3)]"><Send className="mr-2 h-5 w-5" /> Launch App</Button></Link>
          <Button variant="heroSecondary" className="px-8 py-6 text-base">Read the Docs</Button>
        </div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────────────────────────
   PAGE COMPOSITION
   ────────────────────────────────────────── */
export default function Home() {
  return (
    <main className="w-full min-h-screen bg-background font-['Geist_Sans'] text-foreground selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <HeroSection />
      <StatsStrip />
      <HowItWorks />
      <WhyAfriFi />
      <FeeComparison />
      <Corridors />
      <SocialProofSection />
      <CTAFooter />
    </main>
  );
}
