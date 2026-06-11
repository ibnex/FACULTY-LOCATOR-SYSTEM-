import axios from "axios";
import * as cheerio from "cheerio";
import Faculty from "../modules/Faculty.js";

export const scrapeFaculty = async () => {
  try {
    const url =
      "https://www.alliance.edu.in/faculties/category/core-faculty";

    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    const faculties = [];

    $(".card.img-hover-zoom--basic.mb-3").each((index, element) => {
      const name = $(element)
        .find(".card-title")
        .text()
        .trim();

      const photo = $(element)
        .find("img.card-img-top")
        .attr("src");

      const profileUrl = $(element)
        .find("a")
        .attr("href");

      const qualification = $(element)
        .find(".card-text")
        .text()
        .replace(/\s+/g, " ")
        .trim();

      const keywords = name
        .toLowerCase()
        .split(" ")
        .filter(Boolean);

      faculties.push({
        name,
        qualification,
        photo,
        profileUrl,
        keywords,
      });
    });

    // Save or update faculty records
    for (const faculty of faculties) {
      await Faculty.updateOne(
        {
          profileUrl: faculty.profileUrl,
        },
        {
          $set: faculty,
        },
        {
          upsert: true,
        }
      );
    }

    console.log(`${faculties.length} faculties saved to MongoDB`);

    return faculties;
  } catch (error) {
    console.error("Scraper Error:", error.message);
    throw error;
  }
};

export const enrichFacultyProfiles = async () => {
  try {
    const faculties = await Faculty.find();

    let updatedCount = 0;

    for (const faculty of faculties) {
      if (!faculty.profileUrl) continue;

      try {
        const { data } = await axios.get(faculty.profileUrl);

        const $ = cheerio.load(data);

        const designation = $(".faculty_p b")
          .first()
          .text()
          .trim();

        const department = $(".faculty_p")
          .eq(1)
          .text()
          .trim();

        await Faculty.updateOne(
          { _id: faculty._id },
          {
            $set: {
              designation,
              department,
            },
          }
        );

        updatedCount++;

        console.log(
          `Updated ${faculty.name} -> ${department}`
        );
      } catch (err) {
        console.log(
          `Failed: ${faculty.name}`
        );
      }
    }

    console.log(
      `${updatedCount} faculty profiles updated`
    );

    return updatedCount;
  } catch (error) {
    throw error;
  }
};
