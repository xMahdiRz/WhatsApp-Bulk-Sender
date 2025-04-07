"use client"

import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Clock, Shuffle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSendingSettings } from "@/contexts/sending-settings"

// Static default values
const DEFAULT_SETTINGS = {
  timeGap: 0,
  randomizeOrder: false
}

export default function AdvancedSendingSettings() {
  const { settings, updateSettings, resetSettings: contextResetSettings } = useSendingSettings()
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your advanced sending settings have been saved",
    })
  }

  const resetToDefaults = () => {
    contextResetSettings(DEFAULT_SETTINGS)
    toast({
      title: "Settings Reset",
      description: "Your settings have been reset to default values",
    })
  }

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Advanced Sending Settings</DialogTitle>
        <DialogDescription>
          Configure default settings for sending messages. These settings help optimize delivery and avoid rate limits.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="time-gap" className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                Time Gap Between Messages
              </Label>
              <p className="text-sm text-muted-foreground">Time to wait between sending each message (in seconds)</p>
            </div>
            <span className="font-medium">{settings.timeGap} sec</span>
          </div>
          <Slider
            id="time-gap"
            min={0}
            max={10}
            step={1}
            value={[settings.timeGap]}
            onValueChange={(value) => updateSettings({ timeGap: value[0] })}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="randomize-order" className="flex items-center">
              <Shuffle className="h-4 w-4 mr-2 text-muted-foreground" />
              Randomize Sending Order
            </Label>
            <p className="text-sm text-muted-foreground">Send messages in random order to appear more natural</p>
          </div>
          <Switch 
            id="randomize-order" 
            checked={settings.randomizeOrder} 
            onCheckedChange={(checked) => updateSettings({ randomizeOrder: checked })} 
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={resetToDefaults}>Reset to Defaults</Button>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Save Settings
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

