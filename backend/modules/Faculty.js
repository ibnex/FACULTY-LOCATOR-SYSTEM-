import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "",
    },

    qualification: {
      type: String,
      default: "",
    },

    photo: {
      type: String,
      default: "",
    },

    profileUrl: {
      type: String,
      default: "",
      unique: true,
    },

    floorNumber: {
      type: Number,
      default: null,
    },

    roomNumber: {
      type: String,
      default: "",
    },

    cabinNumber: {
      type: String,
      default: "",
    },

    keywords: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

facultySchema.index({ name: "text" });
facultySchema.index({ department: 1 });

export default mongoose.model("Faculty", facultySchema);