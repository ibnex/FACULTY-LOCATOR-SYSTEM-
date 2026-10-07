import axios from "axios";
import * as cheerio from "cheerio";
import Faculty from "../modules/Faculty.js";
import normalizeName from "../utils/normalizeName.js";

const FACULTY_PAGE_URL =
  "https://www.alliance.edu.in/faculties/";
const FACULTY_AJAX_URL =
  "https://www.alliance.edu.in/wp-admin/admin-ajax.php";
const FACULTY_TYPES = [1, 2, 3, 4, 5, 6];
const REQUEST_TIMEOUT_MS = 30_000;

const cleanText = (value = "") =>
  String(value).replace(/\s+/g, " ").trim();

const getText = (element, selector) =>
  cleanText(element.find(selector).first().text());

const escapeRegExp = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getKeywords = (faculty) =>
  [
    faculty.name,
    faculty.qualification,
    faculty.institution,
    faculty.designation,
    faculty.department,
    faculty.school,
    faculty.facultyCategory,
  ]
    .filter(Boolean)
    .join(" ")
    .split(/[\s,./()&-]+/)
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean);

const requestFacultyPage = async (typeId, page) => {
  const response = await axios.post(
    FACULTY_AJAX_URL,
    new URLSearchParams({
      action: "load_faculty",
      type_id: String(typeId),
      page: String(page),
      search: "",
      school_filter: "",
      teach_filter: "",
      phd_filter: "",
    }),
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
        Referer: FACULTY_PAGE_URL,
      },
      timeout: REQUEST_TIMEOUT_MS,
    }
  );

  const data = response.data?.data;

  if (
    response.data?.success !== true ||
    !data ||
    typeof data.html !== "string" ||
    !Number.isInteger(data.total_pages)
  ) {
    throw new Error(
      `Alliance faculty endpoint returned an invalid response for type ${typeId}, page ${page}`
    );
  }

  return data;
};

const normalizeProfileUrl = (url) => {
  if (!url) return "";

  try {
    return new URL(url, FACULTY_PAGE_URL).href;
  } catch {
    return url.trim();
  }
};

const normalizeImageUrl = (url) => {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^http:/i, "https:");
  }

  try {
    return new URL(trimmed, FACULTY_PAGE_URL).href;
  } catch {
    return trimmed;
  }
};

const parseFacultyCards = (html) => {
  const $ = cheerio.load(html);
  const faculty = [];

  $(".faculty-card").each((_, card) => {
    const element = $(card);
    const profileUrl = normalizeProfileUrl(
      element.find("a[href]").first().attr("href")
    );
    const name = getText(element, "h4");

    if (!profileUrl || !name) {
      return;
    }

    const photo = normalizeImageUrl(
      element.find("img[src]").first().attr("src")
    );

    const item = {
      name,
      facultyCategory: getText(element, ".designation"),
      designation: getText(element, ".designation"),
      qualification: getText(element, ".degree"),
      institution: getText(element, ".institution"),
      photo,
      profileUrl,
    };

    faculty.push({
      ...item,
      keywords: getKeywords(item),
    });
  });

  return faculty;
};

const extractProfileBiography = ($) => {
  const aboutContent = $(".about-content").first();
  if (!aboutContent.length) {
    return "";
  }

  const biographyContent = aboutContent.clone();
  biographyContent
    .find(".about-label, .about-title, .about-subtitle, .program-accordion")
    .remove();

  return cleanText(biographyContent.text())
    .replace(/\s+\*\s+/g, " ")
    .trim();
};

const extractInstitutionName = (biography, fallback = "") => {
  const match = biography.match(/Alliance University/gi);
  if (match) return "Alliance University";

  const schoolMatch = biography.match(
    /at the\s+([A-Z][A-Za-z0-9&./ -]+?)(?:,\s*Alliance|\.|$)/i
  );

  if (schoolMatch) {
    return schoolMatch[1].trim();
  }

  return fallback;
};

const extractSchoolName = (biography, fallback = "") => {
  const match = biography.match(
    /at the\s+([A-Z][A-Za-z0-9&./ -]+?)(?:,\s*Alliance University|\.|$)/i
  );

  if (match) {
    return match[1].trim();
  }

  return fallback;
};

const extractArrayFromText = (text, minLength = 2) => {
  if (!text) return [];

  return text
    .split(/[;|\n]/)
    .map((item) => cleanText(item))
    .filter((item) => item && item.length >= minLength)
    .slice(0, 10);
};

const parseProfileSections = ($) => {
  const sections = {};

  $(".program-item").each((_, item) => {
    const element = $(item);
    const title = cleanText(element.find(".program-title").first().clone().children().remove().end().text());
    const content = cleanText(element.find(".program-content").first().text());

    if (title && content) {
      sections[title] = content;
    }
  });

  return sections;
};

const getSection = (sections, title) => {
  const key = Object.keys(sections).find(
    (sectionTitle) => sectionTitle.toLowerCase() === title.toLowerCase()
  );

  return key ? sections[key] : "";
};

const parseFacultyProfile = async (cardFaculty) => {
  const profileUrl = cardFaculty.profileUrl;
  const response = await axios.get(profileUrl, {
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      Referer: FACULTY_PAGE_URL,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });

  const $ = cheerio.load(response.data);

  const facultyCategory = cleanText($(".about-label").first().text());
  const name =
    cleanText($(".about-title").first().text()) || cardFaculty.name;
  const designation =
    cleanText($(".about-subtitle").first().text()) ||
    cardFaculty.designation;
  const biography = extractProfileBiography($);
  const profileSections = parseProfileSections($);
  const photo = normalizeImageUrl(
    $('meta[property="og:image"]').attr("content") ||
      $('img[src*="faculty"]').first().attr("src") ||
      cardFaculty.photo
  );

  const cleanedProfile = {
    name,
    facultyCategory,
    designation,
    biography,
    institution: cardFaculty.institution,
    school: extractSchoolName(biography),
    department: cardFaculty.department || "",
    profileSections,
    photo,
    profileUrl,
  };

  const qualificationCandidates = [
    cardFaculty.qualification,
    $(".degree").first().text(),
    $(".qualification").first().text(),
    $("[class*='qualification']").first().text(),
  ]
    .map((value) => cleanText(value))
    .filter(Boolean);

  if (qualificationCandidates.length) {
    cleanedProfile.qualification = qualificationCandidates[0];
  }

  const researchText =
    getSection(profileSections, "Research Interests") ||
    getSection(profileSections, "Research Interest");
  if (researchText) {
    cleanedProfile.researchInterests = extractArrayFromText(
      researchText,
      3
    );
  }

  const publicationsText = getSection(profileSections, "Publications");
  if (publicationsText) {
    cleanedProfile.publications = extractArrayFromText(
      publicationsText,
      3
    );
  }

  const experienceText = getSection(profileSections, "Experience");
  if (experienceText) {
    cleanedProfile.experience = experienceText;
  }

  const academicText =
    getSection(profileSections, "Qualifications") ||
    getSection(profileSections, "Academic Qualifications");
  if (academicText) {
    cleanedProfile.academicQualifications = extractArrayFromText(
      academicText,
      3
    );
  }

  if (
    !cleanedProfile.qualification &&
    cleanedProfile.academicQualifications?.length
  ) {
    cleanedProfile.qualification = cleanedProfile.academicQualifications[0];
  }

  cleanedProfile.keywords = getKeywords(cleanedProfile);

  return cleanedProfile;
};

const findExistingFaculty = async (faculty) => {
  if (faculty.profileUrl) {
    const byProfileUrl = await Faculty.findOne({
      profileUrl: faculty.profileUrl,
    });

    if (byProfileUrl) return byProfileUrl;
  }

  if (faculty.name) {
    const normalized = normalizeName(faculty.name);

    const byName = await Faculty.findOne({
      name: { $regex: new RegExp(`^${escapeRegExp(faculty.name)}$`, "i") },
    });

    if (byName) return byName;

    if (normalized) {
      const allFaculty = await Faculty.find({});
      const match = allFaculty.find(
        (item) =>
          normalizeName(item.name) === normalized ||
          normalizeName(item.name).includes(normalized)
      );

      if (match) return match;
    }
  }

  return null;
};

const upsertFaculty = async (faculty) => {
  const existing = await findExistingFaculty(faculty);

  const payload = {
    ...faculty,
    roomNumber: existing?.roomNumber ?? faculty.roomNumber ?? "",
    floorNumber: existing?.floorNumber ?? faculty.floorNumber ?? null,
    cabinNumber: existing?.cabinNumber ?? faculty.cabinNumber ?? "",
  };

  await Faculty.findOneAndUpdate(
    existing ? { _id: existing._id } : { profileUrl: faculty.profileUrl },
    {
      $set: payload,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

export const scrapeFaculty = async () => {
  const scrapedFaculty = [];

  for (const typeId of FACULTY_TYPES) {
    let page = 1;
    let totalPages = 1;

    do {
      const data = await requestFacultyPage(typeId, page);
      totalPages = data.total_pages;
      scrapedFaculty.push(...parseFacultyCards(data.html));
      page += 1;
    } while (page <= totalPages);
  }

  const uniqueFaculty = Array.from(
    new Map(
      scrapedFaculty.map((faculty) => [
        faculty.profileUrl,
        faculty,
      ])
    ).values()
  );

  for (const faculty of uniqueFaculty) {
    try {
      const profileData = await parseFacultyProfile(faculty);
      Object.assign(faculty, profileData);
      await upsertFaculty(faculty);
    } catch (error) {
      console.error(
        `Failed to enrich faculty profile for ${faculty.name}:`,
        error.message
      );
      await upsertFaculty(faculty);
    }
  }

  return uniqueFaculty;
};

export const enrichFacultyProfiles = async () => {
  const faculty = await scrapeFaculty();
  return faculty.length;
};