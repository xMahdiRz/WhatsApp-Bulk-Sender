"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ContactsSection from "@/components/contacts-section"
import MessageComposer from "@/components/message-composer"
import SendingLog from "@/components/sending-log"
import MessageReports from "@/components/message-reports"
import ScheduledMessages from "@/components/scheduled-messages"
import ThemeChanger from "@/components/theme-changer"
import { useEffect, useState } from "react"
import { Contact } from "@/actions/contacts"
import { MessageHistory } from "@/components/message-history"

export default function WhatsAppBulkSender() {
  // Add this to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-message-circle"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
            WhatsApp Bulk Sender
          </h1>
          <div className="flex items-center gap-4">
            {/* <span className="hidden md:inline text-sm">Connected to WhatsApp</span>
            <div className="h-3 w-3 bg-green-300 rounded-full"></div> */}
            <ThemeChanger />
          </div>
        </div>
      </header>

      <main className="mx-auto p-4">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-3 space-y-4">
                <ContactsSection onSelectedContactsChange={setSelectedContacts} />
              </div>

              <div className="lg:col-span-6">
                <MessageComposer selectedContacts={selectedContacts} />
              </div>

              <div className="lg:col-span-3">
                <SendingLog />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <MessageReports />
          </TabsContent>

          <TabsContent value="scheduled">
            <ScheduledMessages />
          </TabsContent>

          <TabsContent value="history">
            <div className="bg-card rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Message History</h2>
              <MessageHistory />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-card rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <p className="text-muted-foreground">Configure your WhatsApp Bulk Sender settings here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-card border-t p-4 mt-8">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          WhatsApp Bulk Sender • Use responsibly and in accordance with WhatsApp's terms of service
        </div>
      </footer>
    </div>
  )
}

