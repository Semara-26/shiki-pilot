import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShikiPilot - Jualan Lebih Cepat, Manajemen Lebih Cerdas",
  description: "AI Assistant for UMKM",
  icons: {
    icon: "/logo-new-svg.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
            rel="stylesheet"
          />
        </head>
        <body suppressHydrationWarning className={`${jakarta.variable} font-jakarta antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <Toaster
              position="top-center"
              richColors
              closeButton
              theme="dark"
              className="!z-[9999]"
              toastOptions={{
                style: {
                  background: "rgba(24, 24, 27, 0.85)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#f4f4f5",
                  fontFamily: "var(--font-jakarta), sans-serif",
                  fontSize: "14px",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,211,238,0.05)",
                },
                classNames: {
                  toast: "!border-white/10",
                  success: "!border-l-4 !border-l-cyan-400",
                  error: "!border-l-4 !border-l-red-500",
                  warning: "!border-l-4 !border-l-amber-400",
                  info: "!border-l-4 !border-l-blue-400",
                  description: "!text-zinc-400",
                  closeButton: "!bg-zinc-800 !border-white/10 !text-zinc-400 hover:!text-white",
                },
              }}
            />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
