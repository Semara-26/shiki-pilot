"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const MICRO_COPY = [
  "Menyiapkan ruang kerja...",
  "Memuat aset visual...",
  "Mengoptimalkan pengalaman Anda...",
];

interface SplashScreenProps {
  isHeroLoaded: boolean;
}

export function SplashScreen({ isHeroLoaded }: SplashScreenProps) {
  const [isMounted, setIsMounted] = useState(true);

  // Unmount setelah fade-out selesai agar animasi SVG tidak berjalan di background
  useEffect(() => {
    if (isHeroLoaded) {
      // Beri waktu 700ms untuk transisi opacity selesai, baru unmount
      const unmountTimer = setTimeout(() => {
        setIsMounted(false);
      }, 750);
      return () => clearTimeout(unmountTimer);
    }
  }, [isHeroLoaded]);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-zinc-950 transition-opacity duration-700 ease-in-out ${
        isHeroLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={isHeroLoaded}
    >
      {/* ── Logo + SVG Edge-Trace Ring ─────────────────────────────── */}
      <div className="relative flex items-center justify-center w-28 h-28">
        {/* Outer slow-ping ripple */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-slow-ping" />

        {/* SVG Edge-Trace: cahaya merambat mengelilingi logo */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 112 112"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Track circle (dim) */}
          <circle
            cx="56"
            cy="56"
            r="52"
            stroke="rgba(34,211,238,0.12)"
            strokeWidth="2"
          />
          {/* Animated trace circle */}
          <circle
            cx="56"
            cy="56"
            r="52"
            stroke="rgba(34,211,238,0.9)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="327"
            strokeDashoffset="327"
            style={{
              filter: "drop-shadow(0 0 8px rgba(34,211,238,0.8))",
              animation:
                "svg-trace-run 2.4s cubic-bezier(0.4,0,0.2,1) infinite",
            }}
          />
        </svg>

        {/* Logo Image */}
        <Image
          src="/logo-new-png.png"
          alt="ShikiPilot Logo"
          width={64}
          height={64}
          className="relative z-10 w-16 h-16 object-contain"
          aria-hidden
          unoptimized
        />
      </div>

      {/* ── Brand Name ─────────────────────────────────────────────── */}
      <p className="mt-6 font-bold text-xl tracking-tight text-white select-none">
        ShikiPilot
      </p>

      {/* ── Progressive Micro-Copy ─────────────────────────────────── */}
      <div className="mt-1.5 relative h-4 w-full flex items-center justify-center">
        {MICRO_COPY.map((text, i) => (
          <p
            key={i}
            className="absolute text-sm text-zinc-500 tracking-widest uppercase select-none opacity-0"
            style={{
              animation: `micro-copy-fade 7.5s infinite`,
              animationDelay: `${i * 2.5}s`,
            }}
          >
            {text}
          </p>
        ))}
      </div>

      {/* ── Active Shimmer Loading Bar ─────────────────────────────── */}
      <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-zinc-800">
        {isHeroLoaded ? (
          /* Hero selesai: langsung ke 100% */
          <div className="h-full w-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600 transition-all duration-500 ease-out" />
        ) : (
          /* Hero sedang dimuat: shimmer aktif + fake-progress */
          <div
            className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600 bg-[length:200%_100%] animate-fake-progress"
            style={{
              animation:
                "fake-progress 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards, shimmer 2s linear infinite",
            }}
          />
        )}
      </div>

      {/* Keyframe svg-trace-run diinjeksikan via style tag agar animasi berjalan */}
      <style>{`
        @keyframes svg-trace-run {
          0%   { stroke-dashoffset: 327; opacity: 0; }
          10%  { opacity: 1; }
          70%  { stroke-dashoffset: 0;   opacity: 1; }
          85%  { stroke-dashoffset: 0;   opacity: 0; }
          100% { stroke-dashoffset: 327; opacity: 0; }
        }
        @keyframes micro-copy-fade {
          0%   { opacity: 0; }
          5%   { opacity: 1; }
          28%  { opacity: 1; }
          33%  { opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
