"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Link } from "react-router-dom"
import Badge from "../components/Badge"
import Button from "../components/Button"
import { Layers, Filter, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react"
import L from "leaflet"
import axios from "axios"

// Import Leaflet CSS
import "leaflet/dist/leaflet.css"

// Custom pinpoint marker icons for different categories
const createPinIcon = (category) => {
  const colors = {
    Road: "#ef4444",
    "Water Issues": "#06b6d4",
    Electricity: "#f59e0b",
    "Drainage & Sewage": "#8b5cf6",
    "Public Infrastructure": "#10b981",
    "Sanitation & Waste": "#f97316",
    Other: "#6b7280",
    default: "#6b7280",
  }

  const color = colors[category] || colors.default

  return L.divIcon({
    className: "custom-pin-marker",
    html: `
      <div style="position: relative;">
        <svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
          <path d="M10 0C4.48 0 0 4.48 0 10C0 17.5 10 28 10 28S20 17.5 20 10C20 4.48 15.52 0 10 0Z" fill="${color}"/>
          <circle cx="10" cy="10" r="4" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [20, 28],
    iconAnchor: [10, 28],
    popupAnchor: [0, -28],
  })
}

const categories = [
  { id: "Road", name: "Road" },
  { id: "Water Issues", name: "Water Issues" },
  { id: "Electricity", name: "Electricity" },
  { id: "Drainage & Sewage", name: "Drainage & Sewage" },
  { id: "Public Infrastructure", name: "Public Infrastructure" },
  { id: "Sanitation & Waste", name: "Sanitation & Waste" },
  { id: "Other", name: "Other" },
]

const MapViewPage = () => {
  const [mapIssues, setMapIssues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    ward: "",
  })
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [mapCenter, setMapCenter] = useState([26.8065, 87.2847]) // Dharan coordinates
  const [error, setError] = useState(null)
  const [mapKey, setMapKey] = useState(0) // Force re-render of map

  useEffect(() => {
    fetchVerifiedIssues()
  }, [])

  const fetchVerifiedIssues = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await axios.get("http://localhost:3000/api/issue/verified-issues")
      const data = response.data

      if (data.success && data.issues) {
        const formattedIssues = data.issues.map((issue) => ({
          id: issue._id,
          title: issue.title,
          category: issue.category,
          categoryName: getCategoryName(issue.category),
          status: issue.status,
          description: issue.description,
          ward: issue.ward,
          location: `Ward ${issue.ward}`,
          coordinates: {
            lat: Number.parseFloat(issue.location.latitude),
            lng: Number.parseFloat(issue.location.longitude),
          },
          image: issue.image,
          reportedBy: issue.reportedBy,
          commentCount: issue.commentCount,
          adminFeedback: issue.adminFeedback,
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
        }))

        // Filter out issues with invalid coordinates
        const validIssues = formattedIssues.filter(
          (issue) =>
            !isNaN(issue.coordinates.lat) &&
            !isNaN(issue.coordinates.lng) &&
            issue.coordinates.lat !== 0 &&
            issue.coordinates.lng !== 0,
        )

        console.log("Total issues:", formattedIssues.length)
        console.log("Valid issues with coordinates:", validIssues.length)
        console.log(
          "Sample coordinates:",
          validIssues.slice(0, 3).map((i) => ({ ward: i.ward, lat: i.coordinates.lat, lng: i.coordinates.lng })),
        )

        setMapIssues(validIssues)

        // Set map center to average of all valid issues or keep default
        if (validIssues.length > 0) {
          const avgLat = validIssues.reduce((sum, issue) => sum + issue.coordinates.lat, 0) / validIssues.length
          const avgLng = validIssues.reduce((sum, issue) => sum + issue.coordinates.lng, 0) / validIssues.length

          // Only update center if we have valid averages
          if (!isNaN(avgLat) && !isNaN(avgLng)) {
            setMapCenter([avgLat, avgLng])
          }
          setMapKey((prev) => prev + 1) // Force map re-render with new center
        }
      } else {
        setError("Failed to fetch issues")
      }
    } catch (err) {
      console.error("Error fetching verified issues:", err)
      if (err.response) {
        setError(`Server error: ${err.response.status} - ${err.response.data?.message || "Unknown error"}`)
      } else if (err.request) {
        setError("Failed to connect to the server")
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryName = (category) => {
    const cat = categories.find((c) => c.id === category)
    return cat ? cat.name : category.charAt(0).toUpperCase() + category.slice(1)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({
      category: "",
      status: "",
      ward: "",
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>
      case "verified":
        return <Badge variant="info">Verified</Badge>
      case "in_progress":
        return <Badge variant="primary">In Progress</Badge>
      case "resolved":
        return <Badge variant="success">Resolved</Badge>
      default:
        return null
    }
  }

  const filteredIssues = mapIssues.filter((issue) => {
    return (
      (filters.category === "" || issue.category === filters.category) &&
      (filters.status === "" || issue.status === filters.status) &&
      (filters.ward === "" || issue.ward.toString() === filters.ward)
    )
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={fetchVerifiedIssues} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community Issues Map</h1>
            <p className="text-gray-600 dark:text-gray-400">View verified issues from all wards in your community</p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {isFilterOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            <Button variant="outline" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Layers
            </Button>
          </div>
        </div>

        {isFilterOpen && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
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
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
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

              <div>
                <label htmlFor="ward" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ward/Area
                </label>
                <select
                  id="ward"
                  name="ward"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                  value={filters.ward}
                  onChange={handleFilterChange}
                >
                  <option value="">All Wards</option>
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Ward {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
        )}

        <div className="w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="h-[70vh] min-h-[500px] relative">
              <MapContainer
                key={mapKey}
                center={mapCenter}
                zoom={13}
                style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
                scrollWheelZoom={true}
                zoomControl={true}
                className="rounded-xl"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {filteredIssues.map((issue) => (
                  <Marker
                    key={issue.id}
                    position={[issue.coordinates.lat, issue.coordinates.lng]}
                    icon={createPinIcon(issue.category)}
                  >
                    <Popup closeButton={true} autoClose={true} closeOnClick={true}>
                      <div className="text-center p-2">
                        <strong className="text-base text-gray-900">{issue.title}</strong>
                        <br />
                        <span className="text-sm text-gray-600">{issue.categoryName}</span>
                        <br />
                        <span className="text-xs text-gray-500">
                          {issue.coordinates.lat.toFixed(6)}, {issue.coordinates.lng.toFixed(6)}
                        </span>
                        <br />
                        <div className="mt-2 flex items-center justify-center gap-2">
                          {getStatusBadge(issue.status)}
                        </div>
                        <div className="mt-2">
                          <Link to={`/issues/${issue.id}`}>
                            <Button variant="primary" size="sm" className="text-xs px-3 py-1">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Map Legend */}
              <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700 z-[1000]">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Categories</h4>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border border-white shadow-sm"
                        style={{
                          backgroundColor: {
                            Road: "#ef4444",
                            "Water Issues": "#06b6d4",
                            Electricity: "#f59e0b",
                            "Drainage & Sewage": "#8b5cf6",
                            "Public Infrastructure": "#10b981",
                            "Sanitation & Waste": "#f97316",
                            Other: "#6b7280",
                          }[cat.id],
                        }}
                      ></div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Issues Count Display */}
              <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700 z-[1000]">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Showing {filteredIssues.length} of {mapIssues.length} issues
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapViewPage
