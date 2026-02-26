import express from "express";
import cors from "cors";
import "dotenv/config";
import apiRoutes from "./routes/apiRoutes";

const app = express();

app.use(cors());
app.use(express.json());

// Main API Route
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
