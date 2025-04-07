"use client"

import { useState } from "react"
import MessageComposer from "./message-composer"
import ContactsSection from "./contacts-section"
import { Contact } from "@/actions/contacts"

export default function Dashboard() {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      <ContactsSection 
        onSelectedContactsChange={setSelectedContacts}
      />
      <MessageComposer 
        selectedContacts={selectedContacts}
      />
    </div>
  )
} 