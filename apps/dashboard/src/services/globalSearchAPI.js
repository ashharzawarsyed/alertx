import api from "./api";

// Unified global search API
export const globalSearchAPI = {
  search: async (query) => {
    // Call backend global search endpoint
    const response = await api.get("/api/v1/global-search", { params: { q: query } });
    return response.data.data; // Expecting { results: [...] }
  },
};
