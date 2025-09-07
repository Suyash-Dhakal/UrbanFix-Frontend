"use client"

import { Link } from "react-router-dom"
import Button from "../components/Button"
import { AlertTriangle, Home, ChevronLeft } from "lucide-react"

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <AlertTriangle className="h-16 w-16 text-amber-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/">
          <Button>
            <Home className="mr-2 h-5 w-5" />
            Go to Home
          </Button>
        </Link>
        <button onClick={() => window.history.back()}>
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </button>
      </div>
    </div>
  )
}

export default NotFoundPage
