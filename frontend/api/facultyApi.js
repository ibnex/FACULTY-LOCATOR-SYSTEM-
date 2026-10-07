import axios from "axios";

const DEFAULT_API_URL = "http://localhost:5000";
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, "");
const API = axios.create({
  baseURL: `${API_URL}/api/faculty`,
});

export const getFaculty = (
  page = 1,
  limit = 20
) => {
  const requestUrl = `/?page=${page}&limit=${limit}`;

  if (import.meta.env.DEV) {
    console.debug("[faculty pagination] API request", {
      url: `${API.defaults.baseURL}${requestUrl}`,
      page,
      limit,
    });
  }

  return API.get(requestUrl);
};

export const searchFaculty = (query) =>
  API.get(`/search?q=${encodeURIComponent(query)}`);

export const getSuggestions = (query, config = {}) =>
  API.get(`/suggestions?q=${encodeURIComponent(query)}`, config);

export const getPopularSearches = () =>
  API.get("/popular-searches");

export const getFacultyDetails = (id) =>
  API.get(`/${id}`);