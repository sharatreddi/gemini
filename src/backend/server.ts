import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";

import chatRouter from "./routes/chat"; 
import streamRouter from "./routes/stream";

const app = express();

app.use(cors());
app.use(express.json());

/**
 * 1️⃣ Serve frontend (HTML)
 * This allows http://localhost:5000 to load index.html
 */
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

/**
 * 2️⃣ API routes
 */
// Specific first!
app.use("/api/chat/stream", streamRouter); 
app.use("/api/chat", chatRouter);

/**
 * 3️⃣ Fallback: always return index.html
 * (important for browser refresh / direct access)
 */
app.get(/.*/, (_, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/**
 * 4️⃣ Start server
 */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
