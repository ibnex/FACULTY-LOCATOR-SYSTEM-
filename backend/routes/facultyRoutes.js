import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { importFacultyExcel } from "../controllers/facultyController.js";
import {
  getAllFaculty,
  scrapeFacultyData,
  searchFacultyController,
  enrichFacultyData,
  getSuggestionsController,
  getPopularSearches,
  getDepartments,
  getFacultyByDepartment,
  getSearchStats,
  getFacultyById,
  filterFaculty


} from "../controllers/facultyController.js";

const router = express.Router();

router.get("/", getAllFaculty);

router.get("/scrape", scrapeFacultyData);
router.get("/enrich", enrichFacultyData);
router.get("/search", searchFacultyController);
router.get("/suggestions", getSuggestionsController);
router.get("/search-stats", getSearchStats);
router.get("/popular-searches", getPopularSearches);
router.get("/departments", getDepartments);
router.get("/department/:department",getFacultyByDepartment);
router.get("/filter", filterFaculty);



router.post("/import-excel",upload.single("file"),importFacultyExcel);
router.get("/:id", getFacultyById);

export default router;