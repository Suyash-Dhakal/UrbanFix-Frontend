"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Card from "../components/Card"
import Badge from "../components/Badge"
import { Trophy, Clock, CheckCircle, BarChart, MapPin, ArrowRight } from "lucide-react"

const HallOfFamePage = () => {
  const [topReporters, setTopReporters] = useState([])
  const [topWards, setTopWards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch top reporters and top performing wards simultaneously
        const [reportersResponse, wardsResponse] = await Promise.all([
          axios.get("http://localhost:3000/api/issue/top-reporters"),
          axios.get("http://localhost:3000/api/issue/top-performing-wards"),
        ])

        // Transform reporters data
        const transformedReporters = reportersResponse.data.topContributors.map((contributor, index) => ({
          id: contributor.userId,
          name: contributor.name,
          verifiedIssues: contributor.verifiedCount,
          profilePhoto: null,
          ward: contributor.ward,
          wardName: `Ward ${contributor.ward}`,
          email: contributor.email,
        }))

        // Transform wards data
        const transformedWards = wardsResponse.data.map((ward, index) => ({
          id: `ward${ward.ward}`,
          name: `Ward ${ward.ward}`,
          resolutionRate: Math.round(ward.resolutionRate * 100), // Convert to percentage
          averageResolutionTime:
            ward.avgResolutionTime > 0
              ? Math.round((ward.avgResolutionTime / (1000 * 60 * 60 * 24)) * 10) / 10 // Convert milliseconds to days
              : 0,
          resolvedIssues: ward.resolvedIssues,
          totalIssues: ward.totalIssues,
        }))

        // Sort wards by resolution rate (descending)
        transformedWards.sort((a, b) => b.resolutionRate - a.resolutionRate)

        setTopReporters(transformedReporters)
        setTopWards(transformedWards)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getTrophyColor = (index) => {
    switch (index) {
      case 0:
        return "text-yellow-500" // Gold
      case 1:
        return "text-gray-400" // Silver
      case 2:
        return "text-amber-700" // Bronze
      default:
        return "text-gray-500"
    }
  }

  const getPositionBadge = (index) => {
    switch (index) {
      case 0:
        return <Badge variant="warning">1st Place</Badge>
      case 1:
        return <Badge variant="secondary">2nd Place</Badge>
      case 2:
        return <Badge variant="default">3rd Place</Badge>
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
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Hall of Fame</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Recognizing our top contributors and most active communities in urban issue reporting and resolution
        </p>
      </div>

      {/* Top Reporters Section */}
      <section className="mb-16">
        <div className="flex items-center mb-8">
          <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Reporters</h2>
        </div>

        {topReporters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">No reporters data available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topReporters.map((reporter, index) => (
              <Card key={reporter.id} className="relative overflow-hidden">
                {/* Position indicator */}
                <div className="absolute top-4 right-4">{getPositionBadge(index)}</div>

                <div className="flex flex-col items-center p-6">
                  <Trophy className={`h-12 w-12 ${getTrophyColor(index)} mb-4`} />

                  <div className="mb-4">
                    {reporter.profilePhoto ? (
                      <img
                        src={reporter.profilePhoto || "/placeholder.svg"}
                        alt={reporter.name}
                        className="h-24 w-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-bold">
                        {reporter.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{reporter.name}</h3>

                  <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{reporter.wardName}</span>
                  </div>

                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-full px-4 py-2 flex items-center">
                    <CheckCircle className="h-5 w-5 text-teal-600 dark:text-teal-400 mr-2" />
                    <span className="text-teal-700 dark:text-teal-300 font-medium">
                      {reporter.verifiedIssues} Verified Issues
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Top Wards Section */}
      <section>
        <div className="flex items-center mb-8">
          <BarChart className="h-8 w-8 text-blue-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Performing Wards</h2>
        </div>

        {topWards.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">No ward performance data available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topWards.map((ward, index) => (
              <Card key={ward.id} className="relative overflow-hidden">
                {/* Position indicator */}
                <div className="absolute top-4 right-4">{getPositionBadge(index)}</div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                    {ward.name}
                  </h3>

                  <div className="space-y-6">
                    {/* Resolution Rate */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-gray-700 dark:text-gray-300">Resolution Rate</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{ward.resolutionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{ width: `${ward.resolutionRate}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {ward.resolvedIssues} of {ward.totalIssues} issues resolved
                      </div>
                    </div>

                    {/* Average Resolution Time */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="text-gray-700 dark:text-gray-300">Avg. Resolution Time</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {ward.averageResolutionTime > 0 ? `${ward.averageResolutionTime} days` : "N/A"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-500 h-2.5 rounded-full"
                          style={{
                            width:
                              ward.averageResolutionTime > 0
                                ? `${Math.max(10, 100 - ward.averageResolutionTime * 10)}%`
                                : "100%",
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Total Resolved Issues */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <ArrowRight className="h-5 w-5 text-teal-500 mr-2" />
                          <span className="text-gray-700 dark:text-gray-300">Resolved Issues</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{ward.resolvedIssues}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-teal-500 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(100, (ward.resolvedIssues / Math.max(...topWards.map((w) => w.resolvedIssues))) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default HallOfFamePage
