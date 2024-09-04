// pages/api/saveQuotes.js
import fs from "fs";
import path from "path";
import connectDB from "./config/connectDB";
import Quote from "../../models/quote";

export default async function handler(req, res) {
  await connectDB();

  // Check if quotes already exist in the database
  const existingQuotes = await Quote.find();
  if (existingQuotes.length > 0) {
    return res
      .status(200)
      .json({ message: "Quotes have already been saved to the database." });
  }

  try {
    // Read and parse the JSON file
    const filePath = path.join(process.cwd(), "public", "quotes.json");
    const quotesData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Save cars to the database
    await Quote.insertMany(quotesData);
    return res
      .status(200)
      .json({ 
        message: "Quotes have been successfully saved to the database." 
      });
  } catch (err) {
    console.error("Error saving quotes:", err);
    return res
      .status(500)
      .json({ message: "Error saving quotes.", error: err.message });
  }
}
