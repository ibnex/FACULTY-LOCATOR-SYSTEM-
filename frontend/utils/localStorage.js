// utils/localStorage.js

const KEY = "recent_searches";

export const getRecentSearches = () => {
  const data = localStorage.getItem(KEY);

  return data ? JSON.parse(data) : [];
};

export const saveRecentSearch = (query) => {
  const searches = getRecentSearches();

  const filtered = searches.filter(
    (item) => item !== query
  );

  filtered.unshift(query);

  localStorage.setItem(
    KEY,
    JSON.stringify(filtered.slice(0, 10))
  );
  
};