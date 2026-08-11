import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Motion Atlas | Learn SwiftUI Animation From Zero";
const description =
  "A free, hands-on path from your first iOS app to purposeful, accessible SwiftUI animation, with live labs, verified examples, and optional web-motion lessons.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const protocol =
    forwardedProto ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      url: origin,
      images: [
        {
          url: "/og.png",
          width: 1536,
          height: 1024,
          alt: "Motion Atlas SwiftUI animation course",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
