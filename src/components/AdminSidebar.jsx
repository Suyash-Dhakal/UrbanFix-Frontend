"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { LayoutDashboard, Users, AlertTriangle, Settings, CheckSquare, BarChart, Map, User, Trophy, Bell } from "lucide-react"

const AdminSidebar = () => {
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (path) => {
    return location.pathname === path
  }

const navItems = [
  // {
  //   name: "Dashboard",
  //   path: "/admin",
  //   icon: <LayoutDashboard className="h-5 w-5" />,
  // },
  {
    name: "Pending Verification",
    path: "/admin/pending",
    icon: <CheckSquare className="h-5 w-5" />,
  },
    {
    name: "All Issues",
    path: "/admin/issues",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  // {
  //   name: "Ward Users",
  //   path: "/admin/ward-users",
  //   icon: <Users className="h-5 w-5" />,
  // },
  {
    name: "Map View",
    path: "/admin/ward-map",
    icon: <Map className="h-5 w-5" />,
  },
  {
    name: "Analytics",
    path: "/admin/analytics",
    icon: <BarChart className="h-5 w-5" />,
  },
  {
    name: "Hall of Fame",
    path: "/admin/hall-of-fame",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    name: "Notifications",
    path: "/admin/notifications",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    name: "Profile",
    path: "/admin/profile",
    icon: <User className="h-5 w-5" />,
  },
  // Optional: Include at the bottom under a divider
  // {
  //   name: "Settings",
  //   path: "/admin/settings",
  //   icon: <Settings className="h-5 w-5" />,
  // },
];

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 shadow-md hidden md:block">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
            {user?.name.charAt(0)}
          </div>
          <div className="ml-3">
            <p className="text-gray-900 dark:text-white font-medium">{user?.name}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Administrator</p>
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
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
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

export default AdminSidebar
