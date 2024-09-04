// src/pages/api/auth/admin/register
import Admin from "../../../../models/admin";
import connectDB from "../../config/connectDB";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    const { fullName, email, password, role } = req.body;

    try {
      const adminExists = await Admin.findOne({ email });

      if (adminExists) {
        return res.status(400).json({ message: "Admin already exists" });
      }

      const admin = await Admin.create({
        fullName,
        email,
        password,
        role,
      });

      const token = generateToken(admin._id);

      res.status(201).json({
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        token,
        message: "Admin Registration successful",
      });

      console.log("Registration successful");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
