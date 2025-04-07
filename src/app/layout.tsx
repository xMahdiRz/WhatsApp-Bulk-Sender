import "./globals.css";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/toaster";

import ThemeProvider from "@/contexts/theme-provider";
import { SendingLogProvider } from "@/contexts/sending-log"

import { getUserLocale } from "@/services/locale";
import { cn } from "@/lib/utils";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getUserLocale();
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background antialiased")}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <SendingLogProvider>
              {children}
            </SendingLogProvider>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
