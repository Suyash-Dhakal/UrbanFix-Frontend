"use client"

import { useTheme } from "../hooks/useTheme"
import { Sun, Moon } from "lucide-react"

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  const handleToggle = () => {
    console.log("Toggle clicked, current theme:", theme)
    toggleTheme()
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}

export default ThemeToggle
