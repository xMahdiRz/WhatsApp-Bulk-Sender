"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Import,
  FileOutputIcon as FileExport,
  Trash2,
  MoreVertical,
  RefreshCw,
  Search,
  Download,
  Upload,
  Pencil,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { addContacts, getContacts, Contact } from "@/actions/contacts"
import Papa from 'papaparse'

interface CsvRow {
  name: string;
  phoneNumber: string;
}

interface ParseResult {
  data: CsvRow[];
  errors: any[];
  meta: any;
}

export default function ContactsSection({ 
  onSelectedContactsChange 
}: { 
  onSelectedContactsChange?: (contacts: Contact[]) => void 
}) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newContact, setNewContact] = useState({ name: "", phoneNumber: "" })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const { toast } = useToast()

  // Load contacts on component mount
  useEffect(() => {
    loadContacts()
  }, [])

  // Notify parent when selected contacts change
  useEffect(() => {
    if (typeof onSelectedContactsChange === 'function') {
      const selectedContactObjects = contacts.filter(contact => 
        selectedContacts.includes(contact.phoneNumber)
      )
      console.log('Selected contacts:', selectedContactObjects) // Debug log
      onSelectedContactsChange(selectedContactObjects)
    }
  }, [selectedContacts, contacts, onSelectedContactsChange])

  const loadContacts = async () => {
    const result = await getContacts()
    if (result.success) {
      setContacts(result.data)
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(
    (contact) => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contact.phoneNumber.includes(searchTerm)
  )

  // Handle checkbox selection
  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map((contact) => contact.phoneNumber))
    }
  }

  const handleContactSelect = (phoneNumber: string) => {
    setSelectedContacts(prev => {
      const newSelected = prev.includes(phoneNumber)
        ? prev.filter(num => num !== phoneNumber)
        : [...prev, phoneNumber]
      console.log('New selected contacts:', newSelected) // Debug log
      return newSelected
    })
  }

  // Handle adding a new contact
  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phoneNumber) {
      toast({
        title: "Error",
        description: "Name and number are required",
        variant: "destructive",
      })
      return
    }

    if (!newContact.phoneNumber.startsWith("+")) {
      toast({
        title: "Error",
        description: "Number must start with country code (+)",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate phone number
    const isDuplicate = contacts.some(contact => contact.phoneNumber === newContact.phoneNumber)
    if (isDuplicate) {
      toast({
        title: "Error",
        description: "This phone number already exists in your contacts",
        variant: "destructive",
      })
      return
    }

    // Combine existing contacts with the new contact
    const allContacts = [...contacts, newContact]
    const result = await addContacts(allContacts)
    if (result.success) {
      setContacts(allContacts)
      setNewContact({ name: "", phoneNumber: "" })
      setIsAddDialogOpen(false)
      toast({
        title: "Contact added",
        description: `${newContact.name} has been added to your contacts`,
      })
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  // Handle deleting selected contacts
  const handleDeleteSelected = async () => {
    if (selectedContacts.length === 0) {
      toast({
        title: "No contacts selected",
        description: "Please select contacts to delete",
        variant: "destructive",
      })
      return
    }

    // Filter out selected contacts
    const remainingContacts = contacts.filter((contact) => !selectedContacts.includes(contact.phoneNumber))
    
    // Update backend
    const result = await addContacts(remainingContacts)
    if (result.success) {
      setContacts(remainingContacts)
      setSelectedContacts([])
      toast({
        title: "Contacts deleted",
        description: `${selectedContacts.length} contact(s) have been deleted`,
      })
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  // Handle importing contacts
  const handleImport = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.csv'
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        Papa.parse(file, {
          header: true,
          complete: async (results: ParseResult) => {
            const newContacts = results.data
              .filter((row: CsvRow) => {
                if (!row.name || !row.phoneNumber) return false
                // Skip numbers that don't start with +
                if (!row.phoneNumber.startsWith('+')) {
                  toast({
                    title: "Warning",
                    description: `Skipped number ${row.phoneNumber} - must start with country code (+)`,
                    variant: "default",
                  })
                  return false
                }
                return true
              })
              .map((row: CsvRow) => ({
                name: row.name,
                phoneNumber: row.phoneNumber
              }))

            if (newContacts.length === 0) {
              toast({
                title: "Error",
                description: "No valid contacts found in the CSV file",
                variant: "destructive",
              })
              return
            }

            // Check for duplicates
            const existingNumbers = new Set(contacts.map(contact => contact.phoneNumber))
            const duplicates = newContacts.filter(contact => existingNumbers.has(contact.phoneNumber))
            
            if (duplicates.length > 0) {
              toast({
                title: "Warning",
                description: `${duplicates.length} duplicate number(s) found and skipped`,
                variant: "default",
              })
            }

            // Filter out duplicates
            const uniqueNewContacts = newContacts.filter(contact => !existingNumbers.has(contact.phoneNumber))

            if (uniqueNewContacts.length === 0) {
              toast({
                title: "Error",
                description: "All contacts in the CSV file are duplicates or invalid",
                variant: "destructive",
              })
              return
            }

            const result = await addContacts([...contacts, ...uniqueNewContacts])
            if (result.success) {
              setContacts([...contacts, ...uniqueNewContacts])
              toast({
                title: "Import successful",
                description: `${uniqueNewContacts.length} contacts imported successfully`,
              })
            } else {
              toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
              })
            }
          },
          error: (error: Error) => {
            toast({
              title: "Error",
              description: `Failed to parse CSV file: ${error.message}`,
              variant: "destructive",
            })
          }
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import contacts",
          variant: "destructive",
        })
      }
    }
    fileInput.click()
  }

  // Handle exporting contacts
  const handleExport = () => {
    if (contacts.length === 0) {
      toast({
        title: "No contacts to export",
        description: "Add some contacts first",
        variant: "destructive",
      })
      return
    }

    const csv = Papa.unparse(contacts)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `contacts_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: "Contacts exported to CSV file",
    })
  }

  // Handle editing a contact
  const handleEditContact = async () => {
    if (!editingContact?.name) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a new array with the updated contact name
      const updatedContacts = contacts.map(contact => 
        contact.phoneNumber === editingContact.phoneNumber 
          ? { ...contact, name: editingContact.name }
          : contact
      )

      // Send the updated contacts list to the backend
      const result = await addContacts(updatedContacts)
      
      if (result.success) {
        // Update the local state
        setContacts(updatedContacts)
        setEditingContact(null)
        setIsEditDialogOpen(false)
        
        // Reload contacts from the backend to ensure consistency
        await loadContacts()
        
        toast({
          title: "Contact updated",
          description: `Contact name has been updated to ${editingContact.name}`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating contact:", error)
      toast({
        title: "Error",
        description: "Failed to update contact. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle opening edit dialog
  const handleOpenEditDialog = (contact: Contact) => {
    // Create a new copy of the contact to edit
    setEditingContact({ ...contact })
    setIsEditDialogOpen(true)
  }

  // Handle contact input change
  const handleContactChange = (field: keyof Contact, value: string) => {
    if (editingContact) {
      setEditingContact(prev => ({
        ...prev!,
        [field]: value
      }))
    }
  }

  // Handle dialog close
  const handleDialogClose = () => {
    setEditingContact(null)
    setIsEditDialogOpen(false)
  }

  return (
    <div className="bg-card rounded-lg shadow">
      <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex justify-between items-center">
        <h2 className="text-xl font-semibold">Numbers ({filteredContacts.length})</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/90">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => loadContacts()}>
              <RefreshCw className="h-4 w-4" />
              Refresh Contacts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-4 border-b flex flex-wrap gap-2">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4" /> New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>Add a new contact to your WhatsApp bulk sending list.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="number">Number (with country code)</Label>
                <Input
                  id="number"
                  value={newContact.phoneNumber}
                  onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                  placeholder="+123456789"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleAddContact}>
                Add Contact
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={handleImport}>
          <Import className="h-4 w-4" /> Import
        </Button>

        <Button variant="outline" onClick={handleExport}>
          <FileExport className="h-4 w-4" /> Export
        </Button>

        <Button variant="outline" onClick={handleDeleteSelected}>
          <Trash2 className="h-4 w-4" /> Delete
        </Button>

        <div className="relative w-full mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="overflow-auto max-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all contacts"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <TableRow key={contact.phoneNumber}>
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.includes(contact.phoneNumber)}
                      onCheckedChange={() => handleContactSelect(contact.phoneNumber)}
                      aria-label={`Select ${contact.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.phoneNumber}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      Ready
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditDialog(contact)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  {searchTerm ? "No contacts found" : "No contacts added yet"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t flex justify-between items-center text-sm text-muted-foreground">
        <span>
          {selectedContacts.length} of {filteredContacts.length} selected
        </span>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>Edit the contact name. Phone number cannot be changed.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editingContact?.name || ""}
                onChange={(e) => handleContactChange('name', e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-number">Phone Number</Label>
              <Input
                id="edit-number"
                value={editingContact?.phoneNumber || ""}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleEditContact}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

