import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";

import chatRouter from "./routes/chat";
import streamRouter from "./routes/stream";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRouter);
app.use("/api/chat/stream", streamRouter);

const PORT = 5000;
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
