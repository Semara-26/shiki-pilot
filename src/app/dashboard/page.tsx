import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="font-bold text-xl text-gray-800">ShikiPilot</span>
        </div>
        
        {/* Tombol Profile Sakti dari Clerk */}
        <UserButton />
      </nav>

      {/* 2. Content Area */}
      <main className="max-w-7xl mx-auto py-10 px-6">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Selamat Datang di Cockpit!
          </h1>
          <p className="text-gray-600 mb-6">
            Anda berhasil menembus sistem keamanan.
            <br />
            Langkah selanjutnya: Kita akan menghubungkan halaman ini ke Database Supabase.
          </p>
          
          <Link
            href="/dashboard/create-store"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            + Buat Toko Pertama
          </Link>
        </div>
      </main>
    </div>
  );
}