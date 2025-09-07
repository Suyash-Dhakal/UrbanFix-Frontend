import { forwardRef } from "react"

const Button = forwardRef(
  (
    { children, variant = "primary", size = "md", className = "", isLoading = false, disabled = false, ...props },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"

    const variantClasses = {
      primary: "bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500 disabled:bg-teal-300",
      secondary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 disabled:bg-blue-300",
      accent: "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500 disabled:bg-amber-300",
      danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 disabled:bg-red-300",
      outline:
        "border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500 text-gray-700 dark:text-gray-200 disabled:text-gray-400 dark:disabled:text-gray-500",
      ghost:
        "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:text-gray-400 dark:disabled:text-gray-500",
    }

    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-2.5 text-base",
    }

    const classes = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${disabled || isLoading ? "cursor-not-allowed opacity-70" : ""}
    ${className}
  `

    return (
      <button ref={ref} className={classes} disabled={disabled || isLoading} {...props}>
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"

export default Button
