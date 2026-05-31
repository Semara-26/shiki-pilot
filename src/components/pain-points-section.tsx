"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type PainPoint = {
  id: number;
  image: string;
  title: string;
  desc: string;
  modalTitle: string;
  modalDesc: string;
};

const painPoints: PainPoint[] = [
  {
    id: 1,
    image: "/ilustrasi stok gaib.png",
    title: "Misteri Stok Gaib",
    desc: "Di buku catatannya sisa 20, tapi pas dicek di rak cuma ada 5.",
    modalTitle: "Kunci Kebocoran Stok Anda.",
    modalDesc:
      "Jangan biarkan selisih barang menggerus profit. ShikiPilot melacak setiap mutasi barang masuk dan keluar secara real-time. Pantau sisa stok akurat kapan saja, di mana saja, tanpa perlu bongkar gudang tiap hari.",
  },
  {
    id: 2,
    image: "/ilustrasi card 2.png",
    title: "Malam Minggu Rekap Laporan?",
    desc: "Pusing kumpulin nota lecek dan hitung manual tiap akhir bulan.",
    modalTitle: "Laporan Instan, Tanpa Begadang.",
    modalDesc:
      "Tinggalkan tumpukan kertas dan Excel yang rumit. Sistem kami mengkalkulasi setiap transaksi secara otomatis. Hasilkan laporan penjualan, performa produk, hingga laba rugi bulanan hanya dengan satu klik.",
  },
  {
    id: 3,
    image: "/ilustrasi card 3.png",
    title: "Antrean Panjang Bikin Kabur",
    desc: "Kasir manual yang lambat bikin pelanggan malas balik lagi.",
    modalTitle: "Transaksi Secepat Kilat.",
    modalDesc:
      "Layani pelanggan lebih cepat dengan Micro-POS terintegrasi. Cari barang, hitung totalan, hingga proses pembayaran digital (QRIS Statis) selesai dalam hitungan detik. Buat pelanggan terkesan dengan pelayanan responsif.",
  },
];

export function PainPointsSection() {
  const [activeModal, setActiveModal] = useState<PainPoint | null>(null);

  return (
    <section className="py-section-v-padding max-w-[1440px] w-full mx-auto px-6 lg:px-12 relative z-0">
      <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-5xl font-extrabold text-white text-center">
          Bisnis Makin Ramai, Tapi Operasional Makin Kacau?
        </h2>
        <p className="text-zinc-400 text-center mt-4 max-w-2xl mx-auto">
          Waktumu terlalu berharga untuk ngurusin nota lecek dan selisih stok.
          Biar ShikiPilot yang bereskan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {painPoints.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveModal(item)}
              className={`bg-zinc-900/50 border border-white/5 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] group relative ${
                item.id === 1
                  ? "md:col-span-2 flex flex-col md:flex-row items-center justify-between overflow-hidden"
                  : "col-span-1 flex flex-col justify-between h-full"
              }`}
            >
              <div
                className={
                  item.id === 1 ? "md:w-1/2 flex flex-col" : "flex flex-col"
                }
              >
                <h3 className="text-xl font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-zinc-400 text-sm flex-grow">{item.desc}</p>
                <span className="text-sm text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity mt-6 self-start">
                  Lihat Solusi ➔
                </span>
              </div>

              {item.id === 1 ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full md:w-1/2 h-48 md:h-64 object-contain mt-6 md:mt-0 drop-shadow-2xl group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500"
                />
              ) : (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-40 object-contain mt-8 drop-shadow-2xl group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500 self-end"
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pop-up Modal */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-zinc-950 border border-white/10 rounded-2xl p-8 max-w-lg w-full relative animate-[zoomIn_0.3s_ease-out_forwards]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
              {activeModal.modalTitle}
            </h3>
            <p className="text-zinc-300 leading-relaxed">
              {activeModal.modalDesc}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
