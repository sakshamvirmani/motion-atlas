import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Motion Atlas — SwiftUI Animation Course";
const description =
  "A beautiful, hands-on course for learning iOS animation in SwiftUI, with interactive labs, prediction drills, and web-motion bonus lessons.";

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
          alt: "Motion Atlas — SwiftUI animation course",
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
