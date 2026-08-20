"use client";

import { useEffect, useRef, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useOnboarding } from "@/src/hooks/use-onboarding";
import { SkipTourModal } from "./skip-tour-modal";

export function PosTour() {
  const [showSkipModal, setShowSkipModal] = useState(false);
  const { isTourDone, markTourAsDone, isLoading, onboardingStatus, fetchOnboardingStatus } = useOnboarding();
  const tourStarted = useRef(false);
  const driverInstance = useRef<ReturnType<typeof driver> | null>(null);

  useEffect(() => {
    fetchOnboardingStatus();
  }, [fetchOnboardingStatus]);

  useEffect(() => {
    const startTour = (force = false) => {
      if (isLoading) return;
      if (!force && onboardingStatus === null) return;
      if (!force && isTourDone("posTourDone")) return;
      if (tourStarted.current && !force) return;

      if (driverInstance.current) {
        driverInstance.current.destroy();
      }

      tourStarted.current = true;
      const driverObj = driver({
        showProgress: true,
        popoverClass: 'shiki-tour-theme',
        allowClose: true, 
        nextBtnText: 'Lanjut ➔',
        prevBtnText: '⬅ Kembali',
        doneBtnText: 'Selesai ✨',
        steps: [
          {
            element: '[data-tour="pos-product-list"]',
            popover: {
              title: 'Pilih Produk 📋',
              description: 'Klik produk di daftar ini untuk menambahkannya ke keranjang.',
              showButtons: ['close' as any],
            },
            onHighlighted: (el: any) => {
              if (el) {
                el._tourClickHandler = () => {
                  setTimeout(() => driverInstance.current?.moveNext(), 300);
                };
                el.addEventListener('click', el._tourClickHandler, { capture: true });
              }
            },
            onDeselected: (el: any) => {
              if (el && el._tourClickHandler) {
                el.removeEventListener('click', el._tourClickHandler, { capture: true });
              }
            }
          },
          {
            element: '[data-tour="pos-quantity"]',
            popover: {
              title: 'Sesuaikan Jumlah',
              description: 'Gunakan tombol ini jika pelanggan membeli lebih dari satu item yang sama.'
            }
          },
          {
            element: '[data-tour="pos-cash-input"]',
            popover: {
              title: 'Kalkulasi Kembalian Otomatis',
              description: 'Ketik nominal uang yang diberikan pelanggan di sini. Sistem akan menghitung kembaliannya secara otomatis.'
            }
          },
          {
            element: '[data-tour="pos-checkout"]', 
            popover: {
              title: 'Selesaikan Pembayaran',
              description: 'Terakhir, klik tombol Tunai atau QRIS untuk menyimpan dan menyelesaikan transaksi.',
              showButtons: ['close' as any], 
            },
            onHighlighted: (el: any) => {
              if (el) {
                el._tourClickHandler = () => {
                  driverInstance.current?.destroy();
                  markTourAsDone("posTourDone");
                };
                el.addEventListener('click', el._tourClickHandler, { capture: true });
              }
            },
            onDeselected: (el: any) => {
              if (el && el._tourClickHandler) {
                el.removeEventListener('click', el._tourClickHandler, { capture: true });
              }
            }
          }
        ],
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep()) {
            driverObj.destroy();
            markTourAsDone("posTourDone");
          } else {
            setShowSkipModal(true);
          }
        }
      });

      driverInstance.current = driverObj;
      setTimeout(() => driverObj.drive(), 500);
    };

    if (!isTourDone("posTourDone")) {
      startTour();
    }

    const handleManualStart = () => startTour(true);
    document.addEventListener("start-manual-tour", handleManualStart);

    return () => document.removeEventListener("start-manual-tour", handleManualStart);
  }, [isLoading, onboardingStatus, isTourDone, markTourAsDone]);

  useEffect(() => {
    return () => {
      if (driverInstance.current) {
        driverInstance.current.destroy();
      }
    };
  }, []);

  return (
    <SkipTourModal
      isOpen={showSkipModal}
      onCancel={() => setShowSkipModal(false)}
      onConfirm={() => {
        driverInstance.current?.destroy();
        markTourAsDone("posTourDone");
        setShowSkipModal(false);
      }}
    />
  );
}
