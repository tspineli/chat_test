import React from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";

const API_BASE = import.meta.env.VITE_SERVER_URL; // ex: https://seu-server.up.railway.app

export default function App() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        // pra PoC, se já existe, reutiliza
        if (existing) return existing;

        const r = await fetch(`${API_BASE}/api/chatkit/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: "poc-user" })
        });
        const data = await r.json();
        return data.client_secret;
      }
    }
  });

  return (
    <div style={{ height: "100vh" }}>
      <ChatKit control={control} className="h-full w-full" />
    </div>
  );
}
