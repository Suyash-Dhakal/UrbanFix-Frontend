"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useToast } from "../hooks/useToast"
import Button from "../components/Button"
import Card from "../components/Card"
import { User, Mail, Lock, UserPlus, MapPin, Phone, Building2 } from "lucide-react"

const RegisterPage = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [address, setAddress] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [wardNumber, setWardNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState({})

  const { register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[!@#$%^&*()]/.test(password)) strength += 25
    return Math.min(strength, 100)
  }

  const validateName = (name) => {
    if (!name.trim()) return "Full name is required"
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Only letters and spaces are allowed"
    if (name.trim().length < 2) return "Name must be at least 2 characters"
    if (name.trim().length > 50) return "Name must not exceed 50 characters"
    return ""
  }

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email format"
    return ""
  }

  const validatePassword = (password) => {
    if (!password) return "Password is required"
    if (password.length < 8) return "Password must be at least 8 characters"
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter"
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter"
    if (!/[0-9]/.test(password)) return "Password must contain at least one number"
    if (!/[!@#$%^&*()]/.test(password)) return "Password must contain at least one special character (!@#$%^&*())"
    return ""
  }

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password"
    if (confirmPassword !== password) return "Passwords do not match"
    return ""
  }

  const validateAddress = (address) => {
    if (!address.trim()) return "Address is required"
    if (address.trim().length < 5) return "Address must be at least 5 characters"
    if (address.trim().length > 100) return "Address must not exceed 100 characters"
    return ""
  }

  const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber.trim()) return "Phone number is required"
    const nepalPhoneRegex = /^9\d{9}$/
    if (!nepalPhoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      return "Please enter a valid Nepal phone number (9XXXXXXXXX)"
    }
    return ""
  }

  const handleFieldValidation = (field, value, additionalValue = null) => {
    let error = ""
    switch (field) {
      case "name":
        error = validateName(value)
        break
      case "email":
        error = validateEmail(value)
        break
      case "password":
        error = validatePassword(value)
        break
      case "confirmPassword":
        error = validateConfirmPassword(value, additionalValue || password)
        break
      case "address":
        error = validateAddress(value)
        break
      case "phoneNumber":
        error = validatePhoneNumber(value)
        break
    }

    setValidationErrors((prev) => ({
      ...prev,
      [field]: error,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const errors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
      address: validateAddress(address),
      phoneNumber: validatePhoneNumber(phoneNumber),
    }

    setValidationErrors(errors)

    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some((error) => error !== "")
    if (hasErrors) {
      setError("Please fix the validation errors above")
      return
    }

    setIsLoading(true)

    try {
      const result = await register(name, email, password, address, phoneNumber, wardNumber)

      if (result.success) {
        addToast("Account created successfully!", "success")
        navigate("/verify-email")
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = (strength) => {
    if (strength < 25) return "bg-red-500"
    if (strength < 50) return "bg-orange-500"
    if (strength < 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = (strength) => {
    if (strength < 25) return "Weak"
    if (strength < 50) return "Fair"
    if (strength < 75) return "Good"
    return "Strong"
  }

  const passwordStrength = calculatePasswordStrength(password)

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create an Account</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Join our community and start reporting issues</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                className={`form-input pl-10 ${validationErrors.name ? "border-red-500" : ""}`}
                placeholder="Ram Chandra"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  handleFieldValidation("name", e.target.value)
                }}
                required
              />
            </div>
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                className={`form-input pl-10 ${validationErrors.email ? "border-red-500" : ""}`}
                placeholder="ram@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  handleFieldValidation("email", e.target.value)
                }}
                required
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                className={`form-input pl-10 ${validationErrors.password ? "border-red-500" : ""}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  handleFieldValidation("password", e.target.value)
                  if (confirmPassword) {
                    handleFieldValidation("confirmPassword", confirmPassword, e.target.value)
                  }
                }}
                required
              />
            </div>
            {password && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Strength</span>
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      passwordStrength >= 75
                        ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30"
                        : passwordStrength >= 50
                          ? "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30"
                          : passwordStrength >= 25
                            ? "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/30"
                            : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30"
                    }`}
                  >
                    {getPasswordStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${getPasswordStrengthColor(passwordStrength)}`}
                    style={{ width: `${passwordStrength}%` }}
                  >
                    <div className="h-full w-full bg-gradient-to-r from-transparent to-white/20 rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Weak</span>
                  <span>Strong</span>
                </div>
              </div>
            )}
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                className={`form-input pl-10 ${validationErrors.confirmPassword ? "border-red-500" : ""}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  handleFieldValidation("confirmPassword", e.target.value)
                }}
                required
              />
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="address"
                type="text"
                className={`form-input pl-10 ${validationErrors.address ? "border-red-500" : ""}`}
                placeholder="Bijaypur, Dharan"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  handleFieldValidation("address", e.target.value)
                }}
                required
              />
            </div>
            {validationErrors.address && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.address}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="phoneNumber" className="form-label">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phoneNumber"
                type="tel"
                className={`form-input pl-10 ${validationErrors.phoneNumber ? "border-red-500" : ""}`}
                placeholder="98420XXXXX"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value)
                  handleFieldValidation("phoneNumber", e.target.value)
                }}
                required
              />
            </div>
            {validationErrors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.phoneNumber}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="wardNumber" className="form-label">
              Ward Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="wardNumber"
                className="form-input pl-10"
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select your ward
                </option>
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Ward {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            <UserPlus className="mr-2 h-5 w-5" />
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-600 dark:text-teal-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}

export default RegisterPage
