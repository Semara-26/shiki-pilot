"use client";

import { useState } from "react";

const features = [
  {
    title: "AI Assistant",
    headline: "Ngobrol Sama Data Jualanmu.",
    desc: "Tinggalkan dashboard rumit. Tanya stok, minta laporan, atau cek omzet semudah chatingan via WhatsApp.",
    image: "/screenshoot AI Assistant WA.png",
  },
  {
    title: "Micro-POS",
    headline: "Transaksi Cepat, Antrean Minggat.",
    desc: "Tambahkan produk dengan satu tap, dan selesaikan pembayaran pelanggan melalui Cash atau QRIS Statis dalam hitungan detik.",
    image: "/screenshoot kasir.png",
  },
  {
    title: "Analitik Data",
    headline: "Pantau Performa Bisnis.",
    desc: "Pantau metrik krusial seperti total pendapatan dan produk terlaris secara real-time untuk strategi bisnis yang lebih cerdas.",
    image: "/screenshoot analitik.png",
  },
  {
    title: "Laporan PDF",
    headline: "Ekspor Laporan Sekali Klik.",
    desc: "Seluruh riwayat transaksi Anda dirangkum otomatis ke dalam dokumen PDF profesional yang siap dibagikan atau dicetak.",
    image: "/screenshoot laporan pdf.png",
  },
];

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section
      id="features"
      className="py-24 container mx-auto px-4 relative z-0 border-t border-white/10"
    >
      {/* Background glow optional to keep consistency */}
      <div className="absolute top-[-10%] left-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none"></div>

      <div className="text-center relative z-10">
        <span className="font-label-mono text-cyan-500 uppercase tracking-widest text-sm">
          FITUR UNGGULAN
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold mt-4 text-white">
          Satu Platform, Semua Kebutuhan UMKM Anda
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12 items-center relative z-10">
        {/* Kolom Kiri: Tab Interaktif */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex flex-col text-left p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${
                activeTab === index
                  ? "bg-zinc-900 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                  : "bg-transparent border-transparent hover:bg-zinc-900/50 opacity-50 hover:opacity-100"
              }`}
            >
              <h4 className="text-sm text-cyan-500 font-bold uppercase tracking-wider mb-2">
                {feature.title}
              </h4>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                {feature.headline}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Kolom Kanan: CSS Mockup Browser */}
        <div className="lg:col-span-7">
          <div className="rounded-xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden flex flex-col relative min-h-[300px]">
            {/* Top Bar Mockup */}
            <div className="bg-zinc-900 px-4 py-3 flex gap-2 border-b border-white/5 items-center">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>

            {/* Image Container */}
            <div className="relative">
              <img
                key={activeTab}
                src={features[activeTab].image}
                alt={features[activeTab].title}
                className="w-full object-cover animate-[fadeIn_0.5s_ease-in-out]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
