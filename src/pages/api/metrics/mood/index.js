import connectDB from "../../config/connectDB";
import Metric from "../../../../models/Metric";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connectDB();

  const { method, body, headers, query } = req;
  const { id } = query;

  console.log("Request body log in the API:", body);

  // Extract token from request headers
  const token = headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  let session;
  try {
    session = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  switch (method) {
    case "GET":
      try {
        const existingMoodData = await Metric.find({
          userId: session.id,
          metricType: "mood",
        });
        // console.log("Mood data log in the API:", existingMoodData);
        res.status(200).json({
          message: "Existing mood data fetched successfully",
          existingMoodData,
        });
      } catch (error) {
        res.status(400).json({ message: "Failed to fetch mood data", error });
      }
      break;

    case "POST":
      try {
        const { newMoodData } = req.body;
        console.log("THis is the new mood entry:",newMoodData)
        const { date, moodStatus, description, notes } = newMoodData;

        console.log("This is mood status log in the api:", moodStatus)

        // Create a new mood entry
        const newMetricEntry = new Metric({
          userId: session.id,
          metricType: "mood",
          mood: {
            date,
            moodStatus,
            description,
            notes,
          },
        });

        console.log("This is the newMetricEntry log in the API", newMetricEntry.mood.moodStatus)

        await newMetricEntry.save();

        console.log("New mood entry log in the API:", newMetricEntry);

        res.status(201).json({
          message: "New mood entry saved successfully",
          newMetricEntry,
        });
      } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Failed to add mood entry", error });
      }
      break;

    case "PUT":
      try {
        if (!id) {
          return res.status(400).json({ message: "ID is required" });
        }

        const { updatedMoodEntry } = body;
        const updatedMetricEntry = await Metric.findByIdAndUpdate(
          id,
          { mood: updatedMoodEntry },
          { new: true }
        );

        if (!updatedMetricEntry) {
          return res.status(404).json({ message: "Mood entry not found" });
        }

        res.status(200).json({
          message: "Mood entry updated successfully",
          updatedMetricEntry,
        });
      } catch (error) {
        res.status(400).json({ message: "Failed to update mood entry", error });
      }
      break;

    case "DELETE":
      try {
        if (!id) {
          return res.status(400).json({ message: "ID is required" });
        }

        const deletedMetricEntry = await Metric.findByIdAndDelete(id);

        if (!deletedMetricEntry) {
          return res.status(404).json({ message: "Mood entry not found" });
        }

        res.status(200).json({ message: "Mood entry deleted successfully" });
      } catch (error) {
        res.status(400).json({ message: "Failed to delete mood entry", error });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
