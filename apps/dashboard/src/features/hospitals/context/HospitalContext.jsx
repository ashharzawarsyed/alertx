import React, { createContext, useContext, useReducer } from "react";

// Hospital Action Types
export const HOSPITAL_ACTIONS = {
  SET_SEARCH_TERM: "SET_SEARCH_TERM",
  SET_STATUS_FILTER: "SET_STATUS_FILTER",
  SET_SELECTED_HOSPITAL: "SET_SELECTED_HOSPITAL",
  SET_EDITING_HOSPITAL: "SET_EDITING_HOSPITAL",
  TOGGLE_DETAILS_MODAL: "TOGGLE_DETAILS_MODAL",
  TOGGLE_ADD_EDIT_MODAL: "TOGGLE_ADD_EDIT_MODAL",
  CLEAR_SELECTION: "CLEAR_SELECTION",
};

// Initial State
const initialState = {
  searchTerm: "",
  statusFilter: "all",
  selectedHospital: null,
  editingHospital: null,
  showDetailsModal: false,
  showAddEditModal: false,
};

// Hospital Reducer
function hospitalReducer(state, action) {
  switch (action.type) {
    case HOSPITAL_ACTIONS.SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload,
      };

    case HOSPITAL_ACTIONS.SET_STATUS_FILTER:
      return {
        ...state,
        statusFilter: action.payload,
      };

    case HOSPITAL_ACTIONS.SET_SELECTED_HOSPITAL:
      return {
        ...state,
        selectedHospital: action.payload,
      };

    case HOSPITAL_ACTIONS.SET_EDITING_HOSPITAL:
      return {
        ...state,
        editingHospital: action.payload,
      };

    case HOSPITAL_ACTIONS.TOGGLE_DETAILS_MODAL:
      return {
        ...state,
        showDetailsModal:
          action.payload !== undefined
            ? action.payload
            : !state.showDetailsModal,
        selectedHospital: action.hospital || state.selectedHospital,
      };

    case HOSPITAL_ACTIONS.TOGGLE_ADD_EDIT_MODAL:
      return {
        ...state,
        showAddEditModal:
          action.payload !== undefined
            ? action.payload
            : !state.showAddEditModal,
        editingHospital: action.hospital || state.editingHospital,
      };

    case HOSPITAL_ACTIONS.CLEAR_SELECTION:
      return {
        ...state,
        selectedHospital: null,
        editingHospital: null,
        showDetailsModal: false,
        showAddEditModal: false,
      };

    default:
      return state;
  }
}

// Context
const HospitalContext = createContext();

// Provider Component
export const HospitalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(hospitalReducer, initialState);

  // Action Creators
  const actions = {
    setSearchTerm: (term) =>
      dispatch({ type: HOSPITAL_ACTIONS.SET_SEARCH_TERM, payload: term }),

    setStatusFilter: (status) =>
      dispatch({ type: HOSPITAL_ACTIONS.SET_STATUS_FILTER, payload: status }),

    setSelectedHospital: (hospital) =>
      dispatch({
        type: HOSPITAL_ACTIONS.SET_SELECTED_HOSPITAL,
        payload: hospital,
      }),

    setEditingHospital: (hospital) =>
      dispatch({
        type: HOSPITAL_ACTIONS.SET_EDITING_HOSPITAL,
        payload: hospital,
      }),

    openDetailsModal: (hospital) =>
      dispatch({
        type: HOSPITAL_ACTIONS.TOGGLE_DETAILS_MODAL,
        payload: true,
        hospital,
      }),

    closeDetailsModal: () =>
      dispatch({ type: HOSPITAL_ACTIONS.TOGGLE_DETAILS_MODAL, payload: false }),

    openAddEditModal: (hospital = null) =>
      dispatch({
        type: HOSPITAL_ACTIONS.TOGGLE_ADD_EDIT_MODAL,
        payload: true,
        hospital,
      }),

    closeAddEditModal: () =>
      dispatch({
        type: HOSPITAL_ACTIONS.TOGGLE_ADD_EDIT_MODAL,
        payload: false,
      }),

    clearSelection: () => dispatch({ type: HOSPITAL_ACTIONS.CLEAR_SELECTION }),

    // Convenience methods
    viewHospitalDetails: (hospital) => {
      dispatch({
        type: HOSPITAL_ACTIONS.SET_SELECTED_HOSPITAL,
        payload: hospital,
      });
      dispatch({
        type: HOSPITAL_ACTIONS.TOGGLE_DETAILS_MODAL,
        payload: true,
      });
    },

    editHospital: (hospital) => {
      dispatch({
        type: HOSPITAL_ACTIONS.SET_EDITING_HOSPITAL,
        payload: hospital,
      });
      dispatch({
        type: HOSPITAL_ACTIONS.TOGGLE_ADD_EDIT_MODAL,
        payload: true,
      });
    },

    addNewHospital: () => {
      dispatch({
        type: HOSPITAL_ACTIONS.SET_EDITING_HOSPITAL,
        payload: null,
      });
      dispatch({
        type: HOSPITAL_ACTIONS.TOGGLE_ADD_EDIT_MODAL,
        payload: true,
      });
    },
  };

  const value = {
    ...state,
    ...actions,
  };

  return (
    <HospitalContext.Provider value={value}>
      {children}
    </HospitalContext.Provider>
  );
};

// Custom Hook
export const useHospitalContext = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error(
      "useHospitalContext must be used within a HospitalProvider",
    );
  }
  return context;
};

export default HospitalContext;
