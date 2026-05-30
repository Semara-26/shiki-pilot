"use client";

interface SplashScreenProps {
  isHeroLoaded: boolean;
}

export function SplashScreen({ isHeroLoaded }: SplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-zinc-950 transition-opacity duration-700 ease-in-out ${
        isHeroLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Logo & Ripple */}
      <div className="relative flex items-center justify-center">
        {/* Ripple efek di belakang logo (slow-ping kustom) */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-slow-ping" />
        {/* Logo */}
        <img
          src="/logo-new-png.png"
          alt="ShikiPilot Logo"
          className="relative z-10 w-16 h-16 object-contain"
        />
      </div>

      {/* Nama Brand */}
      <p className="mt-5 font-bold text-xl tracking-tight text-white">
        ShikiPilot
      </p>
      <p className="mt-1 text-xs text-zinc-500 tracking-widest uppercase">
        Memuat pengalaman terbaik...
      </p>

      {/* Loading Bar */}
      <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-zinc-800">
        {isHeroLoaded ? (
          /* Hero selesai: langsung ke 100% */
          <div className="h-full bg-cyan-500 w-full transition-all duration-500 ease-out" />
        ) : (
          /* Hero sedang dimuat: animasi fake-progress 0→80% */
          <div className="h-full bg-cyan-500 animate-fake-progress" />
        )}
      </div>
    </div>
  );
}
