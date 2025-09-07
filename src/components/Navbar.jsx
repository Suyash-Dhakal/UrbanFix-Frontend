"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import ThemeToggle from "./ThemeToggle"
import { Menu, X, User, LogOut, Settings, ChevronDown, MapPin, Home } from "lucide-react"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    // NON STICKY NAVBAR <nav className="bg-white dark:bg-slate-800 shadow-md"> 
  
    // STICKY NAVBAR
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-800 shadow-md"> 
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <MapPin className="h-8 w-8 text-teal-500" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">UrbanFix</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link
                to="/issues"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-teal-500 dark:hover:text-teal-400"
              >
                Issues
              </Link>
              {isAuthenticated && user.role==='admin' && (
              <Link
                to="/ward-map"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-teal-500 dark:hover:text-teal-400"
              >
                Map
              </Link>
              )}
              {(isAuthenticated && user.role!='admin') || (!isAuthenticated) && (
              <Link
                to="/map"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-teal-500 dark:hover:text-teal-400"
              >
                Map
              </Link>
              )}

              {isAuthenticated && user.role==='user' && (
                <Link
                  to="/dashboard/report"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-teal-500 dark:hover:text-teal-400"
                >
                  Report Issue
                </Link>
              )}
              {isAuthenticated && user.role==='admin' && (
                <Link
                  to="/admin/pending"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-teal-500 dark:hover:text-teal-400"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="ml-3 relative group">
                <div>
                  <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                    <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white">
                      {user.name.charAt(0)}
                    </div>
                    <span className="ml-2 hidden md:block">{user.name}</span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </div>

                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="py-1">
                    {user.role === "user" && (
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                    >
                      <Home className="mr-2 h-4 w-4" /> 
                      Dashboard
                    </Link>)}

                    {user.role === "admin" && (
                      <Link
                        to="/admin/pending"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex md:items-center md:ml-6">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-teal-500 dark:hover:text-teal-400"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-2 px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-md hover:bg-teal-600"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex md:hidden ml-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-teal-500 dark:hover:text-teal-400 focus:outline-none"
              >
                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/issues"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Issues
            </Link>
            <Link
              to="/map"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Map
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard/report"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Report Issue
              </Link>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
