import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Motion Atlas | Learn SwiftUI Animation From Zero";
const description =
  "A free, hands-on path from your first iOS app to purposeful, accessible SwiftUI animation, with live labs, verified examples, and optional web-motion lessons.";
const socialImage = "/og.png";
const socialImageAlt =
  "Motion Atlas, a free course for learning SwiftUI animation from zero";

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const protocol =
    forwardedProto ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function generateMetadata(): Promise<Metadata> {
  return {};
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const origin = await getRequestOrigin();
  const socialImageUrl = new URL(socialImage, origin).toString();

  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Motion Atlas" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={origin} />
        <meta property="og:image" content={socialImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content={socialImageAlt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={socialImageUrl} />
        <meta name="twitter:image:alt" content={socialImageAlt} />
        <link rel="icon" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
