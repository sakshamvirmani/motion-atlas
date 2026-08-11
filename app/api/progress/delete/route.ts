import { getChatGPTUser } from "@/app/chatgpt-auth";
import { isSameOriginRequest } from "@/lib/progress";
import { deleteProgress } from "@/lib/progress-store";

export const dynamic = "force-dynamic";

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

  const payload = (await request.json()) as { confirmation?: unknown };
  if (payload.confirmation !== "DELETE MY PROGRESS") {
    return Response.json(
      { error: "Type DELETE MY PROGRESS exactly to confirm." },
      { status: 400 },
    );
  }

  const deleted = await deleteProgress(user.userId);
  return Response.json({ deleted: true, rows: deleted }, { headers: { "cache-control": "no-store" } });
}
