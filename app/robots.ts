import type { MetadataRoute } from "next";

const siteUrl =
  "https://motion-atlas-swiftui-course.saksham-virmani.chatgpt.site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account", "/signin"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
