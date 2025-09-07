"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "../hooks/useAuth"
import { AlertTriangle, CheckCircle, ArrowRight, Map, Clock, Zap, Shield, Activity } from "lucide-react"
import Button from "../components/Button"
import { useCountUp } from "../hooks/useCountUp"
import { useNavigate } from "react-router-dom"


const LandingPage = () => {
  const { isAuthenticated, user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const statsRef = useRef(null)
  const canvasRef = useRef(null)
  const [animationStarted, setAnimationStarted] = useState(false)

  const navigate = useNavigate()

  // Count-up animations
  const issuesReported = useCountUp(isVisible ? 1234 : 0)
  const issuesResolved = useCountUp(isVisible ? 876 : 0)
  const neighborhoods = useCountUp(isVisible ? 42 : 0)
  const activeUsers = useCountUp(isVisible ? 5678 : 0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current)
      }
    }
  }, [])

  // Urban Data Visualization Animation
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let animationFrameId
    let particles = []
    let connectionPoints = []
    let issueMarkers = []
    let resolvedMarkers = []

    // Set canvas dimensions
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect()
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
    }

    // Create connection points (representing neighborhoods)
    const createConnectionPoints = () => {
      connectionPoints = []
      const numPoints = 6

      for (let i = 0; i < numPoints; i++) {
        connectionPoints.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 8 + Math.random() * 8,
          color: `rgba(20, 184, 166, ${0.7 + Math.random() * 0.3})`,
          pulse: 0,
          pulseSpeed: 0.02 + Math.random() * 0.03,
        })
      }
    }

    // Create particles (representing data flow)
    const createParticles = () => {
      particles = []
      const numParticles = 50

      for (let i = 0; i < numParticles; i++) {
        const startPoint = connectionPoints[Math.floor(Math.random() * connectionPoints.length)]
        const endPoint = connectionPoints[Math.floor(Math.random() * connectionPoints.length)]

        if (startPoint === endPoint) continue

        particles.push({
          startPoint,
          endPoint,
          x: startPoint.x,
          y: startPoint.y,
          speed: 0.5 + Math.random() * 1.5,
          progress: 0,
          color: Math.random() > 0.7 ? "rgba(59, 130, 246, 0.7)" : "rgba(20, 184, 166, 0.7)",
          size: 2 + Math.random() * 3,
        })
      }
    }

    // Create issue markers
    const createIssueMarkers = () => {
      issueMarkers = []
      const numMarkers = 8

      for (let i = 0; i < numMarkers; i++) {
        issueMarkers.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 0,
          maxRadius: 15 + Math.random() * 10,
          growSpeed: 0.2 + Math.random() * 0.3,
          color: "rgba(245, 158, 11, 0.7)",
          borderColor: "rgba(245, 158, 11, 0.9)",
          borderWidth: 2,
          delay: Math.random() * 200,
          counter: 0,
          active: false,
          lifetime: 100 + Math.random() * 150,
        })
      }
    }

    // Create resolved markers
    const createResolvedMarkers = () => {
      resolvedMarkers = []
      const numMarkers = 5

      for (let i = 0; i < numMarkers; i++) {
        resolvedMarkers.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 0,
          maxRadius: 15 + Math.random() * 10,
          growSpeed: 0.2 + Math.random() * 0.3,
          color: "rgba(34, 197, 94, 0.7)",
          borderColor: "rgba(34, 197, 94, 0.9)",
          borderWidth: 2,
          delay: Math.random() * 300,
          counter: 0,
          active: false,
          lifetime: 100 + Math.random() * 150,
        })
      }
    }

    // Draw connection lines between points
    const drawConnections = () => {
      for (let i = 0; i < connectionPoints.length; i++) {
        for (let j = i + 1; j < connectionPoints.length; j++) {
          const point1 = connectionPoints[i]
          const point2 = connectionPoints[j]

          const distance = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2))

          if (distance < canvas.width / 2) {
            ctx.beginPath()
            ctx.moveTo(point1.x, point1.y)
            ctx.lineTo(point2.x, point2.y)

            const opacity = 1 - distance / (canvas.width / 2)
            ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.2})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }
    }

    // Draw connection points
    const drawConnectionPoints = () => {
      connectionPoints.forEach((point) => {
        // Update pulse
        point.pulse += point.pulseSpeed
        if (point.pulse > 1) {
          point.pulse = 0
        }

        // Draw main point
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
        ctx.fillStyle = point.color
        ctx.fill()

        // Draw pulse effect
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.radius * (1 + point.pulse), 0, Math.PI * 2)
        ctx.strokeStyle = point.color.replace(")", ", " + (1 - point.pulse) + ")")
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }

    // Draw particles
    const drawParticles = () => {
      particles.forEach((particle) => {
        // Update position
        particle.progress += particle.speed / 100

        if (particle.progress >= 1) {
          particle.progress = 0
          // Swap start and end points for continuous flow
          const temp = particle.startPoint
          particle.startPoint = particle.endPoint
          particle.endPoint = temp
        }

        // Calculate current position
        particle.x = particle.startPoint.x + (particle.endPoint.x - particle.startPoint.x) * particle.progress
        particle.y = particle.startPoint.y + (particle.endPoint.y - particle.startPoint.y) * particle.progress

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
      })
    }

    // Draw issue markers
    const drawIssueMarkers = () => {
      issueMarkers.forEach((marker) => {
        marker.counter++

        if (marker.counter > marker.delay && !marker.active) {
          marker.active = true
          marker.counter = 0
        }

        if (marker.active) {
          if (marker.radius < marker.maxRadius) {
            marker.radius += marker.growSpeed
          } else {
            marker.counter++
            if (marker.counter > marker.lifetime) {
              marker.radius = 0
              marker.x = Math.random() * canvas.width
              marker.y = Math.random() * canvas.height
              marker.counter = 0
            }
          }

          // Draw marker
          ctx.beginPath()
          ctx.arc(marker.x, marker.y, marker.radius, 0, Math.PI * 2)
          ctx.fillStyle = marker.color
          ctx.fill()
          ctx.strokeStyle = marker.borderColor
          ctx.lineWidth = marker.borderWidth
          ctx.stroke()

          // Draw alert icon
          if (marker.radius > marker.maxRadius * 0.7) {
            ctx.fillStyle = "#fff"
            ctx.font = `${Math.floor(marker.radius * 0.8)}px Arial`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText("!", marker.x, marker.y)
          }
        }
      })
    }

    // Draw resolved markers
    const drawResolvedMarkers = () => {
      resolvedMarkers.forEach((marker) => {
        marker.counter++

        if (marker.counter > marker.delay && !marker.active) {
          marker.active = true
          marker.counter = 0
        }

        if (marker.active) {
          if (marker.radius < marker.maxRadius) {
            marker.radius += marker.growSpeed
          } else {
            marker.counter++
            if (marker.counter > marker.lifetime) {
              marker.radius = 0
              marker.x = Math.random() * canvas.width
              marker.y = Math.random() * canvas.height
              marker.counter = 0
            }
          }

          // Draw marker
          ctx.beginPath()
          ctx.arc(marker.x, marker.y, marker.radius, 0, Math.PI * 2)
          ctx.fillStyle = marker.color
          ctx.fill()
          ctx.strokeStyle = marker.borderColor
          ctx.lineWidth = marker.borderWidth
          ctx.stroke()

          // Draw check icon
          if (marker.radius > marker.maxRadius * 0.7) {
            ctx.fillStyle = "#fff"
            ctx.font = `${Math.floor(marker.radius * 0.8)}px Arial`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText("✓", marker.x, marker.y)
          }
        }
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      drawConnections()
      drawConnectionPoints()
      drawParticles()
      drawIssueMarkers()
      drawResolvedMarkers()

      animationFrameId = requestAnimationFrame(animate)
    }

    // Initialize animation
    const initAnimation = () => {
      resizeCanvas()
      createConnectionPoints()
      createParticles()
      createIssueMarkers()
      createResolvedMarkers()
      animate()
      setAnimationStarted(true)
    }

    // Handle resize
    const handleResize = () => {
      resizeCanvas()
      if (animationStarted) {
        createConnectionPoints()
        createParticles()
        createIssueMarkers()
        createResolvedMarkers()
      }
    }

    window.addEventListener("resize", handleResize)
    initAnimation()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-0"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzQkEzOTciIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWNmgydjR6bTAgMjRoLTJ2LTRoMnY0em0wIDZoLTJ2LTRoMnY0em0wIDZoLTJ2LTRoMnY0em0wIDZoLTJ2LTRoMnY0em0tNi0yNGgtNHYtMmg0djJ6bS02IDBoLTR2LTJoNHYyem0tNiAwaC00di0yaDR2MnptLTYgMEg2di0yaDZ2MnptMzAgMGgtNHYtMmg0djJ6bS02IDBoLTR2LTJoNHYyem0tNiAwaC00di0yaDR2MnptLTYgMGgtNHYtMmg0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Report Urban Issues, <span className="text-teal-400">Improve Your City</span>
              </h1>
              <p className="mt-6 text-xl text-gray-300 max-w-lg">
                UrbanFix empowers citizens to report and track urban issues like potholes, broken streetlights, and
                more. Together, we can make our communities better.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                {/* {isAuthenticated ? (
                  <Button onClick={()=> navigate('/dashboard/report')} size="lg" className="px-8 py-3 text-lg shadow-lg shadow-teal-500/20">
                    Report an Issue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button onClick={()=> navigate('/register')} size="lg" className="px-8 py-3 text-lg shadow-lg shadow-teal-500/20">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )} */}

                {(() => {
  if (isAuthenticated && user.role === 'admin') {
    return (
      <Button onClick={() => navigate('/admin/pending')} size="lg" className="px-8 py-3 text-lg shadow-lg shadow-teal-500/20">
        Admin Panel
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    );
  } else if (isAuthenticated) {
    return (
      <Button onClick={() => navigate('/dashboard/report')} size="lg" className="px-8 py-3 text-lg shadow-lg shadow-teal-500/20">
        Report an Issue
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    );
  } else {
    return (
      <Button onClick={() => navigate('/register')} size="lg" className="px-8 py-3 text-lg shadow-lg shadow-teal-500/20">
        Get Started
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    );
  }
})()}

                <Button onClick={() => navigate('/issues')}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-lg border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  View Issues
                </Button>
              </div>
            </div>
            <div className="relative">
              {/* Urban Data Visualization */}
              <div className="relative">
                <div className="urban-data-viz rounded-lg overflow-hidden shadow-2xl border border-slate-700 h-[350px] relative">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ background: "linear-gradient(to bottom, #0f172a, #1e293b)" }}
                  />

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg border border-slate-700 flex flex-wrap justify-around gap-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
                      <span className="text-xs text-white">Neighborhoods</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-xs text-white">Reported Issues</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-xs text-white">Resolved Issues</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-xs text-white">Data Flow</span>
                    </div>
                  </div>
                </div>

                {/* Smart City Label */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-2 rounded-full shadow-lg">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 text-white mr-2" />
                    <p className="text-white font-medium text-sm">Urban Data Network</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform makes it easy to report and track urban issues in your community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-teal-100 dark:bg-teal-900/30 p-3 inline-block rounded-lg mb-6">
                <AlertTriangle className="h-7 w-7 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Report Issues</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Easily report urban issues with details, location, and photos. Help improve your community with just a
                few clicks.
              </p>
            </div>


            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 inline-block rounded-lg mb-6">
                <Map className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Track on Map</h3>
              <p className="text-gray-600 dark:text-gray-300">
                View all reported issues on an interactive map. Filter by category, status, or location to find what
                matters to you.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 inline-block rounded-lg mb-6">
                <Clock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Real-time Updates</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get notifications as your reported issues are verified, in progress, and resolved. Stay informed every
                step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Cards */}
      <section
        ref={statsRef}
        className="py-16 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Our Impact</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See how UrbanFix is making a difference in communities
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-gray-100 dark:border-slate-700 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-teal-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-5xl font-bold text-teal-500">{issuesReported.toLocaleString()}</p>
                  <Zap className="h-10 w-10 text-teal-400 opacity-70 transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">Issues Reported</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-gray-100 dark:border-slate-700 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-teal-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-5xl font-bold text-teal-500">{issuesResolved.toLocaleString()}</p>
                  <CheckCircle className="h-10 w-10 text-teal-400 opacity-70 transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">Issues Resolved</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-gray-100 dark:border-slate-700 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-teal-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-5xl font-bold text-teal-500">{neighborhoods.toLocaleString()}</p>
                  <Map className="h-10 w-10 text-teal-400 opacity-70 transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">Neighborhoods</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-gray-100 dark:border-slate-700 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-teal-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-5xl font-bold text-teal-500">{activeUsers.toLocaleString()}</p>
                  <Shield className="h-10 w-10 text-teal-400 opacity-70 transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">Active Users</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-500"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWNmgydjR6bTAgMjRoLTJ2LTRoMnY0em0wIDZoLTJ2LTRoMnY0em0wIDZoLTJ2LTRoMnY0em0wIDZoLTJ2LTRoMnY0em0tNi0yNGgtNHYtMmg0djJ6bS02IDBoLTR2LTJoNHYyem0tNiAwaC00di0yaDR2MnptLTYgMEg2di0yaDZ2MnptMzAgMGgtNHYtMmg0djJ6bS02IDBoLTR2LTJoNHYyem0tNiAwaC00di0yaDR2MnptLTYgMGgtNHYtMmg0djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to improve your community?</h2>
            <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
              Join thousands of citizens who are making a difference in their neighborhoods. Start reporting issues
              today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {isAuthenticated  ? (
                <Button onClick={()=> navigate('/dashboard/report')}
                  variant="accent"
                  size="lg"
                  className="px-8 py-3 text-lg bg-yellow text-teal-600 hover:bg-yellow-550 shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  Report an Issue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  onClick={()=> navigate('/register')}
                  variant="accent"
                  size="lg"
                  className="px-8 py-3 text-lg bg-yellow text-teal-600 hover:bg-yellow-550 shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  Sign Up Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
