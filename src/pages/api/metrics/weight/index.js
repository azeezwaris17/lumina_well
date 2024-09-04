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
        const existingWeightData = await Metric.find({
          userId: session.id,
          metricType: "weight",
        });

        res.status(200).json({
          message: "Existing weight data fetched successfully",
          existingWeightData,
        });
      } catch (error) {
        res.status(400).json({ message: "Failed to fetch weight data", error });
      }
      break;

    case "POST":
      try {
        const { newWeightData, recommendations } = body;

        const {
          date,
          weight,
          note, 
        } = newWeightData;

        // Ensure only valid metricType fields are included
        const newMetricEntry = new Metric({
          userId: session.id,
          metricType: "weight",
          weight: {
            date,
            weight,
            note,
          },
          recommendations,
        });

        await newMetricEntry.save();

        console.log("new weight data entries log in the api:", newMetricEntry);

        res.status(201).json({
          message: "New weight data entries saved successfully",
          newMetricEntry,
        });
      } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Failed to add weight entry", error });
      }
      break;

    case "PUT":
      try {
         const { id } = query;
        const { newWeightData } = body;
        const updatedWeightDataEntry = await Metric.findByIdAndUpdate(
          id,
          { weight: newWeightData },
          { new: true }
        );

        if (!updatedWeightDataEntry) {
          return res.status(404).json({ message: "Weight entry not found" });
        }

        res.status(200).json({
          message: "Weight data updated successfully",
          updatedWeightDataEntry,
        });
      } catch (error) {
        res
          .status(400)
          .json({ message: "Failed to update weight entry", error });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query; // Ensure you're extracting the id correctly
        const deletedWeightDataEntry = await Metric.findByIdAndDelete(id);

        if (!deletedWeightDataEntry) {
          return res.status(404).json({ message: "Weight entry not found" });
        }

        res.status(200).json({ message: "Weight entry deleted successfully" });
      } catch (error) {
        res
          .status(400)
          .json({ message: "Failed to delete weight entry", error });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
