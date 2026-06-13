import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import { getFacultyDetails } from "../api/facultyApi";

export default function FacultyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await getFacultyDetails(id);

      setFaculty(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-5">
        Loading...
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="p-5">
        Faculty not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}

      <div className="sticky top-0 bg-white border-b p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <FiArrowLeft size={22} />
        </button>

        <h1 className="font-semibold">
          Faculty Details
        </h1>
      </div>

      {/* Profile */}

      <div className="p-5">

        <div className="bg-white rounded-2xl shadow-sm p-5">

          <div className="flex flex-col items-center">

            <img
              src={faculty.photo}
              alt={faculty.name}
              className="w-32 h-32 rounded-full object-cover border"
            />

            <h2 className="text-xl font-bold mt-4 text-center">
              {faculty.name}
            </h2>

            <p className="text-gray-600 text-center mt-1">
              {faculty.designation}
            </p>

            <p className="text-sm text-blue-600 mt-2 text-center">
              {faculty.department}
            </p>

          </div>

        </div>

        {/* Room Info */}

        <div className="bg-white rounded-2xl p-6 shadow">
  <h2 className="font-semibold text-lg mb-4">
    Location Information
  </h2>

  <div className="space-y-3">

    <p>
      📍 Floor{" "}
      {faculty.floorNumber || "Not Assigned"}
    </p>

    <p>
      🚪 Room{" "}
      {faculty.roomNumber || "Not Assigned"}
    </p>

    <p>
      🏢 Cabin{" "}
      {faculty.cabinNumber || "Not Assigned"}
    </p>

  </div>
</div>

        {/* Qualification */}

        <div className="bg-white rounded-2xl shadow-sm p-5 mt-4">

          <h3 className="font-semibold mb-3">
            Qualification
          </h3>

          <p className="text-gray-700">
            {faculty.qualification || "Not Available"}
          </p>

        </div>

      </div>

    </div>
  );
}