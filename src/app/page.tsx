"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Linkedin, Github, ChevronDown } from "lucide-react";

/* ── Animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay, ease: "easeOut" as const },
});
const fadeLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});
const fadeRight = (delay = 0) => ({
  initial: { opacity: 0, x: 40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

/* ── Logo ── */
function ShikiLogo({ size = 56, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/icon.png"
      alt="ShikiPilot"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}

/* ── Data ── */
const PROBLEMS = [
  {
    emoji: "📦",
    title: "Stok Sering Melenceng",
    desc: "Nyatat manual bikin pusing, barang beda sama catatan.",
  },
  {
    emoji: "🛒",
    title: "Kasir Ribet & Lelet",
    desc: "Aplikasi kaku bikin antrean panjang dan pelanggan kabur.",
  },
  {
    emoji: "📈",
    title: "Pusing Bikin Laporan",
    desc: "Bingung hitung profit tiap akhir bulan, data berserakan.",
  },
];

const SOLUTIONS = [
  {
    emoji: "⚡",
    title: "Pantau Stok Real-Time",
    desc: "Stok terpotong otomatis saat transaksi. Tidak ada lagi selisih catatan.",
  },
  {
    emoji: "💳",
    title: "Kasir Kilat (Micro-POS)",
    desc: "Klik produk, langsung proses. Antarmuka cepat dan bersih tanpa hambatan.",
  },
  {
    emoji: "🤖",
    title: "Asisten Bisnis AI & Ekspor PDF",
    desc: "Insight otomatis dari AI dan laporan PDF siap cetak dalam hitungan detik.",
  },
];

const STEPS = [
  {
    num: "01",
    emoji: "📦",
    title: "Setup & Import AI",
    desc: "Tambahkan produk secara manual atau gunakan fitur Import AI cerdas kami untuk memasukkan ratusan data sekaligus dalam hitungan detik.",
    images: ["/step-1-setup-manual.png", "/step-1-setup-ai.png"],
    flip: false,
  },
  {
    num: "02",
    emoji: "🛒",
    title: "Langsung Jualan (Kasir)",
    desc: "Buka menu Micro-POS. Tinggal klik produk, transaksi beres, dan stok gudang otomatis kepotong saat itu juga.",
    images: ["/step-2-pos.png"],
    flip: true,
  },
  {
    num: "03",
    emoji: "📊",
    title: "Pantau Hasilnya (Analisis)",
    desc: "Buka Dashboard untuk melihat grafik pendapatan hari ini, atau minta asisten AI memberi saran produk paling menguntungkan.",
    images: ["/step-3-analytics.png"],
    flip: false,
  },
];

const TECH_STACK = [
  { name: "Next.js", icon: "▲" },
  { name: "React", icon: "⚛" },
  { name: "Tailwind CSS", icon: "✦" },
  { name: "Drizzle ORM", icon: "◈" },
  { name: "Gemini AI", icon: "✧" },
  { name: "jsPDF", icon: "⬡" },
  { name: "Clerk Auth", icon: "⬢" },
  { name: "PostgreSQL", icon: "🐘" },
];

const PRICING_FEATURES = [
  "Unlimited Produk & Transaksi",
  "Import AI & Sinkronisasi Real-Time",
  "Micro-POS Kilat",
  "AI Analytics & Business Insight",
  "Ekspor CSV & Laporan PDF",
  "100% Source Code",
];

const FAQS = [
  {
    q: "Beneran gratis?",
    a: "100% gratis. ShikiPilot adalah proyek open-source. Kamu bisa pakai, modifikasi, dan deploy sendiri tanpa biaya langganan sepeser pun. Fork aja di GitHub!",
  },
  {
    q: "Butuh internet untuk menjalankannya?",
    a: "Untuk fitur AI dan sinkronisasi data ke database, butuh koneksi internet. Tapi kalau kamu deploy lokal sendiri, transaksi kasir tetap jalan mulus di jaringan lokal.",
  },
  {
    q: "Bisa dipakai di HP?",
    a: "Bisa banget! UI ShikiPilot didesain responsif dari awal. Mulai dari dashboard, kasir, sampai analytics semuanya nyaman dipakai di layar HP maupun tablet.",
  },
  {
    q: "Lemot kalau data transaksinya banyak?",
    a: "Tidak. ShikiPilot dibangun di atas Next.js dengan query database yang dioptimasi. Data ditarik secara efisien dan grafik dirender di client, jadi tetap responsif walaupun data ribuan.",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="font-sans bg-[#050505] text-white antialiased selection:bg-primary selection:text-white overflow-x-hidden">

      {/* ── Header ── */}
      <header className="w-full border-b border-surface-border bg-[#050505]/90 backdrop-blur-md fixed top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShikiLogo size={80} className="h-10 w-10 md:h-16 md:w-16" />
            <h2 className="text-white text-2xl md:text-3xl font-black tracking-tight">ShikiPilot</h2>
          </div>
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-bold text-white transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_-5px_rgba(242,13,13,0.7)]"
          >
            Dashboard →
          </Link>
        </div>
      </header>

      <main className="pt-20">

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-28 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(242,13,13,0.12),transparent)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_110%,rgba(242,13,13,0.06),transparent)] pointer-events-none" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "40px 40px" }}
          />

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-7">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-bold font-mono uppercase tracking-widest"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              ⚡ FAST & RELIABLE
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-white"
            >
              Jualan Lebih Cepat.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-red-600">
                Manajemen Lebih Cerdas.
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed"
            >
              Satu platform untuk kasir, gudang, dan analisis data. Dibangun untuk kecepatan,
              didesain untuk pertumbuhan bisnismu.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:bg-primary/90 hover:scale-105 hover:shadow-[0_0_40px_-8px_rgba(242,13,13,0.8)]"
              >
                Buka Dashboard
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>

          </div>
        </section>

        {/* ══════════════════════════════════════
            PROBLEM
        ══════════════════════════════════════ */}
        <section className="px-6 py-24 border-t border-surface-border bg-[#080808]">
          <div className="max-w-[1100px] mx-auto">
            <motion.div {...fadeUp()} className="text-center mb-14">
              <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Pain Points</p>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                Udah capek ngurusin toko manual terus?
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PROBLEMS.map((p, i) => (
                <motion.div
                  key={p.title}
                  {...fadeUp(i * 0.1)}
                  className="group relative p-8 rounded-xl border border-white/5 bg-[#0d0d0d] hover:border-primary/30 hover:bg-[#110808] transition-all duration-300"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="text-4xl mb-5 block">{p.emoji}</span>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{p.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            VALUE PROPOSITION
        ══════════════════════════════════════ */}
        <section className="px-6 py-24 border-t border-surface-border bg-[#050505]">
          <div className="max-w-[1100px] mx-auto">
            <motion.div {...fadeUp()} className="text-center mb-14">
              <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Solusi</p>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                Solusi Pintar Buat Bisnis yang Nggak Mau Ribet.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SOLUTIONS.map((s, i) => (
                <motion.div
                  key={s.title}
                  {...fadeUp(i * 0.1)}
                  className="group relative p-8 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/50 hover:shadow-[0_0_40px_-12px_rgba(242,13,13,0.4)] transition-all duration-300"
                >
                  <span className="text-4xl mb-5 block">{s.emoji}</span>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════ */}
        <section className="px-6 py-24 border-t border-surface-border bg-[#080808]">
          <div className="max-w-[1100px] mx-auto">
            <motion.div {...fadeUp()} className="text-center mb-20">
              <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Cara Kerja</p>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                Cara Pakainya Gimana? Gampang Banget!
              </h2>
            </motion.div>

            <div className="flex flex-col gap-24">
              {STEPS.map((step) => (
                <div
                  key={step.num}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${step.flip ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1" : ""}`}
                >
                  {/* Image(s) */}
                  <motion.div {...(step.flip ? fadeRight(0.1) : fadeLeft(0.1))} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-red-900/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className={`relative rounded-2xl overflow-hidden border border-white/5 bg-[#0d0d0d] shadow-2xl ${step.images.length > 1 ? "grid grid-cols-2 gap-2 p-2" : ""}`}>
                      {step.images.map((src) => (
                        <Image
                          key={src}
                          src={src}
                          alt={step.title}
                          width={600}
                          height={400}
                          className="w-full h-auto object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </motion.div>

                  {/* Text */}
                  <motion.div {...(step.flip ? fadeLeft(0.2) : fadeRight(0.2))} className="flex flex-col gap-5">
                    <div className="inline-flex items-center gap-3">
                      <span className="font-mono text-5xl font-black text-primary/20 leading-none">{step.num}</span>
                      <span className="h-px flex-1 bg-primary/20" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                      {step.emoji} {step.title}
                    </h3>
                    <p className="text-base text-gray-400 leading-relaxed">{step.desc}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            TECH STACK
        ══════════════════════════════════════ */}
        <section className="px-6 py-20 border-t border-surface-border bg-[#050505]">
          <div className="max-w-[1100px] mx-auto">
            <motion.div {...fadeUp()} className="text-center mb-12">
              <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Tech Stack</p>
              <h2 className="text-2xl md:text-4xl font-black text-white">
                Dibangun dengan Teknologi Modern & Scalable.
              </h2>
            </motion.div>

            <motion.div {...fadeUp(0.15)} className="flex flex-wrap justify-center gap-4">
              {TECH_STACK.map((tech) => (
                <div
                  key={tech.name}
                  className="group flex items-center gap-2 px-5 py-3 rounded-lg border border-white/5 bg-[#0d0d0d] text-gray-600 hover:text-white hover:border-primary/50 hover:shadow-[0_0_20px_-8px_rgba(242,13,13,0.5)] transition-all duration-300 cursor-default"
                >
                  <span className="text-lg group-hover:text-primary transition-colors">{tech.icon}</span>
                  <span className="font-mono text-sm font-semibold tracking-wide">{tech.name}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            PRICING
        ══════════════════════════════════════ */}
        <section className="px-6 py-24 border-t border-surface-border bg-[#080808]">
          <div className="max-w-[560px] mx-auto">
            <motion.div {...fadeUp()} className="text-center mb-12">
              <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Harga</p>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                Bebas Biaya Langganan. Selamanya.
              </h2>
            </motion.div>

            <motion.div
              {...fadeUp(0.15)}
              className="relative rounded-2xl border border-primary/30 bg-gradient-to-b from-[#120505] to-[#0d0d0d] p-10 shadow-[0_0_60px_-15px_rgba(242,13,13,0.3)] overflow-hidden"
            >
              {/* Glow top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-bold uppercase tracking-widest mb-6">
                  ✦ PAKET KOMUNITAS
                </div>
                <div className="font-black text-6xl text-white mb-1">Rp 0</div>
                <div className="text-gray-500 font-mono text-sm">/ Bulan</div>
              </div>

              <ul className="space-y-3 mb-8">
                {PRICING_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-primary shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="https://github.com/Semara-26"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-white/10 bg-white/5 py-3.5 font-bold text-white text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-200"
              >
                <Github className="w-4 h-4" />
                📦 Fork di GitHub
              </a>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FAQ
        ══════════════════════════════════════ */}
        <section className="px-6 py-24 border-t border-surface-border bg-[#050505]">
          <div className="max-w-[720px] mx-auto">
            <motion.div {...fadeUp()} className="text-center mb-14">
              <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">FAQ</p>
              <h2 className="text-3xl md:text-5xl font-black text-white">
                Masih Punya Pertanyaan?
              </h2>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="flex flex-col gap-3">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border overflow-hidden transition-all duration-300 ${openFaq === idx ? "border-primary/40 bg-[#110808]" : "border-white/5 bg-[#0d0d0d] hover:border-white/10"}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-white text-sm md:text-base">{faq.q}</span>
                    <ChevronDown
                      className={`shrink-0 w-5 h-5 text-gray-500 transition-transform duration-300 ${openFaq === idx ? "rotate-180 text-primary" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════ */}
        <section className="px-6 py-28 border-t border-surface-border bg-[#080808] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(242,13,13,0.08),transparent)] pointer-events-none" />
          <div className="max-w-[720px] mx-auto text-center relative z-10">
            <motion.div {...fadeUp()}>
              <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Mulai Sekarang</p>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
                Siap Bikin Tokomu Makin Modern?
              </h2>
              <p className="text-gray-400 mb-10 max-w-md mx-auto">
                Gratis selamanya. Setup dalam menit. Tidak perlu kartu kredit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 font-bold text-white text-base transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-[0_0_40px_-8px_rgba(242,13,13,0.8)]"
                >
                  Buka Dashboard →
                </Link>
                <a
                  href="https://github.com/Semara-26"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-transparent px-8 py-4 font-bold text-white text-base transition-all hover:border-white/40 hover:bg-white/5"
                >
                  🌟 Star on GitHub
                </a>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-border bg-surface-dark py-12 px-6">
        <div className="max-w-[1280px] mx-auto">

          {/* Top row */}
          <motion.div {...fadeUp()} className="flex flex-col md:flex-row items-start justify-between gap-10 pb-8 border-b border-surface-border/50">
            {/* Brand */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <ShikiLogo size={72} className="h-12 w-12" />
                <span className="text-white font-black text-2xl tracking-tight">ShikiPilot</span>
              </div>
              <p className="text-text-muted text-sm max-w-xs leading-relaxed">
                Sistem POS cerdas, dari komunitas untuk komunitas.
              </p>
            </div>

            {/* Contact / Social */}
            <div className="flex flex-col gap-4">
              <p className="text-white text-sm font-semibold uppercase tracking-widest font-mono">Ikuti Kami</p>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/semaradana_kadek/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex items-center justify-center w-9 h-9 rounded-md border border-surface-border text-text-muted hover:border-primary hover:text-primary transition-all duration-200 hover:scale-110"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/kadek-semaradana-322b7128a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex items-center justify-center w-9 h-9 rounded-md border border-surface-border text-text-muted hover:border-primary hover:text-primary transition-all duration-200 hover:scale-110"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/Semara-26"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="flex items-center justify-center w-9 h-9 rounded-md border border-surface-border text-text-muted hover:border-primary hover:text-primary transition-all duration-200 hover:scale-110"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Bottom row */}
          <div className="pt-6 flex justify-center">
            <p className="text-text-muted text-xs font-mono">© 2026 ShikiPilot. Dibangun dengan ☕</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
