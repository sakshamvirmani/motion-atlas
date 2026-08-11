import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  emptyProgress,
  mergeProgress,
  validateProgressInput,
} from "../lib/progress.ts";

async function render(requestHeaders = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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
  assert.match(html, /\/signin\?return_to=%2Fmotion-atlas-course\.html/);
  assert.match(html, /href="\/motion-atlas-course\.html"/);
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
  const [css, page, packageJson] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /animation-timeline: scroll\(root block\)/);
  assert.match(css, /animation-timeline: view\(block\)/);
  assert.match(css, /@keyframes hero-enter/);
  assert.match(css, /@keyframes curriculum-progress/);
  assert.match(css, /--orange:\s*#ff4f00/);
  assert.match(page, /getChatGPTUser/);
  assert.match(page, /MotionLabPreview/);
  assert.match(page, /className="scroll-progress"/);
  assert.match(page, /Made by Saksham Virmani\./);
  assert.doesNotMatch(page, /Made by Saksham Virmani in India/);
  assert.match(page, /Apple documentation and WWDC sources/);
  assert.doesNotMatch(page, /<iframe\b/i);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("validates bounded progress and preserves completion when importing", () => {
  const valid = validateProgressInput({
    current: 4,
    completed: [4, 1, 4],
    quizAnswers: { 1: 2, 4: 0 },
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
    revision: 3,
  };
  const merged = mergeProgress(server, valid.value);
  assert.deepEqual(merged.completed, [1, 2, 4, 8]);
  assert.equal(merged.current, 8);
  assert.deepEqual(merged.quizAnswers, { 1: 2, 2: 1, 4: 0 });

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
    privacy,
    sourcesPage,
    sourcePolicy,
    sourceLedger,
    domainAuthDecisions,
    contentLicense,
    softwareLicense,
  ] = await Promise.all([
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_yummy_abomination.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sources/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../docs/SOURCE_POLICY.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/SOURCE_LEDGER.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/DOMAIN_AUTH_DECISIONS.md", import.meta.url), "utf8"),
    readFile(new URL("../CONTENT_LICENSE.md", import.meta.url), "utf8"),
    readFile(new URL("../LICENSE", import.meta.url), "utf8"),
  ]);

  assert.match(hosting, /"d1":\s*"DB"/);
  assert.match(schema, /learnerProfiles/);
  assert.match(schema, /lessonProgress/);
  assert.match(schema, /quizProgress/);
  assert.match(migration, /CREATE TABLE `learner_profiles`/);
  assert.match(privacy, /permanently delete all account-tied Motion Atlas progress/);
  assert.match(sourcesPage, /credit by\s*itself is never treated as permission/);
  assert.match(sourcePolicy, /Learn from sources; do not reproduce their expression/);
  assert.match(sourceLedger, /Third-party tutorial code pasted into lesson examples: none identified/);
  assert.match(domainAuthDecisions, /motionatlas\.chatgpt\.site.*cannot be promised/s);
  assert.match(domainAuthDecisions, /Google OAuth, email magic links/);
  assert.match(contentLicense, /Creative Commons Attribution 4\.0 International/);
  assert.match(softwareLicense, /MIT License/);
});
