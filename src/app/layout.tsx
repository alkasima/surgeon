
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from '@/contexts/auth-context';
import { UserProvider } from '@/contexts/user-context';
import { ErrorBoundary } from '@/components/error-boundary';
import { InsufficientCreditsProvider } from '@/components/credits/insufficient-credits-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FollicleFlow',
  description: 'Track your hair transplant surgeon journey',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Standard Next.js font optimization handles Inter via next/font */}
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        <ErrorBoundary>
          <AuthProvider>
            <UserProvider>
              <InsufficientCreditsProvider>
                <TooltipProvider delayDuration={0}>
                  {children}
                </TooltipProvider>
                <Toaster />
              </InsufficientCreditsProvider>
            </UserProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
