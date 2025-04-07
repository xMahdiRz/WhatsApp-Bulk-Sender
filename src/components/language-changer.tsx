"use client";

import React, { useEffect, useState, useTransition } from "react";
import { setUserLocale, getUserLocale } from "@/services/locale";
import { Button } from "@/components/ui/button";
import { defaultLocale } from "@/i18n/config";

export default function LocaleSwitcherSelect({}) {
  const [isPending, startTransition] = useTransition();
  const [localeActive, setLocaleActive] = useState<string>(defaultLocale);

  useEffect(() => {
    getUserLocale().then((storedLocale) =>
      setLocaleActive(storedLocale || defaultLocale)
    );
  }, [defaultLocale]);

  const toggleLocale = () => {
    const newLocale = localeActive === "en" ? "ar" : "en";
    startTransition(() => {
      setUserLocale(newLocale);
      setLocaleActive(newLocale);
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLocale}
      disabled={isPending}
    >
      {localeActive === "en" ? "AR" : "EN"}
    </Button>
  );
}
