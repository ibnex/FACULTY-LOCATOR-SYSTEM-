import Fuse from "fuse.js";
import Faculty from "../modules/Faculty.js";

const searchCache = new Map();
const pendingCacheLoads = new Map();
const fuseCache = new Map();

const getCachedFaculty = async (department = "") => {
  const cacheKey = department || "__all__";
  const cached = searchCache.get(cacheKey);

  if (cached) {
    return cached.faculties;
  }

  if (pendingCacheLoads.has(cacheKey)) {
    return pendingCacheLoads.get(cacheKey);
  }

  const filter = department ? { department } : {};
  const loadPromise = Faculty.find(filter)
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

export const searchFaculty = async (
  query,
  department = ""
) => {
  const fuse = await getNameIndex();

  const results = fuse.search(query);

  return results.map(
    (result) => result.item
  );
};

export const getSuggestions = async (
  query,
  department = ""
) => {
  const fuse = await getNameIndex();

  const results = fuse.search(query);

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