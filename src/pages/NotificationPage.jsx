"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import Card from "../components/Card"
import Button from "../components/Button"
import axios from "axios"
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Info,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from "lucide-react"

const NotificationsPage = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [filteredNotifications, setFilteredNotifications] = useState([])
  const [notificationStats, setNotificationStats] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    type: "",
    isRead: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !user._id) return

      try {
        setLoading(true)
        // Use different API endpoints based on user role

        const apiUrl = `http://localhost:3000/api/notification/${user._id}`
    

        const response = await axios.get(apiUrl);
        console.log("response", response);

        const data = response.data

        if (data.success) {
          setNotifications(data.notifications)
          setFilteredNotifications(data.notifications)
          setNotificationStats({
            total: data.total,
            unread: data.unread,
          })
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user])

  useEffect(() => {
    let result = [...notifications]

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (notification) =>
          notification.title.toLowerCase().includes(term) || notification.message.toLowerCase().includes(term),
      )
    }

    // Apply filters
    if (filters.type) {
      result = result.filter((notification) => notification.type === filters.type)
    }

    if (filters.isRead !== "") {
      const isRead = filters.isRead === "read"
      result = result.filter((notification) => (notification.status === "read") === isRead)
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "type":
          comparison = a.type.localeCompare(b.type)
          break
        case "createdAt":
          comparison = new Date(a.createdAt) - new Date(b.createdAt)
          break
        default:
          comparison = new Date(a.createdAt) - new Date(b.createdAt)
      }

      return filters.sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredNotifications(result)
  }, [notifications, searchTerm, filters])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({
      type: "",
      isRead: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    })
    setSearchTerm("")
  }

  const handleSort = (field) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }))
  }

  const getSortIcon = (field) => {
    if (filters.sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return filters.sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (notification.status === "unread") {
      try {
        await axios.patch(`http://localhost:3000/api/notification/mark-as-read/${notification._id}`)
        // Update local state
        setNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, status: "read" } : n)))

        // Update stats
        setNotificationStats((prev) => ({
          ...prev,
          unread: prev.unread - 1,
        }))
      } catch (error) {
        console.error("Error marking notification as read:", error)
      }
    }

    // Navigate to issue page
    if (notification.issueId) {
      window.location.href = `http://localhost:5173/issues/${notification.issueId}`
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => n.status === "unread")

    // try {
    //   // Mark all unread notifications as read
    //   await Promise.all(
    //     unreadNotifications.map((notification) =>
    //       fetch(`http://localhost:3000/api/notification/mark-as-read/${notification._id}`, {
    //         method: "PUT",
    //       }),
    //     ),
    //   )

    //   // Update local state
    //   setNotifications((prev) => prev.map((notification) => ({ ...notification, status: "read" })))
    //   setNotificationStats((prev) => ({ ...prev, unread: 0 }))
    // } catch (error) {
    //   console.error("Error marking all notifications as read:", error)
    // }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "issue_reported":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "issue_resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "issue_updated":
        return <Clock className="h-5 w-5 text-amber-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      {/* <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <Button onClick={markAllAsRead} variant="outline">
          Mark All as Read
        </Button>
      </div> */}

      {/* Notification Statistics */}
      {notificationStats && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Bell className="h-5 w-5 text-blue-500 mr-2" />
            Notification Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
                  <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{notificationStats.total}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 mr-4">
                  <EyeOff className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">Unread</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{notificationStats.unread}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Notifications</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Stay updated with the latest activities</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notifications..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter className="h-5 w-5 mr-2" />
            Filters
            {isFilterOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="type" className="form-label">
                Type
              </label>
              <select id="type" name="type" className="form-input" value={filters.type} onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="issue_reported">Issue Reported</option>
                <option value="issue_resolved">Issue Resolved</option>
                <option value="issue_updated">Issue Updated</option>
              </select>
            </div>

            <div>
              <label htmlFor="isRead" className="form-label">
                Status
              </label>
              <select
                id="isRead"
                name="isRead"
                className="form-input"
                value={filters.isRead}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            <div>
              <label htmlFor="sortBy" className="form-label">
                Sort By
              </label>
              <select
                id="sortBy"
                name="sortBy"
                className="form-input"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="createdAt">Date</option>
                <option value="title">Title</option>
                <option value="type">Type</option>
              </select>
            </div>

            <div>
              <label htmlFor="sortOrder" className="form-label">
                Sort Order
              </label>
              <select
                id="sortOrder"
                name="sortOrder"
                className="form-input"
                value={filters.sortOrder}
                onChange={handleFilterChange}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications found</h3>
          <p className="text-gray-600 dark:text-gray-300">No notifications match your search criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification._id}
              className={`transition-all hover:shadow-md cursor-pointer ${
                notification.status === "unread" ? "border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">{getTypeIcon(notification.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className={`text-sm font-medium ${
                          notification.status === "unread"
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {notification.status === "unread" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            Unread
                          </span>
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{notification.message}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Click to view issue details</span>
                      <span>{formatDateTime(notification.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
