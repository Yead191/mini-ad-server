import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'AdForge | Mini Ad Server Engine',
  description: 'High-performance ad decisioning, tracking, and telemetry',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden bg-slate-50/70 text-slate-900 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
        <Toaster position="top-right" richColors />
        <div className="flex flex-1 h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
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
