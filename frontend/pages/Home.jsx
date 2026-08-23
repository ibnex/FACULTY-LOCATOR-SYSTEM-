import { useEffect, useState ,useRef } from "react";

import SearchBar from "../components/SearchBar";
import SearchOverlay from "../components/SearchOverlay";
import PopularSearches from "../components/PopularSearches";
import FacultyCard from "../components/FacultyCard";
import FilterDrawer from "../components/FilterDrawer";


import {
  getPopularSearches,
  getFaculty,
  getDepartments,
  searchFaculty,
} from "../api/facultyApi";

import { saveRecentSearch } from "../utils/localStorage";

export default function Home() {
  
  const [tempDepartment, setTempDepartment] =
  useState("");
  const [loading, setLoading] = useState(true);

  const [faculties, setFaculties] = useState([]);

const [page, setPage] = useState(1);

const [hasMore, setHasMore] = useState(true);

const [loadingMore, setLoadingMore] =
  useState(false);
  
  
  const [openSearch, setOpenSearch] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [popularSearches, setPopularSearches] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  useEffect(() => {
    fetchPopularSearches();
    fetchFaculties();
    fetchDepartments();
  }, []);
  useEffect(() => {
  // console.log("Selected Department:", selectedDepartment);
}, [selectedDepartment]);

useEffect(() => {
  const savedDepartment =
    localStorage.getItem("selectedDepartment");

  if (savedDepartment) {
    setSelectedDepartment(savedDepartment);
    setTempDepartment(savedDepartment);

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

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();

      setDepartments(res.data.data);
    } catch (error) {
      console.error(error);
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

const applyDepartmentFilter = async () => {
  try {
    setSelectedDepartment(tempDepartment);
localStorage.setItem(
  "selectedDepartment",
  tempDepartment
);
    const response = await fetch(
      `http://localhost:5000/api/faculty/department/${encodeURIComponent(
        tempDepartment
      )}`
    );

    const data = await response.json();

    setSearchResults(data.data || []);
    setIsSearching(true);

    setOpenFilter(false);
  } catch (error) {
    console.error(error);
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
<div className="sticky top-0 bg-white border-b z-10">
  <div className="flex items-center gap-6 px-5 lg:px-10 py-4">

    {/* Search */}
    <div className="w-full lg:w-3/4">
      <SearchBar
        onClick={() => setOpenSearch(true)}
      />
    </div>

    {/* Filter */}
    <div className="lg:w-1/4 flex justify-end">
      <button
        onClick={() => {
          setTempDepartment(selectedDepartment);
          setOpenFilter(true);
        }}
        className="
          px-5
          py-3
          bg-white
          border
          rounded-xl
          shadow-sm
          hover:bg-gray-50
          transition
        "
      >
        Filter
      </button>
    </div>

  </div>
</div>

      {/* Popular Searches */}

{selectedDepartment && (
  <div className="px-4 pt-2">
    <div
      className="
        inline-flex
        items-center
        gap-2
        bg-blue-100
        text-blue-700
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
  setTempDepartment("");

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
      <div className="p-4">
        <PopularSearches
          searches={popularSearches}
          onSearch={handleSearch}
        />
      </div>

      {/* Search Result Title */}

      {isSearching && (
        <div className="px-4 pb-2">
          <h2 className="font-semibold">
            Search Results
          </h2>
        </div>
      )}

      {/* Faculty List */}

{loading ? (
  <div className="text-center py-10">
    Loading faculty...
  </div>
) : (
  <div className="p-4 space-y-4">
  
  </div>
)}


      <div className="p-4 space-y-4">
        {/* <div>
  <p>isSearching: {String(isSearching)}</p>
  <p>searchResults: {searchResults.length}</p>
</div> */}

  {isSearching && searchResults.length === 0 ? (

    <div className="text-center py-16">

      <h2 className="text-xl font-semibold mb-2">
        😔 No Faculty Found
      </h2>

      <p className="text-gray-500">
        Try another name or clear filters
      </p>

    </div>

  ) : (

   (isSearching
  ? searchResults
  : faculties
).map((faculty, index, array) => {

  const isLast =
    index === array.length - 1;

  return (
    <div
      key={faculty._id}
      ref={
        !isSearching && isLast
          ? lastFacultyRef
          : null
      }
    >
      <FacultyCard faculty={faculty} />
    </div>
  );
})

  )}

</div>



{loadingMore && (
  <div className="text-center py-6 text-gray-500">
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

      {/* Filter Drawer */}

      <FilterDrawer
        isOpen={openFilter}
        onClose={() => setOpenFilter(false)}
        departments={departments}
        selectedDepartment={tempDepartment}
        setSelectedDepartment={
          setTempDepartment
        }
        onApply={applyDepartmentFilter}
      />
    </div>
  );
}