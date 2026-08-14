"use client";

import { useEffect, useRef, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useOnboarding } from "@/src/hooks/use-onboarding";
import { SkipTourModal } from "./skip-tour-modal";

export function DashboardTour() {
  const [showSkipModal, setShowSkipModal] = useState(false);
  const { isTourDone, markTourAsDone, isLoading, onboardingStatus, fetchOnboardingStatus } = useOnboarding();
  const tourStarted = useRef(false);
  const driverInstance = useRef<ReturnType<typeof driver> | null>(null);

  // Muat status onboarding dari server saat komponen di-mount
  useEffect(() => {
    fetchOnboardingStatus();
  }, [fetchOnboardingStatus]);

  useEffect(() => {
    const startTour = (force = false) => {
      // Jangan lakukan apapun jika status masih loading atau belum ada
      if (isLoading) return;
      if (!force && onboardingStatus === null) return;
      if (!force && isTourDone("dashboardTourDone")) return;
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
            element: 'body',
            popover: {
              title: 'Selamat Datang di ShikiPilot!',
              description: 'Mari kita mulai tur singkat untuk mengenalkan Anda pada fitur-fitur utama.',
            }
          },
          {
            element: '[data-tour="sidebar-inventory"]', 
            popover: {
              title: 'Kelola Stok Barang 📦',
              description: 'Untuk mulai mengelola produk, silakan klik menu "Stok Barang" ini secara manual. Tur ini akan selesai setelah Anda menekan menu tersebut.',
              showButtons: ['close'], // Sembunyikan tombol next, tunggu klik manual
            },
            onHighlighted: (el: any) => {
              console.log("Element highlighted in DashboardTour:", el);
              if (el) {

                el._tourClickHandler = () => {
                  console.log("Clicked sidebar inventory in DashboardTour");
                  driverInstance.current?.destroy();
                  markTourAsDone("dashboardTourDone");
                };

                el.addEventListener('click', el._tourClickHandler);
              }
            },
            onDeselected: (el: any) => {
              console.log("Element deselected in DashboardTour:", el);

              if (el && el._tourClickHandler) {

                el.removeEventListener('click', el._tourClickHandler);
              }
            }
          }
        ];
        
      const steps: any[] = [];
      baseSteps.forEach((step) => {
        if (isMobile() && step.element === '[data-tour="sidebar-inventory"]') {
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
            markTourAsDone("dashboardTourDone");
          } else {
            setShowSkipModal(true);
          }
        }
      });

      driverInstance.current = driverObj;
      setTimeout(() => driverObj.drive(), 500);
    };

    // Auto start if not done
    if (!isTourDone("dashboardTourDone")) {
      startTour();
    }

    // Manual start via custom event
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
        markTourAsDone("dashboardTourDone");
        setShowSkipModal(false);
      }}
    />
  );
}
