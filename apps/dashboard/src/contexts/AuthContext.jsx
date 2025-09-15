import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../services/api";

// Auth state shape
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
};

// Auth actions
const authActions = {
  SET_LOADING: "SET_LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGOUT: "LOGOUT",
  SET_USER: "SET_USER",
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case authActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case authActions.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };
    case authActions.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("alertx_admin_token");
        const userData = localStorage.getItem("alertx_admin_user");

        if (token && userData) {
          // Verify token is still valid
          try {
            const profile = await authAPI.getProfile();
            dispatch({
              type: authActions.LOGIN_SUCCESS,
              payload: { user: profile.user, token },
            });
          } catch {
            // Token invalid, clear storage
            localStorage.removeItem("alertx_admin_token");
            localStorage.removeItem("alertx_admin_user");
            dispatch({
              type: authActions.SET_LOADING,
              payload: false,
            });
          }
        } else {
          dispatch({
            type: authActions.SET_LOADING,
            payload: false,
          });
        }
      } catch {
        dispatch({
          type: authActions.SET_LOADING,
          payload: false,
        });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });

      const response = await authAPI.login(credentials);

      // Store in localStorage
      localStorage.setItem("alertx_admin_token", response.token);
      localStorage.setItem("alertx_admin_user", JSON.stringify(response.user));

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user: response.user, token: response.token },
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: authActions.SET_LOADING, payload: false });
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });

      await authAPI.register(userData);

      dispatch({ type: authActions.SET_LOADING, payload: false });

      return {
        success: true,
        message:
          "Registration submitted successfully. Your account will be reviewed by a super admin.",
      };
    } catch (error) {
      dispatch({ type: authActions.SET_LOADING, payload: false });
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Registration failed",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Continue logout even if API call fails
    }
    dispatch({ type: authActions.LOGOUT });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
