import axios from "axios";

const API = axios.create({
  baseURL:
    "http://localhost:5000/api/faculty",
    // "http://192.168.1.10:5173/api/faculty",
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

export const searchFaculty = (
  query,
  department = ""
) =>
  API.get(
    `/search?q=${encodeURIComponent(query)}&department=${encodeURIComponent(
      department
    )}`
  );

export const getSuggestions = (
  query,
  department = ""
) =>
  API.get(
    `/suggestions?q=${encodeURIComponent(query)}&department=${encodeURIComponent(
      department
    )}`
  );

export const getPopularSearches = () =>
  API.get("/popular-searches");

export const getDepartments = () =>
  API.get("/departments");

export const getFacultyByDepartment = (
  department
) =>
  API.get(
    `/department/${encodeURIComponent(
      department
    )}`
  );

export const getFacultyDetails = (id) =>
  API.get(`/${id}`);

export const filterFaculty = (
  department,
  designation
) =>
  API.get(
    `/filter?department=${department}&designation=${designation}`
  );