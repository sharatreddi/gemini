// src/backend/routes/stream.ts
import express, { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Utility to set SSE headers
function initSse(res: Response) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });
  // send a comment to establish the stream
  res.write(`:ok\n\n`);
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "message is required" });

    initSse(res);

    // start streaming from Gemini (method name may vary with SDK versions)
    // This uses the new SDK's streaming method `generateContentStream`
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: message,
    });

    for await (const chunk of stream) {
      const text = chunk.text ?? "";
      res.write(`data: ${JSON.stringify({ delta: text })}\n\n`);
    }

    // indicate completion
    res.write(`event: done\ndata: {}\n\n`);
    res.end();
  } catch (err) {
    console.error("Streaming error:", err);
    // tell client about error
    res.write(
      `event: error\ndata: ${JSON.stringify({ message: "Server error" })}\n\n`
    );
    res.end();
  }
});

export default router;
