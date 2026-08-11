import { getChatGPTUser } from "@/app/chatgpt-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) {
    return Response.json(
      { authenticated: false },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const accountKey = await stableAccountKey(user.userId);
  return Response.json(
    {
      authenticated: true,
      accountKey,
      displayName: user.displayName,
      email: user.email,
    },
    { headers: { "cache-control": "no-store" } },
  );
}

async function stableAccountKey(userId: string) {
  const bytes = new TextEncoder().encode(`motion-atlas:${userId}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest).slice(0, 12), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
