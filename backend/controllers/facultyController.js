import Faculty from "../modules/Faculty.js";
import normalizeName from "../utils/normalizeName.js";
// import SearchHistory from "../models/SearchHistory.js";
import XLSX from "xlsx";
import mongoose from "mongoose";
import { scrapeFaculty } from "../services/scraperService.js";
import {
  invalidateSearchCache,
  searchFaculty,
} from "../search/searchService.js";
import { enrichFacultyProfiles } from "../services/scraperService.js";
import { getSuggestions } from "../search/searchService.js";
// import SearchHistory from "../modules/SearchHistory.js";
import SearchHistory from "../modules/SearchHistory.js";





export const scrapeFacultyData = async (req, res) => {
  try {
    const faculties = await scrapeFaculty();
    invalidateSearchCache();

    res.status(200).json({
      success: true,
      count: faculties.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getAllFaculty = async (req, res) => {
  try {
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 20;

    const skip = (page - 1) * limit;

    const [total, faculty] = await Promise.all([
      Faculty.countDocuments(),
      Faculty.find({})
        .select("_id name designation department photo roomNumber")
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: faculty.length,
      data: faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const searchFacultyController = async (
  req,
  res
) => {
  try {
    const query = typeof req.query.q === "string"
      ? req.query.q.trim()
      : "";

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Search query is required",
      });
    }

    const results =
      await searchFaculty(query);

    await SearchHistory.create({
      query: query.toLowerCase(),
      resultsCount:
        results.length,
    });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const enrichFacultyData = async (req, res) => {
  try {
    const count = await enrichFacultyProfiles();
    invalidateSearchCache();

    res.json({
      success: true,
      updated: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSuggestionsController = async (
  req,
  res
) => {
  try {
    const query = typeof req.query.q === "string"
      ? req.query.q.trim()
      : "";

    if (query.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const suggestions =
      await getSuggestions(query);

    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPopularSearches = async (req, res) => {
  try {
    const popularSearches = await SearchHistory.aggregate([
      {
        $group: {
          _id: "$query",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      success: true,
      data: popularSearches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const importFacultyExcel = async (req, res) => {  //pendinng work
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    const workbook = XLSX.readFile(req.file.path);

    const sheetName = workbook.SheetNames[0];

    const data = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName]
    );
    const allFaculty = await Faculty.find();

    let updatedCount = 0;

    for (const row of data) {

  const excelName = normalizeName(row.name);

  const faculty = allFaculty.find(
    (f) => normalizeName(f.name) === excelName
  );

      if (!faculty) continue;

      faculty.roomNumber = row.roomNumber || "";
      faculty.floorNumber = row.floorNumber || null;
      faculty.cabinNumber = row.cabinNumber || "";

      await faculty.save();

      updatedCount++;
    }

    invalidateSearchCache();

    res.status(200).json({
      success: true,
      updatedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

   if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid faculty ID",
  });
}

const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getSearchStats = async (req, res) => {
  try {
    const totalSearches = await SearchHistory.countDocuments();

    const uniqueQueries = await SearchHistory.distinct("query");

    const totalResults = await SearchHistory.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$resultsCount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSearches,
        uniqueQueries: uniqueQueries.length,
        totalResultsReturned:
          totalResults.length > 0 ? totalResults[0].total : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
