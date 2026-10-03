// components/PopularSearches.jsx

export default function PopularSearches({ searches, onSearch }) {
  if (!searches.length) return null;

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#7a1f2c]">
        Popular Searches
      </h2>

      <div className="flex flex-wrap gap-2">
        {searches.map((item, index) => (
          <button onClick={() => onSearch(item._id)}
            key={index}
            className="
              px-3
              py-1
              bg-[#f4efe8]
              border
              border-[#cdbda8]
              rounded-lg
              text-sm
              shadow-sm
              text-[#2e2a2a]
              hover:border-[#7a1f2c]
            "
          >
            {item._id}
          </button>
        ))}
      </div>
    </div>
  );
}
