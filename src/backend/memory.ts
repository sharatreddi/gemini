// Simple in-memory chat history (resets on server restart)

type Role = "user" | "assistant";

type Message = {
  role: Role;
  text: string;
};

// sessionId -> messages[]
const memoryStore = new Map<string, Message[]>();

export function addMessage(sessionId: string, role: Role, text: string) {
  const history = memoryStore.get(sessionId) ?? [];
  history.push({ role, text });
  memoryStore.set(sessionId, history);

  console.log("🧠 MEMORY ADD", { sessionId, role, text });
}

export function getHistory(sessionId: string): Message[] {
  const history = memoryStore.get(sessionId) ?? [];
  console.log("🧠 MEMORY GET", { sessionId, history });
  return history;
}
