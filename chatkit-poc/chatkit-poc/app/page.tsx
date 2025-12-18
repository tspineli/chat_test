"use client";

import { ChatKit, useChatKit } from "@openai/chatkit-react";

export default function Home() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) return existing;

        const r = await fetch("/api/chatkit/session", {
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
