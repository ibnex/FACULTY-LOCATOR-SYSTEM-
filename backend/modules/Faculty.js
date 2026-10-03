import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    facultyCategory: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    school: {
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

    academicQualifications: {
      type: [String],
      default: [],
    },

    institution: {
      type: String,
      default: "",
    },

    biography: {
      type: String,
      default: "",
    },

    researchInterests: {
      type: [String],
      default: [],
    },

    publications: {
      type: [String],
      default: [],
    },

    experience: {
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

    profileSections: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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