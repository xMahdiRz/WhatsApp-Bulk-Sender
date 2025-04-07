import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-white dark:from-green-950 dark:to-background">
      <div className="absolute inset-0 opacity-5" />
      <main className="relative">{children}</main>
    </div>
  );
} 