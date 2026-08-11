import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  isSameOriginRequest,
  MAX_PROGRESS_BODY_BYTES,
  validateProgressInput,
} from "@/lib/progress";
import { readProgress, writeProgress } from "@/lib/progress-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return unauthenticated();

  const progress = await readProgress(user.userId);
  return Response.json(
    { authenticated: true, progress },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return unauthenticated();
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Cross-origin progress writes are not allowed." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "Use application/json." }, { status: 415 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_PROGRESS_BODY_BYTES) {
    return Response.json({ error: "Progress payload is too large." }, { status: 413 });
  }

  const bodyText = await request.text();
  if (new TextEncoder().encode(bodyText).byteLength > MAX_PROGRESS_BODY_BYTES) {
    return Response.json({ error: "Progress payload is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return Response.json({ error: "Progress payload is not valid JSON." }, { status: 400 });
  }

  const validated = validateProgressInput(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const result = await writeProgress(user, validated.value);
  if (result.conflict) {
    return Response.json(
      { error: "Progress changed on another device.", progress: result.progress },
      { status: 409, headers: { "cache-control": "no-store" } },
    );
  }

  return Response.json(
    { saved: true, progress: result.progress },
    { headers: { "cache-control": "no-store" } },
  );
}

function unauthenticated() {
  return Response.json(
    { authenticated: false, error: "Sign in to sync progress." },
    { status: 401, headers: { "cache-control": "no-store" } },
  );
}
