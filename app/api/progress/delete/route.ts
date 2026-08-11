import { getChatGPTUser } from "@/app/chatgpt-auth";
import { isSameOriginRequest } from "@/lib/progress";
import { deleteProgress } from "@/lib/progress-store";
import { checkAccountRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_DELETE_BODY_BYTES = 1_024;

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) {
    return Response.json({ error: "Sign in to delete progress." }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Cross-origin deletion is not allowed." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "Use application/json." }, { status: 415 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_DELETE_BODY_BYTES) {
    return Response.json({ error: "Deletion payload is too large." }, { status: 413 });
  }

  const rateLimit = await checkAccountRateLimit({
    userId: user.userId,
    action: "progress-delete",
    limit: 10,
    windowMs: 60 * 60 * 1_000,
  });
  if (!rateLimit.allowed) return rateLimitedResponse(rateLimit);

  const bodyText = await request.text();
  if (new TextEncoder().encode(bodyText).byteLength > MAX_DELETE_BODY_BYTES) {
    return Response.json({ error: "Deletion payload is too large." }, { status: 413 });
  }

  let payload: { confirmation?: unknown };
  try {
    payload = JSON.parse(bodyText) as { confirmation?: unknown };
  } catch {
    return Response.json({ error: "Deletion payload is not valid JSON." }, { status: 400 });
  }
  if (payload.confirmation !== "DELETE MY PROGRESS") {
    return Response.json(
      { error: "Type DELETE MY PROGRESS exactly to confirm." },
      { status: 400 },
    );
  }

  const deleted = await deleteProgress(user.userId);
  return Response.json({ deleted: true, rows: deleted }, { headers: { "cache-control": "no-store" } });
}
