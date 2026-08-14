"use client";

import { useEffect, useRef, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useOnboarding } from "@/src/hooks/use-onboarding";
import { SkipTourModal } from "./skip-tour-modal";

export function InventoryTour() {
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
      if (!force && isTourDone("productsTourDone")) return;
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
      });

      const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;
      const baseSteps = [
          {
            element: '[data-tour="import-ai-button"]',
            popover: {
              title: 'Import Cepat via AI ✨',
              description: 'Punya data stok dalam teks/excel? Klik tombol ini untuk memasukkan produk secara otomatis.',
              showButtons: ['close'],
            },
            onHighlighted: (el: any) => {
              if (el) {
                el._tourClickHandler = () => {
                  setTimeout(() => driverInstance.current?.moveNext(), 300);
                };
                el.addEventListener('click', el._tourClickHandler);
              }
            },
            onDeselected: (el: any) => {
              if (el && el._tourClickHandler) {
                el.removeEventListener('click', el._tourClickHandler);
              }
            }
          },
          {
            element: '[data-tour="import-textarea"]',
            popover: {
              title: '📝 Masukkan Data Produk',
              description: 'Ketik langsung daftar barang Anda di sini, atau paste teks dari catatan, Excel, maupun chat. Tulis sebebasnya, biar AI kami yang merapikannya!',
            }
          },
          {
            element: '[data-tour="import-submit"]',
            popover: {
              title: 'Ekstrak & Simpan ✨',
              description: 'Klik tombol ini untuk memproses data menggunakan AI. Tunggu sejenak hingga proses selesai.',
              showButtons: ['close'],
            },
            onHighlighted: (el: any) => {
              if (el) {
                el._tourClickHandler = () => {
                  setTimeout(() => driverInstance.current?.moveNext(), 300);
                };
                el.addEventListener('click', el._tourClickHandler);
              }
            },
            onDeselected: (el: any) => {
              if (el && el._tourClickHandler) {
                el.removeEventListener('click', el._tourClickHandler);
              }
            }
          },
          {
            element: '[data-tour="sidebar-pos"]', 
            popover: {
              title: 'Mulai Jualan 🛒',
              description: 'Setelah produk siap, klik menu "Kasir" untuk mulai melayani pelanggan. Tur ini selesai setelah Anda menekan menu tersebut.',
              showButtons: ['close'], 
            },
            onHighlighted: (el: any) => {
              if (el) {
                el._tourClickHandler = () => {
                  driverInstance.current?.destroy();
                  markTourAsDone("productsTourDone");
                };
                el.addEventListener('click', el._tourClickHandler);
              }
            },
            onDeselected: (el: any) => {
              if (el && el._tourClickHandler) {
                el.removeEventListener('click', el._tourClickHandler);
              }
            }
          }
        ];
        
      const steps: any[] = [];
      baseSteps.forEach((step) => {
        if (isMobile() && step.element === '[data-tour="sidebar-pos"]') {
          steps.push({
            element: '[data-tour="mobile-burger-btn"]',
            popover: {
              title: 'Menu Navigasi 📱',
              description: 'Ketuk tombol menu ini untuk membuka bilah navigasi.',
              showButtons: ['close'],
            },
            onHighlighted: (el: any) => {
              if (el) {
                el._tourClickHandler = () => {
                  setTimeout(() => {
                    driverInstance.current?.moveNext();
                  }, 300);
                };
                el.addEventListener('click', el._tourClickHandler, { capture: true });
              }
            },
            onDeselected: (el: any) => {
              if (el && el._tourClickHandler) {
                el.removeEventListener('click', el._tourClickHandler, { capture: true });
              }
            }
          });
        }
        steps.push(step);
      });

      driverObj.setSteps(steps);
      
      driverObj.setConfig({
        ...driverObj.getConfig(),
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep()) {
            driverObj.destroy();
            markTourAsDone("productsTourDone");
          } else {
            setShowSkipModal(true);
          }
        }
      });

      driverInstance.current = driverObj;
      setTimeout(() => driverObj.drive(), 500);
    };

    if (!isTourDone("productsTourDone")) {
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
        markTourAsDone("productsTourDone");
        setShowSkipModal(false);
      }}
    />
  );
}
