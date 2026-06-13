import { useEffect, useState } from "react";

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
  const [openSearch, setOpenSearch] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const [faculties, setFaculties] = useState([]);
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

  const fetchPopularSearches = async () => {
    try {
      const res = await getPopularSearches();

      setPopularSearches(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await getFaculty();

      setFaculties(res.data.data);
    } catch (error) {
      console.error(error);
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

      const res = await searchFaculty(query);
       console.log("SEARCH DATA:", res.data);
    console.log("RESULTS:", res.data.data);

      setSearchResults(res.data.data || []);
      setIsSearching(true);

      setOpenSearch(false);
    } catch (error) {
      console.error(error);
    }
  };

  const applyDepartmentFilter = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/faculty/department/${encodeURIComponent(
          selectedDepartment
        )}`
      );

      const data = await response.json();

      setSearchResults(data.data);
      setIsSearching(true);

      setOpenFilter(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <div className="sticky top-0 p-4 bg-white border-b z-10">
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchBar
              onClick={() => setOpenSearch(true)}
            />
          </div>

          <button
            onClick={() => setOpenFilter(true)}
            className="
              px-4
              bg-white
              border
              rounded-xl
            "
          >
            Filter
          </button>
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
          setSelectedDepartment("");
          setIsSearching(false);
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

      <div className="p-4 space-y-4">
        <div>
  <p>isSearching: {String(isSearching)}</p>
  <p>searchResults: {searchResults.length}</p>
</div>

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

    (isSearching ? searchResults : faculties).map(
      (faculty) => (
        <FacultyCard
          key={faculty._id}
          faculty={faculty}
        />
      )
    )

  )}

</div>

      {/* Search Overlay */}

      <SearchOverlay
        isOpen={openSearch}
        onClose={() => setOpenSearch(false)}
        onSearch={handleSearch}
      />

      {/* Filter Drawer */}

      <FilterDrawer
        isOpen={openFilter}
        onClose={() => setOpenFilter(false)}
        departments={departments}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={
          setSelectedDepartment
        }
        onApply={applyDepartmentFilter}
      />
    </div>
  );
}