const cardClass =
  "rounded-xl border border-[#d9cdb8] bg-[#f4efe8] p-4";

export default function FacultyAcademicInfo({ school, qualification }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={cardClass}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a1f2c]">
          School
        </p>
        <p className="mt-2 text-base text-[#2e2a2a]">{school}</p>
      </div>

      <div className={cardClass}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a1f2c]">
          Qualification
        </p>
        <p className="mt-2 text-base text-[#2e2a2a]">{qualification}</p>
      </div>
    </div>
  );
}
