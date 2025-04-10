"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, FileDown, Search, BarChart3, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { getUserHistory } from "@/actions/user"

interface Message {
  id: number;
  phoneNumber: string;
  requestBody: string;
  isSuccessfull: boolean;
  isScheduled: boolean;
}

export default function MessageReports() {
  const [searchTerm, setSearchTerm] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await getUserHistory()
        if (response.success && response.data) {
          setMessages(response.data)
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to fetch messages",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch messages",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [toast])

  // Filter messages based on search term
  const filteredMessages = messages.filter(
    (message) => message.phoneNumber.includes(searchTerm)
  )

  // Separate messages into sent and failed
  const sentMessages = filteredMessages.filter(msg => msg.isSuccessfull)
  const failedMessages = filteredMessages.filter(msg => !msg.isSuccessfull)

  // Calculate metrics
  const totalMessages = messages.length
  const successRate = totalMessages > 0 ? Math.round((sentMessages.length / totalMessages) * 100) : 0

  // Handle download report
  const handleDownloadReport = () => {
    try {
      // Create CSV content
      const headers = ['ID', 'Phone Number', 'Status', 'Type', 'Message Content']
      const rows = messages.map(message => {
        const status = message.isSuccessfull ? 'Delivered' : 'Failed'
        const type = message.isScheduled ? 'Scheduled' : 'Instant'
        const messageContent = JSON.parse(message.requestBody).message || ''
        return [
          message.id,
          message.phoneNumber,
          status,
          type,
          messageContent
        ]
      })

      // Convert to CSV string
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `message-report-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Report Downloaded",
        description: "Your message report has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by phone number..."
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
            <CheckCircle className="h-4 w-4" /> Sent Messages ({sentMessages.length})
          </TabsTrigger>
          <TabsTrigger value="failed" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" /> Failed Messages ({failedMessages.length})
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
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentMessages.length > 0 ? (
                      sentMessages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium">{message.id}</TableCell>
                          <TableCell>{message.phoneNumber}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            >
                              Delivered
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                            >
                              {message.isScheduled ? "Scheduled" : "Instant"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
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
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failedMessages.length > 0 ? (
                      failedMessages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium">{message.id}</TableCell>
                          <TableCell>{message.phoneNumber}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            >
                              Failed
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                            >
                              {message.isScheduled ? "Scheduled" : "Instant"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          {searchTerm ? "No failed messages found matching your search" : "No failed messages to display"}
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

