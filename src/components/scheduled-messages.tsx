"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Edit, Trash2, Play, Pause } from "lucide-react"

// Sample data for scheduled messages
const initialScheduledMessages = [
  {
    id: 1,
    recipients: "John Smith, Maria Garcia, Ahmed Khan",
    recipientCount: 3,
    message: "Hello {{firstName}}, just following up on our conversation...",
    scheduledFor: "2023-05-20 09:30:00",
    status: "Pending",
    hasAttachments: true,
  },
  {
    id: 2,
    recipients: "All Contacts",
    recipientCount: 25,
    message: "Dear {{fullName}}, we're excited to announce our new product launch...",
    scheduledFor: "2023-05-21 14:00:00",
    status: "Pending",
    hasAttachments: false,
  },
  {
    id: 3,
    recipients: "Sarah Johnson",
    recipientCount: 1,
    message: "Hi Sarah, here's the document you requested...",
    scheduledFor: "2023-05-19 16:45:00",
    status: "Paused",
    hasAttachments: true,
  },
]

export default function ScheduledMessages() {
  const [scheduledMessages, setScheduledMessages] = useState(initialScheduledMessages)
  const { toast } = useToast()

  // Handle editing a scheduled message
  const handleEdit = (id: number) => {
    toast({
      title: "Edit Scheduled Message",
      description: `Editing message #${id}`,
    })
    // In a real app, this would open an edit dialog
  }

  // Handle deleting a scheduled message
  const handleDelete = (id: number) => {
    setScheduledMessages(scheduledMessages.filter((message) => message.id !== id))
    toast({
      title: "Message Deleted",
      description: "The scheduled message has been deleted",
    })
  }

  // Handle toggling message status (pause/resume)
  const handleToggleStatus = (id: number) => {
    setScheduledMessages(
      scheduledMessages.map((message) => {
        if (message.id === id) {
          const newStatus = message.status === "Pending" ? "Paused" : "Pending"
          toast({
            title: `Message ${newStatus}`,
            description: `The scheduled message has been ${newStatus.toLowerCase()}`,
          })
          return { ...message, status: newStatus }
        }
        return message
      }),
    )
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Scheduled Messages
        </CardTitle>
        <CardDescription>Manage your scheduled messages and campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        {scheduledMessages.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Scheduled For</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div className="font-medium">{message.recipients}</div>
                      <div className="text-xs text-muted-foreground">{message.recipientCount} recipient(s)</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">{message.message}</div>
                      {message.hasAttachments && <div className="text-xs text-muted-foreground">Has attachments</div>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDate(message.scheduledFor)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          message.status === "Pending"
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                        }
                      >
                        {message.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleStatus(message.id)}
                        >
                          {message.status === "Pending" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(message.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No scheduled messages</h3>
            <p className="text-muted-foreground mt-2">Schedule messages to be sent at a specific time in the future</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

