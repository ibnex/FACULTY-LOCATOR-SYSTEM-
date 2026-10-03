import { useEffect, useRef, useState } from "react";

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

const [loadingMore, setLoadingMore] =
  useState(false);
  
  
  const [openSearch, setOpenSearch] = useState(false);

  
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [popularSearches, setPopularSearches] = useState([]);

  const latestSearchRequest = useRef(0);
  const loadingMoreRef = useRef(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const isSearchingRef = useRef(false);
  const inFlightPagesRef = useRef(new Set());

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
  if (inFlightPagesRef.current.has(pageNumber)) {
    return;
  }

  inFlightPagesRef.current.add(pageNumber);

  try {
    if (pageNumber === 1) {
      setLoading(true);
    }

    const res = await getFaculty(
      pageNumber,
      20
    );

    const newFaculty =
      res.data.data || [];

    if (pageNumber === 1) {
      setFaculties(newFaculty);
    } else {
      setFaculties((prev) => {
        const existingIds = new Set(prev.map((faculty) => faculty._id));
        const uniqueFaculty = newFaculty.filter(
          (faculty) => !existingIds.has(faculty._id)
        );
        return [...prev, ...uniqueFaculty];
      });
    }

    const totalPages = Number(res.data.totalPages);
    const nextHasMore = Number.isFinite(totalPages)
      ? pageNumber < totalPages
      : newFaculty.length === 20;

    pageRef.current = pageNumber;
    hasMoreRef.current = nextHasMore;

    if (import.meta.env.DEV) {
      console.debug("[faculty pagination] received page", {
        requestedPage: pageNumber,
        receivedPage: Number(res.data.page) || pageNumber,
        receivedCount: newFaculty.length,
        facultyCountAfter: pageNumber === 1
          ? newFaculty.length
          : faculties.length + newFaculty.length,
        hasMore: nextHasMore,
      });
    }
  } catch (error) {
    console.error(error);
  }finally {
    inFlightPagesRef.current.delete(pageNumber);

    if (pageNumber === 1) {
      setLoading(false);
    }
  }
};

  // Initial data loading is intentionally triggered by the page lifecycle.
  /* eslint-disable react-hooks/set-state-in-effect */
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchPopularSearches();
    fetchFaculties();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */
  /* eslint-enable react-hooks/set-state-in-effect */


const loadMore = async () => {
  if (
    loadingMoreRef.current ||
    !hasMoreRef.current ||
    isSearchingRef.current
  ) {
    return;
  }

  loadingMoreRef.current = true;
  const requestedPage = pageRef.current + 1;

  if (import.meta.env.DEV) {
    console.debug("[faculty pagination] requesting page", {
      currentPage: pageRef.current,
      requestedPage,
      facultyCount: faculties.length,
      hasMore: hasMoreRef.current,
      loadingMore: loadingMoreRef.current,
    });
  }

  try {
    setLoadingMore(true);

    await fetchFaculties(requestedPage);
  } catch (error) {
    console.error(error);
  } finally {
    loadingMoreRef.current = false;
    setLoadingMore(false);
  }
};

const lastFacultyRef = (node) => {
  if (observer.current) {
    observer.current.disconnect();
  }

  if (!node) return;

  observer.current =
    new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        hasMoreRef.current &&
        !isSearchingRef.current &&
        !loadingMoreRef.current
      ) {
        loadMore();
      }
    });

  observer.current.observe(node);
};

  const handleSearch = async (query) => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return;
    }

    const currentRequestId = latestSearchRequest.current + 1;
    latestSearchRequest.current = currentRequestId;

    try {
      saveRecentSearch(normalizedQuery);

      const res = await searchFaculty(normalizedQuery);

      if (currentRequestId === latestSearchRequest.current) {
        setSearchResults(res.data.data || []);
        setIsSearching(true);
        isSearchingRef.current = true;
      }

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
      />

    </div>
  );
}