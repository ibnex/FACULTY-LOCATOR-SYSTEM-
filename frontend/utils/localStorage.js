// utils/localStorage.js

const KEY = "recent_searches";

export const getRecentSearches = () => {
  const data = localStorage.getItem(KEY);

  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(KEY);
    return [];
  }
};

export const saveRecentSearch = (query) => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return;

  const searches = getRecentSearches();

  const filtered = searches.filter(
    (item) => item !== normalizedQuery
  );

  filtered.unshift(normalizedQuery);

  localStorage.setItem(
    KEY,
    JSON.stringify(filtered.slice(0, 10))
  );
  
};