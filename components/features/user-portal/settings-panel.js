"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Bell, Moon, Globe, Shield, Save } from "lucide-react"

export function SettingsPanel() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: "English",
    privacy: "Public"
  })

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  return (
    <Card className="settings-panel">
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="settings-item">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <Label htmlFor="notifications">Push Notifications</Label>
          </div>
          <Switch
            id="notifications"
            checked={settings.notifications}
            onCheckedChange={() => handleSettingChange("notifications")}
          />
        </div>

        <div className="settings-item">
          <div className="flex items-center space-x-2">
            <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <Label htmlFor="darkMode">Dark Mode</Label>
          </div>
          <Switch
            id="darkMode"
            checked={settings.darkMode}
            onCheckedChange={() => handleSettingChange("darkMode")}
          />
        </div>

        <div className="settings-item">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <Label>Language</Label>
          </div>
          <select
            className="bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
            value={settings.language}
            onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>

        <div className="settings-item">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <Label>Privacy</Label>
          </div>
          <select
            className="bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
            value={settings.privacy}
            onChange={(e) => setSettings(prev => ({ ...prev, privacy: e.target.value }))}
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
            <option value="Friends">Friends Only</option>
          </select>
        </div>

        <Button className="w-full" onClick={() => console.log("Saving settings:", settings)}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </CardContent>
    </Card>
  )
} 