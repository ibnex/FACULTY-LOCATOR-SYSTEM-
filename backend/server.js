import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import { getSuggestions, warmSearchCache } from "./search/searchService.js";

dotenv.config();

await connectDB();
await warmSearchCache()
  .then(() => getSuggestions("v"))
  .catch((error) => {
  console.error("Unable to warm faculty search cache:", error.message);
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Faculty Locator API Running");
});

app.use("/api/faculty", facultyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});