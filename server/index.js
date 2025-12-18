import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (_, res) => res.status(200).send("ok"));

app.post("/api/chatkit/session", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const workflowId = process.env.CHATKIT_WORKFLOW_ID;

  if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
  if (!workflowId) return res.status(500).json({ error: "Missing CHATKIT_WORKFLOW_ID" });

  // um identificador simples de usuário (pode ser deviceId, cookie, uuid etc.)
  const user = req.body?.user || "poc-user";

  const r = await fetch("https://api.openai.com/v1/chatkit/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "OpenAI-Beta": "chatkit_beta=v1"
    },
    body: JSON.stringify({
      workflow: { id: workflowId },
      user
    })
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) return res.status(r.status).json(data);

  // a resposta inclui client_secret
  return res.json({ client_secret: data.client_secret });
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`server listening on :${port}`));
