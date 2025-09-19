import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hospitalService } from "../services/hospitalService";

// Query Keys
export const HOSPITAL_QUERY_KEYS = {
  all: ["hospitals"],
  lists: () => [...HOSPITAL_QUERY_KEYS.all, "list"],
  list: (filters) => [...HOSPITAL_QUERY_KEYS.lists(), filters],
  details: () => [...HOSPITAL_QUERY_KEYS.all, "detail"],
  detail: (id) => [...HOSPITAL_QUERY_KEYS.details(), id],
  stats: () => [...HOSPITAL_QUERY_KEYS.all, "stats"],
};

// Get all hospitals (renamed to avoid confusion)
export const useHospitalQuery = (params = {}) => {
  return useQuery({
    queryKey: HOSPITAL_QUERY_KEYS.list(params),
    queryFn: () => hospitalService.getHospitals(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get hospital by ID
export const useHospital = (id, enabled = true) => {
  return useQuery({
    queryKey: HOSPITAL_QUERY_KEYS.detail(id),
    queryFn: () => hospitalService.getHospital(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Get hospital statistics
export const useHospitalStats = () => {
  return useQuery({
    queryKey: HOSPITAL_QUERY_KEYS.stats(),
    queryFn: hospitalService.getHospitalStats,
    staleTime: 2 * 60 * 1000, // 2 minutes for stats
  });
};

// Create hospital mutation
export const useCreateHospital = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hospitalService.createHospital,
    onSuccess: (newHospital) => {
      // Invalidate and refetch hospitals list
      queryClient.invalidateQueries({ queryKey: HOSPITAL_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: HOSPITAL_QUERY_KEYS.stats() });

      // Optionally add the new hospital to existing cache
      queryClient.setQueryData(
        HOSPITAL_QUERY_KEYS.detail(newHospital.id),
        newHospital,
      );
    },
    onError: (error) => {
      // Failed to create hospital - error will be handled by the component
      throw error;
    },
  });
};

// Update hospital mutation
export const useUpdateHospital = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => hospitalService.updateHospital(id, data),
    onSuccess: (updatedHospital, variables) => {
      const { id } = variables;

      // Update the specific hospital in cache
      queryClient.setQueryData(HOSPITAL_QUERY_KEYS.detail(id), updatedHospital);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: HOSPITAL_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: HOSPITAL_QUERY_KEYS.stats() });
    },
    onError: (error) => {
      // Failed to update hospital - error will be handled by the component
      throw error;
    },
  });
};

// Delete hospital mutation
export const useDeleteHospital = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hospitalService.deleteHospital,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: HOSPITAL_QUERY_KEYS.detail(deletedId),
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: HOSPITAL_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: HOSPITAL_QUERY_KEYS.stats() });
    },
    onError: (error) => {
      // Failed to delete hospital - error will be handled by the component
      throw error;
    },
  });
};

// Update hospital status mutation
export const useUpdateHospitalStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      hospitalService.updateHospitalStatus(id, status),
    onSuccess: (updatedHospital, { id }) => {
      // Update the specific hospital in cache
      queryClient.setQueryData(HOSPITAL_QUERY_KEYS.detail(id), updatedHospital);

      // Invalidate lists and stats
      queryClient.invalidateQueries({ queryKey: HOSPITAL_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: HOSPITAL_QUERY_KEYS.stats() });
    },
  });
};

// Update bed capacity mutation
export const useUpdateBedCapacity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bedData }) =>
      hospitalService.updateBedCapacity(id, bedData),
    onSuccess: (updatedHospital, { id }) => {
      // Update the specific hospital in cache
      queryClient.setQueryData(HOSPITAL_QUERY_KEYS.detail(id), updatedHospital);

      // Invalidate lists and stats
      queryClient.invalidateQueries({ queryKey: HOSPITAL_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: HOSPITAL_QUERY_KEYS.stats() });
    },
  });
};

// Search hospitals
export const useSearchHospitals = (searchParams, enabled = true) => {
  return useQuery({
    queryKey: ["hospitals", "search", searchParams],
    queryFn: () => hospitalService.searchHospitals(searchParams),
    enabled: enabled && Object.keys(searchParams).length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute for search results
  });
};

// Combined hook for hospital management (what the component expects)
export const useHospitals = (params = {}) => {
  const hospitalsQuery = useHospitalQuery(params);
  const createHospitalMutation = useCreateHospital();
  const updateHospitalMutation = useUpdateHospital();
  const deleteHospitalMutation = useDeleteHospital();

  return {
    // Query data
    hospitals: hospitalsQuery.data,
    isLoading: hospitalsQuery.isLoading,
    error: hospitalsQuery.error,
    refetch: hospitalsQuery.refetch,

    // Mutations
    createHospital: createHospitalMutation,
    updateHospital: updateHospitalMutation,
    deleteHospital: deleteHospitalMutation,
  };
};
