import "./globals.css";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";

import ThemeProvider from "@/contexts/theme-provider";
import { SendingLogProvider } from "@/contexts/sending-log";
import { SendingSettingsProvider } from "@/contexts/sending-settings";

import { getUserLocale } from "@/services/locale";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WhatsApp Bulk Sender",
  description: "Send bulk messages on WhatsApp with ease",
};

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
            <SendingSettingsProvider>
              <SendingLogProvider>
                {children}
              </SendingLogProvider>
            </SendingSettingsProvider>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
