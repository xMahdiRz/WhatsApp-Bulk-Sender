"use client";

import { createContext, useContext, useState } from "react";

interface SendingSettings {
  timeGap: number;
  randomizeOrder: boolean;
}

interface SendingSettingsContextType {
  settings: SendingSettings;
  updateSettings: (newSettings: Partial<SendingSettings>) => void;
  resetSettings: (defaultSettings: SendingSettings) => void;
}

const defaultSettings: SendingSettings = {
  timeGap: 0,
  randomizeOrder: false
};

const SendingSettingsContext = createContext<SendingSettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {}
});

export function SendingSettingsProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [settings, setSettings] = useState<SendingSettings>(defaultSettings);

  const updateSettings = (newSettings: Partial<SendingSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const resetSettings = (defaultValues: SendingSettings) => {
    setSettings(defaultValues);
  };

  return (
    <SendingSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SendingSettingsContext.Provider>
  );
}

export const useSendingSettings = () => {
  const context = useContext(SendingSettingsContext);
  if (!context) {
    throw new Error("useSendingSettings must be used within a SendingSettingsProvider");
  }
  return context;
}; 