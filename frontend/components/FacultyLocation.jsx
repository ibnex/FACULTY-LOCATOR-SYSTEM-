const locationItems = [
  ["Floor", "floorNumber"],
  ["Room", "roomNumber"],
  ["Cabin", "cabinNumber"],
];

const cleanLocationValue = (value) =>
  String(value)
    .replace(/[{}<>[\]#$%^*_~=|`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function FacultyLocation({ faculty }) {
  return (
    <section className="mt-8 rounded-xl border border-[#d9cdb8] bg-[#f4efe8] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7a1f2c]">
        Faculty Location
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {locationItems.map(([label, key]) => {
          const value = faculty[key];
          const displayValue =
            value === null || value === undefined || value === ""
              ? "Not Assigned"
              : cleanLocationValue(value);

          return (
            <div
              key={key}
              className="rounded-lg border border-[#d9cdb8] bg-[#fffaf3] px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-[#6a625c]">
                {label} Number
              </p>
              <p className="mt-1 text-base font-semibold text-[#2e2a2a]">
                {displayValue}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
