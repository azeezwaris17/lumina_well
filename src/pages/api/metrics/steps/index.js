import connectDB from "../../config/connectDB";
import Metric from "../../../../models/Metric";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connectDB();

  const { method, body, headers, query } = req;

  console.log("This is the request body log in the api:", body);

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
        const existingStepsData = await Metric.find({
          userId: session.id,
          metricType: "steps",
        });

        res.status(200).json({
          message: "Existing steps data fetched successfully",
          existingStepsData,
        });
      } catch (error) {
        res.status(400).json({ message: "Failed to fetch steps data", error });
      }
      break;

    case "POST":
      try {
        const { newStepsData } = body;

        const {
          date,
          stepsCount,
          distance, // Optional
          caloriesBurned, // Optional
          timeOfDay, // Optional
          notes, // Optional
        } = newStepsData;

        // Ensure only valid metricType fields are included
        const newMetricEntry = new Metric({
          userId: session.id,
          metricType: "steps",
          steps: {
            date,
            stepsCount,
            distance,
            caloriesBurned,
            timeOfDay,
            notes,
          },
        });

        await newMetricEntry.save();

        console.log("New steps data entries log in the api:", newMetricEntry);

        res.status(201).json({
          message: "New steps data entries saved successfully",
          newMetricEntry,
        });
      } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Failed to add steps entry", error });
      }
      break;

    case "PUT":
      try {
        const { id } = query; // Ensure you're extracting the id correctly
        const { updatedStepsData } = body;

        const updatedStepsDataEntry = await Metric.findByIdAndUpdate(
          id,
          { steps: updatedStepsData },
          { new: true }
        );

        if (!updatedStepsDataEntry) {
          return res.status(404).json({ message: "Steps entry not found" });
        }

        res.status(200).json({
          message: "Steps data updated successfully",
          updatedStepsDataEntry,
        });
      } catch (error) {
        res
          .status(400)
          .json({ message: "Failed to update steps entry", error });
      }
      break;

    case "DELETE":
      try {
        const { id } = query; // Ensure you're extracting the id correctly
        const deletedStepsDataEntry = await Metric.findByIdAndDelete(id);

        if (!deletedStepsDataEntry) {
          return res.status(404).json({ message: "Steps entry not found" });
        }

        res.status(200).json({ message: "Steps entry deleted successfully" });
      } catch (error) {
        res
          .status(400)
          .json({ message: "Failed to delete steps entry", error });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
