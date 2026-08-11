import type { Metadata } from "next";
import { courseModules, lessons } from "@/content/course";
import { LearningProvider } from "@/app/components/learning/learning-provider";
import CourseExplorer from "./course-explorer";

export const metadata: Metadata = {
  title: "Course Library | Motion Atlas",
  description:
    "Search 48 iOS and SwiftUI lessons plus a separate eight-lesson web motion bonus, with live labs, bookmarks, mastery, and review scheduling.",
};

export default function LearnPage() {
  return (
    <LearningProvider>
      <CourseExplorer
        lessons={lessons.map((lesson) => ({
          id: lesson.id,
          slug: lesson.slug,
          module: lesson.module,
          track: lesson.track,
          title: lesson.title,
          summary: lesson.summary,
          minutes: lesson.minutes,
        }))}
        modules={courseModules.map((module) => ({
          id: module.id,
          title: module.title,
          track: module.track,
        }))}
      />
    </LearningProvider>
  );
}
