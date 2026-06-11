import Fuse from "fuse.js";
import Faculty from "../modules/Faculty.js";

export const searchFaculty = async (query) => {
  const faculties = await Faculty.find();

  const fuse = new Fuse(faculties, {
    keys: [
      "name",
      "qualification",
      "keywords"
    ],
    threshold: 0.35,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  const results = fuse.search(query);

  return results.map(result => result.item);
};



export const getSuggestions = async (query) => {
  const faculties = await Faculty.find().select(
    "name department designation photo"
  );

  const fuse = new Fuse(faculties, {
    keys: ["name"],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
  });

  const results = fuse.search(query);

  return results
    .slice(0, 10)
    .map((result) => result.item);
};

