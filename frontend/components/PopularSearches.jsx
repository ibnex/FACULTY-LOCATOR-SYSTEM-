// components/PopularSearches.jsx

export default function PopularSearches({ searches, onSearch }) {
  if (!searches.length) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Popular Searches</h2>

      <div className="flex flex-wrap gap-2">
        {searches.map((item, index) => (
          <button onClick={() => onSearch(item._id)}
            key={index}
            className="
              px-3
              py-1
              bg-white
              border
              rounded-full
              text-sm
              shadow-sm
            "
          >
            {item._id}
          </button>
        ))}
      </div>
    </div>
  );
}
