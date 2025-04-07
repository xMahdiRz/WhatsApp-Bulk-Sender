"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

type LogEntry = {
  id: number
  timestamp: string
  message: string
  type: "info" | "success" | "error" | "warning"
}

export default function SendingLog() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 1,
      timestamp: new Date().toLocaleTimeString(),
      message: "System initialized and ready to send messages",
      type: "info",
    },
  ])
  const { toast } = useToast()

  const clearLogs = () => {
    setLogs([])
    toast({
      title: "Logs cleared",
      description: "All logs have been cleared",
    })
  }

  // Function to add a demo log entry
  const addDemoLog = () => {
    const types: ("info" | "success" | "error" | "warning")[] = ["info", "success", "error", "warning"]
    const messages = [
      "Message sent to +123456789",
      "Failed to send message to +987654321",
      "Attachment uploaded successfully",
      "Connection to WhatsApp established",
      "Message queued for sending",
      "Rate limit reached, waiting 30 seconds",
      "Contact list imported successfully",
      "Invalid phone number format detected",
    ]

    const newLog: LogEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message: messages[Math.floor(Math.random() * messages.length)],
      type: types[Math.floor(Math.random() * types.length)],
    }

    setLogs([newLog, ...logs])
  }

  return (
    <div className="bg-card rounded-lg shadow h-full flex flex-col">
      <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sending Log</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-background text-primary hover:bg-background/90 border-background"
            onClick={addDemoLog}
          >
            Demo
          </Button>
          <Button
            variant="outline"
            className="bg-background text-primary hover:bg-background/90 border-background"
            onClick={clearLogs}
          >
            Clear
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 min-h-[400px]">
        {logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded text-sm ${
                  log.type === "info"
                    ? "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    : log.type === "success"
                      ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : log.type === "error"
                        ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                        : "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                }`}
              >
                <span className="font-mono text-xs opacity-70">[{log.timestamp}]</span> {log.message}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">No logs to display</div>
        )}
      </ScrollArea>

      <div className="p-4 border-t text-sm text-muted-foreground mt-auto">
        <div className="flex justify-between">
          <span>
            Status: <span className="text-green-600 dark:text-green-400 font-medium">Connected</span>
          </span>
          <span>Messages sent today: 0</span>
        </div>
      </div>
    </div>
  )
}

