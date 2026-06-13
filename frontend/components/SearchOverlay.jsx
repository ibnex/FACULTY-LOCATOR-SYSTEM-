import { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { getSuggestions } from "../api/facultyApi";
import {
  getRecentSearches,
} from "../utils/localStorage";
export default function SearchOverlay({ isOpen, onClose, onSearch }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] =
  useState([]);
const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    fetchSuggestions();
  }, [query]);

 useEffect(() => {
  if (isOpen) {
    const data = getRecentSearches();

    console.log("Recent:", data);

    setRecentSearches(data);
    // setRecentSearches();
    // getRecentSearches();
  }
}, [isOpen]);



//   const fetchSuggestions = async () => {
//     try {
//       const res = await getSuggestions(query);

//       setSuggestions(res.data.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

  if (!isOpen) return null;



  

  const fetchSuggestions = async () => {
  try {
    setLoading(true);

    const res = await getSuggestions(query);

    setSuggestions(res.data.data || []);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  return (
    


    
    
    <div className="fixed inset-0 bg-white z-50">
      <div className="p-4 border-b">
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
            className="flex-1 outline-none text-lg"
          />
        </div>
      </div>

      <div className="p-4">
  {query.trim() === "" && recentSearches.length > 0 && (
  <div className="mb-6">

    <h3 className="font-semibold mb-3">
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
            bg-gray-100
            rounded-full
            text-sm
          "
        >
          {item}
        </button>
      ))}

    </div>

  </div>
)}


     <div className="p-4">

 {loading ? (
  <div className="py-6 text-center text-gray-500">
    Searching...
  </div>
) : query.trim() && suggestions.length === 0 ? (
  <div className="text-center py-10">
    <h3 className="font-semibold text-lg">
      😔 No Faculty Found
    </h3>

    <p className="text-gray-500 mt-2">
      Try another faculty name
    </p>
  </div>
) : (

    suggestions.map((faculty) => (
      <div
        key={faculty._id}
        onClick={() =>
          onSearch(faculty.name)
        }
        className="
          flex
          items-center
          gap-3
          py-3
          border-b
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
          <h3 className="font-medium">
            {faculty.name}
          </h3>

          <p className="text-sm text-gray-500">
            {faculty.department}
          </p>
        </div>
      </div>
    ))

  )}

</div>
      </div>
    </div>
  );
}
