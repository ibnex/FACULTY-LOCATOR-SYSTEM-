import Fuse from "fuse.js";
import Faculty from "../modules/Faculty.js";

const searchCache = new Map();
const pendingCacheLoads = new Map();
const fuseCache = new Map();

const normalizeSearchQuery = (query) => {
  if (typeof query !== "string") {
    return "";
  }

  return query.trim();
};

const getCachedFaculty = async () => {
  const cacheKey = "__all__";
  const cached = searchCache.get(cacheKey);

  if (cached) {
    return cached.faculties;
  }

  if (pendingCacheLoads.has(cacheKey)) {
    return pendingCacheLoads.get(cacheKey);
  }

  const loadPromise = Faculty.find({})
    .select("_id name designation department photo roomNumber")
    .lean()
    .then((faculties) => {
      searchCache.set(cacheKey, {
        faculties,
      });
      return faculties;
    })
    .finally(() => {
      pendingCacheLoads.delete(cacheKey);
    });

  pendingCacheLoads.set(cacheKey, loadPromise);
  return loadPromise;
};

export const warmSearchCache = () => getCachedFaculty();

export const invalidateSearchCache = () => {
  searchCache.clear();
  pendingCacheLoads.clear();
  fuseCache.clear();
};

const getNameIndex = async () => {
  if (fuseCache.has("name")) {
    return fuseCache.get("name");
  }

  const fuse = new Fuse(await getCachedFaculty(), {
    keys: ["name"],
    threshold: 0.35,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 1,
  });

  fuseCache.set("name", fuse);
  return fuse;
};

export const searchFaculty = async (query) => {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  const fuse = await getNameIndex();
  const results = fuse.search(normalizedQuery);

  return [...new Map(results.map((result) => [String(result.item._id), result.item])).values()];
};

export const getSuggestions = async (query) => {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  const fuse = await getNameIndex();
  const results = fuse.search(normalizedQuery);

  return results
    .slice(0, 10)
    .map(({ item }) => ({
      _id: item._id,
      name: item.name,
      department: item.department,
      designation: item.designation,
      photo: item.photo,
    }));
};