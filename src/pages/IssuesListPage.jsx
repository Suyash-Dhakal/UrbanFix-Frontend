"use client"

import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import Card from "../components/Card"
import Badge from "../components/Badge"
import Button from "../components/Button"
import { Search, Filter, MapPin, Calendar, User, ChevronDown, ChevronUp, AlertTriangle, Edit } from "lucide-react"

// Status badge mapping
const statusBadges = {
  pending: { variant: "warning", label: "Pending Verification" },
  verified: { variant: "info", label: "Verified" },
  in_progress: { variant: "primary", label: "In Progress" },
  resolved: { variant: "success", label: "Resolved" },
}

const categories = [
  { id: "Road", name: "Road" },
  { id: "Streetlight", name: "Streetlight" },
  { id: "Garbage", name: "Garbage" },
  { id: "Water", name: "Water" },
  { id: "Electricity", name: "Electricity" },
  { id: "Other", name: "Other" },
]

const IssuesListPage = () => {
  const { isAuthenticated, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [issues, setIssues] = useState([])
  const [filteredIssues, setFilteredIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    ward: searchParams.get("ward") || "",
    status: searchParams.get("status") || "",
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState("newest")

  // Fetch issues from API with comprehensive error handling
  const fetchIssues = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      if (filters.category) params.append("category", filters.category)
      if (filters.ward) params.append("ward", filters.ward)
      if (filters.status) params.append("status", filters.status)

      const queryString = params.toString()
      const url = `http://localhost:3000/api/issue/reports${queryString ? `?${queryString}` : ""}`

      // Create AbortController for timeout handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      let response
      try {
        response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
        })
        clearTimeout(timeoutId)
      } catch (fetchError) {
        clearTimeout(timeoutId)

        if (fetchError.name === "AbortError") {
          throw new Error("Request timed out. Please check your connection and try again.")
        }

        if (!navigator.onLine) {
          throw new Error("No internet connection. Please check your network and try again.")
        }

        throw new Error("Unable to connect to the server. Please try again later.")
      }

      // Handle HTTP errors
      if (!response.ok) {
        let errorMessage = "Failed to fetch issues"

        switch (response.status) {
          case 400:
            errorMessage = "Invalid request. Please check your filters and try again."
            break
          case 401:
            errorMessage = "Authentication required. Please log in and try again."
            break
          case 403:
            errorMessage = "Access denied. You do not have permission to view these issues."
            break
          case 404:
            errorMessage = "Issues endpoint not found. Please contact support."
            break
          case 429:
            errorMessage = "Too many requests. Please wait a moment and try again."
            break
          case 500:
            errorMessage = "Server error. Please try again later."
            break
          case 502:
          case 503:
          case 504:
            errorMessage = "Service temporarily unavailable. Please try again later."
            break
          default:
            errorMessage = `Server responded with error ${response.status}. Please try again.`
        }

        throw new Error(errorMessage)
      }

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        throw new Error("Invalid response from server. Please try again.")
      }

      // Validate API response structure
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format from server.")
      }

      if (!data.success) {
        const apiError = data.message || data.error || "Unknown error occurred"
        throw new Error(`API Error: ${apiError}`)
      }

      if (!Array.isArray(data.reports)) {
        console.warn("API returned non-array reports:", data.reports)
        setIssues([])
        setFilteredIssues([])
        return
      }

      // Transform API data with error handling for each item
      const transformedIssues = data.reports
        .map((report, index) => {
          try {
            // Validate required fields
            if (!report._id || !report.title) {
              console.warn(`Skipping invalid report at index ${index}:`, report)
              return null
            }

            return {
              id: report._id,
              title: report.title || "Untitled Issue",
              description: report.description || "No description provided",
              category: report.category || "Other",
              categoryName: report.category || "Other",
              ward: report.ward || "1",
              wardName: `Ward ${report.ward || "1"}`,
              status: report.status || "pending",
              location: report.location || "Location not specified",
              reportedBy: report.reportedBy?.name || "Anonymous",
              reportedByUserId: report.reportedBy?._id || null,
              reportedAt: report.createdAt || new Date().toISOString(),
              upvotes: Number(report.upvotes) || 0,
              imageUrl: report.image || "/placeholder.svg?height=200&width=300",
            }
          } catch (transformError) {
            console.error(`Error transforming report at index ${index}:`, transformError, report)
            return null
          }
        })
        .filter(Boolean) // Remove null entries

      setIssues(transformedIssues)
      setFilteredIssues(transformedIssues)

      // Show warning if some reports were skipped
      if (transformedIssues.length < data.reports.length) {
        console.warn(`${data.reports.length - transformedIssues.length} reports were skipped due to invalid data`)
      }
    } catch (err) {
      console.error("Error fetching issues:", err)
      setError(err.message || "An unexpected error occurred while fetching issues.")
      setIssues([])
      setFilteredIssues([])
    } finally {
      setLoading(false)
    }
  }

  // Retry function with exponential backoff
  const retryFetch = async (retryCount = 0) => {
    const maxRetries = 3
    const baseDelay = 1000 // 1 second

    try {
      await fetchIssues()
    } catch (error) {
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount) // Exponential backoff
        console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`)

        setTimeout(() => {
          retryFetch(retryCount + 1)
        }, delay)
      } else {
        setError(`Failed to fetch issues after ${maxRetries} attempts. ${error.message}`)
      }
    }
  }

  // Update URL parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.category) params.set("category", filters.category)
    if (filters.ward) params.set("ward", filters.ward)
    if (filters.status) params.set("status", filters.status)

    setSearchParams(params)
    fetchIssues()
  }, [filters])

  // Apply client-side search and sorting
  useEffect(() => {
    let result = [...issues]

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (issue) =>
          issue.title.toLowerCase().includes(term) ||
          issue.description.toLowerCase().includes(term) ||
          issue.location.toLowerCase().includes(term),
      )
    }

    // Apply sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt))
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.reportedAt) - new Date(b.reportedAt))
    } else if (sortBy === "upvotes") {
      result.sort((a, b) => b.upvotes - a.upvotes)
    }

    setFilteredIssues(result)
  }, [issues, searchTerm, sortBy])

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      if (error && error.includes("internet connection")) {
        fetchIssues()
      }
    }

    const handleOffline = () => {
      setError("No internet connection. Please check your network.")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [error])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({
      category: "",
      ward: "",
      status: "",
    })
    setSearchTerm("")
    setSearchParams({})
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const canEditIssue = (issue) => {
    return isAuthenticated && user && user.id === issue.reportedByUserId && issue.status === "pending"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  error && (
    <div className="text-center py-12">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Unable to load issues</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto">{error}</p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button onClick={fetchIssues} className="min-w-[120px]">
          Try Again
        </Button>
        <Button variant="outline" onClick={retryFetch} className="min-w-[120px]">
          Auto Retry
        </Button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        If the problem persists, please contact support or try refreshing the page.
      </p>
    </div>
  )

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Reported Issues</h1>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search issues..."
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

          <select className="form-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="upvotes">Most Upvotes</option>
          </select>
        </div>
      </div>

      {isFilterOpen && (
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="form-input"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ward" className="form-label">
                Ward
              </label>
              <select id="ward" name="ward" className="form-input" value={filters.ward} onChange={handleFilterChange}>
                <option value="">All Wards</option>
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Ward {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="form-input"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending Verification</option>
                <option value="verified">Verified</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
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

      {filteredIssues.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No issues found</h3>
          <p className="text-gray-600 dark:text-gray-300">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredIssues.map((issue) => (
            <Card key={issue.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <img
                    src={issue.imageUrl || "/placeholder.svg"}
                    alt={issue.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="md:w-2/3 p-6">
                  <div className="flex flex-wrap items-start justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{issue.title}</h2>
                    <Badge variant={statusBadges[issue.status]?.variant || "default"}>
                      {statusBadges[issue.status]?.label || issue.status}
                    </Badge>
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

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="default">{issue.categoryName}</Badge>
                    <Badge variant="default">{issue.wardName}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <User className="h-4 w-4 mr-1" />
                      <span>By {issue.reportedBy}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {canEditIssue(issue) && (
                        <Link to={`/issues/${issue.id}`}>
                          <Button variant="outline" size="sm" className="mr-2">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      )}
                      <Link to={`/issues/${issue.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
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

export default IssuesListPage
