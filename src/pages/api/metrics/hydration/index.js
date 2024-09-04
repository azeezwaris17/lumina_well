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
        const existingHydrationData = await Metric.find({
          userId: session.id,
          metricType: "hydration",
        });
        res.status(200).json({
          message: "Existing hydration data fetched successfully",
          existingHydrationData,
        });
      } catch (error) {
        res
          .status(400)
          .json({ message: "Failed to fetch hydration data", error });
      }
      break;

    case "POST":
      try {
        const { newHydrationData, recommendations } = body;

        const {
          date,
          dailyWaterIntake,
          notes,
        } = newHydrationData;

        // Ensure only valid metricType fields are included
        const newMetricEntry = new Metric({
          userId: session.id,
          metricType: "hydration",
          hydration: {
            date,
            dailyWaterIntake,
            notes,
          },
          recommendations,
        });

        await newMetricEntry.save();

        console.log(
          "New hydration data entries log in the API:",
          newMetricEntry
        );

        res.status(201).json({
          message: "New hydration data entries saved successfully",
          newMetricEntry,
        });
      } catch (error) {
        console.log(error);
        res
          .status(400)
          .json({ message: "Failed to add hydration entry", error });
      }
      break;

    case "PUT":
      try {
        const { id } = req.query; 
        const {hydrationDataUpdateEntries } = body;
        console.log(
          "id:",
          id,
          "new hydration data:",
          hydrationDataUpdateEntries
        );
        const updatedHydrationDataEntry = await Metric.findByIdAndUpdate(
          id,
          { hydration: hydrationDataUpdateEntries },
          { new: true }
        );

        if (!updatedHydrationDataEntry) {
          return res.status(404).json({ message: "Hydration entry not found" });
        }

        res.status(200).json({
          message: "Hydration data updated successfully",
          updatedHydrationDataEntry,
        });
      } catch (error) {
        res
          .status(400)
          .json({ message: "Failed to update hydration entry", error });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query; // Ensure you're extracting the id correctly
        const deletedHydrationDataEntry = await Metric.findByIdAndDelete(id);

        if (!deletedHydrationDataEntry) {
          return res.status(404).json({ message: "Hydration entry not found" });
        }

        res
          .status(200)
          .json({ message: "Hydration entry deleted successfully" });
      } catch (error) {
        res
          .status(400)
          .json({ message: "Failed to delete hydration entry", error });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
