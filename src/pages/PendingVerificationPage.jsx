"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../hooks/useAuth"
import { useToast } from "../hooks/useToast"
import Card from "../components/Card"
import Badge from "../components/Badge"
import Button from "../components/Button"
import Modal from "../components/Modal"
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  MessageSquare,
} from "lucide-react"

const categories = [
  { id: "Road", name: "Road" },
  { id: "Streetlight", name: "Streetlight" },
  { id: "Garbage", name: "Garbage" },
  { id: "Water", name: "Water" },
  { id: "Electricity", name: "Electricity" },
  { id: "Other", name: "Other" },
]

const PendingVerificationPage = () => {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState("pending")
  const [issues, setIssues] = useState([])
  const [filteredIssues, setFilteredIssues] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    category: "",
    ward: "",
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [loading, setLoading] = useState(true)
  const [wards, setWards] = useState([])

  // Selected issue for detail view
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Status change modal
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState("")
  const [statusNote, setStatusNote] = useState("")

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true)
      try {
        let apiUrl = ""
        if (activeTab === "pending") {
          apiUrl = "http://localhost:3000/api/issue/admin/pending-verification"
        } else {
          apiUrl = "http://localhost:3000/api/issue/admin/verified"
        }

        const response = await axios.get(apiUrl)

        if (response.data.success) {
          // Transform API data to match component structure
          const transformedIssues = response.data.issues.map((issue) => ({
            id: issue._id,
            title: issue.title,
            description: issue.description,
            category: issue.category,
            categoryName: issue.category,
            ward: issue.ward,
            wardName: `Ward ${issue.ward}`,
            status: issue.status,
            location: `Lat: ${issue.location.latitude}, Lng: ${issue.location.longitude}`,
            reportedBy: issue.reportedBy, // This might need to be populated with actual user name
            reportedByUserId: issue.reportedBy,
            reportedAt: issue.createdAt,
            verifiedAt: issue.updatedAt !== issue.createdAt ? issue.updatedAt : null,
            verifiedBy: issue.status === "verified" ? "Admin User" : null,
            upvotes: 0, // Not provided in API, defaulting to 0
            comments: issue.commentCount,
            imageUrl: issue.image,
            images: issue.image ? [issue.image] : [],
            adminFeedback: issue.adminFeedback,
          }))

          setIssues(transformedIssues)
          setFilteredIssues(transformedIssues)

          const uniqueWards = [...new Set(transformedIssues.map((issue) => issue.ward))]
          const wardOptions = uniqueWards.map((ward) => ({
            id: ward,
            name: `Ward ${ward}`,
          }))
          setWards(wardOptions)
        } else {
          addToast("Failed to fetch issues", "error")
          setIssues([])
          setFilteredIssues([])
        }
      } catch (error) {
        console.error("Error fetching issues:", error)
        addToast("Error fetching issues. Please try again.", "error")
        setIssues([])
        setFilteredIssues([])
      } finally {
        setLoading(false)
      }
    }

    fetchIssues()
  }, [activeTab, addToast])

  useEffect(() => {
    let result = [...issues]

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (issue) =>
          issue.title.toLowerCase().includes(term) ||
          issue.description.toLowerCase().includes(term) ||
          issue.location.toLowerCase().includes(term) ||
          issue.reportedBy.toLowerCase().includes(term),
      )
    }

    // Apply filters
    if (filters.category) {
      result = result.filter((issue) => issue.category === filters.category)
    }

    if (filters.ward) {
      result = result.filter((issue) => issue.ward === filters.ward)
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
  }, [issues, searchTerm, filters, sortBy])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({
      category: "",
      ward: "",
    })
    setSearchTerm("")
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleViewDetails = (issue) => {
    setSelectedIssue(issue)
    setShowDetailModal(true)
  }

  const handleStatusChange = (issue, action) => {
    setSelectedIssue(issue)
    setStatusAction(action)
    setStatusNote("")
    setShowStatusModal(true)
  }

  const confirmStatusChange = async () => {
    setLoading(true)

    try {
      let apiUrl = ""
      let successMessage = ""

      if (statusAction === "verify") {
        apiUrl = "http://localhost:3000/api/issue/admin/verify-issue"
        successMessage = "Issue has been verified"
      } else if (statusAction === "cancel") {
        apiUrl = "http://localhost:3000/api/issue/admin/reject-issue"
        successMessage = "Issue has been cancelled"
      } else if (statusAction === "resolve") {
        apiUrl = "http://localhost:3000/api/issue/admin/resolve-issue"
        successMessage = "Issue has been marked as resolved"
      }

      const response = await axios.post(apiUrl, {
        id: selectedIssue.id,
        note: statusNote, // Include the optional note
      })

      if (response.data.success) {
        // Remove the issue from the current list
        const updatedIssues = issues.filter((issue) => issue.id !== selectedIssue.id)
        setIssues(updatedIssues)
        setFilteredIssues(
          updatedIssues.filter(
            (issue) =>
              (!filters.category || issue.category === filters.category) &&
              (!filters.ward || issue.ward === filters.ward),
          ),
        )

        setShowStatusModal(false)
        setSelectedIssue(null)
        addToast(response.data.message || successMessage, "success")
      } else {
        addToast(response.data.message || "Operation failed", "error")
      }
    } catch (error) {
      console.error("Error updating issue status:", error)
      addToast("Error updating issue status. Please try again.", "error")
    } finally {
      setLoading(false)
    }
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
      case "cancelled":
        return <Badge variant="danger">Cancelled</Badge>
      default:
        return null
    }
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Issue Verification</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`py-3 px-6 font-medium text-sm focus:outline-none ${
            activeTab === "pending"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Verification
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm focus:outline-none ${
            activeTab === "verified"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("verified")}
        >
          Verified Issues
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeTab === "pending" ? "Issues Awaiting Verification" : "Verified Issues"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {activeTab === "pending"
              ? "Review and verify reported issues or mark them as invalid"
              : "Review verified issues and mark them as resolved when fixed"}
          </p>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Ward/Area
              </label>
              <select id="ward" name="ward" className="form-input" value={filters.ward} onChange={handleFilterChange}>
                <option value="">All Wards</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
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

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No issues found</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {activeTab === "pending"
              ? "There are no pending issues that match your criteria"
              : "There are no verified issues that match your criteria"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{issue.title}</h2>
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

                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <User className="h-4 w-4 mr-1" />
                      <span>By {issue.reportedBy}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant="default">{issue.categoryName}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        <span>{issue.upvotes} upvotes</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>{issue.comments} comments</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(issue)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>

                      {activeTab === "pending" && (
                        <>
                          <Button variant="primary" size="sm" onClick={() => handleStatusChange(issue, "verify")}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleStatusChange(issue, "cancel")}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}

                      {activeTab === "verified" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusChange(issue, "resolve")}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded-md transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Issue Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Issue Details" size="lg">
        {selectedIssue && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedIssue.title}</h2>
              {getStatusBadge(selectedIssue.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</h3>
                <p className="text-gray-900 dark:text-white">{selectedIssue.categoryName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ward</h3>
                <p className="text-gray-900 dark:text-white">{selectedIssue.wardName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Location</h3>
                <p className="text-gray-900 dark:text-white">{selectedIssue.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reported By</h3>
                <p className="text-gray-900 dark:text-white">{selectedIssue.reportedBy}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reported On</h3>
                <p className="text-gray-900 dark:text-white">{formatDate(selectedIssue.reportedAt)}</p>
              </div>
              {selectedIssue.verifiedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Verified On</h3>
                  <p className="text-gray-900 dark:text-white">{formatDate(selectedIssue.verifiedAt)}</p>
                </div>
              )}
              {selectedIssue.verifiedBy && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Verified By</h3>
                  <p className="text-gray-900 dark:text-white">{selectedIssue.verifiedBy}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h3>
              <p className="text-gray-900 dark:text-white whitespace-pre-line">{selectedIssue.description}</p>
            </div>

            {selectedIssue.adminFeedback && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Admin Feedback</h3>
                <p className="text-gray-900 dark:text-white whitespace-pre-line">{selectedIssue.adminFeedback}</p>
              </div>
            )}

            {selectedIssue.images && selectedIssue.images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Images</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedIssue.images.map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Issue image ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>

              {activeTab === "pending" && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowDetailModal(false)
                      handleStatusChange(selectedIssue, "verify")
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verify
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setShowDetailModal(false)
                      handleStatusChange(selectedIssue, "cancel")
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              )}

              {activeTab === "verified" && (
                <Button
                  variant="success"
                  onClick={() => {
                    setShowDetailModal(false)
                    handleStatusChange(selectedIssue, "resolve")
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Resolved
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={
          statusAction === "verify"
            ? "Verify Issue"
            : statusAction === "cancel"
              ? "Cancel Issue"
              : "Mark Issue as Resolved"
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button
              variant={statusAction === "verify" ? "primary" : statusAction === "cancel" ? "danger" : "success"}
              onClick={confirmStatusChange}
            >
              Confirm
            </Button>
          </>
        }
      >
        {selectedIssue && (
          <div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {statusAction === "verify"
                ? "Are you sure you want to verify this issue? This will mark it as confirmed and ready for resolution."
                : statusAction === "cancel"
                  ? "Are you sure you want to cancel this issue? This will mark it as invalid or duplicate."
                  : "Are you sure you want to mark this issue as resolved? This indicates that the problem has been fixed."}
            </p>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Issue:</h3>
              <p className="text-gray-600 dark:text-gray-300">{selectedIssue.title}</p>
            </div>

            <div className="mb-4">
              <label htmlFor="statusNote" className="form-label">
                Add a note (optional)
              </label>
              <textarea
                id="statusNote"
                className="form-input"
                rows={3}
                placeholder={
                  statusAction === "verify"
                    ? "Add any verification notes..."
                    : statusAction === "cancel"
                      ? "Explain why this issue is being cancelled..."
                      : "Add any resolution details..."
                }
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PendingVerificationPage
