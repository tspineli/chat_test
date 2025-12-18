import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const workflowId = process.env.CHATKIT_WORKFLOW_ID;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }
  if (!workflowId) {
    return NextResponse.json({ error: "Missing CHATKIT_WORKFLOW_ID" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const user = body?.user ?? "poc-user";

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
  if (!r.ok) return NextResponse.json(data, { status: r.status });

  return NextResponse.json({ client_secret: data.client_secret });
}
