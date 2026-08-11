import rawCourse from "./course.json";

export type CourseTrack = "ios" | "web";

export type LessonSource = {
  label: string;
  url: string;
};

export type LessonQuiz = {
  prompt: string;
  answers: string[];
  correctIndex: number;
  explanation: string;
};

export type LessonCode = {
  title: string;
  language: "swift" | "javascript";
  source: string;
};

export type CourseLesson = {
  id: number;
  slug: string;
  module: string;
  track: CourseTrack;
  title: string;
  summary: string;
  minutes: number;
  level: string;
  lab: string;
  body: {
    mentalModel: string;
    conceptHtml: string;
    explanationHtml: string;
    practiceHtml: string;
    teachBack: string;
  };
  code: LessonCode | null;
  quiz: LessonQuiz;
  sources: LessonSource[];
  prerequisites: number[];
  minimumIOS: string | null;
  lastReviewed: string;
  published: boolean;
};

export type CourseModule = {
  id: string;
  title: string;
  range: [number, number];
  track: CourseTrack;
};

export type GlossaryEntry = {
  term: string;
  definition: string;
};

export type CourseRegistry = {
  schemaVersion: number;
  generatedFrom: string;
  generatedAt: string;
  modules: CourseModule[];
  glossary: GlossaryEntry[];
  lessons: CourseLesson[];
};

function assertCourseRegistry(value: unknown): asserts value is CourseRegistry {
  if (!value || typeof value !== "object") {
    throw new Error("Motion Atlas course registry is missing.");
  }

  const registry = value as Partial<CourseRegistry>;
  if (!Array.isArray(registry.lessons) || registry.lessons.length !== 56) {
    throw new Error("Motion Atlas course registry must contain 56 lessons.");
  }

  const ids = new Set<number>();
  const slugs = new Set<string>();
  for (const lesson of registry.lessons) {
    if (!Number.isInteger(lesson.id) || lesson.id < 1 || lesson.id > 56) {
      throw new Error(`Invalid lesson id: ${String(lesson.id)}`);
    }
    if (!lesson.slug || slugs.has(lesson.slug)) {
      throw new Error(`Duplicate or missing lesson slug: ${lesson.slug}`);
    }
    if (ids.has(lesson.id)) {
      throw new Error(`Duplicate lesson id: ${lesson.id}`);
    }
    if (lesson.quiz.answers.length < 2) {
      throw new Error(`Lesson ${lesson.id} needs at least two quiz answers.`);
    }
    if (
      lesson.quiz.correctIndex < 0 ||
      lesson.quiz.correctIndex >= lesson.quiz.answers.length
    ) {
      throw new Error(`Lesson ${lesson.id} has an invalid correct answer.`);
    }
    if (lesson.track === "ios" && lesson.sources.length === 0) {
      throw new Error(`Core lesson ${lesson.id} needs a primary source.`);
    }
    ids.add(lesson.id);
    slugs.add(lesson.slug);
  }
}

assertCourseRegistry(rawCourse);

export const course = rawCourse;
export const lessons = course.lessons.filter((lesson) => lesson.published);
export const iosLessons = lessons.filter((lesson) => lesson.track === "ios");
export const webLessons = lessons.filter((lesson) => lesson.track === "web");
export const courseModules = course.modules;
export const glossary = course.glossary;

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getLessonById(id: number) {
  return lessons.find((lesson) => lesson.id === id);
}

export function getModule(id: string) {
  return courseModules.find((module) => module.id === id);
}

export function lessonPath(lesson: CourseLesson) {
  return `/learn/${lesson.slug}`;
}
