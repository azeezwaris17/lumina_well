import connectDB from "../../config/connectDB";
import Metric from "../../../../models/Metric";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connectDB();

  const { method, body, headers, query } = req;

  console.log("This is the request body log in the API:", body);

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
        const existingDietaryData = await Metric.find({
          userId: session.id,
          metricType: "dietaryIntake",
        });
        res.status(200).json({
          message: "Existing dietary intake data fetched successfully",
          existingDietaryData,
        });
      } catch (error) {
        res
          .status(400)
          .json({ message: "Failed to fetch dietary intake data", error });
      }
      break;

    case "POST":
      try {
        const { newDietaryData, recommendations } = body;

        const { date, foodItem,  quantity, calories, mealType, notes } =
          newDietaryData;

        // Ensure only valid metricType fields are included
        const newMetricEntry = new Metric({
          userId: session.id,
          metricType: "dietaryIntake",
          dietaryIntake: {
            date,
            foodItem,
            quantity,
            calories,
            mealType,
            notes,
          },
          recommendations,
        });

        await newMetricEntry.save();

        console.log(
          "New dietary intake data entries log in the API:",
          newMetricEntry
        );

        res.status(201).json({
          message: "New dietary intake data entries saved successfully",
          newMetricEntry,
        });
      } catch (error) {
        console.log(error);
        res
          .status(400)
          .json({ message: "Failed to add dietary intake entry", error });
      }
      break;

    case "PUT":
      try {
        const { id } = req.query;
        const { updatedDietaryData } = body;
        const updatedDietaryDataEntry = await Metric.findByIdAndUpdate(
          id,
          { dietaryIntake: updatedDietaryData },
          { new: true }
        );

        if (!updatedDietaryDataEntry) {
          return res
            .status(404)
            .json({ message: "Dietary intake entry not found" });
        }

        res.status(200).json({
          message: "Dietary intake data updated successfully",
          updatedDietaryDataEntry,
        });
      } catch (error) {
        res
          .status(400)
          .json({ message: "Failed to update dietary intake entry", error });
      }
      break;

    case "DELETE":
      try {
        const { id } = query; // Ensure you're extracting the id correctly
        const deletedDietaryDataEntry = await Metric.findByIdAndDelete(id);

        if (!deletedDietaryDataEntry) {
          return res
            .status(404)
            .json({ message: "Dietary intake entry not found" });
        }

        res
          .status(200)
          .json({ message: "Dietary intake entry deleted successfully" });
      } catch (error) {
        res
          .status(400)
          .json({ message: "Failed to delete dietary intake entry", error });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
