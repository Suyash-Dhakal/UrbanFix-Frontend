"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast"
import Button from "../components/Button"
import Card from "../components/Card"
import { ArrowLeft, CheckCircle } from "lucide-react"


const VerifyEmailPage = () => {
  const location = useLocation()

  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRefs = useRef([])

  const { verifyEmail } = useAuth();
  const { addToast } = useToast()
  const navigate = useNavigate()

  // If no email is provided, redirect to forgot password page
  // useEffect(() => {
  //   if (!email) {
  //     navigate("/forgot-password")
  //   }
  // }, [email, navigate])

  const handleInputChange = (index, value) => {
    if (value.length > 1) {
      // If pasting a code, try to fill all inputs
      if (value.length === 6 && /^\d+$/.test(value)) {
        const digits = value.split("")
        setVerificationCode(digits)
        inputRefs.current[5].focus()
        return
      }
      value = value.slice(0, 1)
    }

    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!verificationCode[index] && index > 0) {
        const newCode = [...verificationCode]
        newCode[index - 1] = ""
        setVerificationCode(newCode)
        inputRefs.current[index - 1].focus()
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const code = verificationCode.join("")
    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setIsLoading(true)

    try {
      // In a real app, this would call an API endpoint
      // For now, we'll simulate a successful verification
      // await new Promise((resolve) => setTimeout(resolve, 1000))

      const result= await verifyEmail(code);
      if(result.success){
        addToast("Email verified successfully!", "success");
        navigate("/dashboard");
      }
      else{
        setError(result.message);
      }

      // // For demo purposes, any code is valid
      // addToast("Email verified successfully!", "success")
      // // In a real app, navigate to reset password page
      // navigate("/login")

    } catch (err) {
      setError("Invalid verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  };

  // Uncomment this if you want to implement resend code functionality
  // const handleResendCode = () => {
  //   addToast("A new verification code has been sent to your email", "info")
  // }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-teal-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Email</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            We've sent a 6-digit verification code to your email address.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="form-label text-center block mb-4">Enter Verification Code</label>
            <div className="flex justify-between gap-2">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="form-input w-12 h-12 text-center text-xl"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  required
                />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Verify Email
          </Button>
        </form>

        <div className="mt-6 text-center">
          {/* <p className="text-gray-600 dark:text-gray-300 mb-2">
            Didn't receive the code?{" "}
            <button onClick={handleResendCode} className="text-teal-600 dark:text-teal-400 hover:underline">
              Resend
            </button>
          </p> */}
          <Link
            to="/register"
            className="text-sm text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Register Page
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default VerifyEmailPage
