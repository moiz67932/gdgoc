"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, MessageSquare, Star, Trophy, TrendingUp, Users, Calendar, Target } from "lucide-react"

export function DashboardWidgets() {
  const stats = [
    {
      title: "Total Conversations",
      value: "156",
      icon: MessageSquare,
      description: "Your AI chat history",
      trend: "+12%",
      trendUp: true
    },
    {
      title: "Active Streak",
      value: "7 days",
      icon: Activity,
      description: "Current learning streak",
      trend: "Best: 14 days",
      trendUp: true
    },
    {
      title: "Achievement Points",
      value: "2,450",
      icon: Trophy,
      description: "Points earned",
      trend: "+150",
      trendUp: true
    },
    {
      title: "Favorite Topics",
      value: "12",
      icon: Star,
      description: "Topics you've engaged with",
      trend: "+2 this week",
      trendUp: true
    }
  ]

  const recentActivities = [
    {
      title: "Completed Machine Learning Course",
      description: "Advanced Neural Networks Module",
      time: "2 hours ago",
      icon: Target
    },
    {
      title: "Joined Study Group",
      description: "Natural Language Processing",
      time: "5 hours ago",
      icon: Users
    },
    {
      title: "Achieved Weekly Goal",
      description: "Completed 5 learning sessions",
      time: "1 day ago",
      icon: Trophy
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">Last 7 days</span>
        </div>
      </div>
      
      <div className="stats-grid">
        {stats.map((stat) => (
          <Card key={stat.title} className="widget-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <stat.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">{stat.trend}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="widget-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <activity.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 