// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/shared/Navbar';
import { getSessionAction } from '@/actions/auth.actions';

export const metadata: Metadata = {
  title: 'Dhaka Tesla Pool | Smart Electric Ride Sharing',
  description: 'Shared electric pooling across Dhaka corridors with 3-seater Bullet vehicle.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch session directly from HttpOnly cookie on the server
  const sessionUser = await getSessionAction();

  return (
    <html lang="bn" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
        <Navbar user={sessionUser} />
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
          {children}
        </main>
        <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
          Dhaka Tesla Pool &copy; {new Date().getFullYear()} &bull; 3-Seater Bullet Electric Transport
        </footer>
      </body>
    </html>
  );
}