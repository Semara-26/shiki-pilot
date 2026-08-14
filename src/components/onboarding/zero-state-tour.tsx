"use client";

import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function ZeroStateTour() {
  const driverInstance = useRef<ReturnType<typeof driver> | null>(null);

  useEffect(() => {
    const startTour = () => {
      const driverObj = driver({
        showProgress: false,
        popoverClass: 'shiki-tour-theme',
        allowClose: false,
        steps: [
          {
            element: '[data-tour="create-store-btn"]',
            popover: {
              title: '🚀 Mulai Perjalanan Anda',
              description: 'Selamat datang di Cockpit! Mari mulai dengan menyiapkan profil toko Anda. Klik tombol ini untuk membuat toko pertama.',
              showButtons: ['close'],
            },
            onHighlighted: (el: any) => {
              if (el) {
                el._tourClickHandler = () => {
                  driverObj.destroy();
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
      });
      
      driverInstance.current = driverObj;
      setTimeout(() => driverObj.drive(), 500);
    };

    startTour();

    return () => {
      if (driverInstance.current) {
        driverInstance.current.destroy();
      }
    };
  }, []);

  return null;
}
