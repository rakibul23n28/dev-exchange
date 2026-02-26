import express from "express";
import cors from "cors";
import "dotenv/config";
import apiRoutes from "./routes/apiRoutes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.set("trust proxy", true);

// Main API Route
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
