"use client"

import { createContext, useState, useEffect } from "react"
import axios from "axios"


axios.defaults.withCredentials = true;

export const AuthContext = createContext()


const API_URL= "http://localhost:3000/api/auth"

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/check-auth`);
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally{
      setIsLoading(false);
      }
    };
    fetchUser();
  },[])


  // const checkAuth = async () => {
  //   try {
  //     const response = await axios.get(`${API_URL}/check-auth`);
  //     setUser(response.data.user);
  //     setIsAuthenticated(true);
  //   } catch (error) {
  //     console.error("Error fetching user:", error);
  //     setUser(null);
  //     setIsAuthenticated(false);
  //   } finally{
  //     setIsLoading(false);
  //   }
  // }

  const login = async (email, password) => {

    const user={
      email,
      password
    }
    
    try {
      const response = await axios.post(`${API_URL}/login`,user);
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error("Error logging in:", error);
      return { success: false, message: error.response.data.message };
    }
    finally{
      setIsLoading(false);
    }
  }

  const register = async (name, email, password, address, phoneNumber, wardNumber) => {


    // Create new user
    const newUser = {
      name,
      email,
      password,
      address,
      phoneNumber,
      wardNumber,
    }

    try {
      const response= await axios.post(`${API_URL}/signup`, newUser);
      setUser(response.data.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error("Error registering user:", error);
      return { success: false, message: error.response.data.message };
    }
  }

  const verifyEmail=async(code)=>{
    try {
      const response= await axios.post(`${API_URL}/verify-email`, {code});
      setUser(response.data.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Error verifying email:", error);
      return { success: false, message: error.response.data.message };
    }
  }

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`);
    } catch (error) {
      console.error("Error logging out:", error);
    }
    finally{
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        verifyEmail,
        // checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
