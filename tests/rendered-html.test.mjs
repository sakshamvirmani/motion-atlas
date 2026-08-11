import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  emptyProgress,
  mergeProgress,
  validateProgressInput,
} from "../lib/progress.ts";

async function render(requestHeaders = {}, pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: {
        accept: "text/html",
        ...requestHeaders,
      },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders a meaningful guest landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Motion Atlas \| Learn SwiftUI Animation From Zero/i);
  assert.match(html, /Make iPhone/);
  assert.match(html, /interfaces/);
  assert.match(html, /move/);
  assert.match(html, /Start learning free/);
  assert.match(html, /Sign in to sync/);
  assert.match(html, /\/signin\?return_to=%2Flearn/);
  assert.match(html, /href="\/learn"/);
  assert.match(html, /\$0/);
  assert.match(html, /href="https:\/\/sakshamvirmani\.com"/);
  assert.match(html, /No account is required/);
  assert.doesNotMatch(html, /<iframe\b/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/i);
});

test("uses trusted Sites identity headers for the signed-in landing", async () => {
  const response = await render({
    "oai-authenticated-user-id": "user_test_123",
    "oai-authenticated-user-email": "learner@example.com",
    "oai-authenticated-user-full-name": "Saksham%20Learner",
    "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
  });

  const html = await response.text();
  assert.match(html, /Saksham Learner/);
  assert.match(html, /Continue the current course/);
  assert.match(html, /Return to the course/);
  assert.match(html, /\/signout-with-chatgpt\?return_to=%2F/);
  assert.doesNotMatch(html, />Sign in with ChatGPT</);
});

test("keeps the current course and its local progress source reachable", async () => {
  const course = await readFile(
    new URL("../public/motion-atlas-course.html", import.meta.url),
    "utf8",
  );

  assert.equal((course.match(/lesson\(\{/g) ?? []).length, 56);
  assert.equal((course.match(/quiz:\s*\{/g) ?? []).length, 56);
  assert.match(course, /motion-atlas-v2/);
  assert.match(course, /motion-atlas-account-v1:/);
  assert.match(course, /\/api\/progress/);
  assert.match(course, /Merge this device’s progress/);
  assert.match(course, /Saved on this device/);
  assert.match(course, /48 core iOS and SwiftUI lessons/);
  assert.match(course, /8-lesson web-motion track/);
  assert.match(course, /const CORE_LESSON_COUNT = 48;/);
  assert.match(course, /filter\(id => id <= CORE_LESSON_COUNT\)/);
  assert.match(course, /const answerOrders = \[\[0, 1, 2\], \[1, 2, 0\], \[2, 0, 1\]\];/);

  const referenceMap = course.match(
    /const lessonReferences = \{([\s\S]*?)\n {4}\};/,
  )?.[1];
  assert.ok(referenceMap, "core lesson reference map exists");
  const referencedLessonIds = [
    ...referenceMap.matchAll(/^\s+(\d+):\s*\[/gm),
  ].map((match) => Number(match[1]));
  assert.deepEqual(
    referencedLessonIds,
    Array.from({ length: 48 }, (_, index) => index + 1),
    "all 48 core iOS lessons have an explicit evidence entry",
  );
  assert.match(course, /Evidence &amp; further reading/);

  const script = course.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(script, "course script exists");
  assert.doesNotThrow(() => new Function(script), "course script parses");
});

test("ships product-specific responsive and reduced-motion styling", async () => {
  const [css, page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /animation-timeline: scroll\(root block\)/);
  assert.match(css, /animation-timeline: view\(block\)/);
  assert.match(css, /@keyframes hero-enter/);
  assert.doesNotMatch(css, /@keyframes curriculum-progress/);
  assert.doesNotMatch(css, /\.curriculum-list::after/);
  assert.doesNotMatch(css, /@keyframes reveal-slide[\s\S]{0,220}translateX/);
  assert.match(css, /\.skip-link/);
  assert.match(css, /--font-display:/);
  assert.match(css, /--orange:\s*#ff4f00/);
  assert.match(page, /getChatGPTUser/);
  assert.match(page, /MotionLabPreview/);
  assert.match(page, /className="scroll-progress"/);
  assert.match(page, /Made by Saksham Virmani\./);
  assert.match(page, /https:\/\/sakshamvirmani\.com/);
  assert.match(page, /<strong>\$0<\/strong>/);
  assert.doesNotMatch(page, /Made by Saksham Virmani in India/);
  assert.match(page, /Apple documentation and WWDC sources/);
  assert.match(page, /id="main-content"/);
  assert.match(layout, /Skip to main content/);
  assert.match(layout, /href="#main-content"/);
  assert.doesNotMatch(page, /<iframe\b/i);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("validates bounded progress and preserves completion when importing", () => {
  const valid = validateProgressInput({
    current: 4,
    completed: [4, 1, 4],
    quizAnswers: { 1: 2, 4: 0 },
    learning: {
      4: {
        bookmarked: true,
        masteryStage: 3,
        labState: { duration: 650, curve: "smooth" },
      },
    },
    baseRevision: 3,
    mode: "merge",
  });
  assert.equal(valid.ok, true);
  assert.deepEqual(valid.value.completed, [1, 4]);

  const server = {
    ...emptyProgress(),
    current: 8,
    completed: [2, 8],
    quizAnswers: { 2: 1 },
    learning: {},
    revision: 3,
  };
  const merged = mergeProgress(server, valid.value, 1_000);
  assert.deepEqual(merged.completed, [1, 2, 4, 8]);
  assert.equal(merged.current, 8);
  assert.deepEqual(merged.quizAnswers, { 1: 2, 2: 1, 4: 0 });
  assert.equal(merged.learning["4"].bookmarked, true);
  assert.equal(merged.learning["4"].masteryStage, 3);
  assert.equal(merged.learning["4"].reviewDueAt, 259_201_000);

  const legacy = validateProgressInput({
    current: 2,
    completed: [2],
    quizAnswers: {},
    baseRevision: 3,
    mode: "replace",
  });
  assert.equal(legacy.ok, true);
  assert.equal(legacy.value.learning, null, "legacy clients leave learning state untouched");

  const invalid = validateProgressInput({
    current: 99,
    completed: [],
    quizAnswers: {},
    baseRevision: 0,
    mode: "replace",
  });
  assert.deepEqual(invalid, { ok: false, error: "Current lesson is outside the course." });
});

test("ships real persistence, privacy, and open-license artifacts", async () => {
  const [
    hosting,
    schema,
    migration,
    learningMigration,
    privacy,
    sourcesPage,
    sourcePolicy,
    sourceLedger,
    domainAuthDecisions,
    contentLicense,
    softwareLicense,
    contributing,
    securityPolicy,
    conduct,
    thirdPartyNotices,
  ] = await Promise.all([
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_yummy_abomination.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_chilly_karen_page.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sources/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../docs/SOURCE_POLICY.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/SOURCE_LEDGER.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/DOMAIN_AUTH_DECISIONS.md", import.meta.url), "utf8"),
    readFile(new URL("../CONTENT_LICENSE.md", import.meta.url), "utf8"),
    readFile(new URL("../LICENSE", import.meta.url), "utf8"),
    readFile(new URL("../CONTRIBUTING.md", import.meta.url), "utf8"),
    readFile(new URL("../SECURITY.md", import.meta.url), "utf8"),
    readFile(new URL("../CODE_OF_CONDUCT.md", import.meta.url), "utf8"),
    readFile(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8"),
  ]);

  assert.match(hosting, /"d1":\s*"DB"/);
  assert.match(schema, /learnerProfiles/);
  assert.match(schema, /lessonProgress/);
  assert.match(schema, /quizProgress/);
  assert.match(schema, /lessonLearningState/);
  assert.match(migration, /CREATE TABLE `learner_profiles`/);
  assert.match(learningMigration, /CREATE TABLE `lesson_learning_state`/);
  assert.match(privacy, /permanently delete all account-tied Motion Atlas progress/);
  assert.match(sourcesPage, /credit by\s*itself is never treated as permission/);
  assert.match(sourcePolicy, /Learn from sources; do not reproduce their expression/);
  assert.match(sourceLedger, /Third-party tutorial code pasted into lesson examples: none identified/);
  assert.match(domainAuthDecisions, /motionatlas\.chatgpt\.site.*cannot be promised/s);
  assert.match(domainAuthDecisions, /Google OAuth, email magic links/);
  assert.match(contentLicense, /Creative Commons Attribution 4\.0 International/);
  assert.match(softwareLicense, /MIT License/);
  assert.match(contributing, /do not copy another course's wording/i);
  assert.match(securityPolicy, /Report a vulnerability/);
  assert.match(conduct, /beginner questions/);
  assert.match(thirdPartyNotices, /No third-party tutorial prose/);
});

test("ships one typed registry with stable native lesson routes", async () => {
  const registry = JSON.parse(
    await readFile(new URL("../content/course.json", import.meta.url), "utf8"),
  );
  assert.equal(registry.lessons.length, 56);
  assert.equal(registry.lessons.filter((lesson) => lesson.track === "ios").length, 48);
  assert.equal(registry.lessons.filter((lesson) => lesson.track === "web").length, 8);
  assert.equal(new Set(registry.lessons.map((lesson) => lesson.id)).size, 56);
  assert.equal(new Set(registry.lessons.map((lesson) => lesson.slug)).size, 56);
  assert.equal(registry.glossary.length, 58);
  assert.ok(
    registry.lessons
      .filter((lesson) => lesson.track === "ios")
      .every((lesson) => lesson.sources.length > 0),
  );

  const libraryResponse = await render({}, "/learn");
  assert.equal(libraryResponse.status, 200);
  const library = await libraryResponse.text();
  assert.match(library, /Learn motion by making it respond/);
  assert.match(library, /Welcome to Motion Atlas/);
  assert.match(library, /Search lessons/);

  const lessonResponse = await render({}, "/learn/welcome-to-motion-atlas");
  assert.equal(lessonResponse.status, 200);
  const lesson = await lessonResponse.text();
  assert.match(lesson, /Mental model/);
  assert.match(lesson, /Live motion laboratory|Interactive state laboratory/);
  assert.match(lesson, /Evidence and further reading/);

  const sitemapResponse = await render({}, "/sitemap.xml");
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  assert.match(sitemap, /motion-atlas-swiftui-course\.saksham-virmani\.chatgpt\.site\/learn\/welcome-to-motion-atlas/);

  const robotsResponse = await render({}, "/robots.txt");
  assert.equal(robotsResponse.status, 200);
  const robots = await robotsResponse.text();
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Sitemap: https:\/\/motion-atlas-swiftui-course\.saksham-virmani\.chatgpt\.site\/sitemap\.xml/);
});
