import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { IBM_Plex_Sans_Condensed } from "next/font/google";
import "./globals.css";

const ibmPlexSansCondensed = IBM_Plex_Sans_Condensed({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShikiPilot",
  description: "AI Assistant for UMKM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={ibmPlexSansCondensed.variable}>
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
