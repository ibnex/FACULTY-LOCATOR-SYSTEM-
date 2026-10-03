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
px-5
py-3
bg-[#f4efe8]
border
border-[#cdbda8]
rounded-xl
shadow-sm
hover:border-[#7a1f2c]
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
          bg-[#861226]
          text-white
          shrink-0
        "
      >
        <FiSearch size={18} />
      </div>

      <div className="flex flex-col items-start">
        <span className="text-[15px] font-medium text-[#2e2a2a]">
          Search Faculty
        </span>

        <span className="text-xs text-[#6a625c]">
          Search by name, department, or expertise
        </span>
      </div>
    </button>
  );
}