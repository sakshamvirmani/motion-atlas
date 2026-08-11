import type { MetadataRoute } from "next";
import { lessons } from "@/content/course";

const siteUrl =
  "https://motion-atlas-swiftui-course.saksham-virmani.chatgpt.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-11T00:00:00.000Z");
  const stableRoutes = ["", "/learn", "/review", "/sources", "/privacy"];

  return [
    ...stableRoutes.map((pathname, index) => ({
      url: `${siteUrl}${pathname}`,
      lastModified,
      changeFrequency: index < 2 ? ("weekly" as const) : ("monthly" as const),
      priority: index === 0 ? 1 : index === 1 ? 0.95 : 0.65,
    })),
    ...lessons.map((lesson) => ({
      url: `${siteUrl}/learn/${lesson.slug}`,
      lastModified: new Date(`${lesson.lastReviewed}T00:00:00.000Z`),
      changeFrequency: "monthly" as const,
      priority: lesson.track === "ios" ? 0.8 : 0.55,
    })),
  ];
}
