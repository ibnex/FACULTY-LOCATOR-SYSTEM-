import { useNavigate } from "react-router-dom";

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

export default function FacultyCard({ faculty }) {
  const navigate = useNavigate();
  const photoUrl = normalizeImageUrl(faculty.photo) || FALLBACK_IMAGE;

  return (
    <div
      onClick={() => navigate(`/faculty/${faculty._id}`)}
      className="
        bg-[#f4efe8]
        rounded-lg
        shadow-sm
        border border-[#d9cdb8]
        p-3 sm:p-4
        cursor-pointer
        active:scale-[0.98]
        transition
        
      "
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <img
          src={photoUrl}
          alt={faculty.name}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-16 w-16 shrink-0 rounded-lg object-cover sm:h-20 sm:w-20"
        />

        <div className="flex-1">
          <h3 className="line-clamp-2 font-serif text-xl font-medium leading-tight text-[#1f1b1b] sm:text-2xl">
            {faculty.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm leading-snug text-[#3d3a39]">
            {faculty.designation}
          </p>

          <p className="mt-1 line-clamp-1 text-sm text-[#6a625c]">
            {faculty.department}
          </p>
          {faculty.roomNumber && (
  <p className="text-sm text-[#6a625c]">
    🚪 Room {faculty.roomNumber}
  </p>
)}
        </div>
      </div>
    </div>
  );
}