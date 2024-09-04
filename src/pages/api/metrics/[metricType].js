// pages/api/metrics/[metricType].js
import connectDB from "../config/connectDB";
import Metric from "../../../models/Metric";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connectDB();
  const { method } = req;
  const { metricType } = req.query;

  // Extract token from request headers
  const token = req.headers.authorization?.split(" ")[1];

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
        const metrics = await Metric.find({
          userId: session.id,
          metricType,
        });
        res.status(200).json({ success: true, data: metrics });
      } catch (error) {
        console.error("Error fetching metrics:", error);
        res.status(500).json({
          success: false,
          message: "Server error. Please try again later.",
        });
      }
      break;

    case "POST":
      try {
        const { value, date } = req.body;

        if (!value || value <= 0) {
          return res.status(400).json({
            success: false,
            message: `${metricType} value must be a positive number.`,
          });
        }

        const existingMetric = await Metric.findOne({
          userId: session.id,
          metricType,
        });

        if (existingMetric) {
          return res.status(400).json({
            success: false,
            message: `You are already tracking ${metricType}.`,
          });
        }

        const newMetric = await Metric.create({
          userId: session.id,
          metricType,
          value,
          date: date || Date.now(),
        });

        res.status(201).json({
          success: true,
          data: newMetric,
          message: `${metricType} entry added successfully.`,
        });
      } catch (error) {
        console.error(`Error adding ${metricType}:`, error);
        res.status(500).json({
          success: false,
          message: "Server error. Please try again later.",
        });
      }
      break;

    case "PUT":
      try {
        const { id, value, date } = req.body;

        if (!id) {
          return res
            .status(400)
            .json({ success: false, message: "ID is required." });
        }

        if (!value || value <= 0) {
          return res.status(400).json({
            success: false,
            message: `${metricType} value must be a positive number.`,
          });
        }

        const updatedMetric = await Metric.findOneAndUpdate(
          { _id: id, userId: session.id, metricType },
          { value, date },
          { new: true, runValidators: true }
        );

        if (!updatedMetric) {
          return res
            .status(404)
            .json({
              success: false,
              message: `${metricType} entry not found.`,
            });
        }

        res.status(200).json({
          success: true,
          data: updatedMetric,
          message: `${metricType} entry updated successfully.`,
        });
      } catch (error) {
        console.error(`Error updating ${metricType}:`, error);
        res.status(500).json({
          success: false,
          message: "Server error. Please try again later.",
        });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.body;

        if (!id) {
          return res
            .status(400)
            .json({ success: false, message: "ID is required." });
        }

        const deletedMetric = await Metric.findOneAndDelete({
          _id: id,
          userId: session.id,
          metricType,
        });

        if (!deletedMetric) {
          return res
            .status(404)
            .json({
              success: false,
              message: `${metricType} entry not found.`,
            });
        }

        res.status(200).json({
          success: true,
          data: deletedMetric,
          message: `${metricType} entry deleted successfully.`,
        });
      } catch (error) {
        console.error(`Error deleting ${metricType}:`, error);
        res.status(500).json({
          success: false,
          message: "Server error. Please try again later.",
        });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res
        .status(405)
        .json({ success: false, message: `Method ${method} Not Allowed` });
      break;
  }
}
