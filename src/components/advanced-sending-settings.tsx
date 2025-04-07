"use client"

import { Checkbox } from "@/components/ui/checkbox"

import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Clock, Users, Zap, Calendar, AlarmClock } from "lucide-react"

export default function AdvancedSendingSettings() {
  const [timeGap, setTimeGap] = useState(3)
  const [batchSize, setBatchSize] = useState(10)
  const [retryFailed, setRetryFailed] = useState(true)
  const [maxRetries, setMaxRetries] = useState(3)
  const [randomizeOrder, setRandomizeOrder] = useState(false)
  const [enableScheduling, setEnableScheduling] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your advanced sending settings have been saved",
    })
    // In a real app, this would save the settings to a database or local storage
  }

  // Get current date and time for default values
  const getCurrentDateTime = () => {
    const now = new Date()
    const date = now.toISOString().split("T")[0]
    const time = now.toTimeString().split(" ")[0].substring(0, 5)

    if (!scheduleDate) setScheduleDate(date)
    if (!scheduleTime) setScheduleTime(time)
  }

  // Call once when component mounts
  useState(() => {
    getCurrentDateTime()
  })

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Advanced Sending Settings</DialogTitle>
        <DialogDescription>
          Configure default settings for sending messages. These settings help optimize delivery and avoid rate limits.
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="time-gap" className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  Default Time Gap
                </Label>
                <p className="text-sm text-muted-foreground">Time to wait between sending each message (in seconds)</p>
              </div>
              <span className="font-medium">{timeGap} sec</span>
            </div>
            <Slider
              id="time-gap"
              min={1}
              max={10}
              step={1}
              value={[timeGap]}
              onValueChange={(value) => setTimeGap(value[0])}
              className="w-full"
            />
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="batch-size" className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  Default Batch Size
                </Label>
                <p className="text-sm text-muted-foreground">Number of messages to send in each batch</p>
              </div>
              <span className="font-medium">{batchSize} messages</span>
            </div>
            <Slider
              id="batch-size"
              min={5}
              max={50}
              step={5}
              value={[batchSize]}
              onValueChange={(value) => setBatchSize(value[0])}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="retry-failed" className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-muted-foreground" />
                Retry Failed Messages
              </Label>
              <p className="text-sm text-muted-foreground">Automatically retry messages that fail to send</p>
            </div>
            <Switch id="retry-failed" checked={retryFailed} onCheckedChange={setRetryFailed} />
          </div>

          {retryFailed && (
            <div className="grid gap-2 pl-6 border-l-2 border-muted ml-2">
              <Label htmlFor="max-retries">Maximum Retry Attempts</Label>
              <Input
                id="max-retries"
                type="number"
                min={1}
                max={10}
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number.parseInt(e.target.value) || 1)}
              />
            </div>
          )}

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="randomize-order">Randomize Sending Order</Label>
              <p className="text-sm text-muted-foreground">Send messages in random order to appear more natural</p>
            </div>
            <Switch id="randomize-order" checked={randomizeOrder} onCheckedChange={setRandomizeOrder} />
          </div>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-6 mt-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="enable-scheduling" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                Enable Message Scheduling
              </Label>
              <p className="text-sm text-muted-foreground">Schedule messages to be sent at a specific time</p>
            </div>
            <Switch id="enable-scheduling" checked={enableScheduling} onCheckedChange={setEnableScheduling} />
          </div>

          {enableScheduling && (
            <div className="grid gap-4 pl-6 border-l-2 border-muted ml-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="schedule-date" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    Date
                  </Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schedule-time" className="flex items-center">
                    <AlarmClock className="h-4 w-4 mr-2 text-muted-foreground" />
                    Time
                  </Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="schedule-timezone">Timezone</Label>
                <select
                  id="schedule-timezone"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="local">Local Time</option>
                  <option value="utc">UTC</option>
                  <option value="est">Eastern Time (EST/EDT)</option>
                  <option value="pst">Pacific Time (PST/PDT)</option>
                  <option value="gmt">Greenwich Mean Time (GMT)</option>
                </select>
              </div>

              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-sm font-medium">Scheduled Time Preview:</p>
                <p className="text-sm text-muted-foreground">
                  {scheduleDate && scheduleTime
                    ? new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString()
                    : "Please select date and time"}
                </p>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Reschedule Options</h3>
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="reschedule-failed" />
                <Label htmlFor="reschedule-failed">Automatically reschedule failed messages</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="reschedule-notify" />
                <Label htmlFor="reschedule-notify">Notify me when scheduled messages are sent</Label>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button variant="outline">Reset to Defaults</Button>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Save Settings
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

