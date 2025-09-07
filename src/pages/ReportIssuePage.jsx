"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "../hooks/useToast"
import Button from "../components/Button"
import Card from "../components/Card"
import { Camera, X, Send, MapPin, Calendar } from "lucide-react"
import axios from "axios"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in react-leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

// Component for handling map clicks and marker dragging
const LocationSelector = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })

  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target
          const newPosition = marker.getLatLng()
          setPosition([newPosition.lat, newPosition.lng])
        },
      }}
    />
  ) : null
}

axios.defaults.withCredentials = true

console.log("Cloudinary config:", {
  preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ? "Set" : "Missing",
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ? "Set" : "Missing",
})

const categories = [
  { id: "Road", name: "Road" },
  { id: "Water Issues", name: "Water Issues" },
  { id: "Electricity", name: "Electricity" },
  { id: "Drainage & Sewage", name: "Drainage & Sewage" },
  { id: "Public Infrastructure", name: "Public Infrastructure" },
  { id: "Sanitation & Waste", name: "Sanitation & Waste" },
  { id: "Other", name: "Other" },
]

const ReportIssuePage = () => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [ward, setWard] = useState("")
  const [location, setLocation] = useState("")
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [similarIssues, setSimilarIssues] = useState([])
  const [showSimilarIssuesPopup, setShowSimilarIssuesPopup] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImageUrls, setUploadedImageUrls] = useState([])

  // Map modal states
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapCenter, setMapCenter] = useState([26, 87])
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (images.length + files.length > 2) {
      addToast("Maximum 2 images allowed", "error")
      return
    }

    setIsUploadingImages(true)
    addToast("Uploading images to Cloudinary...", "info")

    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...newPreviews])

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
        formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME)

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData,
          { withCredentials: false },
        )
        return response.data.secure_url
      })

      const urls = await Promise.all(uploadPromises)
      setImages((prev) => [...prev, ...files])
      setUploadedImageUrls((prev) => [...prev, ...urls])
      addToast("Images uploaded successfully!", "success")
    } catch (error) {
      console.error("Error uploading images:", error)
      addToast("Failed to upload images. Please try again.", "error")

      files.forEach((_, index) => {
        const previewIndex = imagePreviews.length + index
        if (newPreviews[index]) {
          URL.revokeObjectURL(newPreviews[index])
        }
      })
      setImagePreviews((prev) => prev.slice(0, prev.length - files.length))
    } finally {
      setIsUploadingImages(false)
    }
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const openMapModal = () => {
    setIsGettingLocation(true)
    setShowMapModal(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setMapCenter([latitude, longitude])
          setSelectedPosition([latitude, longitude])
          setIsGettingLocation(false)
          addToast("Location detected! Click or drag the marker to adjust.", "success")
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsGettingLocation(false)
          addToast("Using default location. Click on the map to select your location.", "info")
        },
      )
    } else {
      setIsGettingLocation(false)
      addToast("Click on the map to select your location.", "info")
    }
  }

  const confirmLocation = () => {
    if (selectedPosition) {
      const [lat, lng] = selectedPosition
      setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      setShowMapModal(false)
      addToast("Location selected successfully!", "success")
    } else {
      addToast("Please select a location on the map first.", "error")
    }
  }

  const cancelMapSelection = () => {
    setShowMapModal(false)
    setSelectedPosition(null)
  }

  const handleBlur = async () => {
    if (!title.trim()) return

    try {
      const API_URL = "https://0569-103-191-131-60.ngrok-free.app/predict"
      const response = await axios.post(API_URL, { title: title.trim() }, { withCredentials: true })
      const predictedCategory = response.data.prediction
      console.log("Predicted category:", predictedCategory)
      setCategory(predictedCategory)
    } catch (error) {
      console.error("Error predicting category:", error.message)
      addToast("Failed to predict category. Please enter it manually.", "error")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let coordinates = { latitude: 0, longitude: 0 }
      if (location) {
        const [lat, lng] = location.split(",").map((coord) => Number.parseFloat(coord.trim()))
        if (!isNaN(lat) && !isNaN(lng)) {
          coordinates = { latitude: lat, longitude: lng }
        }
      }

      const issueData = {
        title,
        description,
        category,
        ward,
        location: coordinates,
        image: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : "",
        images: uploadedImageUrls,
      }

      console.log("Issue data being submitted:", issueData)

      const API_URL = "http://localhost:3000/api/issue"
      const response = await axios.post(`${API_URL}/report-issue`, issueData)

      if (response.data.similarIssues && response.data.similarIssues.length > 0) {
        setSimilarIssues(response.data.similarIssues)
        setShowSimilarIssuesPopup(true)
      } else {
        await submitConfirmedIssue(issueData)
      }
    } catch (error) {
      console.error("Error submitting issue:", error)
      addToast("Failed to submit issue. Please try again.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSimilarIssueResponse = async (isListed) => {
    setShowSimilarIssuesPopup(false)

    if (!isListed) {
      let coordinates = { latitude: 0, longitude: 0 }
      if (location) {
        const [lat, lng] = location.split(",").map((coord) => Number.parseFloat(coord.trim()))
        if (!isNaN(lat) && !isNaN(lng)) {
          coordinates = { latitude: lat, longitude: lng }
        }
      }

      const issueData = {
        title,
        description,
        category,
        ward,
        location: coordinates,
        image: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : "",
        images: uploadedImageUrls,
      }
      await submitConfirmedIssue(issueData)
    } else {
      addToast("Submission cancelled. Your issue is already reported.", "info")
      navigate("/")
    }
  }

  const submitConfirmedIssue = async (issueData) => {
    try {
      setIsSubmitting(true)
      const API_URL = "http://localhost:3000/api/issue"
      const response = await axios.post(`${API_URL}/confirm-report`, issueData)

      if (response.status === 200 || response.status === 201) {
        addToast("Issue reported successfully!", "success")
        navigate("/")
      } else {
        throw new Error("Unexpected response status: " + response.status)
      }
    } catch (error) {
      console.error("Error submitting confirmed issue:", error)
      addToast("Failed to submit issue. Please try again.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Report an Issue</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="form-label">
                Issue Title
              </label>
              <input
                id="title"
                type="text"
                className="form-input"
                placeholder="E.g., Pothole on Main Street"
                value={title}
                onBlur={handleBlur}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  id="category"
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                <label htmlFor="ward" className="form-label">
                  Ward/Area
                </label>
                <select
                  id="ward"
                  className="form-input"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select a ward
                  </option>
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Ward {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <button
                  type="button"
                  onClick={openMapModal}
                  className="text-sm text-teal-600 dark:text-teal-400 hover:underline flex items-center"
                >
                  📍 Select on Map
                </button>
              </div>
              <input
                id="location"
                type="text"
                className="form-input"
                placeholder="Coordinates will appear here after map selection"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Click "📍 Select on Map" to choose location visually, or enter coordinates manually
              </p>
            </div>

            <div>
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="form-input"
                placeholder="Please provide details about the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Images (Optional - Max 2)</label>
              <div className="mt-1 flex items-center">
                <label className="cursor-pointer btn btn-outline flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  <span>{isUploadingImages ? "Uploading..." : "Add Photos"}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={images.length >= 2 || isUploadingImages}
                  />
                </label>
                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{images.length}/2 images</span>
              </div>

              {imagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        disabled={isUploadingImages}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {isUploadingImages && (
                <div className="mt-3 flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-teal-500 mr-2"></div>
                  Uploading images to cloud storage...
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                <Send className="mr-2 h-5 w-5" />
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Map Selection Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select Issue Location</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isGettingLocation
                  ? "Getting your current location..."
                  : "Click on the map or drag the marker to select the exact location of the issue"}
              </p>
            </div>

            <div className="flex-1 relative">
              {isGettingLocation ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Detecting your location...</p>
                  </div>
                </div>
              ) : (
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationSelector position={selectedPosition} setPosition={setSelectedPosition} />
                </MapContainer>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPosition ? (
                  <span>
                    Selected: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
                  </span>
                ) : (
                  <span>No location selected</span>
                )}
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={cancelMapSelection}>
                  Cancel
                </Button>
                <Button onClick={confirmLocation} disabled={!selectedPosition}>
                  Confirm Location
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Similar Issues Popup */}
      {showSimilarIssuesPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-0 max-w-2xl w-full max-h-[90vh] shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 border-b border-amber-200 dark:border-amber-800">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-amber-600 dark:text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Similar Issues Found</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    We found {similarIssues.length} issue{similarIssues.length > 1 ? "s" : ""} that might be similar to
                    yours
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please check if your issue is already reported to avoid duplicates:
              </p>

              {/* Similar Issues List */}
              <div className="max-h-96 overflow-y-auto space-y-4 mb-6">
                {similarIssues.map((issue, index) => (
                  <div
                    key={issue.id || index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                        {issue.title}
                      </h4>
                      {issue.similarity && (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium px-2.5 py-1 rounded-full ml-3 flex-shrink-0">
                          {issue.similarity} match
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{issue.description}</p>

                    {/* Images */}
                    {issue.image && issue.image.length > 0 && (
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        {issue.image.map((imageUrl, imgIndex) => (
                          <div key={imgIndex} className="flex-shrink-0">
                            <img
                              src={imageUrl || "/placeholder.svg?height=80&width=80"}
                              alt={`Issue image ${imgIndex + 1}`}
                              className="h-20 w-20 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                              onError={(e) => {
                                e.target.src = "/placeholder.svg?height=80&width=80&text=No+Image"
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Issue metadata */}
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>Issue #{issue.id ? issue.id.slice(-6) : "Unknown"}</span>
                      </div>
                      {issue.createdAt && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Is your issue already listed above?
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSimilarIssueResponse(true)}
                    className="flex-1 justify-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Yes, my issue is already reported
                  </Button>
                  <Button
                    onClick={() => handleSimilarIssueResponse(false)}
                    className="flex-1 justify-center bg-teal-600 hover:bg-teal-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    No, continue with my report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportIssuePage

