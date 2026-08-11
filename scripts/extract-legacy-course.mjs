import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "..");
const legacyPath = resolve(root, "public/motion-atlas-course.html");
const outputPath = resolve(root, "content/course.json");
const html = await readFile(legacyPath, "utf8");

const startMarker = "    const modules = [";
const endMarker = "    const TOTAL_LESSONS = lessons.length;";
const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker);

if (start === -1 || end === -1 || end <= start) {
  throw new Error("Could not find the frozen lesson registry in the legacy course.");
}

const source = `${html.slice(start, end)}\n;globalThis.__motionAtlasCourse = { modules, lessons, glossary };`;
const context = vm.createContext({ Map, String });
vm.runInContext(source, context, {
  filename: "motion-atlas-course.registry.js",
  timeout: 5_000,
});

const extracted = context.__motionAtlasCourse;
if (!extracted || extracted.lessons.length !== 56) {
  throw new Error(`Expected 56 lessons, found ${extracted?.lessons?.length ?? 0}.`);
}

function slugify(title) {
  return title
    .normalize("NFKD")
    .replace(/SwiftUI/g, "Swiftui")
    .replace(/iOS/g, "Ios")
    .replace(/TestFlight/g, "Testflight")
    .replace(/[’']/g, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const lessons = extracted.lessons.map((lesson) => ({
  id: lesson.id,
  slug: slugify(lesson.title),
  module: lesson.module,
  track: lesson.module === "web" ? "web" : "ios",
  title: lesson.title,
  summary: lesson.summary,
  minutes: lesson.minutes,
  level: lesson.level,
  lab: lesson.lab,
  body: {
    mentalModel: lesson.mental,
    conceptHtml: lesson.big,
    explanationHtml: lesson.under,
    practiceHtml: lesson.practice,
    teachBack: lesson.teach,
  },
  code: lesson.code
    ? {
        title: lesson.codeTitle || "SwiftUI example",
        language: lesson.module === "web" ? "javascript" : "swift",
        source: lesson.code,
      }
    : null,
  quiz: {
    prompt: lesson.quiz.q,
    answers: lesson.quiz.a,
    correctIndex: lesson.quiz.c,
    explanation: lesson.quiz.why,
  },
  sources: lesson.sources,
  prerequisites:
    lesson.id === 1 ? [] : lesson.id === 49 ? [20] : [lesson.id - 1],
  minimumIOS: lesson.module === "web" ? null : "17.0",
  lastReviewed: "2026-08-11",
  published: true,
}));

const slugs = new Set(lessons.map((lesson) => lesson.slug));
if (slugs.size !== lessons.length) {
  throw new Error("Generated lesson slugs are not unique.");
}

const registry = {
  schemaVersion: 1,
  generatedFrom: "public/motion-atlas-course.html",
  generatedAt: "2026-08-11",
  modules: extracted.modules.map((module) => ({
    ...module,
    track: module.id === "web" ? "web" : "ios",
  })),
  glossary: extracted.glossary,
  lessons,
};

await writeFile(outputPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
console.log(`Extracted ${lessons.length} lessons to ${outputPath}`);
