import { useState, useEffect, useRef } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { getSuggestions } from "../api/facultyApi";
import { getRecentSearches } from "../utils/localStorage";

export default function SearchOverlay({
  isOpen,
  onClose,
  onSearch,
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const currentQuery = query.trim();

    if (currentQuery.length < 2) {
      return undefined;
    }

    const currentRequestId = ++requestId.current;
    const timer = setTimeout(async () => {
      try {
        const res = await getSuggestions(currentQuery);

        if (currentRequestId === requestId.current) {
          setSuggestions(res.data.data || []);
          setHasSearched(true);
        }
      } catch (error) {
        if (currentRequestId === requestId.current) {
          setSuggestions([]);
          setHasSearched(true);
        }
        console.error(error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // The overlay owns transient state that must reset each time it opens.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      const data = getRecentSearches();

      // console.log("Recent:", data);

      setRecentSearches(data);
      setQuery("");
      setSuggestions([]);
      setHasSearched(false);
      requestId.current += 1;
    } else {
      requestId.current += 1;
    }
  }, [isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */


  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div
      className="fixed
    inset-0
    bg-[#e7dfd3]
    z-50
    flex
    flex-col"
    >
      <div className="border-b border-[#d9cdb8] bg-[#e7dfd3] p-4">
        <div className="flex items-center gap-3">
          <button onClick={onClose}>
            <FiArrowLeft size={22} />
          </button>

          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch(query);
              }
            }}
            placeholder="Search faculty..."
            className="flex-1 bg-transparent text-lg text-[#2e2a2a] outline-none"
          />
        </div>
      </div>
{/* chanegdd  herer */}
      <div className="flex-1 overflow-y-auto p-4">
        {query.trim() === "" && recentSearches.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#7a1f2c]">
              Recent Searches
            </h3>

            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item) => (
                <button
                  key={item}
                  onClick={() => onSearch(item)}
                  className="
            px-3
            py-1
            bg-[#f4efe8]
            border border-[#cdbda8]
            rounded-lg
            text-sm
            text-[#2e2a2a]
          "
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4">
          {/* hereeeeeeeeeeeeeeeeeeee */}
<div>
          {query.trim().length >= 2 &&
          hasSearched &&
          suggestions.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="font-serif text-2xl font-medium text-[#1f1b1b]">No Faculty Found</h3>

              <p className="mt-2 text-[#6a625c]">Try another faculty name</p>
            </div>
          ) : (
            suggestions.map((faculty) => (
              <div
                key={faculty._id}
                onClick={() => onSearch(faculty.name)}
                className="
          flex
          items-center
          gap-3
          py-3
          border-b border-[#d9cdb8]
          cursor-pointer
        "
              >
                <img
                  src={faculty.photo}
                  alt={faculty.name}
                  className="
            w-12
            h-12
            rounded-full
            object-cover
          "
                />

                <div>
                  <h3 className="font-serif text-xl text-[#1f1b1b]">{faculty.name}</h3>

                  <p className="text-sm text-[#6a625c]">{faculty.department}</p>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
