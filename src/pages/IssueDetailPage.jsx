"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useToast } from "../hooks/useToast"
import axios from "axios"
import Card from "../components/Card"
import Badge from "../components/Badge"
import Button from "../components/Button"
import Modal from "../components/Modal"
import {
  MapPin,
  Calendar,
  User,
  MessageSquare,
  Flag,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Edit,
  Camera,
  Trash2,
} from "lucide-react"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Create axios instance with base URL and default timeout
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Categories matching your API
const categories = [
  { id: "Road", name: "Road" },
  { id: "Streetlight", name: "Streetlight" },
  { id: "Garbage", name: "Garbage" },
  { id: "Water", name: "Water" },
  { id: "Electricity", name: "Electricity" },
  { id: "Other", name: "Other" },
]

// Status badge mapping
const statusBadges = {
  pending: { variant: "warning", label: "Pending Verification" },
  verified: { variant: "info", label: "Verified" },
  in_progress: { variant: "primary", label: "In Progress" },
  resolved: { variant: "success", label: "Resolved" },
}

const IssueDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { addToast } = useToast()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comment, setComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)

  // Edit issue state
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    images: [],
  })
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch issue details from API
  const fetchIssue = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get(`/issue/report/${id}`)
      const data = response.data

      if (!data || !data.success || !data.report) {
        throw new Error(data.message || "Invalid response format")
      }

      // Transform API data to match component expectations
      const report = data.report
      const transformedIssue = {
        id: report._id,
        title: report.title || "Untitled Issue",
        description: report.description || "No description provided",
        category: report.category || "Other",
        categoryName: report.category || "Other",
        ward: report.ward || "1",
        wardName: `Ward ${report.ward || "1"}`,
        status: report.status || "pending",
        location:
          report.location?.latitude && report.location?.longitude
            ? `Lat: ${report.location.latitude}, Long: ${report.location.longitude}`
            : "Location not specified",
        coordinates:
          report.location?.latitude && report.location?.longitude
            ? { lat: report.location.latitude, lng: report.location.longitude }
            : null,
        reportedBy: report.reportedBy?.name || "Anonymous",
        reportedByUserId: report.reportedBy?._id || null,
        reportedAt: report.createdAt || new Date().toISOString(),
        updatedAt: report.updatedAt || report.createdAt || new Date().toISOString(),
        commentCount: report.commentCount || 0,
        adminFeedback: report.adminFeedback || "",
        images: report.image ? [report.image] : [],
        comments: [], // Comments would need separate API call
        timeline: [
          {
            id: 1,
            status: report.status,
            date: report.createdAt,
            description: "Issue reported",
          },
        ],
      }

      setIssue(transformedIssue)

      // Initialize edit form data
      setEditFormData({
        title: transformedIssue.title,
        description: transformedIssue.description,
        category: transformedIssue.category,
        location: transformedIssue.location,
        images: transformedIssue.images.map((url, index) => ({
          id: `existing-${index}`,
          preview: url,
          isExisting: true,
        })),
      })
    } catch (err) {
      console.error("Error fetching issue:", err)

      // Handle different types of axios errors
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = err.response.status
        let errorMessage = "Failed to fetch issue details"

        switch (status) {
          case 404:
            errorMessage = "Issue not found"
            break
          case 401:
            errorMessage = "Authentication required"
            break
          case 403:
            errorMessage = "Access denied"
            break
          case 500:
            errorMessage = "Server error. Please try again later."
            break
          default:
            errorMessage = `Server error ${status}`
        }

        setError(errorMessage)
      } else if (err.request) {
        // The request was made but no response was received
        setError("No response from server. Please check your connection.")
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(err.message || "Failed to load issue details")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchIssue()
    }
  }, [id])

  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      addToast("Please log in to comment", "warning")
      return
    }

    if (!comment.trim()) {
      addToast("Comment cannot be empty", "error")
      return
    }

    setIsSubmittingComment(true)

    try {
      // TODO: Implement comment API call with axios
      // const response = await api.post(`/issue/report/${id}/comment`, {
      //   comment: comment.trim()
      // })

      // Simulate API call for now
      setTimeout(() => {
        const newComment = {
          id: Date.now(),
          user: user.name,
          text: comment,
          createdAt: new Date().toISOString(),
        }

        setIssue((prev) => ({
          ...prev,
          comments: [newComment, ...prev.comments],
          commentCount: prev.commentCount + 1,
        }))

        setComment("")
        addToast("Comment added successfully", "success")
      }, 500)
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add comment", "error")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      addToast("Please provide a reason for reporting", "warning")
      return
    }

    try {
      // TODO: Implement report API call with axios
      // const response = await api.post(`/issue/report/${id}/report`, {
      //   reason: reportReason.trim()
      // })

      // Simulate API call for now
      setTimeout(() => {
        setShowReportModal(false)
        setReportReason("")
        addToast("Issue reported to moderators", "success")
      }, 500)
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to report issue", "error")
    }
  }

  // Edit form handlers
  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)

    if (files.length + editFormData.images.length > 3) {
      addToast("You can upload a maximum of 3 images", "warning")
      return
    }

    const newImages = files.map((file) => ({
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }))

    setEditFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }))
  }

  const removeImage = (id) => {
    setEditFormData((prev) => ({
      ...prev,
      images: prev.images.filter((image) => image.id !== id),
    }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setIsSubmittingEdit(true)

    // Validate form
    if (
      !editFormData.title.trim() ||
      !editFormData.description.trim() ||
      !editFormData.category ||
      !editFormData.location.trim()
    ) {
      addToast("Please fill in all required fields", "error")
      setIsSubmittingEdit(false)
      return
    }

    try {
      // TODO: Implement edit API call with axios
      // For file uploads, you'd need FormData
      // const formData = new FormData()
      // formData.append('title', editFormData.title)
      // formData.append('description', editFormData.description)
      // formData.append('category', editFormData.category)
      // formData.append('location', editFormData.location)
      //
      // editFormData.images.forEach((img, index) => {
      //   if (!img.isExisting && img.file) {
      //     formData.append(`images`, img.file)
      //   }
      // })
      //
      // const response = await api.put(`/issue/report/${id}`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // })

      // Simulate API call for now
      setTimeout(() => {
        const updatedIssue = {
          ...issue,
          title: editFormData.title,
          description: editFormData.description,
          category: editFormData.category,
          categoryName: editFormData.category,
          location: editFormData.location,
          updatedAt: new Date().toISOString(),
          images: editFormData.images.map((img) => img.preview),
          timeline: [
            ...issue.timeline,
            {
              id: issue.timeline.length + 1,
              status: "pending",
              date: new Date().toISOString(),
              description: "Issue details updated",
            },
          ],
        }

        setIssue(updatedIssue)
        setShowEditModal(false)
        addToast("Issue updated successfully", "success")
      }, 1000)
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update issue", "error")
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  const handleDeleteIssue = async () => {
    setIsDeleting(true)

    try {
      // TODO: Implement delete API call with axios
      // const response = await api.delete(`/issue/report/${id}`)

      // Simulate API call for now
      setTimeout(() => {
        setShowDeleteModal(false)
        addToast("Issue deleted successfully", "success")
        navigate("/issues")
      }, 1000)
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete issue", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  const canEditIssue = () => {
    return isAuthenticated && issue && user && user.id === issue.reportedByUserId && issue.status === "pending"
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "verified":
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case "in_progress":
        return <AlertTriangle className="h-5 w-5 text-teal-500" />
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error loading issue</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={fetchIssue}>Try Again</Button>
          <Link to="/dashboard/issues">
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back to Issues
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Issue not found</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The issue you're looking for doesn't exist or has been removed
        </p>
        <Link to="/dashboard/issues">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Issues
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/dashboard/issues" className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:underline">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Issues
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{issue.title}</h1>
              <div className="flex items-center gap-2">
                {canEditIssue() && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)} className="mr-2">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteModal(true)}
                      className="mr-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
                <Badge variant={statusBadges[issue.status]?.variant || "default"}>
                  {statusBadges[issue.status]?.label || issue.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{issue.location}</span>
              </div>

              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Reported on {formatDate(issue.reportedAt)}</span>
              </div>

              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <User className="h-5 w-5 mr-2" />
                <span>Reported by {issue.reportedBy}</span>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="default">{issue.categoryName}</Badge>
                <Badge variant="default">{issue.wardName}</Badge>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{issue.description}</p>
            </div>

            {issue.adminFeedback && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">Admin Feedback</h3>
                <p className="text-blue-800 dark:text-blue-200">{issue.adminFeedback}</p>
              </div>
            )}

            {issue.images && issue.images.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Images</h3>
                <div className="grid grid-cols-2 gap-2">
                  {issue.images.map((image, index) => (
                    <div
                      key={index}
                      className="cursor-pointer rounded-lg overflow-hidden"
                      onClick={() => {
                        setActiveImageIndex(index)
                        setShowImageModal(true)
                      }}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Issue image ${index + 1}`}
                        className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <MessageSquare className="h-4 w-4" />
                  <span>{issue.commentCount}</span>
                </div>
              </div>

              <button
                onClick={() => setShowReportModal(true)}
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1"
              >
                <Flag className="h-4 w-4" />
                <span className="text-sm">Report</span>
              </button>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Comments</h3>

            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="mb-3">
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Add your comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" isLoading={isSubmittingComment}>
                    Post Comment
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-md mb-6 text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-2">Please log in to leave a comment</p>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Log In
                  </Button>
                </Link>
              </div>
            )}

            {issue.comments.length === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {issue.comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-gray-900 dark:text-white">{comment.user}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Issue Status">
            <div className="space-y-4">
              {issue.timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="mt-0.5">{getStatusIcon(event.status)}</div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{event.description}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(event.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Location">
            {issue.coordinates ? (
              <div className="mb-3">
                <MapContainer
                  center={[issue.coordinates.lat, issue.coordinates.lng]}
                  zoom={16}
                  style={{ height: "300px", width: "100%" }}
                  className="rounded-md"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[issue.coordinates.lat, issue.coordinates.lng]}>
                    <Popup>
                      <div className="text-center">
                        <strong>{issue.title}</strong>
                        <br />
                        <span className="text-sm text-gray-600">{issue.categoryName}</span>
                        <br />
                        <span className="text-xs text-gray-500">
                          {issue.coordinates.lat.toFixed(6)}, {issue.coordinates.lng.toFixed(6)}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-md mb-3 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <span>No location coordinates available</span>
                </div>
              </div>
            )}
            <p className="text-gray-600 dark:text-gray-300 text-sm">{issue.location}</p>
            {issue.coordinates && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Coordinates: {issue.coordinates.lat.toFixed(6)}°, {issue.coordinates.lng.toFixed(6)}°
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Issue"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReportSubmit}>
              Submit Report
            </Button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Please let us know why you're reporting this issue. This will be reviewed by our moderators.
        </p>
        <div>
          <label htmlFor="reportReason" className="form-label">
            Reason for reporting
          </label>
          <textarea
            id="reportReason"
            className="form-input"
            rows={4}
            placeholder="Please explain why you're reporting this issue..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            required
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Issue"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteIssue} isLoading={isDeleting}>
              Delete Issue
            </Button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Are you sure you want to delete this issue? This action cannot be undone.
        </p>
      </Modal>

      {/* Edit Issue Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Issue"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} isLoading={isSubmittingEdit}>
              Save Changes
            </Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleEditSubmit(e)
          }}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="form-label">
                Issue Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-input"
                placeholder="E.g., Pothole on Main Street"
                value={editFormData.title}
                onChange={handleEditFormChange}
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="form-input"
                value={editFormData.category}
                onChange={handleEditFormChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="form-label">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                className="form-input"
                placeholder="Address or coordinates"
                value={editFormData.location}
                onChange={handleEditFormChange}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="form-input"
                placeholder="Please provide details about the issue..."
                value={editFormData.description}
                onChange={handleEditFormChange}
                required
              />
            </div>

            <div>
              <label className="form-label">Images (Optional)</label>
              <div className="mt-1 flex items-center">
                <label className="cursor-pointer btn btn-outline flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  <span>Add Photos</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={editFormData.images.length >= 3}
                  />
                </label>
                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                  {editFormData.images.length}/3 images
                </span>
              </div>

              {editFormData.images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {editFormData.images.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.preview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-24 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="h-8 w-8" />
          </button>

          <img
            src={issue.images[activeImageIndex] || "/placeholder.svg"}
            alt={`Issue image ${activeImageIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain"
          />

          {issue.images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {issue.images.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full ${index === activeImageIndex ? "bg-white" : "bg-gray-500"}`}
                  onClick={() => setActiveImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default IssueDetailPage
