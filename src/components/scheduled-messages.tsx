"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Trash2, Edit2, X } from "lucide-react";
import {
  getScheduledMessages,
  updateScheduledMessage,
  cancelScheduledMessage,
} from "@/actions/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScheduledMessage {
  id: number;
  appUserId: string | null;
  userEmail: string | null;
  toPhoneNumber: string;
  requestBody: string;
  token: string;
  dueDateUTC: string;
}

interface ParsedRequestBody {
  type: string;
  text?: {
    preview_url: boolean;
    body: string;
  };
  messaging_product: string;
  recipient_type: string;
  to: string;
}

export default function ScheduledMessages() {
  const [scheduledMessages, setScheduledMessages] = useState<
    ScheduledMessage[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<ScheduledMessage | null>(
    null
  );
  const [newScheduledDate, setNewScheduledDate] = useState("");
  const [newScheduledTime, setNewScheduledTime] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchScheduledMessages();
  }, []);

  const fetchScheduledMessages = async () => {
    try {
      const { success, data, error } = await getScheduledMessages();
      if (success) {
        setScheduledMessages(data);
      } else {
        setError(error || "Failed to fetch scheduled messages");
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Failed to fetch scheduled messages",
        });
      }
    } catch (err) {
      setError("An unexpected error occurred");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching messages",
      });
    } finally {
      setLoading(false);
    }
  };

  const parseRequestBody = (requestBody: string): ParsedRequestBody => {
    try {
      const parsed = JSON.parse(requestBody);
      return {
        type: parsed.type || "unknown",
        text: parsed.text || { preview_url: false, body: "No message content" },
        messaging_product: parsed.messaging_product || "whatsapp",
        recipient_type: parsed.recipient_type || "individual",
        to: parsed.to || "unknown",
      };
    } catch (e) {
      console.error("Error parsing request body:", e);
      return {
        type: "unknown",
        text: { preview_url: false, body: "Error parsing message" },
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: "unknown",
      };
    }
  };

  const handleEdit = (message: ScheduledMessage) => {
    const date = new Date(message.dueDateUTC);
    setNewScheduledDate(date.toISOString().split("T")[0]);
    setNewScheduledTime(date.toTimeString().slice(0, 5));
    setEditingMessage(message);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setNewScheduledDate("");
    setNewScheduledTime("");
  };

  const handleSaveEdit = async () => {
    if (!editingMessage) return;

    const newDateTime = new Date(`${newScheduledDate}T${newScheduledTime}`);
    const result = await updateScheduledMessage(
      editingMessage.id.toString(),
      newDateTime.toISOString()
    );

    if (result.success) {
      toast({
        title: "Schedule Updated",
        description: "The message has been rescheduled successfully",
      });
      fetchScheduledMessages();
      handleCancelEdit();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to update schedule",
      });
    }
  };

  const handleCancel = async (id: number) => {
    const result = await cancelScheduledMessage(id.toString());
    if (result.success) {
      toast({
        title: "Message Cancelled",
        description: "The scheduled message has been cancelled",
      });
      fetchScheduledMessages();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to cancel message",
      });
    }
  };

  // Format date for display with error handling
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Scheduled Messages
          </CardTitle>
          <CardDescription>Loading scheduled messages...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-md animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Scheduled Messages
          </CardTitle>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Scheduled Messages
          </CardTitle>
          <CardDescription>
            Manage your scheduled messages and campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledMessages.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Scheduled For</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledMessages.map((message) => {
                    const parsedBody = parseRequestBody(message.requestBody);
                    return (
                      <TableRow key={message.id}>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {message.id || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {parsedBody.to || "No recipient"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[300px] truncate">
                            {parsedBody.text?.body || "No message content"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{formatDate(message.dueDateUTC)}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(message)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCancel(message.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No scheduled messages</h3>
              <p className="text-muted-foreground mt-2">
                Schedule messages to be sent at a specific time in the future
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingMessage} onOpenChange={() => handleCancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scheduled Time</DialogTitle>
            <DialogDescription>
              Change the scheduled time for this message
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="scheduled-date">Date</Label>
                <Input
                  id="scheduled-date"
                  type="date"
                  value={newScheduledDate}
                  onChange={(e) => setNewScheduledDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scheduled-time">Time</Label>
                <Input
                  id="scheduled-time"
                  type="time"
                  value={newScheduledTime}
                  onChange={(e) => setNewScheduledTime(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm font-medium">New Scheduled Time:</p>
              <p className="text-sm text-muted-foreground">
                {newScheduledDate && newScheduledTime
                  ? new Date(
                      `${newScheduledDate}T${newScheduledTime}`
                    ).toLocaleString()
                  : "Please select date and time"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
