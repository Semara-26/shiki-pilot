"use client";

import { useEffect, useRef, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useOnboarding } from "@/src/hooks/use-onboarding";
import { SkipTourModal } from "./skip-tour-modal";

export function HistoryTour() {
  const { onboardingStatus, markTourAsDone, isLoading, isTourDone } = useOnboarding();
  const driverInstance = useRef<ReturnType<typeof driver> | null>(null);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isLoading || !onboardingStatus) return;

    if (!isTourDone("historyTourDone")) {
      // Tunggu render komponen selesai
      setTimeout(() => {
        startTour();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, isLoading, onboardingStatus]);

  const startTour = (force = false) => {
    // Cegah multi-instance jika manual ditekankan berulang kali
    if (driverInstance.current?.isActive()) return;
    if (!force && isTourDone("historyTourDone")) return;

    driverInstance.current = driver({
      showProgress: true,
      animate: true,
      popoverClass: 'shiki-tour-theme',
      overlayColor: "rgba(0, 0, 0, 0.75)",
      nextBtnText: "Lanjut ➔",
      prevBtnText: "⬅ Kembali",
      doneBtnText: "Selesai ✨",
      onDestroyStarted: (element, step, options) => {
        if (step?.popover?.title !== "Rincian & Cetak Ulang" && !onboardingStatus?.historyTourDone) {
          setShowSkipModal(true);
        } else {
          if (options && typeof (options as unknown as { destroy: () => void }).destroy === 'function') {
            (options as unknown as { destroy: () => void }).destroy();
          } else {
            driverInstance.current?.destroy();
          }
          markTourAsDone("historyTourDone");
        }
      },
      steps: [
        {
          element: '[data-tour="history-filter"]',
          popover: {
            title: "Pencarian & Filter",
            description:
              "Cari ID transaksi spesifik atau filter laporan penjualan Anda berdasarkan rentang tanggal di sini.",
          },
        },
        {
          element: '[data-tour="history-row-first"]',
          popover: {
            title: "Lihat Detail Transaksi",
            description:
              "Klik baris transaksi ini untuk membuka rincian struk belanja pelanggan.",
            showButtons: ["close" as any],
          },
          onHighlighted: (el: any) => {
            if (el) {
              el._tourClickHandler = () => {
                setTimeout(() => driverInstance.current?.moveNext(), 300);
              };
              el.addEventListener("click", el._tourClickHandler, { capture: true });
            }
          },
          onDeselected: (el: any) => {
            if (el && el._tourClickHandler) {
              el.removeEventListener("click", el._tourClickHandler, { capture: true });
            }
          },
        },
        {
          element: '[data-tour="history-detail-modal"]',
          popover: {
            title: "Rincian & Cetak Ulang",
            description:
              "Di sini Anda bisa melihat detail item yang terjual. Tutup pop-up ini untuk menyelesaikan panduan.",
            showButtons: ["close" as any],
          },
          onHighlighted: (el: any) => {
            if (el) {
              el._tourCloseHandler = () => {
                driverInstance.current?.destroy();
                markTourAsDone("historyTourDone");
              };
              
              const closeBtn = el.querySelector('button[aria-label="Tutup"]');
              if (closeBtn) {
                closeBtn.addEventListener("click", el._tourCloseHandler, { capture: true });
                el._closeBtn = closeBtn;
              }
            }
          },
          onDeselected: (el: any) => {
            if (el && el._closeBtn && el._tourCloseHandler) {
              el._closeBtn.removeEventListener("click", el._tourCloseHandler, { capture: true });
            }
          }
        },
      ],
    });

    driverInstance.current.drive();
  };

  const handleSkip = () => {
    setShowSkipModal(false);
    driverInstance.current?.destroy();
    markTourAsDone("historyTourDone");
  };

  const handleCancelSkip = () => {
    setShowSkipModal(false);
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

  return (
    <>
      <SkipTourModal
        isOpen={showSkipModal}
        onCancel={handleCancelSkip}
        onConfirm={handleSkip}
      />
    </>
  );
}
