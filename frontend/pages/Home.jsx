import { useEffect, useState ,useRef } from "react";

import SearchBar from "../components/SearchBar";
import SearchOverlay from "../components/SearchOverlay";
import PopularSearches from "../components/PopularSearches";
import FacultyCard from "../components/FacultyCard";


import {
  getPopularSearches,
  getFaculty,
  searchFaculty,
} from "../api/facultyApi";

import { saveRecentSearch } from "../utils/localStorage";

export default function Home() {
  
  const [loading, setLoading] = useState(true);

  const [faculties, setFaculties] = useState([]);

const [page, setPage] = useState(1);

const [hasMore, setHasMore] = useState(true);

const [loadingMore, setLoadingMore] =
  useState(false);
  
  
  const [openSearch, setOpenSearch] = useState(false);

  
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [popularSearches, setPopularSearches] = useState([]);

  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  useEffect(() => {
    fetchPopularSearches();
    fetchFaculties();
  }, []);
  useEffect(() => {
  // console.log("Selected Department:", selectedDepartment);
}, [selectedDepartment]);

useEffect(() => {
  const savedDepartment =
    localStorage.getItem("selectedDepartment");

  if (savedDepartment) {
    setSelectedDepartment(savedDepartment);

    fetch(
      `http://localhost:5000/api/faculty/department/${encodeURIComponent(
        savedDepartment
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSearchResults(data.data || []);
        setIsSearching(true);
      });
  }
}, []);

  const observer = useRef();
  const fetchPopularSearches = async () => {
    try {
      const res = await getPopularSearches();

      setPopularSearches(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

const fetchFaculties = async (
  pageNumber = 1
) => {
  try {
    setLoading(true);
    const res = await getFaculty(
      pageNumber,
      20
    );

    const newFaculty =
      res.data.data || [];

    if (pageNumber === 1) {
      setFaculties(newFaculty);
    } else {
      setFaculties((prev) => [
        ...prev,
        ...newFaculty,
      ]);
    }

    if (newFaculty.length < 20) {
      setHasMore(false);
    }
  } catch (error) {
    console.error(error);
  }finally {
    setLoading(false);
  }
};


const loadMore = async () => {
  try {
    setLoadingMore(true);

    const nextPage = page + 1;

    await fetchFaculties(nextPage);

    setPage(nextPage);
  } catch (error) {
    console.error(error);
  } finally {
    setLoadingMore(false);
  }
};

const lastFacultyRef = (node) => {
  if (loadingMore) return;

  if (observer.current) {
    observer.current.disconnect();
  }

  observer.current =
    new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        hasMore &&
        !isSearching
      ) {
        loadMore();
      }
    });

  if (node) {
    observer.current.observe(node);
  }
};

  const handleSearch = async (query) => {
    try {
      saveRecentSearch(query);

      const res = await searchFaculty(query,selectedDepartment);
    //    console.log("SEARCH DATA:", res.data);
    // console.log("RESULTS:", res.data.data);

      setSearchResults(res.data.data || []);
      setIsSearching(true);

      setOpenSearch(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#e7dfd3" }}>
      {/* Header */}
<div className="sticky top-0 z-10 border-b border-[#d9cdb8] bg-[#e7dfd3]/95 backdrop-blur">
  <div className="mx-auto flex max-w-7xl items-center px-5 py-5 lg:px-10">

    {/* Search */}
    <div className="w-full">
      <SearchBar
        onClick={() => setOpenSearch(true)}
      />
    </div>

  </div>
</div>

      {/* Popular Searches */}

{selectedDepartment && (
  <div className="mx-auto max-w-7xl px-5 pt-5 lg:px-10">
    <div
      className="
        inline-flex
        items-center
        gap-2
        border border-[#cdbda8]
        bg-[#f4efe8]
        text-[#7a1f2c]
        px-3
        py-1
        rounded-full
        text-sm
      "
    >
      <span>
        {selectedDepartment}
      </span>

      <button
      onClick={() => {
  localStorage.removeItem(
    "selectedDepartment"
  );

  setSelectedDepartment("");

  setIsSearching(false);

  setPage(1);
  setHasMore(true);

  fetchFaculties(1);
}}
        className="font-bold"
      >
        ✕
      </button>
    </div>
  </div>
)}
      <div className="mx-auto max-w-7xl px-5 pt-7 lg:px-10">
        <PopularSearches
          searches={popularSearches}
          onSearch={handleSearch}
        />
      </div>

      {/* Search Result Title */}

      {isSearching && (
        <div className="mx-auto max-w-7xl px-5 pb-3 lg:px-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7a1f2c]">
            Search Results
          </h2>
        </div>
      )}

      {/* Faculty List */}

      {loading ? (
        <div className="py-16 text-center text-[#5f554e]">
          Loading faculty...
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-5 pb-10 md:grid-cols-2 lg:gap-5 lg:px-10">
          {isSearching && searchResults.length === 0 ? (
            <div className="py-16 text-center md:col-span-2">
              <h2 className="mb-2 font-serif text-2xl text-[#1f1b1b]">
                No Faculty Found
              </h2>
              <p className="text-[#6a625c]">
                Try another name or clear the search
              </p>
            </div>
          ) : (
            (isSearching ? searchResults : faculties).map(
              (faculty, index, array) => {
                const isLast = index === array.length - 1;

                return (
                  <div
                    key={faculty._id}
                    ref={
                      !isSearching && isLast ? lastFacultyRef : null
                    }
                  >
                    <FacultyCard faculty={faculty} />
                  </div>
                );
              }
            )
          )}
        </div>
      )}



{loadingMore && (
  <div className="py-6 text-center text-[#6a625c]">
    Loading more faculty...
  </div>
)}

      {/* Search Overlay */}

      <SearchOverlay
        isOpen={openSearch}
  onClose={() => setOpenSearch(false)}
  onSearch={handleSearch}
  selectedDepartment={
    selectedDepartment
  }
      />

    </div>
  );
}