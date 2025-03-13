"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Settings, LogOut, Camera } from "lucide-react"

export function UserInfoPanel() {
  const router = useRouter()
  const [user] = useState({
    name: "John Doe",
    email: "john@example.com",
    avatarUrl: null,
    bio: "AI Communication Enthusiast"
  })

  const handleProfileEdit = () => {
    router.push("/profile")
  }

  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log("Logging out...")
  }

  return (
    <Card className="user-info-panel">
      <CardHeader className="user-info-header">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="bg-purple-600 text-xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="outline"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{user.bio}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="user-info-content">
        <Button
          variant="default"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 rounded-full"
          onClick={handleProfileEdit}
        >
          <User className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </CardContent>
    </Card>
  )
} 