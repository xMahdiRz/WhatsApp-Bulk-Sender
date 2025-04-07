"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type LogEntry = {
  id: string
  timestamp: string
  message: string
  type: "info" | "success" | "error" | "warning"
  details?: string
}

type SendingLogContextType = {
  logs: LogEntry[]
  addLog: (message: string, type: LogEntry["type"], details?: string) => void
  clearLogs: () => void
}

const SendingLogContext = createContext<SendingLogContextType | undefined>(undefined)

export function SendingLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "initial",
      timestamp: new Date().toLocaleTimeString(),
      message: "System initialized and ready to send messages",
      type: "info",
    },
  ])

  const addLog = (message: string, type: LogEntry["type"], details?: string) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
      details,
    }
    setLogs((prev) => [newLog, ...prev])
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <SendingLogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </SendingLogContext.Provider>
  )
}

export function useSendingLog() {
  const context = useContext(SendingLogContext)
  if (context === undefined) {
    throw new Error("useSendingLog must be used within a SendingLogProvider")
  }
  return context
} 