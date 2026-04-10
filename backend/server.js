const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routers/auth");
const lessonRoutes = require('./routers/lessonRoutes')
const quizRoutes = require('./routers/quizRoutes');

const app = express();

// Middleware
app.use(cors()); // Allows your React app to talk to this backend
app.use(express.json()); // Allows Express to read JSON body data

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error: ", err));

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));