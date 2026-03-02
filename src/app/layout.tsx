import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "ShikiPilot",
  description: "AI Assistant for UMKM",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className={`${poppins.variable} font-sans antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <Toaster
              theme="dark"
              toastOptions={{
                style: {
                  background: "#121212",
                  border: "1px solid #262626",
                  color: "#ffffff",
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
