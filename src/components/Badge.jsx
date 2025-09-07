const Badge = ({ children, variant = "default", size = "md", className = "", ...props }) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full"

  const variantClasses = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    primary: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100",
    secondary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  }

  const classes = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${className}
  `

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}

export default Badge
