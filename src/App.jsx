"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"
import { useAuth } from "./hooks/useAuth"
import MainLayout from "./layouts/MainLayout"
import DashboardLayout from "./layouts/DashboardLayout"
import AdminLayout from "./layouts/AdminLayout"

// Pages
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ReportIssuePage from "./pages/ReportIssuePage"
import IssuesListPage from "./pages/IssuesListPage"
import IssueDetailPage from "./pages/IssueDetailPage"
import UserDashboardPage from "./pages/UserDashboardPage"
import AdminDashboardPage from "./pages/AdminDashboardPage"
import MapViewPage from "./pages/MapViewPage"
import NotFoundPage from "./pages/NotFoundPage"
import ForgotPassword from "./pages/ForgotPassword"
import VerifyEmailPage from "./pages/VerifyEmailPage"
import HallOfFamePage from "./pages/HallOfFamePage"
import ProfilePage from "./pages/ProfilePage"
import PendingVerificationPage from "./pages/PendingVerificationPage"
import WardUsersPage from "./pages/WardUsersPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import CommonMapViewPage from "./pages/CommonMapViewPage"
import NotificationsPage from "./pages/NotificationPage"




function App() {

  const { user, isAuthenticated } = useAuth()
  // console.log("user", user)
  // console.log("isAuthenticated", isAuthenticated);

  //public route component
//   const PublicRoute = ({ children }) => {

//   if (isAuthenticated) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

const PublicRoute = ({ children }) => {
  const location = window.location.pathname;
  if (isAuthenticated && location !== "/verify-email") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

  // Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  
  if (!isAuthenticated) {
    console.log("User is not authenticated");
    
    return <Navigate to="/login" replace />
  }

  // if (requiredRole && user.role !== requiredRole) {
  //   return <Navigate to="/" replace />
  // }

  if (requiredRole && user?.role !== requiredRole) {
  return <Navigate to="/" replace />;
}

  return children
}

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="forgot" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="issues" element={<IssuesListPage />} />
        <Route path="issues/:id" element={<IssueDetailPage />} />
        <Route path="hall-of-fame" element={<HallOfFamePage />} />
        {/* <Route path="ward-map" element={<MapViewPage />} /> */}
        <Route path="map" element={<CommonMapViewPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
      </Route>

      

      {/* User dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboardPage />} />
        <Route path="report" element={<ReportIssuePage />} />
        <Route path="profile" element={<ProfilePage />} />
         <Route path="city-map" element={<CommonMapViewPage />} />
        <Route path="hall-of-fame" element={<HallOfFamePage />} />
        <Route path="issues" element={<IssuesListPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
  
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="pending" element={<PendingVerificationPage />} />
        <Route path="ward-users" element={<WardUsersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="hall-of-fame" element={<HallOfFamePage />} />
        <Route path="issues" element={<IssuesListPage />} />
        <Route path="ward-map" element={<MapViewPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      
      </Route>


      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
