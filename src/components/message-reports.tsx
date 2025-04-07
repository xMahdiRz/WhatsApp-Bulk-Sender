"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, FileDown, Search, BarChart3, CheckCircle, XCircle, Clock } from "lucide-react"

// Sample data for the reports
const sentMessages = [
  { id: 1, name: "John Smith", number: "+123456789", status: "Delivered", timestamp: "2023-05-15 09:30:45" },
  { id: 2, name: "Maria Garcia", number: "+987654321", status: "Read", timestamp: "2023-05-15 09:31:12" },
  { id: 3, name: "Ahmed Khan", number: "+123789456", status: "Delivered", timestamp: "2023-05-15 09:32:05" },
  { id: 4, name: "Sarah Johnson", number: "+456123789", status: "Read", timestamp: "2023-05-15 09:33:22" },
  { id: 5, name: "Li Wei", number: "+789456123", status: "Delivered", timestamp: "2023-05-15 09:34:18" },
  { id: 6, name: "Carlos Rodriguez", number: "+321654987", status: "Read", timestamp: "2023-05-15 09:35:30" },
  { id: 7, name: "Emma Wilson", number: "+654987321", status: "Delivered", timestamp: "2023-05-15 09:36:45" },
  { id: 8, name: "Raj Patel", number: "+159753456", status: "Read", timestamp: "2023-05-15 09:37:10" },
]

const failedMessages = [
  {
    id: 9,
    name: "David Brown",
    number: "+111222333",
    status: "Failed",
    reason: "Invalid number",
    timestamp: "2023-05-15 09:38:22",
  },
  {
    id: 10,
    name: "Sophia Lee",
    number: "+444555666",
    status: "Failed",
    reason: "Network error",
    timestamp: "2023-05-15 09:39:15",
  },
]

export default function MessageReports() {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // Filter messages based on search term
  const filteredSentMessages = sentMessages.filter(
    (message) => message.name.toLowerCase().includes(searchTerm.toLowerCase()) || message.number.includes(searchTerm),
  )

  const filteredFailedMessages = failedMessages.filter(
    (message) => message.name.toLowerCase().includes(searchTerm.toLowerCase()) || message.number.includes(searchTerm),
  )

  // Calculate metrics
  const totalMessages = sentMessages.length + failedMessages.length
  const successRate = totalMessages > 0 ? Math.round((sentMessages.length / totalMessages) * 100) : 0
  const lastCampaignDate = "May 15, 2023"

  // Handle download report
  const handleDownloadReport = () => {
    toast({
      title: "Report Download Started",
      description: "Your report is being generated and will download shortly.",
    })
    // In a real app, this would generate and download a CSV/Excel file
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Message Reports</h1>
          <p className="text-muted-foreground">View and analyze your message delivery statistics</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalMessages}</div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{successRate}%</div>
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{lastCampaignDate}</div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          onClick={handleDownloadReport}
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto"
        >
          <FileDown className="mr-2 h-4 w-4" /> Download Report
        </Button>
      </div>

      <Tabs defaultValue="sent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Sent Messages ({filteredSentMessages.length})
          </TabsTrigger>
          <TabsTrigger value="failed" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" /> Failed Messages ({filteredFailedMessages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Successfully Sent Messages</CardTitle>
              <CardDescription>Messages that were successfully delivered to recipients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSentMessages.length > 0 ? (
                      filteredSentMessages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium">{message.id}</TableCell>
                          <TableCell>{message.name}</TableCell>
                          <TableCell>{message.number}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                message.status === "Read"
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                  : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              }
                            >
                              {message.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{message.timestamp}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          {searchTerm ? "No sent messages found matching your search" : "No sent messages to display"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Messages</CardTitle>
              <CardDescription>Messages that failed to deliver to recipients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFailedMessages.length > 0 ? (
                      filteredFailedMessages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium">{message.id}</TableCell>
                          <TableCell>{message.name}</TableCell>
                          <TableCell>{message.number}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            >
                              {message.reason}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{message.timestamp}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          {searchTerm
                            ? "No failed messages found matching your search"
                            : "No failed messages to display"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

