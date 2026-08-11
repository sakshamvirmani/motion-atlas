import type { Metadata } from "next";
import { LearningProvider } from "@/app/components/learning/learning-provider";
import { lessons } from "@/content/course";
import ReviewQueue from "./review-queue";

export const metadata: Metadata = {
  title: "Review Queue | Motion Atlas",
  description:
    "A transparent SwiftUI animation review queue using same-session, 1, 3, 7, 14, and 30-day retrieval intervals.",
};

export default function ReviewPage() {
  return (
    <LearningProvider>
      <ReviewQueue
        lessons={lessons.map((lesson) => ({
          id: lesson.id,
          slug: lesson.slug,
          title: lesson.title,
          summary: lesson.summary,
          teachBack: lesson.body.teachBack,
        }))}
      />
    </LearningProvider>
  );
}
