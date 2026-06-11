import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      trim: true,
    },

    resultsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

searchHistorySchema.index({ query: 1 });
searchHistorySchema.index({ createdAt: -1 });

export default mongoose.model(
  "SearchHistory",
  searchHistorySchema
);