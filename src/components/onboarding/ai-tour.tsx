"use client";

import { useEffect, useRef, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useOnboarding } from "@/src/hooks/use-onboarding";
import { SkipTourModal } from "./skip-tour-modal";

export function AiTour() {
  const { onboardingStatus, markTourAsDone, isLoading, isTourDone } = useOnboarding();
  const driverInstance = useRef<ReturnType<typeof driver> | null>(null);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isLoading || !onboardingStatus) return;

    if (!isTourDone("aiTourDone")) {
      setTimeout(() => {
        startTour();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, isLoading, onboardingStatus]);

  const startTour = (force = false) => {
    if (driverInstance.current?.isActive()) return;
    if (!force && isTourDone("aiTourDone")) return;

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
          element: '[data-tour="ai-clear-btn"]',
          popover: {
            title: "🧹 Reset Percakapan",
            description: "Klik tombol ini jika Anda ingin memulai topik obrolan baru agar AI tidak bingung dengan konteks sebelumnya.",
            side: "bottom",
            align: "end",
          }
        },
        {
          element: '[data-tour="ai-chat-input"]',
          popover: {
            title: "🤖 Tanya Apa Saja soal Toko",
            description: "AI ini terhubung langsung dengan data Anda! Coba ketik: 'Produk apa yang stoknya mau habis?' atau 'Urutkan produk dari yang paling lama ditambahkan'. Ketik pesan Anda dan tekan Kirim untuk menyelesaikan panduan ini.",
            side: "top",
            align: "center",
            showButtons: ["close"],
          },
          onHighlighted: (el: any) => {
            if (!el) return;
            const form = el.closest('form');
            if (!form) return;

            el._tourSubmitHandler = () => {
              markTourAsDone("aiTourDone");
              driverInstance.current?.destroy();
            };
            form.addEventListener("submit", el._tourSubmitHandler);
            el._tourFormEl = form;
          },
          onDeselected: (el: any) => {
            if (el && el._tourFormEl && el._tourSubmitHandler) {
              el._tourFormEl.removeEventListener("submit", el._tourSubmitHandler);
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
          markTourAsDone("aiTourDone");
          setShowSkipModal(false);
          driverInstance.current?.destroy();
        }}
      />
    </>
  );
}
