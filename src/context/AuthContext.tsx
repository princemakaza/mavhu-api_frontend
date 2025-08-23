import axios from "axios";
import { log } from "console";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone_number: string;
  level: string;
  address?: string;
  school?: string;
  subjects?: string[];
  subscription_status?: string;
  profile_picture?: string;
  next_of_kin_full_name?: string;
  next_of_kin_phone_number?: string;
};

interface loginCreds {
  email: string;
  password: string;
}

interface registerCreds {
  firstName: string;
  lastName: string;
  email: string;
  phone_number: string;
  password: string;
  level: string;
  address?: string;
  school?: string;
  subjects?: string[];
  subscription_status?: string;
  profile_picture?: string;
  next_of_kin_full_name?: string;
  next_of_kin_phone_number?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (userData: loginCreds) => Promise<null | string>;
  logout: () => void;
  checkLogin: () => boolean;
  register: (userData: registerCreds) => Promise<null | string>;
  user: User | null;
  loading: boolean;
  token: string | null;
  updateStudent: (data: Partial<User>) => Promise<null | string>;
  isInitialized: boolean; // Add this to track if auth has been initialized
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL =
  "/api/v1/student_route";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // For action loading states
  const [isInitialized, setIsInitialized] = useState(false); // For initialization state
  const navigate = useNavigate();

  // Clear auth data helper function
  const clearAuthData = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  // Validate stored user data
  const isValidUserData = (userData: any): userData is User => {
    return (
      userData &&
      typeof userData === "object" &&
      userData._id &&
      userData.firstName &&
      userData.lastName &&
      userData.email
    );
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Initializing authentication...");

        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        console.log("---------stored User", storedUser);
        if (storedUser && storedToken) {
          try {
            const userData = JSON.parse(storedUser);

            // Validate the parsed user data
            if (isValidUserData(userData)) {
              console.log("Valid user data found in localStorage:", userData);

              // Optional: Verify token with backend (uncomment if needed)
              // try {
              //     const response = await axios.get(`${API_BASE_URL}/verify-token`, {
              //         headers: {
              //             Authorization: `Bearer ${storedToken}`,
              //         },
              //     });
              //
              //     if (response.data?.data?.message !== "Token is valid") {
              //         throw new Error("Token verification failed");
              //     }
              // } catch (verifyError) {
              //     console.error("Token verification failed:", verifyError);
              //     clearAuthData();
              //     setIsInitialized(true);
              //     return;
              // }

              setUser(userData);
              setToken(storedToken);
              setIsAuthenticated(true);

              // Redirect from auth pages if already logged in
              const currentPath = window.location.pathname;
              if (currentPath === "/login" || currentPath === "/register") {
                console.log("Redirecting from auth page to home");
                navigate("/", { replace: true });
              }
            } else {
              console.warn("Invalid user data in localStorage:", userData);
              clearAuthData();
            }
          } catch (parseError) {
            console.error("Error parsing stored user data:", parseError);
            clearAuthData();
          }
        } else {
          console.log("No stored authentication data found");
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        clearAuthData();
      } finally {
        setIsInitialized(true);
        console.log("Authentication initialization complete");
      }
    };

    initializeAuth();
  }, [navigate]);

  const checkLogin = () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        return isValidUserData(userData);
      } catch {
        return false;
      }
    }
    return false;
  };

  const login = async (credentials: loginCreds): Promise<null | string> => {
    try {
      setLoading(true);
      console.log("Attempting login...");

      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: credentials.email,
        password: credentials.password,
      });

      console.log("Login response:", response.data);

      if (response.data?.token && response.data?.data) {
        const { token, data: userData } = response.data;

        // Validate received user data
        if (!isValidUserData(userData)) {
          console.error("Invalid user data received from server:", userData);
          return "Invalid user data received from server";
        }

        // Store user data and token
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);

        setUser(userData);
        setToken(token);
        setIsAuthenticated(true);

        console.log("Login successful, redirecting...");
        navigate("/", { replace: true });
        return null;
      } else {
        return response.data?.data?.message || "Login failed";
      }
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error)) {
        return (
          error.response?.data?.data?.message ||
          "Login failed. Please try again."
        );
      }
      return "An unexpected error occurred during login.";
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: registerCreds): Promise<null | string> => {
    try {
      setLoading(true);
      console.log("Attempting registration...");

      const response = await axios.post(`${API_BASE_URL}/signup`, {
        ...userData,
        profile_picture: userData.profile_picture || "default_picture",
        next_of_kin_full_name: userData.next_of_kin_full_name || "None",
        next_of_kin_phone_number: userData.next_of_kin_phone_number || "None",
      });

      if (response.data?.token && response.data?.data) {
        console.log("Registration response:", response.data);

        const { token, data: newUserData } = response.data;

        // Validate received user data
        if (!isValidUserData(newUserData)) {
          console.error("Invalid user data received from server:", newUserData);
          return "Invalid user data received from server";
        }

        // Store user data and token
        localStorage.setItem("user", JSON.stringify(newUserData));
        localStorage.setItem("token", token);

        setUser(newUserData);
        setToken(token);
        setIsAuthenticated(true);

        console.log("Registration successful, redirecting...");
        navigate("/", { replace: true });
        return null;
      } else {
        return response.data?.data?.message || "Registration failed";
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (axios.isAxiosError(error)) {
        return (
          error.response?.data?.data?.message ||
          "Registration failed. Please try again."
        );
      }
      return "An unexpected error occurred during registration.";
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log("Logging out...");

      if (token) {
        try {
          await axios.post(
            `${API_BASE_URL}/logout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (error) {
          console.error(
            "Server logout error (continuing with local logout):",
            error
          );
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
      setLoading(false);
      console.log("Logout complete, redirecting to login...");
      navigate("/login", { replace: true });
    }
  };

  const updateStudent = async (data: Partial<User>): Promise<null | string> => {
    if (!token || !user?._id) return "Not authenticated";
    try {
      setLoading(true);
      console.log("Updating student data...");

      const response = await axios.put(
        `${API_BASE_URL}/updatestudent/${user._id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.data) {
        const updatedUser = response.data.data;

        // Validate updated user data
        if (!isValidUserData(updatedUser)) {
          console.error("Invalid updated user data:", updatedUser);
          return "Invalid user data received from server";
        }

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("Student data updated successfully");
        return null;
      } else {
        return response.data?.message || "Update failed";
      }
    } catch (error) {
      console.error("Update student error:", error);
      if (axios.isAxiosError(error)) {
        return (
          error.response?.data?.message || "Update failed. Please try again."
        );
      }
      return "An unexpected error occurred during update.";
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        register,
        user,
        loading,
        token,
        checkLogin,
        updateStudent,
        isInitialized, // Provide initialization state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
