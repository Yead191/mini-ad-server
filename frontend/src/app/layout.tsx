import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'AdForge | Mini Ad Server Engine',
  description: 'High-performance Ad Server management, tracking, and CTR analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-500/20 selection:text-blue-300">
        <Toaster position="top-right" richColors />
        <div className="flex flex-1 min-h-screen">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
