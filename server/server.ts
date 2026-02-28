import express from "express";
import cors from "cors";
import "dotenv/config";
import apiRoutes from "./routes/apiRoutes.js";

const app = express();

// --- Middleware ---
app.use(
  cors({
    // In production, you might want to change this to your Vercel domain
    origin:
      process.env.NODE_ENV === "production" ? true : "http://localhost:5173",
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.set("trust proxy", true);

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// --- Server Activation ---
// We only call app.listen() if we are NOT on Vercel (Serverless)
// Vercel sets an environment variable named 'VERCEL' automatically
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// CRITICAL: Export for Vercel's Serverless handler
export default app;
