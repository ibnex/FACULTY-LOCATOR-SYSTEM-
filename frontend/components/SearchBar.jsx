// components/SearchBar.jsx

import { FiSearch } from "react-icons/fi";

export default function SearchBar({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full
        flex
        items-center
        gap-3
        px-4
        py-3
        bg-white
        border
        border-gray-200
        rounded-xl
        shadow-sm
      "
    >
      <FiSearch size={20} />

      <span className="text-gray-500">Search faculty...</span>
    </button>
  );
}
