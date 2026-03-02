import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans bg-background-light dark:bg-background-dark text-slate-900 dark:text-text-main antialiased selection:bg-primary selection:text-white overflow-x-hidden">
      <div className="relative min-h-screen w-full flex flex-col">

        {/* ── Header ── */}
        <header className="w-full border-b border-surface-border bg-background-dark/80 backdrop-blur-md fixed top-0 z-50">
          <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 text-primary">
                <span className="material-symbols-outlined text-3xl">rocket_launch</span>
              </div>
              <h2 className="text-white text-xl font-black tracking-tight">ShikiPilot</h2>
            </div>
          </div>
        </header>

        <main className="flex-grow pt-16">

          {/* ── Hero ── */}
          <section className="relative px-6 py-20 lg:py-32 flex flex-col items-center justify-center text-center bg-background-dark">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-40 pointer-events-none"></div>
            <div className="relative max-w-4xl mx-auto flex flex-col gap-8 z-10">
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-surface-dark border border-surface-border mx-auto mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-xs font-medium text-text-muted tracking-wide uppercase">OPERASIONAL SISTEM NORMAL</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-white drop-shadow-lg">
                Sistem Manajemen Inventaris &amp; Micro-POS Cerdas{" "}
                <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-text-muted">untuk Bisnismu</span>
              </h1>
              <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
                Kelola inventaris dan transaksi dengan mudah dalam satu platform yang terintegrasi, modern, dan dirancang untuk kecepatan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                <Link
                  href="/dashboard"
                  className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-primary px-8 font-bold text-white transition-all duration-300 hover:bg-primary-hover hover:scale-105 hover:shadow-[0_0_20px_-5px_#f20d0d]"
                >
                  <span className="relative flex items-center gap-2">
                    BUKA DASHBOARD
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 text-lg">arrow_forward</span>
                  </span>
                </Link>
              </div>
            </div>
          </section>

          {/* ── System Modules ── */}
          <section className="px-6 py-24 bg-[#0a0a0a] border-y border-surface-border relative overflow-hidden">
            <div className="max-w-[1280px] mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">System Modules</h2>
                <p className="max-w-2xl mx-auto font-mono text-xs uppercase tracking-widest text-primary">Eksplorasi Ekosistem ShikiPilot</p>
              </div>

              <div className="flex flex-col gap-32">

                {/* ── Module 1: Dashboard ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Mock */}
                  <div className="order-2 lg:order-1 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-red-900 rounded-xl blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative rounded-xl bg-surface-dark border border-surface-border overflow-hidden shadow-2xl">
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-surface-border bg-[#050505]">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                        <div className="text-[10px] font-mono text-text-muted ml-2">TERMINAL // DASHBOARD_OVERVIEW</div>
                      </div>
                      <div className="bg-[#0a0a0a] p-4 aspect-[16/10] grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-white">
                        {/* Stock Levels */}
                        <div className="col-span-1 md:col-span-1 border border-surface-border bg-surface-dark/30 p-3 rounded flex flex-col">
                          <h4 className="text-[10px] font-bold uppercase mb-4 tracking-wider text-white">Current Stock Levels</h4>
                          <div className="space-y-3 flex-1 overflow-hidden">
                            {[
                              { name: "Kerupuk Tuna Bawang", pct: "100%", val: "100" },
                              { name: "Kerupuk Tuna Pedas", pct: "100%", val: "100" },
                              { name: "Tuna Rasa Sayange", pct: "75%", val: "75" },
                              { name: "Kerupuk Tuna Original", pct: "80%", val: "80" },
                              { name: "Kerupuk udang kecil", pct: "20%", val: "20" },
                              { name: "Kerupuk cumi pedas", pct: "70%", val: "70" },
                            ].map((item) => (
                              <div key={item.name} className="flex items-center gap-2 text-[8px]">
                                <span className="w-24 text-right truncate text-text-muted">{item.name}</span>
                                <div className="flex-1 h-3 bg-surface-dark rounded-sm overflow-hidden relative border border-surface-border">
                                  <div className={`absolute top-0 left-0 h-full bg-primary`} style={{ width: item.pct }}></div>
                                </div>
                                <span className="w-6 text-right">{item.val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Asset Distribution */}
                        <div className="col-span-1 md:col-span-1 border border-surface-border bg-surface-dark/30 p-3 rounded flex flex-col items-center justify-between">
                          <h4 className="text-[10px] font-bold uppercase mb-2 tracking-wider text-white w-full text-left">Asset Distribution</h4>
                          <div className="relative w-28 h-28 flex items-center justify-center my-2">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#2a1010" strokeWidth="16"></circle>
                              <circle className="opacity-80" cx="50" cy="50" fill="transparent" r="40" stroke="#f20d0d" strokeDasharray="251.2" strokeDashoffset="150" strokeWidth="16"></circle>
                              <circle className="opacity-90" cx="50" cy="50" fill="transparent" r="40" stroke="#991b1b" strokeDasharray="251.2" strokeDashoffset="200" strokeWidth="16"></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-[8px] text-text-muted">TOTAL ASET</span>
                              <span className="text-xs font-bold text-white">Rp 10.7Jt</span>
                            </div>
                          </div>
                          <div className="w-full text-[8px] space-y-1 mt-2 border-t border-surface-border pt-2">
                            <div className="flex justify-between items-center"><div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span><span className="text-text-muted">Tuna Pedas</span></div><span>18.6%</span></div>
                            <div className="flex justify-between items-center"><div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-900"></span><span className="text-text-muted">Ikan Paus</span></div><span>18.6%</span></div>
                            <div className="flex justify-between items-center"><div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-700"></span><span className="text-text-muted">Rasa Bawang</span></div><span>15.8%</span></div>
                          </div>
                        </div>
                        {/* Event Log */}
                        <div className="col-span-1 md:col-span-1 border border-surface-border bg-surface-dark/30 p-3 rounded flex flex-col">
                          <h4 className="text-[10px] font-bold uppercase mb-4 tracking-wider text-white">Event Log</h4>
                          <div className="space-y-4 text-[9px] flex-1 overflow-y-auto pr-1">
                            {[
                              { title: "New Assets Registered via AI", sub: "[1] items", date: "27 Feb • 19:33", active: true },
                              { title: "New Asset Registered", sub: "Kerupuk Tuna Original", date: "27 Feb • 12:22", active: false },
                              { title: "New Asset Registered", sub: "Kerupuk Tuna Rasa Sayange", date: "27 Feb • 12:20", active: false },
                              { title: "Asset Parameters Updated", sub: "Kerupuk Tuna Pedas", date: "24 Feb • 18:33", active: false },
                            ].map((ev, i) => (
                              <div key={i} className="relative pl-3 border-l border-surface-border">
                                <div className={`absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-full ${ev.active ? "bg-primary" : "bg-surface-border"}`}></div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-white font-bold">{ev.title}</span>
                                  <span className="text-text-muted text-[8px]">{ev.sub}</span>
                                  <div className="flex items-center gap-1 text-[8px] text-text-muted mt-0.5">
                                    <span className="material-symbols-outlined text-[10px]">schedule</span> {ev.date}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Copy */}
                  <div className="order-1 lg:order-2">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-primary text-3xl">dashboard</span>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Dashboard Interaktif</h3>
                    </div>
                    <p className="text-text-muted leading-relaxed mb-6">Pusat kendali operasional bisnis Anda. Pantau metrik kunci, nilai aset, dan status produk dalam satu tampilan yang terorganisir.</p>
                    <ul className="space-y-3 mb-8">
                      {["Real-time asset valuation", "Status stok instan", "Ringkasan performa harian"].map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>
                          <span className="text-sm text-text-muted">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ── Module 2: Inventory ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Copy */}
                  <div className="order-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Manajemen Aset Lengkap</h3>
                    </div>
                    <p className="text-text-muted leading-relaxed mb-6">Kelola ribuan SKU dengan mudah. Fitur pencarian canggih, filter status, dan manajemen stok yang intuitif.</p>
                    <ul className="space-y-3 mb-8">
                      {["Import cepat via AI", "Pelacakan ID Produk unik", "Manajemen multi-varian"].map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>
                          <span className="text-sm text-text-muted">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Mock */}
                  <div className="order-2 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-l from-primary to-red-900 rounded-xl blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative rounded-xl bg-surface-dark border border-surface-border overflow-hidden shadow-2xl">
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-surface-border bg-[#050505]">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                        <div className="text-[10px] font-mono text-text-muted ml-2">TERMINAL // INVENTORY_LIST</div>
                      </div>
                      <div className="bg-[#0a0a0a] p-6 aspect-[16/10] flex flex-col gap-4 font-mono text-xs">
                        <div className="flex justify-between items-center pb-4 border-b border-surface-border/30">
                          <div>
                            <h3 className="text-white text-xl font-bold font-sans uppercase tracking-widest">Full Asset List</h3>
                            <p className="text-text-muted text-[10px] mt-1">TERMINAL / INVENTORY</p>
                          </div>
                          <button className="px-3 py-1.5 border border-primary text-primary text-[10px] hover:bg-primary hover:text-white transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">auto_awesome</span>
                            Import Cepat (AI)
                          </button>
                        </div>
                        <div className="border border-surface-border bg-surface-dark/30 flex-1 relative overflow-hidden">
                          <div className="grid grid-cols-6 gap-2 text-[9px] text-text-muted border-b border-surface-border/30 p-3 bg-surface-dark/50">
                            <span className="col-span-1">ID</span>
                            <span className="col-span-2">PRODUCT NAME</span>
                            <span className="text-center">STATUS</span>
                            <span className="text-right">PRICE</span>
                            <span className="text-right">STOCK</span>
                          </div>
                          <div className="p-3 space-y-4">
                            {[
                              { id: "#c7c4", name: "Kerupuk Tuna Rasa Bawang", price: "17.000", stock: "100" },
                              { id: "#149a", name: "Kerupuk Tuna Pedas", price: "20.000", stock: "100" },
                              { id: "#052c", name: "Kerupuk Tuna Sayange", price: "20.000", stock: "75" },
                              { id: "#a7e7", name: "Kerupuk Tuna Original", price: "15.000", stock: "80" },
                            ].map((p) => (
                              <div key={p.id} className="grid grid-cols-6 gap-2 items-center text-white text-[10px]">
                                <span className="text-text-muted">{p.id}</span>
                                <span className="col-span-2 font-bold">{p.name}</span>
                                <div className="text-center"><span className="px-1.5 py-0.5 bg-green-900/30 text-green-500 text-[8px] border border-green-900/50">ACTIVE</span></div>
                                <span className="text-right">{p.price}</span>
                                <span className="text-right">{p.stock}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Module 3: Micro-POS ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Mock */}
                  <div className="order-2 lg:order-1 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-red-900 rounded-xl blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative rounded-xl bg-surface-dark border border-surface-border overflow-hidden shadow-2xl">
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-surface-border bg-[#050505]">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                        <div className="text-[10px] font-mono text-text-muted ml-2">TERMINAL // MICRO_POS</div>
                      </div>
                      <div className="bg-[#0a0a0a] p-6 aspect-[16/10] flex flex-col gap-4 font-mono text-xs">
                        <div className="flex justify-between items-center pb-2">
                          <div>
                            <h3 className="text-white text-xl font-bold font-sans uppercase tracking-widest">Keranjang Pintar</h3>
                            <p className="text-text-muted text-[10px] mt-1">TERMINAL // MICRO-POS</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { name: "Kerupuk Tuna Bawang", price: "Rp 17.000", stock: 100 },
                            { name: "Kerupuk Tuna Pedas", price: "Rp 20.000", stock: 100 },
                            { name: "Kerupuk Tuna Sayange", price: "Rp 20.000", stock: 75 },
                          ].map((p) => (
                            <div key={p.name} className="border border-surface-border bg-surface-dark/30 p-2 relative group hover:border-primary/50 transition-colors cursor-pointer">
                              <p className="text-[9px] text-white font-bold mb-1">{p.name}</p>
                              <p className="text-lg text-cyan-400 font-bold">{p.price}</p>
                              <div className="flex justify-between mt-2 text-[9px] text-text-muted">
                                <span>Stok: {p.stock}</span>
                                <span className="text-primary">+</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border border-surface-border border-dashed bg-surface-dark/10 flex-1 flex flex-col items-center justify-center text-text-muted py-6">
                          <span className="material-symbols-outlined text-3xl mb-2 opacity-50">shopping_cart</span>
                          <p className="text-[10px]">Keranjang kosong. Tap produk untuk menambah.</p>
                        </div>
                        <div className="mt-auto">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] uppercase">Grand Total</span>
                            <span className="text-xl font-bold text-cyan-400">Rp 0</span>
                          </div>
                          <button className="w-full bg-cyan-900/50 hover:bg-cyan-800 text-cyan-100 border border-cyan-700 py-3 uppercase tracking-wider font-bold text-[10px]">
                            Simpan Transaksi
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Copy */}
                  <div className="order-1 lg:order-2">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-primary text-3xl">point_of_sale</span>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Micro-POS / Keranjang Pintar</h3>
                    </div>
                    <p className="text-text-muted leading-relaxed mb-6">Sistem kasir ringkas yang dirancang untuk kecepatan transaksi. Tambahkan produk ke keranjang dengan satu klik dan proses pembayaran instan.</p>
                    <ul className="space-y-3 mb-8">
                      {["Desain grid responsif", "Kalkulasi total otomatis", "Antarmuka kontras tinggi"].map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>
                          <span className="text-sm text-text-muted">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ── Module 4: Analytics ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Copy */}
                  <div className="order-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-primary text-3xl">analytics</span>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Analytics &amp; Business Intelligence</h3>
                    </div>
                    <p className="text-text-muted leading-relaxed mb-6">Visualisasikan pertumbuhan bisnis Anda. Dari grafik pendapatan mingguan hingga analisis produk terlaris.</p>
                    <ul className="space-y-3 mb-8">
                      {["Export data ke CSV", "Grafik tren pendapatan", "Analisis kontribusi produk"].map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>
                          <span className="text-sm text-text-muted">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Mock */}
                  <div className="order-2 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-l from-primary to-red-900 rounded-xl blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative rounded-xl bg-surface-dark border border-surface-border overflow-hidden shadow-2xl">
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-surface-border bg-[#050505]">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                        <div className="text-[10px] font-mono text-text-muted ml-2">TERMINAL // ANALYTICS_BI</div>
                      </div>
                      <div className="bg-[#0a0a0a] p-4 aspect-[16/10] flex flex-col gap-4 font-mono text-xs text-white">
                        <div className="flex justify-between items-center pb-2 border-b border-surface-border/30">
                          <div>
                            <h3 className="text-white text-xl font-bold font-sans uppercase tracking-widest">Revenue Over Time</h3>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-2 py-1 border border-surface-border text-[9px] hover:text-white flex items-center gap-1 hover:bg-surface-dark/50">
                              <span className="material-symbols-outlined text-[10px]">download</span> Export CSV
                            </button>
                            <div className="flex border border-surface-border rounded overflow-hidden">
                              <span className="px-2 py-1 bg-surface-dark text-[9px] text-text-muted cursor-pointer hover:text-white border-r border-surface-border">Daily</span>
                              <span className="px-2 py-1 bg-cyan-900/40 text-cyan-400 text-[9px] font-bold">Weekly</span>
                              <span className="px-2 py-1 bg-surface-dark text-[9px] text-text-muted cursor-pointer hover:text-white border-l border-surface-border">Monthly</span>
                            </div>
                          </div>
                        </div>
                        <div className="h-40 border border-surface-border bg-surface-dark/20 p-2 relative overflow-hidden">
                          <div className="absolute top-2 left-2 text-[9px] text-text-muted z-10">750k</div>
                          <div className="absolute bottom-6 left-2 text-[9px] text-text-muted z-10">0</div>
                          <div className="w-full h-full relative flex items-end">
                            <svg className="w-full h-[85%] overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                              <defs>
                                <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6"></stop>
                                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"></stop>
                                </linearGradient>
                              </defs>
                              <path d="M0,80 C15,60 30,10 50,20 S 75,50 100,80 L100,100 L0,100 Z" fill="url(#revenueGradient)"></path>
                              <path d="M0,80 C15,60 30,10 50,20 S 75,50 100,80" fill="none" stroke="#22d3ee" strokeWidth="0.5" vectorEffect="non-scaling-stroke"></path>
                            </svg>
                            <div className="absolute bottom-0 w-full flex justify-between px-2 text-[8px] text-text-muted pt-2 border-t border-surface-border/30">
                              {["Week 1","Week 2","Week 3","Week 4","Week 5","Week 6","Week 7","Week 8"].map((w) => (
                                <span key={w}>{w}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          {/* Top Products */}
                          <div className="border border-surface-border bg-surface-dark/20 p-3 flex flex-col">
                            <h4 className="text-[9px] font-bold uppercase mb-2 tracking-wider text-white">Produk Terlaris (Unit)</h4>
                            <div className="flex-1 flex flex-col justify-center gap-3">
                              {[
                                { name: "Kerupuk Tuna Rasa Bawang", val: 148, pct: "90%" },
                                { name: "Kerupuk Tuna Pedas", val: 76, pct: "45%" },
                              ].map((p) => (
                                <div key={p.name} className="group relative">
                                  <div className="flex items-center justify-between mb-1 text-[8px]">
                                    <span className="text-white transform -rotate-12 origin-bottom-left block w-20 truncate">{p.name}</span>
                                    <span className="text-text-muted">{p.val}</span>
                                  </div>
                                  <div className="w-full h-6 bg-surface-dark border border-surface-border relative">
                                    <div className="absolute left-0 top-0 h-full bg-cyan-400" style={{ width: p.pct }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between text-[7px] text-text-muted mt-1 px-1 border-t border-surface-border/20 pt-1">
                              {["0","40","80","120","160"].map((n) => <span key={n}>{n}</span>)}
                            </div>
                          </div>
                          {/* Revenue Contribution */}
                          <div className="border border-surface-border bg-surface-dark/20 p-3 flex flex-col items-center">
                            <h4 className="text-[9px] font-bold uppercase mb-1 tracking-wider text-white w-full text-left">Kontribusi Pendapatan</h4>
                            <div className="relative w-24 h-24 my-auto">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#164e63" strokeWidth="12"></circle>
                                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#22d3ee" strokeDasharray="251.2" strokeDashoffset="100" strokeWidth="12"></circle>
                                <circle className="opacity-90" cx="50" cy="50" fill="transparent" r="40" stroke="#f20d0d" strokeDasharray="251.2" strokeDashoffset="220" strokeWidth="12"></circle>
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[7px] text-text-muted uppercase">Total</span>
                                <span className="text-[10px] font-bold text-white">Rp 4.0Jt</span>
                              </div>
                            </div>
                            <div className="w-full mt-1 space-y-1">
                              <div className="flex justify-between items-center text-[7px]">
                                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div><span className="text-text-muted truncate max-w-[60px]">Rasa Bawang</span></div>
                                <span className="text-white">62%</span>
                              </div>
                              <div className="flex justify-between items-center text-[7px]">
                                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div><span className="text-text-muted truncate max-w-[60px]">Tuna Pedas</span></div>
                                <span className="text-white">38%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Module 5: AI Assistant ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Mock */}
                  <div className="order-2 lg:order-1 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-red-900 rounded-xl blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative rounded-xl bg-surface-dark border border-surface-border overflow-hidden shadow-2xl">
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-surface-border bg-[#050505]">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                        <div className="text-[10px] font-mono text-text-muted ml-2">TERMINAL // AI_ASSISTANT</div>
                      </div>
                      <div className="bg-[#0a0a0a] p-6 aspect-[16/10] flex flex-col gap-4 font-mono text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-surface-border/30">
                          <div>
                            <h3 className="text-white text-xl font-bold font-sans uppercase tracking-widest">Communication // AI</h3>
                            <p className="text-text-muted text-[10px] mt-1">TERMINAL / AI ASSISTANT</p>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                          <div className="bg-surface-dark/50 border border-surface-border p-3 rounded-lg rounded-tl-none max-w-[90%]">
                            <p className="text-text-muted leading-relaxed">Halo! Kamu sedang berbicara dengan <strong className="text-white">ShikiPilot</strong>, asisten toko di sini. Ada yang bisa saya bantu terkait produk kami?</p>
                          </div>
                          <div className="bg-primary text-white p-3 rounded-lg rounded-tr-none ml-auto max-w-[90%] shadow-[0_0_15px_-5px_rgba(242,13,13,0.5)]">
                            <p className="leading-relaxed">aku perlu analisis terkait produk tokoku, produk mana yang memberikan kontribusi paling besar ke total aset?</p>
                          </div>
                          <div className="bg-surface-dark/50 border border-surface-border p-3 rounded-lg rounded-tl-none max-w-[95%]">
                            <p className="text-text-muted leading-relaxed mb-2">Tentu, sebagai ShikiPilot, saya akan membantu menganalisis data produk yang tersedia saat ini:</p>
                            <p className="text-white font-bold mb-1">1. Kontribusi Aset Terbesar</p>
                            <p className="text-text-muted leading-relaxed mb-2">Berdasarkan perhitungan nilai stok (Harga x Stok), berikut adalah rinciannya:</p>
                            <div className="pl-2 border-l-2 border-primary/50 my-2 text-[10px]">
                              <p className="text-white"><strong className="text-white">Kerupuk Tuna Pedas:</strong> Rp 20.000 x 100 = <span className="text-cyan-400">Rp 2.000.000</span></p>
                              <p className="text-text-muted"><strong className="text-white">Kerupuk Tuna Rasa Bawang:</strong> Rp 17.000 x 100 = Rp 1.700.000</p>
                            </div>
                            <p className="text-text-muted leading-relaxed">Produk yang memberikan kontribusi paling besar ke total aset toko Anda saat ini adalah <strong className="text-white">Kerupuk Tuna Pedas</strong>.</p>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <input
                            className="flex-1 bg-transparent border border-surface-border rounded p-2 text-white focus:border-primary focus:ring-0 text-xs placeholder:text-text-muted/50"
                            placeholder="Tanya tentang produk..."
                            type="text"
                            readOnly
                          />
                          <button className="bg-primary/90 hover:bg-primary text-white px-4 rounded font-bold text-xs uppercase tracking-wide transition-colors">Kirim</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Copy */}
                  <div className="order-1 lg:order-2">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-primary text-3xl">smart_toy</span>
                      <h3 className="text-2xl font-bold text-white tracking-tight">AI Assistant</h3>
                    </div>
                    <p className="text-text-muted leading-relaxed mb-6">Asisten cerdas yang memahami data toko Anda. Dapatkan rekomendasi stok, analisis performa, dan jawaban instan untuk pertanyaan bisnis Anda.</p>
                    <ul className="space-y-3 mb-8">
                      {["Analisis natural language", "Rekomendasi stok cerdas", "Integrasi data real-time"].map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>
                          <span className="text-sm text-text-muted">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ── Features Grid ── */}
          <section className="px-6 py-24 bg-[#0a0a0a] border-t border-surface-border">
            <div className="max-w-[1280px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "inventory",
                    title: "Manajemen Inventaris Real-time",
                    desc: "Pantau pergerakan stok secara langsung dengan akurasi tinggi. Notifikasi otomatis saat stok menipis untuk menjaga ketersediaan barang.",
                  },
                  {
                    icon: "analytics",
                    title: "Analitik Penjualan Cerdas",
                    desc: "Visualisasi data penjualan mendalam untuk pengambilan keputusan strategis. Pahami tren pasar dan perilaku pelanggan Anda.",
                  },
                  {
                    icon: "shield_lock",
                    title: "Keamanan Data Berlapis",
                    desc: "Perlindungan data end-to-end dengan enkripsi standar industri. Pastikan data transaksi dan pelanggan Anda tetap aman.",
                  },
                ].map((card) => (
                  <div key={card.title} className="group flex flex-col items-start p-8 bg-transparent border border-red-900/30 hover:border-primary transition-colors duration-300 rounded-lg h-full">
                    <div className="mb-6 text-primary">
                      <span className="material-symbols-outlined text-4xl font-light">{card.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{card.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed font-light">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-surface-border bg-surface-dark py-12 px-6">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">rocket_launch</span>
              <span className="text-white font-bold text-lg">ShikiPilot</span>
            </div>
            <p className="text-text-muted text-sm text-center md:text-right">© 2026 ShikiPilot. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
