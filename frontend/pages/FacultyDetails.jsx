import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowDown, FiArrowLeft } from "react-icons/fi";

import { getFacultyDetails } from "../api/facultyApi";
import FacultyAcademicInfo from "../components/FacultyAcademicInfo";
import FacultyLocation from "../components/FacultyLocation";

const FALLBACK_IMAGE = "https://placehold.co/500x500/efe7dc/3b2f2d?text=Faculty";

const normalizeImageUrl = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const resolved = new URL(trimmed, window.location.origin);

    if (resolved.protocol === "http:" && window.location.protocol === "https:") {
      return `https:${resolved.href.slice(6)}`;
    }

    return resolved.href;
  } catch {
    return trimmed;
  }
};

const cleanDisplayText = (value, fallback = "Not Available") => {
  if (typeof value !== "string") {
    return fallback;
  }

  const cleaned = value
    .replace(/\\([\\/'".])/g, "$1")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/([!?]){2,}/g, "$1")
    .replace(/[+/@]{2,}/g, " ")
    .replace(/\s*([,;:.!?])\s*/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || fallback;
};

const cleanArray = (items) =>
  Array.isArray(items)
    ? items.map((item) => cleanDisplayText(item)).filter(Boolean)
    : [];

const removeProfileSections = (biography, profileSections) => {
  const sectionTitles = [
    ...Object.keys(profileSections),
    "Publications",
    "Conference",
    "Conferences",
    "Research Interests",
    "Experience",
    "Patents",
    "Projects",
    "Book Editor",
    "Book Reviewer",
    "Event Organizer",
  ]
    .map((title) => cleanDisplayText(title, ""))
    .filter(Boolean);

  const sectionStart = sectionTitles.reduce((firstIndex, title) => {
    const match = biography.search(
      new RegExp(`\\b${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
    );

    return match >= 0 && (firstIndex < 0 || match < firstIndex)
      ? match
      : firstIndex;
  }, -1);

  return sectionStart >= 0
    ? biography.slice(0, sectionStart).trim()
    : biography;
};

const formatIntroduction = (biography, name) => {
  const normalizedBiography = biography.replace(/^[\s,.;:!?-]+/, "").trim();

  if (!normalizedBiography) {
    return "No biography available.";
  }

  if (normalizedBiography.toLowerCase().startsWith(name.toLowerCase())) {
    return normalizedBiography;
  }

  const accomplishedStart = normalizedBiography.match(
    /^.*?\b(is\s+(?:a|an)\s+highly accomplished\b)/i
  );

  if (accomplishedStart) {
    return `${name} ${accomplishedStart[1]}${normalizedBiography.slice(
      accomplishedStart[0].length
    )}`;
  }

  return `${name} ${normalizedBiography}`;
};

const SECTION_HEADINGS = [
  "Books",
  "Journals",
  "Magazines",
  "Patents",
  "Projects",
  "Conference",
  "Conferences",
  "Workshops",
  "Awards",
  "Education",
  "Book Editor",
  "Book Reviewer",
  "Event Organizer",
];

const splitSectionContent = (content) => {
  const cleaned = cleanDisplayText(content, "");

  if (!cleaned) {
    return [];
  }

  return cleaned
    .replace(
      new RegExp(`\\s+(?=(${SECTION_HEADINGS.join("|")})\\b)`, "gi"),
      "\n"
    )
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean);
};

const sectionHeadingPattern = new RegExp(
  `^(${SECTION_HEADINGS.join("|")})$`,
  "i"
);

const parseSectionHighlights = (content) => {
  const parts = splitSectionContent(content);
  const groups = [];
  let currentGroup = { heading: "Highlights", items: [] };

  parts.forEach((part) => {
    if (sectionHeadingPattern.test(part)) {
      if (currentGroup.items.length) {
        groups.push(currentGroup);
      }
      currentGroup = { heading: part, items: [] };
      return;
    }

    currentGroup.items.push(part);
  });

  if (currentGroup.items.length) {
    groups.push(currentGroup);
  }

  return groups;
};

const sectionOrder = (title) => {
  const normalizedTitle = title.toLowerCase();

  if (
    normalizedTitle.includes("achievement") ||
    normalizedTitle.includes("award") ||
    normalizedTitle.includes("patent") ||
    normalizedTitle.includes("project")
  ) {
    return 10;
  }

  if (normalizedTitle.includes("conference")) {
    return 20;
  }

  if (normalizedTitle.includes("publication")) {
    return 100;
  }

  return 50;
};

function FacultyAccordion({ title, content, items = [] }) {
  const [open, setOpen] = useState(false);
  const groups = items.length
    ? [{ heading: "Peer-Reviewed Research Publications", items }]
    : parseSectionHighlights(content);

  return (
    <div
      className={`mb-3 overflow-hidden border ${
        open
          ? "border-[#861226] bg-[#861226] text-white"
          : "border-[#d9cdb8] bg-transparent"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left ${
          open ? "text-white" : "text-[#7a1f2c]"
        }`}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold uppercase tracking-[0.18em]">
          {cleanDisplayText(title)}
        </span>
        <FiArrowDown
          className={`shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="space-y-6 px-5 pb-6 text-base leading-relaxed text-white">
          {groups.map((group) => (
            <div key={`${title}-${group.heading}`}>
              <h3 className="mb-3 text-base font-semibold">
                {group.heading}
              </h3>
              <ul className="list-disc space-y-2 pl-5">
                {group.items.map((item, index) => (
                  <li key={`${title}-${group.heading}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FacultyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await getFacultyDetails(id);
        setFaculty(res.data.data);
      } catch (error) {
        console.error(error);
        setLoadError(
          error.response?.data?.message ||
            "Unable to load this faculty profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, [id]);

  if (loading) {
    return <div className="p-5 text-gray-600">Loading...</div>;
  }

  if (!faculty) {
    return (
      <div className="p-5 text-gray-600">
        {loadError || "Faculty not found"}
      </div>
    );
  }

  const photoUrl = normalizeImageUrl(faculty.photo) || FALLBACK_IMAGE;
  const category = cleanDisplayText(
    faculty.facultyCategory || faculty.department,
    "CORE FACULTY"
  );
  const name = cleanDisplayText(faculty.name);
  const designation = cleanDisplayText(faculty.designation, "Faculty");
  const biography = cleanDisplayText(
    faculty.biography,
    ""
  );
  const school = cleanDisplayText(
    faculty.school || faculty.department,
    "Alliance University"
  );
  const qualification = cleanDisplayText(
    faculty.qualification,
    "Qualification not available."
  );
  const qualifications = cleanArray(faculty.academicQualifications);
  const researchInterests = cleanArray(faculty.researchInterests);
  const publications = cleanArray(faculty.publications);
  const storedProfileSections = faculty.profileSections || {};
  const profileSections = Object.entries(storedProfileSections).sort(
    ([firstTitle], [secondTitle]) =>
      sectionOrder(firstTitle) - sectionOrder(secondTitle)
  );
  const introduction = formatIntroduction(
    removeProfileSections(biography, storedProfileSections),
    name
  );
  const sections = [
    ...(faculty.experience && !storedProfileSections.Experience
      ? [["Experience", faculty.experience]]
      : []),
    ...(qualifications.length &&
    !Object.keys(storedProfileSections).some((title) =>
      title.toLowerCase().includes("qualification")
    )
      ? [["Academic Qualifications", qualifications.join(" | ")]]
      : []),
    ...(researchInterests.length &&
    !Object.keys(storedProfileSections).some((title) =>
      title.toLowerCase().includes("research")
    )
      ? [["Research Interests", researchInterests.join(" | ")]]
      : []),
    ...(publications.length &&
    !Object.keys(storedProfileSections).some(
      (title) => title.toLowerCase() === "publications"
    )
      ? [["Publications", publications.join(" | ")]]
      : []),
    ...profileSections,
  ];

  return (
    <div className="min-h-screen" style={{ background: "#e7dfd3" }}>
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-[#7b1e2d] hover:opacity-80"
          aria-label="Go back"
        >
          <FiArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-center">
          <div className="shrink-0 rounded-lg border border-[#d9cdb8] bg-[#efe7dc] p-3 shadow-sm">
            <img
              src={photoUrl}
              alt={name}
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
              className="h-80 w-80 object-cover object-center md:h-90 md:w-90"
              style={{ background: "#d7d0c7" }}
            />
          </div>

          <div className="max-w-205 flex-1">
            <div className="mb-5 inline-block border-b border-[#7a1f2c] pb-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-[#7a1f2c]">
              {category}
            </div>

            <h1 className="font-serif text-5xl font-medium leading-none tracking-tight text-[#1f1b1b] md:text-6xl">
              {name}
            </h1>

            <p className="mt-4 text-xl text-[#3d3a39] md:text-2xl">
              {designation}
            </p>

            {faculty.department && (
              <p className="mt-1 text-base text-[#6a625c]">
                {cleanDisplayText(faculty.department)}
              </p>
            )}

            <div className="mt-8 text-lg leading-relaxed text-[#2a2929]">
              <p>{introduction}</p>
            </div>

            <div className="mt-8">
              <FacultyAcademicInfo
                school={school}
                qualification={qualification}
              />
            </div>

            <FacultyLocation faculty={faculty} />

            {sections.length > 0 && (
              <section className="mt-8">
                {sections
                  .sort(([firstTitle], [secondTitle]) =>
                    sectionOrder(firstTitle) - sectionOrder(secondTitle)
                  )
                  .map(([title, content], index) => (
                  <FacultyAccordion
                    key={`${title}-${index}`}
                    title={title}
                    content={content}
                    items={
                      title.toLowerCase() === "publications"
                        ? publications
                        : title.toLowerCase().includes("research")
                          ? researchInterests
                          : []
                    }
                  />
                  ))}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
