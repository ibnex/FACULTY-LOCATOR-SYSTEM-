export default function FilterDrawer({
  isOpen,
  onClose,
  departments,
  selectedDepartment,
  setSelectedDepartment,
  onApply,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/40
        z-50
      "
    >
      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          bg-white
          rounded-t-3xl
          p-5
          max-h-[80vh]
          overflow-y-auto
        "
      >
        <h2 className="text-lg font-semibold mb-4">
          Filter Departments
        </h2>

        <div className="space-y-3">

          {departments.map((department) => (
            <label
              key={department}
              className="
                flex
                items-center
                gap-2
              "
            >
              <input
                type="radio"
                checked={
                  selectedDepartment ===
                  department
                }
                onChange={() =>
                  setSelectedDepartment(
                    department
                  )
                }
              />

              {department}
            </label>
          ))}

        </div>

        <button
          onClick={onApply}
          className="
            mt-6
            w-full
            bg-black
            text-white
            py-3
            rounded-xl
          "
        >
          Apply Filter
        </button>

        <button
          onClick={onClose}
          className="
            mt-2
            w-full
            py-3
          "
        >
          Close
        </button>

      </div>
    </div>
  );
}