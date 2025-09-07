"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Card from "../components/Card"
import Button from "../components/Button"
import {
  BarChart,
  PieChart,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  MapPin,
  Calendar,
} from "lucide-react"

// Mock data for admin dashboard
const mockStats = {
  totalIssues: 1234,
  pendingIssues: 42,
  verifiedIssues: 156,
  inProgressIssues: 321,
  resolvedIssues: 715,
  totalUsers: 5678,
  issuesByCategory: [
    { name: "Pothole", count: 432 },
    { name: "Streetlight", count: 287 },
    { name: "Garbage", count: 198 },
    { name: "Graffiti", count: 145 },
    { name: "Sidewalk", count: 102 },
    { name: "Other", count: 70 },
  ],
  issuesByWard: [
    { name: "Ward 1 - Downtown", count: 345 },
    { name: "Ward 2 - Westside", count: 289 },
    { name: "Ward 3 - Northside", count: 267 },
    { name: "Ward 4 - Eastside", count: 198 },
    { name: "Ward 5 - Southside", count: 135 },
  ],
  recentIssues: [
    {
      id: 1,
      title: "Large pothole on Main Street",
      status: "pending",
      location: "123 Main St",
      reportedAt: "2023-05-15T10:30:00",
      imageUrl: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 2,
      title: "Broken streetlight on Elm Street",
      status: "pending",
      location: "456 Elm St",
      reportedAt: "2023-05-10T15:45:00",
      imageUrl: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 3,
      title: "Overflowing garbage bin at Central Park",
      status: "pending",
      location: "Central Park, Main Entrance",
      reportedAt: "2023-05-18T09:15:00",
      imageUrl: "/placeholder.svg?height=100&width=100",
    },
  ],
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setStats(mockStats)
      setIsLoading(false)
    }, 500)
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Overview of all reported urban issues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
              <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Issues</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalIssues}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 mr-4">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingIssues}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900/30 mr-4">
              <BarChart className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgressIssues}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Resolved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolvedIssues}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Issues by Category" className="lg:col-span-2">
          <div className="h-64 flex items-center justify-center">
            <div className="flex items-center">
              <PieChart className="h-8 w-8 text-gray-400 mr-2" />
              <span className="text-gray-500 dark:text-gray-400">Chart would be rendered here</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
            {stats.issuesByCategory.map((category) => (
              <div key={category.name} className="flex justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-md">
                <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                <span className="font-medium text-gray-900 dark:text-white">{category.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Issues by Ward">
          <div className="h-64 flex items-center justify-center">
            <div className="flex items-center">
              <BarChart className="h-8 w-8 text-gray-400 mr-2" />
              <span className="text-gray-500 dark:text-gray-400">Chart would be rendered here</span>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {stats.issuesByWard.map((ward) => (
              <div key={ward.name} className="flex justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-md">
                <span className="text-gray-700 dark:text-gray-300">{ward.name}</span>
                <span className="font-medium text-gray-900 dark:text-white">{ward.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Pending Verification"
          subtitle="Issues that need admin verification"
          footer={
            <Link
              to="/admin/pending"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all pending issues
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          }
        >
          <div className="space-y-4">
            {stats.recentIssues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-md"
              >
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0">
                  <img
                    src={issue.imageUrl || "/placeholder.svg"}
                    alt="Issue thumbnail"
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{issue.title}</div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{issue.location}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(issue.reportedAt)}</span>
                  </div>
                </div>
                <Link to={`/issues/${issue.id}`}>
                  <Button variant="outline" size="sm">
                    Verify
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="User Statistics"
          subtitle="Overview of user activity"
          footer={
            <Link
              to="/admin/users"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all users
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          }
        >
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 dark:text-gray-300">New Users (This Week)</span>
                <span className="font-medium text-gray-900 dark:text-white">124</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "25%" }}></div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 dark:text-gray-300">Active Users (This Month)</span>
                <span className="font-medium text-gray-900 dark:text-white">2,345</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 dark:text-gray-300">Issues per User (Average)</span>
                <span className="font-medium text-gray-900 dark:text-white">3.2</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "40%" }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboardPage
