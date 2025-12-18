"use client";

import { ChatKit, useChatKit } from "@openai/chatkit-react";

const USER_ID = "poc-user";

// Pra PoC: renova o secret periodicamente (evita expiração/intermitência)
const SECRET_TTL_MS = 10 * 60 * 1000; // 10 min

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchClientSecret(): Promise<string> {
  const r = await fetch("/api/chatkit/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: USER_ID }),
    cache: "no-store",
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`POST /api/chatkit/session failed: ${r.status} ${txt}`);
  }

  const data = (await r.json().catch(() => ({}))) as { client_secret?: string };

  if (!data?.client_secret || typeof data.client_secret !== "string") {
    throw new Error("Missing/invalid client_secret from /api/chatkit/session");
  }

  return data.client_secret;
}

async function fetchWithRetry(tries = 3): Promise<string> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fetchClientSecret();
    } catch (e) {
      lastErr = e;
      await sleep(300 * (i + 1)); // 300ms, 600ms, 900ms
    }
  }
  throw lastErr;
}

export default function Home() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        // Cache simples com TTL em memória (por aba)
        // (evita ficar criando secret toda msg, mas também evita expiração)
        const w = window as unknown as {
          __chatkitSecret?: string;
          __chatkitSecretAt?: number;
        };

        const now = Date.now();
        const cached = w.__chatkitSecret;
        const cachedAt = w.__chatkitSecretAt ?? 0;

        const cacheValid = !!cached && now - cachedAt < SECRET_TTL_MS;

        // Se a lib passar "existing", usa só se ainda estiver no TTL
        if (existing && cacheValid && existing === cached) return existing;

        // Se já temos cache válido, devolve (mesmo se existing vier vazio)
        if (cacheValid) return cached!;

        // Caso contrário, busca novo com retry
        const fresh = await fetchWithRetry(3);

        w.__chatkitSecret = fresh;
        w.__chatkitSecretAt = now;

        return fresh;
      },
    },
  });

  return (
    <div style={{ height: "100vh" }}>
      <ChatKit control={control} className="h-full w-full" />
    </div>
  );
}
