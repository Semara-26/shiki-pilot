export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 max-w-[1440px] w-full mx-auto px-6 lg:px-12 border-t border-white/10 relative z-0"
    >
      <div className="text-center mb-20 relative z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
          Setup Cepat. Cuma Butuh 3 Menit.
        </h2>
        <p className="text-zinc-400 font-body text-body max-w-2xl mx-auto">
          Tidak perlu instalasi rumit atau pelatihan berjam-jam. Mulai
          digitalisasi tokomu hari ini juga.
        </p>
      </div>

      {/* Desktop View: S-Curve Absolute Layout */}
      <div className="relative max-w-5xl mx-auto min-h-[1000px] hidden md:block">
        {/* SVG S-Curve Path */}
        <svg
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 1000 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 850 100 C 400 100, 150 200, 150 330 C 150 500, 850 500, 850 660 C 850 800, 400 900, 150 900"
            stroke="url(#cyan-glow-gradient)"
            strokeWidth="4"
            strokeDasharray="10 10"
            className="drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]"
          />
          <defs>
            <linearGradient
              id="cyan-glow-gradient"
              x1="850"
              y1="100"
              x2="150"
              y2="900"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#06b6d4" />
              <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </svg>

        {/* Step 1 */}
        <div className="absolute top-0 right-4 lg:right-12 z-10">
          <div className="relative w-[350px] bg-zinc-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm group hover:-translate-y-2 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-300 hover:z-[999]">
            <span className="text-6xl font-black text-white/5 absolute -top-4 -right-4 group-hover:text-cyan-500/20 group-hover:scale-110 transition-all duration-500 pointer-events-none">
              01
            </span>
            <div className="text-4xl mb-4 relative z-10">🚀</div>
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
              Login Sekali Klik
            </h3>
            <p className="text-zinc-400 text-sm relative z-10">
              Gunakan akun Google atau Github, tanpa perlu ingat password rumit.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="absolute top-[33%] left-4 lg:left-12 -translate-y-1/2 z-10">
          <div className="relative w-[350px] bg-zinc-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm group hover:-translate-y-2 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-300 hover:z-[999]">
            <span className="text-6xl font-black text-white/5 absolute -top-4 -right-4 group-hover:text-cyan-500/20 group-hover:scale-110 transition-all duration-500 pointer-events-none">
              02
            </span>
            <div className="text-4xl mb-4 relative z-10">🏪</div>
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
              Daftarkan Toko
            </h3>
            <p className="text-zinc-400 text-sm relative z-10">
              Masukkan profil singkat usaha dan tambahkan beberapa produk
              pertama untuk mulai.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="absolute top-[66%] right-4 lg:right-12 -translate-y-1/2 z-10">
          <div className="relative w-[350px] bg-zinc-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm group hover:-translate-y-2 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-300 hover:z-[999]">
            <span className="text-6xl font-black text-white/5 absolute -top-4 -right-4 group-hover:text-cyan-500/20 group-hover:scale-110 transition-all duration-500 pointer-events-none">
              03
            </span>
            <div className="text-4xl mb-4 relative z-10">💳</div>
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
              Mulai Transaksi
            </h3>
            <p className="text-zinc-400 text-sm relative z-10">
              Layani pembeli dengan Micro-POS. Tambah ke keranjang dan terima
              pembayaran digital dalam hitungan detik.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="absolute bottom-0 left-4 lg:left-12 z-10">
          <div className="relative w-[350px] bg-zinc-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm group hover:-translate-y-2 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-300 hover:z-[999]">
            <span className="text-6xl font-black text-white/5 absolute -top-4 -right-4 group-hover:text-cyan-500/20 group-hover:scale-110 transition-all duration-500 pointer-events-none">
              04
            </span>
            <div className="text-4xl mb-4 relative z-10">💬</div>
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
              Pantau & Evaluasi
            </h3>
            <p className="text-zinc-400 text-sm relative z-10">
              Ngobrol dengan AI via WhatsApp untuk cek stok, atau unduh laporan
              penjualan via halaman analitik dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile View: Vertical Stack */}
      <div className="relative pl-12 md:hidden flex flex-col gap-12 max-w-md mx-auto">
        <div className="absolute left-[22px] top-4 bottom-4 w-0 border-l-2 border-dashed border-cyan-500/50 z-0"></div>

        {/* Step 1 */}
        <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-6 relative z-10">
          <div className="absolute -left-12 top-4 w-10 h-10 rounded-full bg-zinc-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 font-bold z-10">
            1
          </div>
          <h3 className="text-xl font-bold text-white mb-2 mt-1">
            Login Sekali Klik
          </h3>
          <p className="text-zinc-400 text-sm">
            Gunakan akun Google atau Github, tanpa perlu ingat password rumit.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-6 relative z-10">
          <div className="absolute -left-12 top-4 w-10 h-10 rounded-full bg-zinc-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 font-bold z-10">
            2
          </div>
          <h3 className="text-xl font-bold text-white mb-2 mt-1">
            Daftarkan Toko
          </h3>
          <p className="text-zinc-400 text-sm">
            Masukkan profil singkat usaha dan tambahkan beberapa produk pertama
            untuk mulai.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-6 relative z-10">
          <div className="absolute -left-12 top-4 w-10 h-10 rounded-full bg-zinc-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 font-bold z-10">
            3
          </div>
          <h3 className="text-xl font-bold text-white mb-2 mt-1">
            Mulai Transaksi
          </h3>
          <p className="text-zinc-400 text-sm">
            Layani pembeli dengan Micro-POS. Tambah ke keranjang dan terima
            pembayaran digital dalam hitungan detik.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-6 relative z-10">
          <div className="absolute -left-12 top-4 w-10 h-10 rounded-full bg-zinc-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 font-bold z-10">
            4
          </div>
          <h3 className="text-xl font-bold text-white mb-2 mt-1">
            Pantau & Evaluasi
          </h3>
          <p className="text-zinc-400 text-sm">
            Ngobrol dengan AI via WhatsApp untuk cek stok, atau unduh laporan
            penjualan via halaman analitik dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}
