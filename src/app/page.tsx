"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Instagram, Linkedin, Github } from "lucide-react";
import { motion } from "framer-motion";
import { SplashScreen } from "@/src/components/splash-screen";
import { PainPointsSection } from "@/src/components/pain-points-section";
import { FeaturesSection } from "@/src/components/features-section";
import { HowItWorksSection } from "@/src/components/how-it-works-section";

export default function Home() {
  const [isHeroLoaded, setIsHeroLoaded] = useState(false);

  useEffect(() => {
    // Fallback: paksa splash screen hilang maksimal 3 detik,
    // berguna jika event onLoad gagal terpicu (misal gambar sudah ter-cache)
    const timer = setTimeout(() => {
      setIsHeroLoaded(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="overflow-x-hidden bg-[#0a0a0a] text-text-primary selection:bg-primary/30 selection:text-primary font-sans">
      {/* Splash Screen: muncul saat hero image belum selesai dimuat */}
      <SplashScreen isHeroLoaded={isHeroLoaded} />
      {/* 1. Header (Shared Component: TopNavBar) */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1440px] w-full mx-auto px-6 lg:px-12 flex justify-between items-center h-20">
          <Link href="/" className="flex items-center">
            <img
              src="/logo-new-png.png"
              alt="ShikiPilot Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="font-bold text-xl ml-3 tracking-tight text-white">
              ShikiPilot
            </span>
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="#features"
              className="text-on-surface-variant hover:text-primary transition-all duration-300"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-on-surface-variant hover:text-primary transition-all duration-300"
            >
              How it Works
            </Link>
            <Link
              href="#pricing"
              className="text-on-surface-variant hover:text-primary transition-all duration-300"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-on-surface-variant hover:text-primary transition-all duration-300"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="bg-[#0ea5e9] text-[#0a0a0a] px-4 py-2 md:px-6 md:py-2 text-sm md:text-base rounded-full font-bold transition-all duration-200 hover:scale-105 active:scale-95 active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] whitespace-nowrap"
            >
              Meluncur ke Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Responsive Split-Layout) */}
      <section
        className="relative w-full min-h-screen flex items-center bg-cover bg-no-repeat bg-[position:82%_center] md:bg-right lg:bg-center"
        style={{
          backgroundImage: "url('/banner hero section.png')",
        }}
      >
        {/* Atmospheric Glow */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-cyan-glow rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none" />

        {/* Mobile-only overlay: agar teks tetap terbaca saat menimpa ilustrasi */}
        <div className="absolute inset-0 bg-zinc-950/60 md:bg-transparent pointer-events-none" />

        {/* Gradient bawah: selalu aktif agar transisi ke section berikutnya mulus */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/20 via-transparent to-[#0a0a0a] pointer-events-none" />

        {/* Konten: centered di mobile, geser kiri di desktop */}
        <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10 pt-32 pb-32 flex flex-col items-center text-center md:items-start md:text-left">
          <div className="max-w-xl lg:max-w-2xl flex flex-col gap-8">
            {/* Headline */}
            <h1 className="font-jakarta leading-[1.05] tracking-tight">
              <span className="block text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-50 drop-shadow-md">
                Jualan Lebih Cepat.
              </span>
              <span className="mt-2 block text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-md">
                Manajemen Lebih Cerdas.
              </span>
            </h1>

            {/* CTA Button */}
            <div className="flex justify-center md:justify-start">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center bg-[#0ea5e9] text-[#0a0a0a] font-bold px-10 py-5 rounded-full text-lg hover:scale-105 hover:shadow-[0_0_50px_-10px_rgba(14,165,233,0.6)] active:scale-95 active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] transition-all duration-200"
              >
                Buka Dashboard (Gratis)
              </Link>
            </div>
          </div>
        </div>

        {/* Trigger onLoad untuk splash screen (gambar dirender tapi tidak terlihat) */}
        <img
          src="/banner hero section.png"
          alt=""
          aria-hidden
          className="absolute w-0 h-0 opacity-0 pointer-events-none"
          onLoad={() => setIsHeroLoaded(true)}
        />
      </section>

      {/* 3. Problem/Agitation (Pain Points Bento Grid & Interactive Modal) */}
      <PainPointsSection />

      {/* 4. Features (Interactive Tabs) */}
      <FeaturesSection />

      {/* 5. How It Works (S-Curve Glowing Stepper) */}
      <HowItWorksSection />

      {/* 6. Pricing */}
      <section
        id="pricing"
        className="py-section-v-padding px-gutter w-full bg-[#050505] relative border-y border-white/10 z-0"
      >
        <div className="absolute top-[-10%] left-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h2 className="font-section-h2-mobile md:font-section-h2 text-section-h2-mobile md:text-section-h2 mb-12">
              Satu Paket Sempurna, Selamanya Gratis.
            </h2>
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-[2rem] p-12 relative overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.15)]">
              {/* Inner Glow */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-glow rounded-full blur-[80px]"></div>
              <div className="flex justify-center items-end gap-2 mb-8">
                <span className="text-2xl text-text-muted font-bold pb-2">
                  Rp
                </span>
                <span className="text-[80px] font-black leading-none text-text-primary">
                  0
                </span>
              </div>
              <ul className="text-left space-y-4 mb-12 max-w-sm mx-auto font-body text-body">
                <li className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    check_circle
                  </span>
                  Dashboard POS Lengkap
                </li>
                <li className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    check_circle
                  </span>
                  Asisten AI WhatsApp (Beta Access)
                </li>
                <li className="flex items-center gap-3 pb-2">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    check_circle
                  </span>
                  Laporan &amp; PDF Export
                </li>
              </ul>
              <Link
                href="/dashboard"
                className="inline-block text-center w-full bg-[#0ea5e9] text-[#0a0a0a] font-bold px-10 py-5 rounded-full text-lg hover:scale-105 hover:shadow-[0_0_50px_-10px_rgba(14,165,233,0.6)] active:scale-95 active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] transition-all duration-200"
              >
                Mulai Sekarang Tanpa Kartu Kredit
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 7. FAQ */}
      <section
        id="faq"
        className="py-section-v-padding px-gutter max-w-3xl mx-auto relative z-0"
      >
        <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-section-h2-mobile md:font-section-h2 text-section-h2-mobile md:text-section-h2 mb-16 text-center">
            Sering Ditanyakan Bos UMKM.
          </h2>
          <div className="space-y-4 font-body text-body">
            <details className="group border border-white/10 rounded-[2rem] bg-white/5 overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:bg-zinc-900/80">
              <summary className="w-full px-8 py-6 text-left flex justify-between items-center font-bold text-lg hover:text-primary transition-colors focus:outline-none cursor-pointer list-none">
                Kenapa Asisten AI WhatsApp berstatus Beta Access?
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="px-8 pb-6 text-text-secondary">
                Saat ini sistem AI kami masih dalam tahap pengembangan intensif
                dan di-host secara lokal untuk memastikan responsivitas serta
                pembaruan kilat. Oleh karena itu, fitur AI akan aktif menemani
                Anda selama jam operasional/jam kerja saja.
              </div>
            </details>
            <details className="group border border-white/10 rounded-[2rem] bg-white/5 overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:bg-zinc-900/80">
              <summary className="w-full px-8 py-6 text-left flex justify-between items-center font-bold text-lg hover:text-primary transition-colors focus:outline-none cursor-pointer list-none">
                Saya gaptek dan belum pernah pakai sistem kasir, apa bakal
                susah?
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="px-8 pb-6 text-text-secondary">
                Desain kami dibuat sangat minimalis dan fokus. Jika Anda bisa
                menggunakan WhatsApp, Anda pasti bisa menggunakan ShikiPilot.
              </div>
            </details>
            <details className="group border border-white/10 rounded-[2rem] bg-white/5 overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:bg-zinc-900/80">
              <summary className="w-full px-8 py-6 text-left flex justify-between items-center font-bold text-lg hover:text-primary transition-colors focus:outline-none cursor-pointer list-none">
                Apakah data jualan saya aman?
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="px-8 pb-6 text-text-secondary">
                Sangat aman. Kami menggunakan enkripsi standar industri untuk
                melindungi data transaksi dan inventaris toko Anda.
              </div>
            </details>
            <details className="group border border-white/10 rounded-[2rem] bg-white/5 overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:bg-zinc-900/80">
              <summary className="w-full px-8 py-6 text-left flex justify-between items-center font-bold text-lg hover:text-primary transition-colors focus:outline-none cursor-pointer list-none">
                Aplikasi ini beneran gratis?
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="px-8 pb-6 text-text-secondary">
                Ya, 100% gratis untuk fitur dasar yang sudah sangat cukup untuk
                operasional UMKM harian.
              </div>
            </details>
          </div>
        </motion.div>
      </section>

      {/* 8. Final CTA */}
      <section className="py-32 max-w-[1440px] w-full mx-auto px-6 lg:px-12 text-center relative border-t border-white/10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-zinc-950 to-zinc-950">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-glow rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-section-h2-mobile md:font-section-h2 text-section-h2-mobile md:text-section-h2 mb-10 max-w-4xl mx-auto">
            Siap Jadi UMKM Next Level?
            <br />
            Mulai Hari Ini dengan{" "}
            <span className="bg-gradient-to-r from-[#0284c7] to-[#38bdf8] bg-clip-text text-transparent">
              ShikiPilot.
            </span>
          </h2>
          <Link
            className="inline-flex items-center justify-center bg-[#0ea5e9] text-[#0a0a0a] font-bold px-12 py-6 rounded-full text-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] hover:scale-105 hover:-translate-y-1 active:scale-95 active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] transition-all duration-300"
            href="/dashboard"
          >
            Daftar Gratis Sekarang
          </Link>
        </motion.div>
      </section>

      {/* 9. Footer (Shared Component: Footer) */}
      <footer className="bg-surface-alt-1 border-t border-white/10 w-full pt-20 pb-10">
        <div className="max-w-[1440px] w-full mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between mb-16">
          <div className="flex flex-col gap-4 mb-10 md:mb-0">
            <div className="flex items-center">
              <img
                src="/logo-new-png.png"
                alt="ShikiPilot Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="font-bold text-2xl ml-3 tracking-tight text-white">
                ShikiPilot
              </span>
            </div>
            <p className="font-body text-body text-text-secondary mt-2">
              Sistem POS cerdas, dari komunitas untuk komunitas.
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-6">
            <div className="font-bold text-sm tracking-widest text-text-secondary uppercase">
              IKUTI KAMI
            </div>
            <div className="flex gap-4">
              <Link
                href="https://www.instagram.com/semaradana_kadek/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-primary/20 text-text-muted hover:text-[#0ea5e9] transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/kadek-semaradana-322b7128a/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-primary/20 text-text-muted hover:text-[#0ea5e9] transition-all duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link
                href="https://github.com/Semara-26"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-primary/20 text-text-muted hover:text-[#0ea5e9] transition-all duration-300"
              >
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] w-full mx-auto px-6 lg:px-12 pt-8 border-t border-white/10 text-center">
          <p className="font-body text-sm text-text-muted">
            © 2026 ShikiPilot. Dibangun dengan ☕
          </p>
        </div>
      </footer>
    </main>
  );
}
