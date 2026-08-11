import { getChatGPTUser } from "@/app/chatgpt-auth";
import { readProgress } from "@/lib/progress-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) {
    return Response.json({ error: "Sign in to export progress." }, { status: 401 });
  }

  const progress = await readProgress(user.userId);
  const exportBody = JSON.stringify(
    {
      product: "Motion Atlas",
      exportedAt: new Date().toISOString(),
      account: { displayName: user.displayName, email: user.email },
      progress,
    },
    null,
    2,
  );

  return new Response(exportBody, {
    headers: {
      "cache-control": "no-store",
      "content-disposition": `attachment; filename="motion-atlas-progress-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
      "content-type": "application/json; charset=utf-8",
    },
  });
}
