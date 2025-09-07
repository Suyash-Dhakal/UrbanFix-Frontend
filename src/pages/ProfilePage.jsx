"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../hooks/useAuth"
import { useToast } from "../hooks/useToast"
import Card from "../components/Card"
import Button from "../components/Button"
import Badge from "../components/Badge"
import { User, Mail, MapPin, Calendar, Shield, Camera, X, Check, EditIcon } from "lucide-react"

// Mock user additional data
const mockUserData = {
  1: {
    ward: "ward1",
    wardName: "Ward 1 - Downtown",
    registeredOn: "2023-01-15T10:30:00",
    profilePhoto: null,
  },
  2: {
    ward: null, // Admins don't have a ward
    wardName: null,
    registeredOn: "2022-11-05T09:15:00",
    profilePhoto: null,
  },
}

const ProfilePage = () => {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedWard, setEditedWard] = useState("")
  const [profilePhoto, setProfilePhoto] = useState(null)
  const fileInputRef = useRef(null)

  // Mock wards data for dropdown
  const wards = [
    { id: "ward1", name: "Ward 1 - Downtown" },
    { id: "ward2", name: "Ward 2 - Westside" },
    { id: "ward3", name: "Ward 3 - Northside" },
    { id: "ward4", name: "Ward 4 - Eastside" },
    { id: "ward5", name: "Ward 5 - Southside" },
  ]

  useEffect(() => {
    if (user) {
      // Simulate API fetch for additional user data
      setTimeout(() => {
        const additionalData = mockUserData[user.id] || {
          ward: null,
          wardName: null,
          registeredOn: new Date().toISOString(),
          profilePhoto: null,
        }

        setUserData({
          ...user,
          ...additionalData,
        })

        setEditedName(user.name)
        setEditedWard(additionalData.ward || "")
        setProfilePhoto(additionalData.profilePhoto)
        setLoading(false)
      }, 500)
    }
  }, [user])

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setEditedName(userData.name)
      setEditedWard(userData.ward || "")
      setIsEditing(false)
    } else {
      setIsEditing(true)
    }
  }

  const handleSaveProfile = () => {
    if (!editedName.trim()) {
      addToast("Name cannot be empty", "error")
      return
    }

    // Simulate API call to update profile
    setLoading(true)
    setTimeout(() => {
      const updatedUserData = {
        ...userData,
        name: editedName,
        ward: user.role === "user" ? editedWard : userData.ward,
        wardName: user.role === "user" ? wards.find((w) => w.id === editedWard)?.name : userData.wardName,
        profilePhoto: profilePhoto,
      }

      setUserData(updatedUserData)
      setIsEditing(false)
      setLoading(false)
      addToast("Profile updated successfully", "success")
    }, 800)
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePhoto(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setProfilePhoto(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">User not found</h3>
        <p className="text-gray-600 dark:text-gray-300">Please log in to view your profile</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

      <Card className="overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
          <Button variant={isEditing ? "outline" : "primary"} size="sm" onClick={handleEditToggle}>
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </>
            ) : (
              <>
                <EditIcon className="h-4 w-4 mr-1" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {profilePhoto ? (
                <img
                  src={profilePhoto || "/placeholder.svg"}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-teal-500 flex items-center justify-center text-white text-4xl font-bold">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}

              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    ref={fileInputRef}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-teal-500 text-white p-2 rounded-full shadow-md hover:bg-teal-600 transition-colors"
                    title="Upload photo"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {isEditing && profilePhoto && (
              <button onClick={removePhoto} className="mt-2 text-red-500 text-sm flex items-center hover:text-red-600">
                <X className="h-4 w-4 mr-1" />
                Remove photo
              </button>
            )}

            <div className="mt-4 text-center">
              <Badge variant={userData.role === "admin" ? "secondary" : "primary"} size="lg" className="mt-2">
                {userData.role === "admin" ? "Administrator" : "Citizen"}
              </Badge>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="form-label">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-input"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              ) : (
                <div className="flex items-center text-gray-900 dark:text-white">
                  <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <span>{userData.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Email</label>
              <div className="flex items-center text-gray-900 dark:text-white">
                <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span>{userData.email}</span>
              </div>
            </div>

            {userData.role === "user" && (
              <div>
                <label className="form-label">Ward</label>
                {isEditing ? (
                  <select className="form-input" value={editedWard} onChange={(e) => setEditedWard(e.target.value)}>
                    <option value="">Select your ward</option>
                    {wards.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span>{userData.wardName || "Not specified"}</span>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="form-label">Role</label>
              <div className="flex items-center text-gray-900 dark:text-white">
                <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span>{userData.role === "admin" ? "Administrator" : "Citizen"}</span>
              </div>
            </div>

            <div>
              <label className="form-label">Registered On</label>
              <div className="flex items-center text-gray-900 dark:text-white">
                <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span>{formatDate(userData.registeredOn)}</span>
              </div>
            </div>

            {isEditing && (
              <div className="pt-4">
                <Button onClick={handleSaveProfile}>
                  <Check className="h-5 w-5 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProfilePage
