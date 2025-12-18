import express, { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Basic chat (non-streaming)
router.get("/stream", async (req, res) => {
  try {
    const message = req.query.message as string;

    if (!message) {
      res.status(400).end("Missing message");
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: message,
    });

    for await (const chunk of stream) {
      const text = chunk.text ?? "";
      res.write(`data: ${JSON.stringify({ delta: text })}\n\n`);
    }

    res.write(`event: done\ndata: {}\n\n`);
    res.end();
  } catch (err) {
    console.error(err);
    res.end();
  }
});


export default router;
