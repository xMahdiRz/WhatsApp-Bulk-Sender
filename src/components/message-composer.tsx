"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { Bold, Italic, Underline, Smile, Trash2, Image, FileText, Settings, Send, Calendar, Check, Pencil } from "lucide-react"
import AdvancedSendingSettings from "@/components/advanced-sending-settings"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { sendMessage, sendTemplate } from "@/actions/sender"
import { useFormState, useFormStatus } from "react-dom"
import { Contact } from "@/actions/contacts"
import { uploadImageToImgBB } from "@/actions/image-upload"

interface TemplateParameter {
  type: string;
  text: string;
}

interface TemplateComponent {
  type: string;
  parameters: TemplateParameter[];
}

interface Template {
  name: string;
  language: {
    policy: string;
    code: string;
  };
  components: TemplateComponent;
}

export default function MessageComposer({ selectedContacts }: { selectedContacts: Contact[] }) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<{ id: number; name: string; type: string; caption: string; url?: string }[]>([])
  const [selectedAttachments, setSelectedAttachments] = useState<number[]>([])
  const [isTurboMode, setIsTurboMode] = useState(false)
  const [isAttachDialogOpen, setIsAttachDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)
  const [editingAttachment, setEditingAttachment] = useState<{ id: number; name: string; caption: string } | null>(null)
  const [newAttachment, setNewAttachment] = useState({ name: "", type: "Image", caption: "" })
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [isTemplateMode, setIsTemplateMode] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templateLanguage, setTemplateLanguage] = useState("en")
  const [templateParameters, setTemplateParameters] = useState<{ type: string; text: string }[]>([])

  // Handle text formatting
  const formatText = (format: "bold" | "italic" | "underline") => {
    const textarea = document.getElementById("message") as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = message.substring(start, end)

    let formattedText = ""
    switch (format) {
      case "bold":
        formattedText = `*${selectedText}*`
        break
      case "italic":
        formattedText = `_${selectedText}_`
        break
      case "underline":
        formattedText = `~${selectedText}~`
        break
    }

    const newMessage = message.substring(0, start) + formattedText + message.substring(end)
    setMessage(newMessage)

    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
    }, 0)
  }

  // Handle inserting variables
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById("message") as HTMLTextAreaElement
    const start = textarea.selectionStart
    const variableText = `{{${variable}}}`

    const newMessage = message.substring(0, start) + variableText + message.substring(start)
    setMessage(newMessage)

    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variableText.length, start + variableText.length)
    }, 0)
  }

  // Handle adding emoji
  const addEmoji = (emoji: any) => {
    const textarea = document.getElementById("message") as HTMLTextAreaElement
    const start = textarea.selectionStart
    const newMessage = message.substring(0, start) + emoji.native + message.substring(start)
    setMessage(newMessage)
    setIsEmojiPickerOpen(false)
  }

  // Handle clearing message
  const clearMessage = () => {
    if (!message.trim()) {
      toast({
        title: "Nothing to clear",
        description: "Message is already empty",
      })
      return
    }

    setMessage("")
    toast({
      title: "Message cleared",
      description: "Your message has been cleared",
    })
  }

  // Handle sending the message
  const handleSend = async () => {
    // Check if turbo mode is enabled and text is empty
    if (isTurboMode && !message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message when turbo mode is enabled",
        variant: "destructive",
      });
      return;
    }

    // Check if there's nothing to send
    if (!message.trim() && selectedAttachments.length === 0) {
      toast({
        title: "Nothing to send",
        description: "Please add a message or select attachments to send",
        variant: "destructive",
      });
      return;
    }

    // Check if no recipients are selected
    if (!selectedContacts || selectedContacts.length === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one contact to send the message to",
        variant: "destructive",
      });
      return;
    }

    try {
      // Filter attachments to only include selected ones
      const selectedAttachmentsToSend = attachments.filter(attachment => 
        selectedAttachments.includes(attachment.id)
      );

      // If turbo mode is disabled and there's a message, send it first
      if (!isTurboMode && message.trim()) {
        const textResult = await sendMessage({
          message,
          attachments: [],
          isTurboMode: false,
          isScheduled,
          scheduledTime: isScheduled ? new Date().toISOString() : undefined,
          recipients: selectedContacts.map(contact => contact.phoneNumber)
        });

        if (!textResult.success) {
          toast({
            title: "Error",
            description: textResult.error || "Failed to send text message",
            variant: "destructive",
          });
          return;
        }
      }

      // If there are selected attachments, send them
      if (selectedAttachmentsToSend.length > 0) {
        for (const attachment of selectedAttachmentsToSend) {
          const attachmentResult = await sendMessage({
            message: "", // No text message for attachments
            attachments: [attachment],
            isTurboMode: false,
            isScheduled,
            scheduledTime: isScheduled ? new Date().toISOString() : undefined,
            recipients: selectedContacts.map(contact => contact.phoneNumber)
          });

          if (!attachmentResult.success) {
            toast({
              title: "Error",
              description: `Failed to send ${attachment.name}`,
              variant: "destructive",
            });
            // Continue with other attachments even if one fails
          }
        }
      }

      // If turbo mode is enabled, send everything in one go
      if (isTurboMode) {
        const result = await sendMessage({
          message,
          attachments: selectedAttachmentsToSend,
          isTurboMode: true,
          isScheduled,
          scheduledTime: isScheduled ? new Date().toISOString() : undefined,
          recipients: selectedContacts.map(contact => contact.phoneNumber)
        });

        if (!result.success) {
          toast({
            title: "Error",
            description: result.error || "Failed to send message",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: isScheduled ? "Message scheduled" : "Message sent",
        description: isScheduled ? "Your message has been scheduled for sending" : "Your message has been sent successfully",
        className: "bg-primary text-primary-foreground",
      });

      // Clear the form
      setMessage("");
      setAttachments([]);
      setSelectedAttachments([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the message",
        variant: "destructive",
      });
    }
  }

  // Handle file attachment
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAttachments = []
    for (const file of Array.from(files)) {
      try {
        let fileUrl = ""
        if (file.type.startsWith("image/")) {
          fileUrl = await uploadImageToImgBB(file)
        }

        const newAttachment = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type.startsWith("image/") ? "Image" : "Document",
          caption: "",
          url: fileUrl
        }

        newAttachments.push(newAttachment)
        // Automatically select the newly uploaded attachment
        setSelectedAttachments(prev => [...prev, newAttachment.id])
      } catch (error) {
        toast({
          title: "Error uploading file",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        })
      }
    }

    setAttachments([...attachments, ...newAttachments])

    toast({
      title: "Files attached",
      description: `${newAttachments.length} file(s) have been attached and selected`,
    })

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle adding a demo attachment
  const handleAddDemoAttachment = () => {
    if (!newAttachment.name) {
      toast({
        title: "Error",
        description: "File name is required",
        variant: "destructive",
      })
      return
    }

    const newId = attachments.length > 0 ? Math.max(...attachments.map((a) => a.id)) + 1 : 1
    setAttachments([
      ...attachments,
      {
        id: newId,
        name: newAttachment.name,
        type: newAttachment.type,
        caption: newAttachment.caption || "No Caption",
      },
    ])

    setNewAttachment({ name: "", type: "Image", caption: "" })
    setIsAttachDialogOpen(false)

    toast({
      title: "Attachment added",
      description: `${newAttachment.name} has been added to your attachments`,
    })
  }

  // Handle deleting selected attachments
  const handleDeleteAttachments = () => {
    if (selectedAttachments.length === 0) {
      toast({
        title: "No attachments selected",
        description: "Please select attachments to delete",
        variant: "destructive",
      })
      return
    }

    setAttachments(attachments.filter((attachment) => !selectedAttachments.includes(attachment.id)))
    setSelectedAttachments([])

    toast({
      title: "Attachments deleted",
      description: `${selectedAttachments.length} attachment(s) have been deleted`,
    })
  }

  // Handle editing attachment
  const handleEditAttachment = (attachment: { id: number; name: string; type: string; caption: string }) => {
    setEditingAttachment({ id: attachment.id, name: attachment.name, caption: attachment.caption })
  }

  const handleSaveEdit = () => {
    if (!editingAttachment) return

    setAttachments(attachments.map(attachment => 
      attachment.id === editingAttachment.id 
        ? { ...attachment, name: editingAttachment.name, caption: editingAttachment.caption }
        : attachment
    ))
    setEditingAttachment(null)
  }

  // Toggle select all attachments
  const toggleSelectAllAttachments = () => {
    if (selectedAttachments.length === attachments.length) {
      setSelectedAttachments([])
    } else {
      setSelectedAttachments(attachments.map((attachment) => attachment.id))
    }
  }

  // Toggle select attachment
  const toggleSelectAttachment = (id: number) => {
    if (selectedAttachments.includes(id)) {
      setSelectedAttachments(selectedAttachments.filter((attachmentId) => attachmentId !== id))
    } else {
      setSelectedAttachments([...selectedAttachments, id])
    }
  }

  // Toggle scheduled sending
  const toggleScheduled = () => {
    setIsScheduled(!isScheduled)
  }

  const handleSendTemplate = async () => {
    if (!selectedContacts || selectedContacts.length === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one contact to send the template to",
        variant: "destructive",
      })
      return
    }

    if (!templateName) {
      toast({
        title: "Template name required",
        description: "Please enter a template name",
        variant: "destructive",
      })
      return
    }

    const result = await sendTemplate({
      to: selectedContacts.map(contact => contact.phoneNumber),
      accessToken: "",
      delayBetweenMessagesInMs: 0,
      scheduledTimeInUtc: null,
      template: {
        name: templateName,
        language: {
          policy: "deterministic",
          code: templateLanguage
        },
        components: {
          type: "body",
          parameters: templateParameters.map(param => ({
            type: "text",
            text: param.text
          }))
        }
      }
    })

    if (result.success) {
      toast({
        title: "Template sent",
        description: "Your template has been sent successfully",
        className: "bg-primary text-primary-foreground",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send template",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="bg-card rounded-lg shadow flex-1 flex flex-col">
        <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold">Message Composer</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="bg-background text-primary hover:bg-background/90 border-background"
              onClick={() => setIsTemplateMode(!isTemplateMode)}
            >
              {isTemplateMode ? "Normal Message" : "Template"}
            </Button>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          {isTemplateMode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Input
                  value={templateLanguage}
                  onChange={(e) => setTemplateLanguage(e.target.value)}
                  placeholder="en"
                />
              </div>
              <div className="space-y-2">
                <Label>Parameters</Label>
                {templateParameters.map((param, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={param.text}
                      onChange={(e) => {
                        const newParams = [...templateParameters]
                        newParams[index].text = e.target.value
                        setTemplateParameters(newParams)
                      }}
                      placeholder={`Parameter ${index + 1}`}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setTemplateParameters(templateParameters.filter((_, i) => i !== index))
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setTemplateParameters([...templateParameters, { type: "text", text: "" }])}
                >
                  Add Parameter
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Dialog open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-dashed border-2 text-primary hover:bg-primary/10"
                    >
                      <Smile className="mr-2 h-5 w-5" /> Emoji
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="p-0">
                    <DialogHeader>
                      <DialogTitle>Select Emoji</DialogTitle>
                    </DialogHeader>
                    <Picker data={data} onEmojiSelect={addEmoji} />
                  </DialogContent>
                </Dialog>
              </div>

              <Textarea
                id="message"
                placeholder="Type your message here. Use {{variable}} for personalization."
                className="min-h-32 mb-4 flex-1"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <div className="grid grid-cols-5 gap-2 mb-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" onClick={addEmoji}>
                        <Smile className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add Emoji</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" onClick={clearMessage}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear Message</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" onClick={() => formatText("bold")}>
                        <Bold className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Bold</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" onClick={() => formatText("italic")}>
                        <Italic className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Italic</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" onClick={() => formatText("underline")}>
                        <Underline className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Strikethrough</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() =>
                    toast({
                      title: "Variables",
                      description: "Variable selector would open here",
                    })
                  }
                >
                  Variables
                </Button>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => insertVariable("fullName")}
                >
                  Full Name
                </Button>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => insertVariable("firstName")}
                >
                  First Name
                </Button>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => insertVariable("lastName")}
                >
                  Last Name
                </Button>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                  onClick={() => insertVariable("random")}
                >
                  Random Tag
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg shadow">
        <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold">Attach Files & Photos</h2>
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
            <Button
              variant="outline"
              className="bg-background text-primary hover:bg-background/90 border-background"
              onClick={handleFileSelect}
            >
              Add
            </Button>
            <Button
              variant="outline"
              className="bg-background text-primary hover:bg-background/90 border-background"
              onClick={handleDeleteAttachments}
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="overflow-auto max-h-[200px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedAttachments.length === attachments.length && attachments.length > 0}
                    onCheckedChange={toggleSelectAllAttachments}
                    aria-label="Select all attachments"
                  />
                </TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Caption</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attachments.length > 0 ? (
                attachments.map((attachment) => (
                  <TableRow key={attachment.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedAttachments.includes(attachment.id)}
                        onCheckedChange={() => toggleSelectAttachment(attachment.id)}
                        aria-label={`Select ${attachment.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium flex items-center">
                      {attachment.type === "Image" ? (
                        <Image className="h-4 w-4 mr-2" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      {editingAttachment?.id === attachment.id ? (
                        <Input
                          value={editingAttachment.name}
                          onChange={(e) => setEditingAttachment({ ...editingAttachment, name: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        attachment.name
                      )}
                    </TableCell>
                    <TableCell>{attachment.type}</TableCell>
                    <TableCell>
                      {editingAttachment?.id === attachment.id ? (
                        <Input
                          value={editingAttachment.caption}
                          onChange={(e) => setEditingAttachment({ ...editingAttachment, caption: e.target.value })}
                          className="h-8"
                        />
                      ) : (
                        attachment.caption || "No Caption"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingAttachment?.id === attachment.id ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSaveEdit}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAttachment(attachment)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No attachments added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t flex justify-between items-center">
          <div className="flex items-center">
            <Checkbox
              id="turbo-mode"
              checked={isTurboMode}
              onCheckedChange={(checked) => setIsTurboMode(checked === true)}
            />
            <Label htmlFor="turbo-mode" className="ml-2 text-sm">
              Turbo Mode (No Files)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="text-primary hover:text-primary/90">
                  <Settings className="h-4 w-4 mr-1" /> Advanced Settings
                </Button>
              </DialogTrigger>
              <AdvancedSendingSettings />
            </Dialog>

            <Button
              variant="link"
              className={`text-primary hover:text-primary/90 ${isScheduled ? "font-semibold" : ""}`}
              onClick={toggleScheduled}
            >
              <Calendar className="h-4 w-4 mr-1" /> {isScheduled ? "Scheduled" : "Schedule"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        {isScheduled && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Scheduled for: {new Date().toLocaleString()}</span>
            <Button variant="outline" size="sm" className="h-7 px-2">
              Edit
            </Button>
          </div>
        )}
        <div className="ml-auto">
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
            onClick={isTemplateMode ? handleSendTemplate : handleSend}
          >
            <Send className="mr-2 h-5 w-5" /> {isScheduled ? "Schedule" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  )
}

