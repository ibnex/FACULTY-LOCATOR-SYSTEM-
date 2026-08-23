// components/SearchBar.jsx

import { FiSearch } from "react-icons/fi";

export default function SearchBar({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="
w-full
max-w-full
flex
items-center
gap-3
px-4
py-2
bg-white
border
border-gray-200
rounded-2xl
shadow-sm
hover:shadow-md
transition-all
duration-200
"
    >
      <div
        className="
          flex
          items-center
          justify-center
          w-9
          h-9
          rounded-full
          bg-blue-50
          text-blue-600
          shrink-0
        "
      >
        <FiSearch size={18} />
      </div>

      <div className="flex flex-col items-start">
        <span className="text-[15px] font-medium text-gray-800">
          Search Faculty
        </span>

        <span className="text-xs text-gray-500">
          Name
        </span>
      </div>
    </button>
  );
}