const normalizeName = (name) => {
  if (!name) return "";

  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export default normalizeName;