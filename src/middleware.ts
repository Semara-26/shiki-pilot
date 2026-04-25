import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Definisikan route yang boleh diakses tanpa login (termasuk Webhook kita)
const isPublicRoute = createRouteMatcher(["/api/wa-webhook", "/"]);

// 2. Terapkan proteksi untuk route yang bukan publik
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// 3. Konfigurasi Matcher bawaan Clerk (jangan diubah)
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};