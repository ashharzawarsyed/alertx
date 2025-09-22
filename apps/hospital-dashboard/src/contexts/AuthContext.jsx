import React, { createContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("hospital_token"));

  // API base URL
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1";

  const logout = useCallback(() => {
    setUser(null);
    setHospital(null);
    setToken(null);
    localStorage.removeItem("hospital_token");
  }, []);

  const fetchHospitalDetails = useCallback(
    async (hospitalId) => {
      try {
        // Ensure hospitalId is a string
        const validHospitalId =
          typeof hospitalId === "string"
            ? hospitalId
            : hospitalId?.hospitalId || hospitalId?._id || String(hospitalId);

        if (
          !validHospitalId ||
          validHospitalId === "undefined" ||
          validHospitalId === "[object Object]"
        ) {
          console.error("Invalid hospital ID:", hospitalId);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/hospitals/${validHospitalId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setHospital(data.data.hospital);
          }
        } else {
          console.warn(
            `Hospital API endpoint not found (${response.status}). Using user data as fallback.`
          );
          // Fallback: use hospitalId as the hospital object with basic info
          setHospital({
            id: validHospitalId,
            name: `Hospital ${validHospitalId}`,
            // Add other default hospital properties as needed
          });
        }
      } catch (error) {
        console.error("Error fetching hospital details:", error);
      }
    },
    [API_BASE_URL, token]
  );

  const validateToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.user.role === "hospital") {
          setUser(data.data.user);
          // Fetch hospital details if user is hospital account
          const hospitalId = data.data.user.hospitalInfo?.hospitalId;
          if (hospitalId) {
            await fetchHospitalDetails(hospitalId);
          }
        } else {
          // User is not hospital account, logout
          logout();
        }
      } else {
        // Invalid token, logout
        logout();
      }
    } catch (error) {
      console.error("Token validation error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token, logout, fetchHospitalDetails]);

  // Check if user is authenticated on app load
  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, [token, validateToken]);

  const signin = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Check if user is hospital staff or hospital account
        if (
          data.data.user.role !== "hospital_staff" &&
          data.data.user.role !== "hospital"
        ) {
          throw new Error("Access denied. Hospital accounts only.");
        }

        // Check if hospital account is approved
        if (data.data.user.approvalStatus !== "approved") {
          throw new Error(
            "Your hospital account is pending approval. Please wait for admin approval."
          );
        }

        const authToken = data.data.token;
        setToken(authToken);
        setUser(data.data.user);
        localStorage.setItem("hospital_token", authToken);

        // Fetch hospital details
        const hospitalId = data.data.user.hospitalInfo?.hospitalId;
        if (hospitalId) {
          await fetchHospitalDetails(hospitalId);
        } else {
          // If no separate hospital ID, use user data as hospital data for now
          setHospital({
            id: data.data.user._id,
            name: data.data.user.name,
            email: data.data.user.email,
            phone: data.data.user.phone,
            ...data.data.user.hospitalInfo,
          });
        }

        return { success: true, user: data.data.user };
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Signin error:", error);
      throw error;
    }
  };

  const signup = async (hospitalData) => {
    try {
      // Use the new combined hospital registration endpoint
      const response = await fetch(`${API_BASE_URL}/auth/register/hospital`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Hospital details
          hospitalName: hospitalData.hospitalName,
          hospitalType: hospitalData.hospitalType,
          licenseNumber: hospitalData.licenseNumber,
          address: hospitalData.address,
          city: hospitalData.city,
          state: hospitalData.state,
          zipCode: hospitalData.zipCode,
          country: hospitalData.country,
          latitude: parseFloat(hospitalData.latitude),
          longitude: parseFloat(hospitalData.longitude),
          contactNumber: hospitalData.contactNumber,
          email: hospitalData.email,
          totalBeds: {
            general: parseInt(hospitalData.totalBeds.general),
            icu: parseInt(hospitalData.totalBeds.icu),
            emergency: parseInt(hospitalData.totalBeds.emergency),
            operation: parseInt(hospitalData.totalBeds.operation) || 0,
          },
          facilities: hospitalData.facilities || [],
          emergencyContact: hospitalData.emergencyContact,
          operatingHours: hospitalData.operatingHours || { isOpen24x7: true },
          password: hospitalData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Hospital registration failed");
      }

      return {
        success: true,
        message: data.message,
        hospital: data.data.hospital,
        user: data.data.user,
      };
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const value = {
    user,
    hospital,
    loading,
    isAuthenticated: !!user,
    signin,
    signup,
    logout,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
