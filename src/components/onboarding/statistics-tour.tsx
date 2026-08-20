"use client";

import { useEffect, useRef, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useOnboarding } from "@/src/hooks/use-onboarding";
import { SkipTourModal } from "./skip-tour-modal";

export function StatisticsTour() {
  const { onboardingStatus, markTourAsDone, isLoading, isTourDone } = useOnboarding();
  const driverInstance = useRef<ReturnType<typeof driver> | null>(null);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isLoading || !onboardingStatus) return;

    if (!isTourDone("statisticsTourDone")) {
      setTimeout(() => {
        startTour();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, isLoading, onboardingStatus]);

  const startTour = (force = false) => {
    if (driverInstance.current?.isActive()) return;
    if (!force && isTourDone("statisticsTourDone")) return;

    driverInstance.current = driver({
      showProgress: true,
      animate: true,
      popoverClass: 'shiki-tour-theme',
      overlayColor: "rgba(0, 0, 0, 0.75)",
      nextBtnText: "Lanjut ➔",
      prevBtnText: "⬅ Kembali",
      doneBtnText: "Selesai ✨",
      allowClose: true,
      onDestroyStarted: (el, step, options) => {
        if (!driverInstance.current?.hasNextStep()) {
          if (options && typeof (options as unknown as { destroy: () => void }).destroy === 'function') {
            (options as unknown as { destroy: () => void }).destroy();
          } else {
            driverInstance.current?.destroy();
          }
          return;
        }
        setShowSkipModal(true);
      },
      steps: [
        {
          element: '[data-tour="stat-filter"]',
          popover: {
            title: "📊 Atur Rentang Waktu",
            description: "Ingin melihat performa hari ini atau bulan lalu? Ubah filter waktunya di sini untuk menyesuaikan seluruh grafik.",
            side: "bottom",
            align: "start",
          }
        },
        {
          element: '[data-tour="stat-metrics"]',
          popover: {
            title: "📈 Pantau Performa",
            description: "Cari tahu produk mana yang paling laku keras dan pantau tren pendapatan Anda dengan mudah.",
            side: "top",
            align: "center",
          }
        },
        {
          element: '[data-tour="stat-ai-btn"]',
          popover: {
            title: "✨ Analisis Otomatis",
            description: "Klik tombol ini dan biarkan AI kami merangkumkan kondisi bisnis serta memberikan saran strategi untuk Anda!",
            side: "top",
            align: "start",
            showButtons: ["close" as any]
          },
          onHighlighted: (el: any) => {
            if (!el) return;
            el._tourClickHandler = () => {
              markTourAsDone("statisticsTourDone");
              driverInstance.current?.destroy();
            };
            el.addEventListener("click", el._tourClickHandler);
          },
          onDeselected: (el: any) => {
            if (el && el._tourClickHandler) {
              el.removeEventListener("click", el._tourClickHandler);
            }
          }
        }
      ]
    });

    driverInstance.current.drive();
  };

  useEffect(() => {
    const handleStartManualTour = () => {
      startTour(true);
    };

    document.addEventListener("start-manual-tour", handleStartManualTour);
    return () => {
      document.removeEventListener("start-manual-tour", handleStartManualTour);
      if (driverInstance.current) {
        driverInstance.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isClient) return null;

  return (
    <>
      <SkipTourModal
        isOpen={showSkipModal}
        onCancel={() => setShowSkipModal(false)}
        onConfirm={() => {
          markTourAsDone("statisticsTourDone");
          setShowSkipModal(false);
          driverInstance.current?.destroy();
        }}
      />
    </>
  );
}
