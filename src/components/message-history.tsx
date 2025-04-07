"use client";

import { useEffect, useState } from "react";
import { getUserHistory } from "@/actions/user";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MessageHistory {
  id: number;
  phoneNumber: string;
  requestBody: string;
  isSuccessfull: boolean;
  isScheduled: boolean;
}

interface ParsedMessage {
  type: string;
  text?: {
    preview_url: boolean;
    body: string;
  };
  messaging_product: string;
  recipient_type: string;
  to: string;
}

export function MessageHistory() {
  const [history, setHistory] = useState<MessageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { success, data, error } = await getUserHistory();
        if (success) {
          setHistory(data);
        } else {
          setError(error || "Failed to fetch message history");
        }
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const parseMessageBody = (requestBody: string): ParsedMessage => {
    try {
      return JSON.parse(requestBody);
    } catch (e) {
      return {
        type: "unknown",
        messaging_product: "unknown",
        recipient_type: "unknown",
        to: "unknown",
      };
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phone Number</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No message history found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Phone Number</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((message) => {
            const parsedMessage = parseMessageBody(message.requestBody);
            return (
              <TableRow key={message.id}>
                <TableCell className="font-medium">
                  {message.phoneNumber}
                </TableCell>
                <TableCell>
                  {parsedMessage.text?.body || "No message content"}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      message.isSuccessfull
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {message.isSuccessfull ? "Success" : "Failed"}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      message.isScheduled
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {message.isScheduled ? "Scheduled" : "Immediate"}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
} 