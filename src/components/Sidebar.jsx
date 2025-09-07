"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { Home, AlertTriangle, User, Map, List, Trophy, Bell, FilePlus } from "lucide-react"

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (path) => {
    return location.pathname === path
  }

  const navItems = [
    {
      name: "My Reports",
      path: "/dashboard",
      icon: <List className="h-5 w-5" />,
    },
    {
      name: "Report Issue",
      path: "/dashboard/report",
      icon: <FilePlus className="h-5 w-5" />,
    },
    // {
    //   name: "My Reports",
    //   path: "/dashboard/reports",
    //   icon: <List className="h-5 w-5" />,
    // },
    {
      name: "All Issues",
      path: "/dashboard/issues",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      name: "Map View",
      path: "/dashboard/city-map",
      icon: <Map className="h-5 w-5" />,
    },
    {
      name: "Hall of Fame",
      path: "/dashboard/hall-of-fame",
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      name: "Notifications",
      path: "/dashboard/notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      name: "Profile",
      path: "/dashboard/profile",
      icon: <User className="h-5 w-5" />,
    },
    // Optional: Place Settings at the bottom
    // {
    //   name: "Settings",
    //   path: "/dashboard/settings",
    //   icon: <Settings className="h-5 w-5" />,
    // },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 shadow-md hidden md:block">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center text-white text-lg font-bold">
            {user?.name.charAt(0)}
          </div>
          <div className="ml-3">
            <p className="text-gray-900 dark:text-white font-medium">{user?.name}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        <nav className="mt-8">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive(item.path)
                      ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
