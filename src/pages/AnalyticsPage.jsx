"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("last-week")
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`http://localhost:3000/api/issue/analytics?range=${timeRange}`)
        setAnalyticsData(processApiData(response.data))
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  const processApiData = (data) => {
    // Extract dates and create labels for the time series chart
    const labels = data.issuesOverTime.map((item) => item.date)

    // Extract verified and resolved counts for the time series chart
    const verifiedData = data.issuesOverTime.map((item) => item.verified)
    const resolvedData = data.issuesOverTime.map((item) => item.resolved)

    // Process category data
    const categoryData = data.issuesByCategory.map((item, index) => ({
      name: item._id,
      count: item.count,
      color: getColorByIndex(index),
    }))

    // Process ward data - ensure we have 20 wards
    const wardData = []

    // First, add the wards we have data for
    data.issuesByWard.forEach((item, index) => {
      wardData.push({
        name: `Ward ${item._id}`,
        count: item.count,
        color: getColorByIndex(index),
      })
    })

    // Fill in the remaining wards up to 20 with zero counts
    const existingWardIds = data.issuesByWard.map((item) => item._id)
    for (let i = 1; i <= 20; i++) {
      const wardId = i.toString()
      if (!existingWardIds.includes(wardId)) {
        wardData.push({
          name: `Ward ${wardId}`,
          count: 0,
          color: getColorByIndex(wardData.length),
        })
      }
    }

    // Sort wards by number
    wardData.sort((a, b) => {
      const aNum = Number.parseInt(a.name.replace("Ward ", ""))
      const bNum = Number.parseInt(b.name.replace("Ward ", ""))
      return aNum - bNum
    })

    // Process status data
    const statusData = data.issuesByStatus.map((item, index) => ({
      name: capitalizeFirstLetter(item._id),
      count: item.count,
      color: getColorByIndex(index),
    }))

    return {
      labels,
      verifiedData,
      resolvedData,
      categoryData,
      wardData: wardData.slice(0, 20), // Ensure we only have 20 wards
      statusData,
      kpis: {
        totalIssues: data.totalReported,
        resolvedIssues: data.totalResolved,
        pendingIssues: data.totalPending,
        resolutionRate: data.resolutionRate,
      },
    }
  }

  const getColorByIndex = (index) => {
    const colors = [
      "rgba(255, 99, 132, 0.8)",
      "rgba(54, 162, 235, 0.8)",
      "rgba(255, 206, 86, 0.8)",
      "rgba(75, 192, 192, 0.8)",
      "rgba(153, 102, 255, 0.8)",
      "rgba(255, 159, 64, 0.8)",
      "rgba(201, 203, 207, 0.8)",
      "rgba(255, 99, 71, 0.8)",
      "rgba(46, 139, 87, 0.8)",
      "rgba(106, 90, 205, 0.8)",
      "rgba(255, 215, 0, 0.8)",
      "rgba(30, 144, 255, 0.8)",
      "rgba(220, 20, 60, 0.8)",
      "rgba(0, 128, 128, 0.8)",
      "rgba(240, 128, 128, 0.8)",
      "rgba(144, 238, 144, 0.8)",
      "rgba(186, 85, 211, 0.8)",
      "rgba(210, 105, 30, 0.8)",
      "rgba(112, 128, 144, 0.8)",
      "rgba(188, 143, 143, 0.8)",
    ]
    return colors[index % colors.length]
  }

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  if (isLoading || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const lineChartData = {
    labels: analyticsData.labels,
    datasets: [
      {
        label: "Issues Verified",
        data: analyticsData.verifiedData,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.3,
      },
      {
        label: "Issues Resolved",
        data: analyticsData.resolvedData,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.3,
      },
    ],
  }

  const pieChartData = {
    labels: analyticsData.categoryData.map((item) => item.name),
    datasets: [
      {
        data: analyticsData.categoryData.map((item) => item.count),
        backgroundColor: analyticsData.categoryData.map((item) => item.color),
        borderWidth: 1,
      },
    ],
  }

  const doughnutChartData = {
    labels: analyticsData.statusData.map((item) => item.name),
    datasets: [
      {
        data: analyticsData.statusData.map((item) => item.count),
        backgroundColor: analyticsData.statusData.map((item) => item.color),
        borderWidth: 1,
      },
    ],
  }

  const wardChartData = {
    labels: analyticsData.wardData.map((item) => item.name),
    datasets: [
      {
        label: "Issues by Ward",
        data: analyticsData.wardData.map((item) => item.count),
        backgroundColor: analyticsData.wardData.map((item) => item.color),
        borderColor: analyticsData.wardData.map((item) => item.color.replace("0.8", "1")),
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Time Range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="last-week">Last Week</option>
            <option value="last-month">Last Month</option>
            <option value="last-year">Last Year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Issues</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.kpis.totalIssues}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved Issues</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.kpis.resolvedIssues}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Issues</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.kpis.pendingIssues}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolution Rate</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.kpis.resolutionRate}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Issues Over Time</h3>
          <div className="h-80">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Issues by Ward</h3>
          <div className="h-80">
            <Bar
              data={wardChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Issues by Category</h3>
          <div className="h-80">
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right",
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Issues by Status</h3>
          <div className="h-80">
            <Doughnut
              data={doughnutChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
