"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSendingLog } from "@/contexts/sending-log"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState, useMemo } from "react"

export default function SendingLog() {
  const { logs, clearLogs } = useSendingLog()
  const [selectedLog, setSelectedLog] = useState<typeof logs[0] | null>(null)

  // Count unique successful message sends
  const successfulMessagesCount = useMemo(() => {
    const uniqueMessages = new Set<string>()
    logs.forEach(log => {
      if (log.type === "success" && log.message.includes("Message sent")) {
        // Extract the timestamp part of the ID to identify unique operations
        const operationId = log.id.split("-")[0]
        uniqueMessages.add(operationId)
      }
    })
    return uniqueMessages.size
  }, [logs])

  return (
    <div className="bg-card rounded-lg shadow h-full flex flex-col">
      <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sending Log</h2>
        <div className="flex gap-2">
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
                className={`p-2 rounded text-sm cursor-pointer ${
                  log.type === "info"
                    ? "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    : log.type === "success"
                      ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : log.type === "error"
                        ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                        : "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                }`}
                onClick={() => setSelectedLog(log)}
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
          <span>Messages sent today: {successfulMessagesCount}</span>
        </div>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedLog?.message}</DialogTitle>
            <DialogDescription>
              <div className="mt-2 space-y-4">
                <div className="text-sm text-muted-foreground">
                  Time: {selectedLog?.timestamp}
                </div>
                {selectedLog?.details && (
                  <div>
                    <div className="text-sm font-medium mb-2">Details:</div>
                    <pre className="bg-muted p-2 rounded text-sm overflow-auto">
                      {selectedLog.details}
                    </pre>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

