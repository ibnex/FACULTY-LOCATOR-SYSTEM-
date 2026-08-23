import { useNavigate } from "react-router-dom";

export default function FacultyCard({ faculty }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/faculty/${faculty._id}`)}
      className="
        bg-white
        rounded-xl
        shadow-sm
        border
        p-4
        cursor-pointer
        active:scale-[0.98]
        transition
        
      "
    >
      <div className="flex gap-4 ">
        <img
          src={faculty.photo}
          alt={faculty.name}
          className="w-20 h-20 rounded-lg object-cover"
        />

        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {faculty.name}
          </h3>

          <p className="text-sm text-gray-600">
            {faculty.designation}
          </p>

          <p className="text-sm text-gray-500 mt-1">
            {faculty.department}
          </p>
          {faculty.roomNumber && (
  <p className="text-sm text-gray-500">
    🚪 Room {faculty.roomNumber}
  </p>
)}
        </div>
      </div>
    </div>
  );
}