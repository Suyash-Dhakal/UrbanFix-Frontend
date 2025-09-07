"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios" // Added axios import
import { useAuth } from "../hooks/useAuth"
import Card from "../components/Card"
import Badge from "../components/Badge"
import Button from "../components/Button"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  ArrowRight,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

const UserDashboardPage = () => {
  const { user } = useAuth()
  const [userIssues, setUserIssues] = useState([])
  const [filteredIssues, setFilteredIssues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    verified: 0,
    resolved: 0,
    cancelled: 0,
  })

  useEffect(() => {
    const fetchUserIssues = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get("http://localhost:3000/api/issue/my-reports")

        if (response.data.success) {
          // Map API response to component format
          const mappedIssues = response.data.reports.map((report) => ({
            id: report._id,
            title: report.title,
            description: report.description,
            category: report.category.toLowerCase().replace(/\s+/g, "_"),
            categoryName: report.category,
            status: report.status,
            location: `Ward ${report.ward}`,
            reportedAt: report.createdAt,
            imageUrl: report.image || "/placeholder.svg?height=200&width=300",
          }))

          setUserIssues(mappedIssues)
          setFilteredIssues(mappedIssues)

          // Set counts from API response
          setStatusCounts({
            pending: response.data.pending,
            verified: response.data.verified,
            resolved: response.data.resolved,
            cancelled: response.data.cancelled,
          })
        }
      } catch (error) {
        console.error("Error fetching user issues:", error)
        // Handle error - could show toast notification
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserIssues()
  }, [])

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredIssues(userIssues)
    } else {
      setFilteredIssues(userIssues.filter((issue) => issue.status === statusFilter))
    }
  }, [statusFilter, userIssues])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending Verification</Badge>
      case "verified":
        return <Badge variant="info">Verified</Badge>
      case "in_progress":
        return <Badge variant="primary">In Progress</Badge>
      case "resolved":
        return <Badge variant="success">Resolved</Badge>
      case "cancelled": // Added cancelled status
        return <Badge variant="danger">Cancelled</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 mr-4">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
              <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Verified</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.verified}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 mr-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.cancelled}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.resolved}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-0">Your Reported Issues</h2>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <Filter className="h-5 w-5 mr-2" />
              Filter
              {isFilterOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>

            <Link to="/dashboard/report">
              <Button>Report New Issue</Button>
            </Link>
          </div>
        </div>

        {isFilterOpen && (
          <Card className="mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  statusFilter === "all"
                    ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}
                onClick={() => setStatusFilter("all")}
              >
                All Issues
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  statusFilter === "pending"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}
                onClick={() => setStatusFilter("pending")}
              >
                Pending
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  statusFilter === "verified"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}
                onClick={() => setStatusFilter("verified")}
              >
                Verified
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  statusFilter === "cancelled"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}
                onClick={() => setStatusFilter("cancelled")}
              >
                Cancelled
              </button>

              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  statusFilter === "resolved"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}
                onClick={() => setStatusFilter("resolved")}
              >
                Resolved
              </button>
            </div>
          </Card>
        )}

        {filteredIssues.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No issues found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You haven't reported any issues with the selected status yet.
              </p>
              <Link to="/dashboard/report">
                <Button>Report an Issue</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredIssues.map((issue) => (
              <Card key={issue.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 h-48 md:h-auto">
                    <img
                      src={issue.imageUrl || "/placeholder.svg"}
                      alt={issue.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="md:w-3/4 p-6">
                    <div className="flex flex-wrap items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{issue.title}</h3>
                      {getStatusBadge(issue.status)}
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{issue.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{issue.location}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Reported on {formatDate(issue.reportedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="default">{issue.categoryName}</Badge>

                      <a href={`http://localhost:5173/issues/${issue.id}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          View Details
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDashboardPage
