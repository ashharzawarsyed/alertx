import React, { createContext, useContext, useReducer, useEffect } from "react";

// Initial state
const initialState = {
  ambulances: [],
  hospitals: [],
  hotspots: [],
  loading: false,
  error: null,
  selectedEntity: null,
  sidebarOpen: false,
  layerVisibility: {
    ambulances: true,
    hospitals: true,
    hotspots: true,
  },
};

// Action types
export const MAPS_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_AMBULANCES: "SET_AMBULANCES",
  SET_HOSPITALS: "SET_HOSPITALS",
  SET_HOTSPOTS: "SET_HOTSPOTS",
  UPDATE_AMBULANCE: "UPDATE_AMBULANCE",
  UPDATE_HOSPITAL: "UPDATE_HOSPITAL",
  SELECT_ENTITY: "SELECT_ENTITY",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
  SET_SIDEBAR_OPEN: "SET_SIDEBAR_OPEN",
  TOGGLE_LAYER: "TOGGLE_LAYER",
  UPDATE_AMBULANCE_POSITION: "UPDATE_AMBULANCE_POSITION",
  UPDATE_AMBULANCE_ETA: "UPDATE_AMBULANCE_ETA",
  UPDATE_HOSPITAL_CAPACITY: "UPDATE_HOSPITAL_CAPACITY",
};

// Reducer function
const mapsReducer = (state, action) => {
  switch (action.type) {
    case MAPS_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case MAPS_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case MAPS_ACTIONS.SET_AMBULANCES:
      return { ...state, ambulances: action.payload, loading: false };

    case MAPS_ACTIONS.SET_HOSPITALS:
      return { ...state, hospitals: action.payload, loading: false };

    case MAPS_ACTIONS.SET_HOTSPOTS:
      return { ...state, hotspots: action.payload, loading: false };

    case MAPS_ACTIONS.UPDATE_AMBULANCE:
      return {
        ...state,
        ambulances: state.ambulances.map((ambulance) =>
          ambulance.id === action.payload.id
            ? { ...ambulance, ...action.payload.updates }
            : ambulance,
        ),
      };

    case MAPS_ACTIONS.UPDATE_HOSPITAL:
      return {
        ...state,
        hospitals: state.hospitals.map((hospital) =>
          hospital.id === action.payload.id
            ? { ...hospital, ...action.payload.updates }
            : hospital,
        ),
      };

    case MAPS_ACTIONS.SELECT_ENTITY:
      return {
        ...state,
        selectedEntity: action.payload,
        sidebarOpen: action.payload !== null,
      };

    case MAPS_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
        selectedEntity: !state.sidebarOpen ? state.selectedEntity : null,
      };

    case MAPS_ACTIONS.SET_SIDEBAR_OPEN:
      return {
        ...state,
        sidebarOpen: action.payload,
        selectedEntity: action.payload ? state.selectedEntity : null,
      };

    case MAPS_ACTIONS.TOGGLE_LAYER:
      return {
        ...state,
        layerVisibility: {
          ...state.layerVisibility,
          [action.payload]: !state.layerVisibility[action.payload],
        },
      };

    case MAPS_ACTIONS.UPDATE_AMBULANCE_POSITION:
      return {
        ...state,
        ambulances: state.ambulances.map((ambulance) =>
          ambulance.id === action.payload.id
            ? { ...ambulance, coords: action.payload.coords }
            : ambulance,
        ),
      };

    case MAPS_ACTIONS.UPDATE_AMBULANCE_ETA:
      return {
        ...state,
        ambulances: state.ambulances.map((ambulance) =>
          ambulance.eta && ambulance.eta > 0
            ? { ...ambulance, eta: ambulance.eta - 1 }
            : ambulance,
        ),
      };

    case MAPS_ACTIONS.UPDATE_HOSPITAL_CAPACITY:
      return {
        ...state,
        hospitals: state.hospitals.map((hospital) => {
          const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
          const newAvailable = Math.max(
            0,
            Math.min(hospital.beds.total, hospital.beds.available + change),
          );

          return {
            ...hospital,
            beds: {
              ...hospital.beds,
              available: newAvailable,
            },
          };
        }),
      };

    default:
      return state;
  }
};

// Create contexts
const MapsStateContext = createContext();
const MapsDispatchContext = createContext();

// Provider component
export const MapsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mapsReducer, initialState);

  // Real-time updates
  useEffect(() => {
    const etaInterval = setInterval(() => {
      dispatch({ type: MAPS_ACTIONS.UPDATE_AMBULANCE_ETA });
    }, 5000); // Update ETA every 5 seconds

    const positionInterval = setInterval(() => {
      state.ambulances.forEach((ambulance) => {
        if (ambulance.status === "On Route" && ambulance.route.length > 0) {
          const currentRoute = ambulance.route;
          const currentIndex = Math.floor(Math.random() * currentRoute.length);
          const newCoords = currentRoute[currentIndex];

          dispatch({
            type: MAPS_ACTIONS.UPDATE_AMBULANCE_POSITION,
            payload: { id: ambulance.id, coords: newCoords },
          });
        }
      });
    }, 10000); // Update positions every 10 seconds

    const capacityInterval = setInterval(() => {
      dispatch({ type: MAPS_ACTIONS.UPDATE_HOSPITAL_CAPACITY });
    }, 30000); // Update hospital capacity every 30 seconds

    return () => {
      clearInterval(etaInterval);
      clearInterval(positionInterval);
      clearInterval(capacityInterval);
    };
  }, [state.ambulances]);

  return (
    <MapsStateContext.Provider value={state}>
      <MapsDispatchContext.Provider value={dispatch}>
        {children}
      </MapsDispatchContext.Provider>
    </MapsStateContext.Provider>
  );
};

// Custom hooks
export const useMapsState = () => {
  const context = useContext(MapsStateContext);
  if (context === undefined) {
    throw new Error("useMapsState must be used within a MapsProvider");
  }
  return context;
};

export const useMapsDispatch = () => {
  const context = useContext(MapsDispatchContext);
  if (context === undefined) {
    throw new Error("useMapsDispatch must be used within a MapsProvider");
  }
  return context;
};

// Combined hook for convenience
export const useMaps = () => {
  return {
    state: useMapsState(),
    dispatch: useMapsDispatch(),
  };
};
