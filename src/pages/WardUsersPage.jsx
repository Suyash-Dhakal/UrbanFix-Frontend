"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import Card from "../components/Card"
import Button from "../components/Button"
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  User,
  CheckCircle,
  Clock,
  MapPin,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

// Mock data for ward users
const mockWardUsers = [
  {
    id: 1,
    name: "John Citizen",
    email: "john@example.com",
    ward: "ward1",
    wardName: "Ward 1 - Downtown",
    registeredOn: "2023-01-15T10:30:00",
    totalReports: 42,
    verifiedReports: 36,
    resolvedReports: 28,
    lastActive: "2023-05-21T14:30:00",
    profilePhoto: null,
  },
  {
    id: 10,
    name: "Emily Johnson",
    email: "emily@example.com",
    ward: "ward1",
    wardName: "Ward 1 - Downtown",
    registeredOn: "2023-02-05T09:15:00",
    totalReports: 27,
    verifiedReports: 22,
    resolvedReports: 18,
    lastActive: "2023-05-20T11:45:00",
    profilePhoto: null,
  },
  {
    id: 11,
    name: "Michael Smith",
    email: "michael@example.com",
    ward: "ward1",
    wardName: "Ward 1 - Downtown",
    registeredOn: "2023-01-28T14:20:00",
    totalReports: 19,
    verifiedReports: 15,
    resolvedReports: 12,
    lastActive: "2023-05-19T16:30:00",
    profilePhoto: null,
  },
  {
    id: 12,
    name: "Sarah Williams",
    email: "sarah@example.com",
    ward: "ward1",
    wardName: "Ward 1 - Downtown",
    registeredOn: "2023-03-10T08:45:00",
    totalReports: 31,
    verifiedReports: 26,
    resolvedReports: 20,
    lastActive: "2023-05-21T09:15:00",
    profilePhoto: null,
  },
  {
    id: 13,
    name: "David Brown",
    email: "david@example.com",
    ward: "ward1",
    wardName: "Ward 1 - Downtown",
    registeredOn: "2023-02-18T11:30:00",
    totalReports: 15,
    verifiedReports: 12,
    resolvedReports: 10,
    lastActive: "2023-05-18T13:20:00",
    profilePhoto: null,
  },
  {
    id: 14,
    name: "Jennifer Davis",
    email: "jennifer@example.com",
    ward: "ward1",
    wardName: "Ward 1 - Downtown",
    registeredOn: "2023-04-02T15:10:00",
    totalReports: 8,
    verifiedReports: 6,
    resolvedReports: 5,
    lastActive: "2023-05-17T10:45:00",
    profilePhoto: null,
  },
  {
    id: 15,
    name: "Robert Wilson",
    email: "robert@example.com",
    ward: "ward1",
    wardName: "Ward 1 - Downtown",
    registeredOn: "2023-03-25T09:30:00",
    totalReports: 23,
    verifiedReports: 19,
    resolvedReports: 15,
    lastActive: "2023-05-20T14:15:00",
    profilePhoto: null,
  },
]

// Mock data for ward statistics
const mockWardStats = {
  ward1: {
    totalUsers: 7,
    activeUsers: 6,
    totalReports: 165,
    verifiedReports: 136,
    resolvedReports: 108,
    verificationRate: 82, // percentage
    resolutionRate: 79, // percentage
    avgReportsPerUser: 23.6,
  },
  ward2: {
    totalUsers: 5,
    activeUsers: 4,
    totalReports: 98,
    verifiedReports: 76,
    resolvedReports: 62,
    verificationRate: 78,
    resolutionRate: 82,
    avgReportsPerUser: 19.6,
  },
}

const WardUsersPage = () => {
  const { user } = useAuth()
  const [wardUsers, setWardUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [wardStats, setWardStats] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    minReports: "",
    minVerified: "",
    sortBy: "name",
    sortOrder: "asc",
  })
  const [loading, setLoading] = useState(true)

  // Determine admin's ward
  const adminWard = "ward1" // In a real app, this would come from the user object

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      // Filter users by admin's ward
      const usersInWard = mockWardUsers.filter((user) => user.ward === adminWard)
      setWardUsers(usersInWard)
      setFilteredUsers(usersInWard)
      setWardStats(mockWardStats[adminWard])
      setLoading(false)
    }, 800)
  }, [adminWard])

  useEffect(() => {
    let result = [...wardUsers]

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
      )
    }

    // Apply filters
    if (filters.minReports) {
      result = result.filter((user) => user.totalReports >= Number.parseInt(filters.minReports))
    }

    if (filters.minVerified) {
      result = result.filter((user) => user.verifiedReports >= Number.parseInt(filters.minVerified))
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "reports":
          comparison = a.totalReports - b.totalReports
          break
        case "verified":
          comparison = a.verifiedReports - b.verifiedReports
          break
        case "resolved":
          comparison = a.resolvedReports - b.resolvedReports
          break
        case "registered":
          comparison = new Date(a.registeredOn) - new Date(b.registeredOn)
          break
        case "lastActive":
          comparison = new Date(a.lastActive) - new Date(b.lastActive)
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }

      return filters.sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredUsers(result)
  }, [wardUsers, searchTerm, filters])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({
      minReports: "",
      minVerified: "",
      sortBy: "name",
      sortOrder: "asc",
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ward Users</h1>

      {/* Ward Statistics */}
      {wardStats && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MapPin className="h-5 w-5 text-blue-500 mr-2" />
            {mockWardUsers[0]?.wardName || "Ward"} Statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{wardStats.totalUsers}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900/30 mr-4">
                  <AlertTriangle className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{wardStats.totalReports}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 mr-4">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Verification Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{wardStats.verificationRate}%</p>
                </div>
              </div>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Resolution Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{wardStats.resolutionRate}%</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Users in {mockWardUsers[0]?.wardName || "Ward"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">View and manage users in your ward</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
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
              <label htmlFor="minReports" className="form-label">
                Min. Total Reports
              </label>
              <input
                type="number"
                id="minReports"
                name="minReports"
                className="form-input"
                placeholder="0"
                min="0"
                value={filters.minReports}
                onChange={handleFilterChange}
              />
            </div>

            <div>
              <label htmlFor="minVerified" className="form-label">
                Min. Verified Reports
              </label>
              <input
                type="number"
                id="minVerified"
                name="minVerified"
                className="form-input"
                placeholder="0"
                min="0"
                value={filters.minVerified}
                onChange={handleFilterChange}
              />
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
                <option value="name">Name</option>
                <option value="reports">Total Reports</option>
                <option value="verified">Verified Reports</option>
                <option value="resolved">Resolved Reports</option>
                <option value="registered">Registration Date</option>
                <option value="lastActive">Last Active</option>
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
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
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

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
          <p className="text-gray-600 dark:text-gray-300">No users match your search criteria</p>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      <span>User</span>
                      <button className="ml-1 focus:outline-none">{getSortIcon("name")}</button>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("reports")}
                  >
                    <div className="flex items-center">
                      <span>Total Reports</span>
                      <button className="ml-1 focus:outline-none">{getSortIcon("reports")}</button>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("verified")}
                  >
                    <div className="flex items-center">
                      <span>Verified</span>
                      <button className="ml-1 focus:outline-none">{getSortIcon("verified")}</button>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("resolved")}
                  >
                    <div className="flex items-center">
                      <span>Resolved</span>
                      <button className="ml-1 focus:outline-none">{getSortIcon("resolved")}</button>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("registered")}
                  >
                    <div className="flex items-center">
                      <span>Registered</span>
                      <button className="ml-1 focus:outline-none">{getSortIcon("registered")}</button>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("lastActive")}
                  >
                    <div className="flex items-center">
                      <span>Last Active</span>
                      <button className="ml-1 focus:outline-none">{getSortIcon("lastActive")}</button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profilePhoto ? (
                            <img
                              src={user.profilePhoto || "/placeholder.svg"}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.totalReports}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.verifiedReports}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round((user.verifiedReports / user.totalReports) * 100)}% of total
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.resolvedReports}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round((user.resolvedReports / user.verifiedReports) * 100)}% of verified
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{formatDate(user.registeredOn)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{formatDateTime(user.lastActive)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default WardUsersPage
