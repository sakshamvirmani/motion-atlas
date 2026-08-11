# Motion Atlas project guide

## Product contract

Motion Atlas is a free, beginner-first learning product for iOS animation with SwiftUI. A learner who has never coded should be able to begin here, build a correct mental model of apps and SwiftUI, practice motion in interactive labs, and eventually ship production-quality animated interfaces.

The primary course is iOS and SwiftUI only. Web scroll motion, Motion for React, Framer, and GSAP belong in a visibly separate optional bonus track and do not count toward iOS course completion.

The public site is hosted with OpenAI Sites:

- Project ID: `appgprj_6a7aa73d54b08191827fabda3eba315c`
- Public URL: `https://motion-atlas-swiftui-course.saksham-virmani.chatgpt.site`
- Access mode: public

The public source repository is `https://github.com/sakshamvirmani/motion-atlas`.
Keep a visible source link in both the landing header and footer. The social
preview asset is `public/og.png` at 1200x630 and must remain paired with the
Open Graph and `summary_large_image` metadata in `app/layout.tsx`. The pinned
vinext runtime does not currently emit its Metadata API output in rendered HTML,
so the root layout owns explicit server-rendered social tags and keeps an empty
Metadata API hook to satisfy the runtime's metadata route slots without duplicate
tags or browser warnings. Recheck both paths before replacing this compatibility
layer during a vinext upgrade.

Never put credentials, auth client secrets, or private user data in source files or public output.

## Resume order

When continuing work after a new session or context compaction, read these files in order:

1. `AGENTS.md`
2. `docs/STATUS.md`
3. `docs/MASTER_PLAN.md`
4. The phase-specific design or research document linked from `docs/STATUS.md`

Update `docs/STATUS.md` whenever a milestone starts, completes, or changes. Record durable project facts and gotchas in this file.

## Current architecture and migration rule

The native root route is a server-rendered product landing page. The canonical
course registry is `content/course.json`, validated and exported by
`content/course.ts`. It drives landing counts, `/learn`, all 56 stable
`/learn/[lesson]` routes, search, modules, quizzes, labs, sources, and review.
The registry contains 48 core iOS/SwiftUI lessons plus eight optional web-motion
lessons.

`public/motion-atlas-course.html` is a read-only compatibility and migration
source while native lab and legacy-progress parity are verified. Never edit it
as a second content source. `scripts/extract-legacy-course.mjs` exists for the
recorded extraction workflow, not for routine two-way synchronization.

Native guest progress uses `motion-atlas-native-v1` and defensively reads the
legacy `motion-atlas-v2` state. Signed-in progress uses Sites identity, a
per-account local cache, and D1. Current sync includes lesson position,
completion, quiz selections, bookmarks, self-assessed mastery stages,
server-calculated review dates, and bounded lab controls. The owner has completed
the real Sites sign-in flow, and a write/reload/direct-account-read matrix proves
same-context production D1 persistence. An independent two-context convergence
check must still be recorded before cross-device sync is called proven.

The current Sites/vinext production runtime has a confirmed `next/link` client
compatibility failure: its Link chunk throws during hydration and leaves real
routes visibly unresponsive. Use ordinary semantic `<a href>` navigation for
this project until the runtime is upgraded and the production Link path is
explicitly re-verified.

The original copy under `/Users/sakshamvirmani/Developer/html-doc/` is outside this repository and must not be edited without explicit scope and filesystem approval.

## Identity and progress decision

Use a guest-first model:

- Anyone can browse and begin learning without an account.
- Guest progress is saved locally and must survive reloads.
- A real optional `Sign in with ChatGPT` action enables account-tied, cross-device progress.
- Do not build passwords, password resets, email verification, or a custom auth database.
- Use the existing Sites auth helpers in `app/chatgpt-auth.ts` and the platform routes `/signin-with-chatgpt` and `/signout-with-chatgpt`.
- Authenticated persistence uses the Cloudflare D1 `DB` binding.
- On first sign-in, offer a one-time import of legacy or guest progress. Completed lessons merge by union; no completed lesson is lost. The newest explicit lesson position wins. Import must be idempotent.
- Learners must be able to export and delete their saved progress.

See `docs/DATA_AUTH_ARCHITECTURE.md` for the schema, endpoints, merge behavior, validation, privacy, and tests.

## Content quality contract

Every published lesson must meet `docs/CONTENT_STANDARD.md`. In particular:

- State a concrete observable outcome and prerequisites.
- Teach the mental model before syntax.
- Include a prediction, an interactive or Xcode exercise, a worked example, a faded variation, a retrieval prompt, and an independent transfer task.
- Include code that is compile-checked with the stated stable Xcode and iOS target.
- Explain state ownership, animation scope, interruption behavior, identity, Reduce Motion, and performance when relevant.
- Cite first-party Apple documentation for technical claims. Third-party sources can add perspective but cannot replace primary evidence.
- Show API availability and a last-verified date.
- Never use fake testimonials, fake learner counts, fake completion statistics, or placeholder lessons.
- External sources are reference-only by default. Follow `docs/SOURCE_POLICY.md` and update `docs/SOURCE_LEDGER.md` before any quotation, code reuse, media reuse, or licensed adaptation ships.
- Original software and code samples are MIT licensed. Original non-code educational content is CC BY 4.0. Never imply that third-party sources, names, trademarks, or linked material inherit those licenses.

## Visual and interaction direction

The product should feel like a premium learning instrument, not a generic course template. The approved direction is an editorial, Apple-adjacent instrument panel with high typographic contrast, mineral paper tones, dark ink, precise orange accents, thin rules, useful diagrams, and motion used to clarify state.

Design constraints:

- Preserve strong hierarchy and generous negative space.
- Avoid a dashboard made from interchangeable rounded cards.
- Use containers only when they clarify grouping or interaction.
- Keep corner radii restrained and consistent.
- Avoid excessive pills, gradients, floating blobs, stock illustrations, and decorative animation.
- Prefer bespoke diagrams and live manipulable examples over generic hero art.
- Every animation must be interruptible where practical and have a meaningful reduced-motion behavior.
- The landing page may be expressive. Lesson reading surfaces prioritize focus, scanability, and calm.
- Mobile is a first-class layout, not a scaled-down desktop.

The design benchmark includes the current Recent website gallery. Borrow principles such as restrained chrome, strong editorial spacing, dense but orderly browsing, and content-forward previews. Do not copy any featured site.

## Accessibility and performance gates

- Support keyboard navigation, visible focus, semantic headings, landmarks, labels, and non-gesture alternatives.
- Support large text without clipping or hidden controls.
- Respect `prefers-reduced-motion` on the web and teach `accessibilityReduceMotion` in SwiftUI.
- Do not use color or motion as the only carrier of meaning.
- Ambient autoplay may be used for a short landing-page demonstration when it
  pauses on pointer hover and keyboard focus, exposes a replay control, and
  becomes static under Reduced Motion. Lesson labs remain learner-controlled.
- Target WCAG 2.2 AA for the website.
- Keep primary lesson content readable before client JavaScript hydrates.
- Avoid full-page scroll hijacking and long main-thread animation work.

## Research and freshness

`docs/RESEARCH_BENCHMARK.md` is a dated industry map, not a claim to have found every course on the internet. Update it when a major source changes. `docs/CURRICULUM_MAP.md` maps the benchmark to Motion Atlas coverage.

Technical source priority:

1. Apple documentation, Human Interface Guidelines, sample code, and WWDC sessions
2. Runtime authors for third-party tools such as Lottie and Rive
3. Maintainer documentation and source repositories
4. High-quality courses and community explanations as secondary perspective

## Commands and verification

Run from the repository root:

```sh
npm run dev
npm run typecheck
npm run lint
npm test
```

Before publishing a meaningful change:

1. `npm run lint` passes.
2. `npm test` passes and tests describe the actual product, not the old starter.
3. Production build passes.
4. Browser QA covers landing, navigation, one complete lesson flow, guest progress reload, signed-in progress when available, keyboard focus, desktop, calibrated mobile width, reduced motion, and console errors.
5. All new Swift snippets or sample projects are compiled against the stated stable Xcode toolchain.
6. The deployed public URL is rechecked after publishing.

The release baseline and remaining gates are recorded in `docs/STATUS.md`; do not
repeat stale command results here. The product test suite now covers the native
landing, real identity states, the legacy course contract, progress validation,
the 48-lesson evidence map, persistence artifacts, and licensing artifacts.

## Change boundaries

- Preserve unrelated user changes in a dirty checkout.
- Use path-scoped edits and report exact files changed.
- Never permanently delete with `rm`; move material files to Trash if deletion is explicitly needed.
- Do not mutate the live deployment until the local acceptance gates for that phase pass.
- Do not claim account sync is live until D1 is provisioned, migrations are applied, authenticated browser QA passes, and the deployed site is verified.
