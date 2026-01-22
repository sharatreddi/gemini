import express, { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { getHistory, addMessage } from "../memory";

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

function initSse(res: Response) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
}

router.get("/", async (req: Request, res: Response) => {
  const message = req.query.message as string;
  const sessionId = req.query.sessionId as string;
  console.log("💬 STREAM REQ", { message, sessionId });
  if (!message || !sessionId) {
    return res.status(400).end();
  }

  initSse(res);

  try {
    // 1️⃣ Get existing history from your memory.ts (OLD messages only)
    const rawHistory = getHistory(sessionId);

    // 2️⃣ Format it for the Chat SDK (mapping "assistant" -> "model")
    const formattedHistory = rawHistory.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    // 3️⃣ Initialize the Chat according to the Docs
    // Use 'gemini-3-flash-preview' as seen in the 2026 docs
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      history: formattedHistory,
    });

    // 4️⃣ Send the NEW message via the chat object
    const stream = await chat.sendMessageStream({
      message: message,
    });

    // 5️⃣ Save the current USER message to your local memory
    addMessage(sessionId, "user", message);

    let assistantReply = "";

    for await (const chunk of stream) {
      const text = chunk.text;
      if (!text) continue;

      assistantReply += text;
      res.write(`data: ${JSON.stringify({ delta: text })}\n\n`);
    }

    // 6️⃣ Save the final AI response to your local memory
    addMessage(sessionId, "assistant", assistantReply);

    res.write(`event: done\ndata: {}\n\n`);
    res.end();
  } catch (err) {
    console.error("❌ STREAM ERROR", err);
    res.end();
  }
});

export default router;