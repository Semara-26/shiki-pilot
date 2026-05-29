"use client";

import Link from "next/link";
import { FileText, Users, Instagram, Linkedin, Github } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-[#0a0a0a] text-text-primary selection:bg-primary/30 selection:text-primary font-sans">
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

      {/* 2. Hero Section (Asymmetrical Stack) */}
      <section className="w-full max-w-none px-0 relative pt-hero-top-padding pb-32">
        {/* Atmospheric Glow */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-cyan-glow rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none"></div>

        {/* Hero Background Image */}
        <img
          src="/banner hero section.png"
          alt="Hero Banner"
          className="absolute inset-0 z-0 w-full h-[80vh] md:h-[90vh] object-cover object-[25%_center] md:object-[70%_center] opacity-80"
        />

        {/* Gradient Masking overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a0a0a]/30 via-[#0a0a0a]/60 to-[#0a0a0a]"></div>

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center gap-8 py-20 px-6">
          <h1 className="relative z-10 font-hero-h1-mobile md:font-hero-h1 text-hero-h1-mobile md:text-hero-h1 text-text-primary text-center max-w-5xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/70 via-white/10 to-white/40 [-webkit-text-stroke:1.5px_rgba(255,255,255,0.5)] [text-shadow:0_8px_16px_rgba(255,255,255,0.15)] drop-shadow-sm">
              Jualan Lebih Cepat.
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#38bdf8]/70 via-[#0284c7]/20 to-[#38bdf8]/40 [-webkit-text-stroke:1.5px_rgba(56,189,248,0.5)] [text-shadow:0_8px_16px_rgba(56,189,248,0.2)] drop-shadow-sm">
              Manajemen Lebih Cerdas.
            </span>
          </h1>

          <Link
            className="relative z-10 inline-flex items-center justify-center bg-[#0ea5e9] text-[#0a0a0a] font-bold px-10 py-5 rounded-full text-lg hover:scale-105 hover:shadow-[0_0_50px_-10px_rgba(14,165,233,0.6)] active:scale-95 active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] transition-all duration-200"
            href="/dashboard"
          >
            Buka Dashboard (Gratis)
          </Link>
        </div>
      </section>

      {/* 3. Problem/Agitation (Bento Grid Asymmetrical) */}
      <section className="py-section-v-padding max-w-[1440px] w-full mx-auto px-6 lg:px-12 relative z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-section-h2-mobile md:font-section-h2 text-section-h2-mobile md:text-section-h2 mb-16 text-center">
            Tinggalkan Cara Lama.
            <br />
            <span className="text-text-muted">
              Masalah UMKM Selesai di Sini.
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 (Span 6 / col-span-2) */}
            <div className="bg-gradient-to-r from-white/10 via-[#0a0a0a]/80 to-transparent border border-white/10 rounded-3xl p-8 md:col-span-2 min-h-[300px] flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
              <div className="md:w-1/2 relative z-10">
                <h3 className="text-3xl font-bold mb-4">
                  Misteri Stok Gaib yang Bikin Tekor
                </h3>
                <p className="text-text-secondary font-body text-body">
                  Di pembukuan ketulis sisa 20, tapi pas dicari di rak ternyata
                  sisa 5. ShikiPilot otomatis ngunci dan lacak setiap mutasi
                  barang...
                </p>
              </div>
              {/* Image Stok Gaib with Mix-Blend Magic */}
              <img
                src="/ilustrasi stok gaib.png"
                alt="Stok Gaib"
                className="absolute -bottom-10 -right-10 w-[80%] md:w-[60%] object-contain mix-blend-screen opacity-90 z-0"
              />
            </div>
            {/* Card 2 (Span 3) */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 min-h-[200px] relative overflow-hidden">
              <FileText className="text-white/10 w-16 h-16 absolute top-4 right-4 z-0" />
              <div className="mt-auto relative z-10">
                <h3 className="text-xl font-bold mb-4">
                  Begadang Demi Laporan? Gak Lagi.
                </h3>
                <p className="text-text-secondary font-body text-body text-sm">
                  Gak usah pusing ngumpulin nota lecek tiap malam minggu...
                </p>
              </div>
            </div>
            {/* Card 3 (Span 3) */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 min-h-[200px] relative overflow-hidden">
              <Users className="text-white/10 w-16 h-16 absolute top-4 right-4 z-0" />
              <div className="mt-auto relative z-10">
                <h3 className="text-xl font-bold mb-4">
                  Antrean Panjang Bikin Pelanggan Kabur
                </h3>
                <p className="text-text-secondary font-body text-body text-sm">
                  Kasir manual yang lambat bikin pembeli gak sabar...
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. Value Proposition (Z-Pattern / Asymmetrical Split) */}
      <section
        id="features"
        className="py-section-v-padding max-w-[1440px] w-full mx-auto px-6 lg:px-12 relative border-t border-white/10 z-0"
      >
        <div className="absolute top-[-10%] left-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Text (40%) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <span className="font-label-mono text-label-mono text-primary uppercase tracking-widest">
                Fitur Unggulan
              </span>
              <h2 className="font-section-h2-mobile md:font-section-h2 text-section-h2-mobile md:text-section-h2">
                Ngobrol Sama Data Jualanmu.
              </h2>
              <p className="font-body text-body text-text-secondary">
                Tinggalkan dashboard rumit. Tanya stok, minta laporan, atau cek
                omzet semudah chatingan sama teman via WhatsApp. AI kami
                mengerti bahasa sehari-hari.
              </p>
            </div>
            {/* Right Visual (60% Bleeding) */}
            <div className="lg:col-span-7 relative min-h-[400px] lg:min-h-[500px] flex flex-col justify-end w-[110%] lg:w-[120%] -right-[5%] lg:-right-[10%]">
              <div className="w-full h-full bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col justify-end relative">
                {/* Fake WhatsApp UI */}
                <div className="relative z-10 w-full min-h-[350px] bg-[#0a0a0a]/80 backdrop-blur-md p-6 flex flex-col gap-4 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#0ea5e9] flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-[#0a0a0a]"
                        style={{ fontVariationSettings: '"FILL" 1' }}
                      >
                        smart_toy
                      </span>
                    </div>
                    <div>
                      <div className="font-bold">ShikiPilot AI</div>
                      <div className="text-xs text-[#0ea5e9]">Online</div>
                    </div>
                  </div>
                  {/* User Bubble */}
                  <div className="self-end mr-8 md:mr-20 bg-[#005c4b] text-[#e9edef] border border-white/10 p-4 rounded-2xl rounded-tr-none max-w-[80%]">
                    <p className="font-body text-body text-sm">
                      Produk apa aja yang tinggal dikit?
                    </p>
                  </div>
                  {/* AI Bubble */}
                  <div className="self-start bg-[#202c33] text-[#e9edef] border border-primary/30 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                    <p className="font-body text-body text-sm mb-2">
                      Tunggu sebentar ya Bos... Ini beberapa produk yang stoknya
                      masuk kategori kritis:
                    </p>
                    <ul className="list-disc pl-4 text-sm text-text-secondary space-y-1">
                      <li>
                        Kerupuk Tuna Pedas{" "}
                        <span className="text-error font-bold">(sisa 9)</span>
                      </li>
                      <li>
                        Kopi Susu Literan{" "}
                        <span className="text-error font-bold">(sisa 2)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5. How It Works (Hairline Minimalist) */}
      <section
        id="how-it-works"
        className="py-section-v-padding max-w-[1440px] w-full mx-auto px-6 lg:px-12 border-t border-white/10 relative z-0"
      >
        <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-section-h2-mobile md:font-section-h2 text-section-h2-mobile md:text-section-h2 mb-20 text-center">
            Jalan Pintas Ke Berhasil.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* Step 1 */}
            <div className="border-t border-b md:border-b-0 md:border-r border-white/10 p-12 relative flex flex-col items-center text-center">
              <span className="font-step-number text-step-number text-white/5 absolute -top-10 -left-4 z-0 pointer-events-none">
                01
              </span>
              <span
                className="material-symbols-outlined text-primary text-5xl mb-6 relative z-10"
                style={{ fontVariationSettings: '"FILL" 0' }}
              >
                login
              </span>
              <h3 className="text-2xl font-bold mb-4 relative z-10">
                Login Sekali Klik
              </h3>
              <p className="text-text-secondary font-body text-body relative z-10 text-sm">
                Gunakan akun Google atau nomor WhatsApp, tanpa perlu ingat
                password rumit.
              </p>
            </div>
            {/* Step 2 */}
            <div className="border-b md:border-b-0 md:border-r border-white/10 p-12 relative flex flex-col items-center text-center">
              <span className="font-step-number text-step-number text-white/5 absolute -top-10 -left-4 z-0 pointer-events-none">
                02
              </span>
              <span
                className="material-symbols-outlined text-primary text-5xl mb-6 relative z-10"
                style={{ fontVariationSettings: '"FILL" 0' }}
              >
                storefront
              </span>
              <h3 className="text-2xl font-bold mb-4 relative z-10">
                Daftarkan Toko
              </h3>
              <p className="text-text-secondary font-body text-body relative z-10 text-sm">
                Masukkan profil singkat usaha dan tambahkan beberapa produk
                pertama untuk mulai.
              </p>
            </div>
            {/* Step 3 */}
            <div className="border-b md:border-b-0 border-white/10 p-12 relative flex flex-col items-center text-center">
              <span className="font-step-number text-step-number text-white/5 absolute -top-10 -left-4 z-0 pointer-events-none">
                03
              </span>
              <span
                className="material-symbols-outlined text-primary text-5xl mb-6 relative z-10"
                style={{ fontVariationSettings: '"FILL" 0' }}
              >
                chat
              </span>
              <h3 className="text-2xl font-bold mb-4 relative z-10">
                Jualan Otomatis &amp; Pantau via Chat
              </h3>
              <p className="text-text-secondary font-body text-body relative z-10 text-sm">
                Kasir siap digunakan. Pantau semuanya lewat laporan chat
                WhatsApp tiap akhir hari.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

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
            <div className="bg-[#0a0a0a] border border-primary/30 rounded-[2rem] p-12 relative overflow-hidden shadow-[0_0_80px_-20px_rgba(14,165,233,0.3)]">
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
                  Asisten AI WhatsApp (Terbatas)
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
            Pertanyaan Umum.
          </h2>
          <div className="space-y-4 font-body text-body">
            <details className="group border border-white/10 rounded-[2rem] bg-white/5 overflow-hidden">
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
            <details className="group border border-white/10 rounded-[2rem] bg-white/5 overflow-hidden">
              <summary className="w-full px-8 py-6 text-left flex justify-between items-center font-bold text-lg hover:text-primary transition-colors focus:outline-none cursor-pointer list-none">
                Apakah data jualan saya aman?
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="px-8 pb-6 text-text-secondary">
                Sangat aman. Kami menggunakan enkripsi standar industri
                perbankan untuk melindungi data transaksi dan inventaris toko
                Anda.
              </div>
            </details>
            <details className="group border border-white/10 rounded-[2rem] bg-white/5 overflow-hidden">
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
      <section className="py-32 max-w-[1440px] w-full mx-auto px-6 lg:px-12 text-center relative border-t border-white/10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0ea5e9]/20 via-[#0a0a0a] to-[#0a0a0a]">
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
            className="inline-flex items-center justify-center bg-[#0ea5e9] text-[#0a0a0a] font-bold px-12 py-6 rounded-full text-xl hover:scale-105 hover:shadow-[0_0_50px_-10px_rgba(14,165,233,0.6)] active:scale-95 active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] transition-all duration-200"
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
