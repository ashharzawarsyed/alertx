import React, { createContext, useContext, useReducer, useEffect } from "react";

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
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("alertx_token");
        const userData = localStorage.getItem("alertx_user");

        if (token && userData) {
          const user = JSON.parse(userData);
          dispatch({
            type: authActions.LOGIN_SUCCESS,
            payload: { user, token },
          });
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

      // TODO: Replace with actual API call

      // Mock successful login for Phase 1 testing
      const mockUser = {
        id: "1",
        name: "Admin User",
        email: credentials.email,
        role: "admin",
      };
      const mockToken = "mock-jwt-token";

      // Store in localStorage
      localStorage.setItem("alertx_token", mockToken);
      localStorage.setItem("alertx_user", JSON.stringify(mockUser));

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user: mockUser, token: mockToken },
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: authActions.SET_LOADING, payload: false });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("alertx_token");
    localStorage.removeItem("alertx_user");
    dispatch({ type: authActions.LOGOUT });
  };

  const value = {
    ...state,
    login,
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
