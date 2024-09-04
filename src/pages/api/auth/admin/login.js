// src/pages/api/auth/admin/login.js
import Admin from "../../../../models/admin";
import connectDB from "../../config/connectDB";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    const { email, password } = req.body;

    try {
      const admin = await Admin.findOne({ email });
      console.log("admin email found:", email);

      if (!admin) {
        return res.status(400).json({ message: "Email not found" });
      }

      const isPasswordValid = await admin.comparePassword(password);

      if (isPasswordValid) {
        const token = generateToken(admin._id);

        res.json({
          _id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
          token,
          message: "Login successful",
        });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
