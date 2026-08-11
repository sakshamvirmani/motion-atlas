# Motion Atlas master plan

Plan version: 1

Last updated: 2026-08-11

## Mission

Build the strongest free, evidence-backed learning product for iOS animation with SwiftUI: approachable from zero, deep enough for production work, visually exceptional, interactive, accessible, current, and honest about what has been verified.

The plan is intentionally stored in the repository so execution survives chat compaction, agent changes, and long pauses.

## Definition of done

Motion Atlas reaches its first industry-level release when all of the following are true:

- A visitor understands the promise, outcomes, curriculum, prerequisites, and free access from the landing page.
- Anyone can begin without an account.
- Real Sign in with ChatGPT works on the deployed public site.
- Signed-in progress survives a second browser or device and guest work imports without loss.
- The required iOS path is complete from absolute beginner through a profiled, accessible SwiftUI capstone.
- Web motion is available as a separate optional track and does not blur the iOS promise.
- Every published lesson meets `docs/CONTENT_STANDARD.md`.
- Every technical lesson has primary sources, availability metadata, and a last-reviewed date.
- Every Swift sample is compile-checked under its declared stable Xcode toolchain.
- Every meaningful motion example has a reduced-motion behavior and interruption test.
- Stable lesson URLs, search metadata, sitemap, keyboard navigation, mobile layout, and WCAG 2.2 AA checks pass.
- Lint, unit, content-schema, database, build, and browser tests pass.
- The deployed public URL is verified after release.
- A dated research and API maintenance process is visible and repeatable.

## Product decisions already made

1. **Primary focus:** iOS animation with SwiftUI.
2. **Web content:** separate optional bonus track.
3. **Access:** free and public.
4. **Account:** optional, not required to begin.
5. **Authentication:** Sites-provided Sign in with ChatGPT, never a custom password system.
6. **Persistence:** local guest state plus authenticated D1 sync.
7. **Content source:** one typed canonical registry, not duplicated HTML.
8. **Design:** premium editorial learning instrument, not a generic card dashboard.
9. **Evidence:** first-party Apple sources for technical claims.
10. **Learning model:** worked examples, fading, transfer, retrieval, spacing, and immediate explanatory feedback.
11. **Marketing:** no fake testimonials, fake activity, hand-written counts, or unprovable “best” claims.
12. **Originality:** learn from external sources without copying their expression; reuse requires a recorded license or written permission for the exact use.
13. **Open licensing:** original software and code samples are MIT; original non-code course content is CC BY 4.0; third-party material is excluded and remains under its own terms.

## Current baseline and audit

The initial audit on 2026-08-11 confirmed:

- Existing public Sites deployment is active.
- Existing standalone course contains 56 lessons, 56 quizzes, and a lab type per lesson.
- Existing design is visually stronger than a generic starter and already includes useful interactive laboratories.
- Guest completion and current lesson survive reload in local storage.
- The root page was only a full-screen iframe wrapper around a large HTML document; Milestone 1 replaced it with a native landing page.
- Individual lessons have no first-class application routes.
- Only 12 lesson declarations originally had explicit source arrays; a centralized evidence map now covers all 48 core iOS lessons as a compatibility step.
- The web bonus originally contributed to the same completion count; current completion is based on the 48 core iOS lessons.
- D1 and account progress were absent; a local D1 implementation now covers lesson position, completion, and quiz answers, pending deployed SIWC and cross-device proof.
- Auth helper code existed but had no user-facing account flow; the current local release includes sign-in explanation, account, export, and deletion flows.
- Both original product tests were stale starter tests; the replacement suite tests the actual product.
- Lint and production build pass.
- The iframe creates poor integration boundaries for auth, metadata, responsive QA, routing, and likely contributes to browser instrumentation noise.

## Milestone overview

| Milestone | Outcome | Status |
| --- | --- | --- |
| 0. Evidence and durable plan | Audit, benchmark, content standard, curriculum, auth architecture, status file | Complete |
| 1. Stabilize and establish landing | Real landing page, actual tests, no iframe at root, legacy course still reachable | Complete locally |
| 2. Canonical content foundation | Typed schemas, source registry, stable slugs, redirects, content checks | Pending |
| 3. Native learning experience | Lesson routes, course home, navigation, search, glossary, responsive lab shell | Pending |
| 4. Real identity and cloud progress | SIWC, D1 migrations, guest import, cross-device sync, export, delete | Local compatibility slice; deployed proof pending |
| 5. Learning engine | Mastery signals, review queue, concept graph, session planner, honest progress | Pending |
| 6. Required curriculum rebuild | Complete 60-lesson required path and module projects | Pending |
| 7. Mastery electives and pattern library | 36 deeper lessons, failure atlas, API reference, technology chooser | Pending |
| 8. Vibe-code studio and capstones | Prompt director, diagnosis tools, three original capstones, verification workflow | Pending |
| 9. Trust, discovery, and polish | Source dashboard, SEO, sharing, social image system, privacy and accessibility pages | Partial: privacy, sources, licensing |
| 10. Full quality campaign | Automated and browser QA, Swift compile matrix, performance and accessibility evidence | Pending |
| 11. Publish and verify | Production migrations, Sites publish, deployed smoke, rollback record | In progress |
| 12. Operate and improve | Feedback, analytics with consent and restraint, quarterly research, annual WWDC audit | Pending |

## Milestone 0: Evidence and durable plan

### Outputs

- `AGENTS.md`
- `docs/STATUS.md`
- `docs/MASTER_PLAN.md`
- `docs/RESEARCH_BENCHMARK.md`
- `docs/CURRICULUM_MAP.md`
- `docs/CONTENT_STANDARD.md`
- `docs/DATA_AUTH_ARCHITECTURE.md`
- Baseline command and browser evidence

### Acceptance

- Every confirmed issue is separated from an inference.
- Research sources have direct URLs and a checked date.
- The plan states what cannot be honestly called exhaustive.
- Auth and progress decisions are specific enough to implement without another product decision.
- The next milestone has exact local gates.

## Milestone 1: Stabilize and establish the landing page

### Goals

- Give public visitors a clear product introduction before the lesson interface.
- Remove the full-screen iframe from the root route.
- Fix the false test suite before deeper architecture work.

### Work

1. Replace the root with a native responsive landing page.
2. Show generated current counts only. Until the canonical registry exists, label the existing material as a preview library rather than making permanent count promises.
3. Explain outcomes, who it is for, how the learning loop works, required versus web bonus paths, and account choice.
4. Add real conditional auth action from `getChatGPTUser()`:
   - guest: `Sign in to sync progress` using `chatGPTSignInPath`;
   - authenticated: real display name, continue action, and account link.
5. Link directly to the existing standalone course as a temporary `Open current course` route. Do not embed it in an iframe.
6. Replace starter tests with landing, metadata, auth-link, and legacy-course availability tests.
7. Remove `react-loading-skeleton` after confirming no source import remains.
8. Update metadata and social copy to match the actual public product.
9. Fix any console or viewport issue reproducible after iframe removal.

### Acceptance

- `npm run lint`, `npm test`, and production build pass.
- Root HTML contains meaningful landing content server-side.
- No iframe exists on the root page.
- Guest and simulated authenticated server-render tests produce the correct real actions.
- Existing course remains usable and guest `motion-atlas-v2` progress is untouched.
- Desktop and calibrated mobile screenshots show no clipping or unintended horizontal scroll.
- Keyboard reaches navigation, primary action, curriculum preview, account action, and footer in a logical order.
- Reduced-motion preference removes ambient landing motion without hiding content.

## Milestone 2: Canonical content foundation

### Goals

- Create one source of truth for the course.
- Make content validation automatic.

### Work

1. Define TypeScript schemas for modules, lessons, concepts, sources, labs, questions, code examples, API availability, and redirects.
2. Create stable descriptive slugs and freeze the 1-to-56 legacy ID map.
3. Extract existing content into structured records without silently rewriting it.
4. Separate 48 iOS lessons from the eight web lessons in the data model.
5. Add build-time validation from `docs/CONTENT_STANDARD.md`.
6. Add source-link checking with bounded network behavior in a maintenance command, not every production request.
7. Generate course counts, prerequisite graph, sitemap inputs, and progress registry from data.
8. Add a content changelog and last-reviewed field.

### Acceptance

- Unique IDs and slugs; no prerequisite cycles.
- Every legacy lesson maps to one or more new records or an explicit retired redirect.
- Every published lesson has required fields and at least one relevant primary source when it makes a technical claim.
- Invalid content fails tests with a precise file and field.
- Landing and course counts come from the registry.

## Milestone 3: Native learning experience

### Goals

- Replace the standalone document with real product routes.
- Keep the strongest parts of the existing visual instrument and labs.

### Routes

- `/learn`
- `/learn/[lesson]`
- `/curriculum`
- `/labs`
- `/glossary`
- `/review`
- `/web-motion` and `/web-motion/[lesson]`

### Work

1. Create a calm course home with next action, progress, due reviews, module map, and bookmarks.
2. Create stable lesson pages with semantic content server-rendered and interactive labs hydrated as client islands.
3. Build course navigation for desktop and mobile, with search and current position.
4. Add command-style search across lesson titles, concepts, glossary, APIs, and failure cases.
5. Add previous and next navigation, module checkpoints, source panel, and lesson version information.
6. Port existing labs into tested React components sharing tokens and controls.
7. Preserve legacy local progress using the frozen redirect map.
8. Retire the standalone HTML only after parity is verified; move it to recoverable archive or Trash according to user scope, never `rm`.

### Acceptance

- All published lessons have unique URLs and metadata.
- Refreshing a lesson route restores the same lesson.
- Content is readable without client-side lab JavaScript.
- Search results are keyboard accessible and point to stable targets.
- The old course's valuable labs and progress survive migration.
- Web motion is visually and mathematically separate from iOS progress.

## Milestone 4: Real identity and cloud progress

Implement `docs/DATA_AUTH_ARCHITECTURE.md` exactly unless the document is deliberately revised first.

### Work

1. Add Drizzle tables and migrations.
2. Bind D1 as `DB` for local and target Sites environments.
3. Build `/account` and minimal `/api/me` behavior.
4. Add validated progress, quiz, lab, review, import, export, and delete handlers.
5. Add client local-first state and a bounded sync outbox.
6. Add explicit guest import and legacy-v2 migration.
7. Add truthful sync status labels.
8. Add privacy page and retention statement.

### Acceptance

- Guest start remains immediate.
- Sign in and sign out use real platform routes.
- Same real account on two browsers converges on lesson completion.
- Import is idempotent and never loses a completed lesson.
- Offline mutation syncs after reconnection.
- Export is complete and deletion removes every learner-owned row.
- Unknown IDs, forged correctness, oversized payloads, and cross-user access are rejected.
- Public deployment passes the complete auth and progress browser matrix.

## Milestone 5: Learning engine

### Work

1. Create concept-level mastery signals separate from “page visited.”
2. Add transparent review stages: same session, 1, 3, 7, 14, and 30 days.
3. Build a daily session planner based on available time, due reviews, and current module.
4. Add prediction recording, retrieval variation, answer explanations, and retry support.
5. Add worked-example fading and layered hints.
6. Add module readiness checks and optional skip diagnostics for experienced learners.
7. Keep all content browseable; recommendations guide rather than punish.

### Acceptance

- Review dates are server-calculated for accounts and locally calculated for guests.
- Answering incorrectly produces correction plus near-term re-retrieval.
- Progress UI distinguishes read, practiced, and demonstrated.
- No streak-loss dark pattern, artificial deadline, or shame language exists.

## Milestone 6: Required curriculum rebuild

Follow `docs/CURRICULUM_MAP.md` and `docs/CONTENT_STANDARD.md`.

### Work order

1. Modules 0 through 3: zero-to-SwiftUI foundations.
2. Module 4: motion design literacy.
3. Modules 5 through 7: core animation, transitions, gestures, and scroll.
4. Module 8 required topics: phase, keyframe, symbols, and technology choice.
5. Module 9 production path.
6. Required capstone sessions.

### Per-module gate

- All lessons source-audited.
- Code compiled on declared toolchain.
- Labs tested on keyboard, touch-width layout, and reduced motion.
- Module project works independently.
- At least one transfer task requires original learner decisions.
- Technical reviewer and beginner-language review complete.

### Release strategy

Publish completed modules as clearly labeled preview releases only if they form a coherent usable sequence. Do not publish placeholder cards for future lessons.

## Milestone 7: Mastery electives and pattern library

### Outputs

- 36 elective lessons from the curriculum map.
- Searchable API atlas.
- Failure atlas organized by symptom.
- Motion pattern library organized by user need, not visual effect name.
- Technology chooser for native SwiftUI, SF Symbols, Lottie, Rive, video, and static vector assets.
- Role-based motion token workbench.

### Acceptance

- Every pattern includes state, event, interpolation, interruption, accessibility, lifetime, and test notes.
- Gallery inspiration is original or appropriately licensed and attributed.
- Advanced visual examples disclose OS and hardware expectations.

## Milestone 8: Vibe-code studio and capstones

### Studio tools

- Behavior-spec builder
- State-machine sketcher
- Motion-role chooser
- Prompt-quality linter
- SwiftUI error translator
- Animation-scope visualizer
- Identity and transition debugger
- Reduce Motion alternative designer
- Performance and interruption test generator

### Guardrails

- Generated prompts must include states, events, target OS, acceptance checks, and accessibility.
- The studio never labels uncompiled output as working code.
- Learners must explain and modify generated code before mastery credit.
- Reference-site exercises teach abstraction and originality, not pixel copying of protected work.

### Capstone acceptance

- Original product concept and visual identity.
- Correct state without animation.
- Motion rationale for every animated moment.
- Repeated-input and interruption tests.
- Reduce Motion, VoiceOver, and large-text checks.
- Physical-device performance evidence for continuous or graphics-heavy work.
- Archive and TestFlight handoff described truthfully; simulator evidence alone is not shipping proof.

## Milestone 9: Trust, discovery, and polish

### Work

- Per-lesson SEO metadata and structured educational data where valid.
- Sitemap, robots, canonical URLs, and share images.
- Public curriculum and source-freshness dashboard.
- About, methodology, changelog, accessibility, privacy, and contribution pages.
- Shareable completion cards generated from real progress without exposing private data.
- Social landing image and a human launch post.
- Optional newsletter only if there is a real storage, unsubscribe, privacy, and anti-abuse implementation.

### Acceptance

- Metadata describes actual content.
- No fake social proof or learner activity.
- All public forms have real storage, validation, rate controls, and owner workflow; otherwise the form is not shipped.

## Milestone 10: Full quality campaign

### Automated gates

- ESLint and TypeScript
- Unit and content-schema tests
- Database migration and merge tests
- Route and server-render tests
- Accessibility checks
- Broken-link and source-freshness maintenance checks
- Swift compile checks across declared availability fixtures
- Build-size and route-budget report

### Browser matrix

- Desktop and narrow mobile
- Guest and authenticated
- Clean state, legacy v2 state, v3 guest state, and cloud state
- Keyboard-only
- Reduced motion
- Large text and browser zoom
- Offline and reconnection
- Rapid repeated input
- Refresh on every major route
- Back and forward navigation
- Console and network errors

### Native sample matrix

- Current stable Xcode
- Declared minimum simulator OS
- Latest simulator OS
- At least one physical iPhone for performance-sensitive capstones
- Reduce Motion on and off
- Large Dynamic Type
- VoiceOver smoke

## Milestone 11: Publish and verify

### Sequence

1. Freeze content and schema version.
2. Back up or export production learner data if any exists.
3. Apply production migrations.
4. Publish through Sites.
5. Confirm the new live version and URL.
6. Run deployed landing, lesson, auth, progress, import, export, delete, metadata, and mobile smoke tests.
7. Record version, migration, test evidence, and rollback target in `docs/STATUS.md`.

No release is “done” at local build. The deployed public URL must be verified.

## Milestone 12: Operate and improve

### Recurring work

- Quarterly competitor and documentation refresh.
- Annual WWDC and stable-Xcode content audit.
- Monthly broken-source check.
- Review support questions and wrong-answer patterns to find unclear lessons.
- Recompile sample catalog after toolchain updates.
- Measure performance budgets after major UI changes.
- Publish a transparent changelog and known-limitations list.

### Analytics principle

If analytics are added, collect the minimum aggregate signals needed to improve lessons. Do not record code typed into labs, private account identifiers, or fine-grained behavior merely because it is technically possible. Document purpose, retention, and opt-out.

## What more can be added after the core is excellent

These are deliberately sequenced after foundational quality so they do not become feature clutter.

### High value

- Downloadable, compile-verified Xcode mini-project for every module
- Public source and freshness dashboard
- Motion critique gallery with before, after, and Reduce Motion comparisons
- Adaptive “explain this compiler error” practice using curated local error cases
- Community-contributed examples through reviewed pull requests, with license and source requirements
- Instructor mode for classrooms with local cohort exports, without exposing student data publicly
- Localization beginning with glossary and captions, then full lessons after review capacity exists

### Valuable but operationally heavier

- Human-reviewed learner showcase
- Optional moderated discussion per concept
- Office-hour or mentor cohorts
- Native companion iOS app for offline lessons and on-device animation labs
- App Clip or playground-style code runner if Apple platform constraints make it reliable

### Do not add yet

- Open public chat
- Unmoderated comments
- User-uploaded arbitrary code execution
- Competitive leaderboards
- Daily streak punishment
- AI-generated lessons published without technical review
- A newsletter form without a real unsubscribe and abuse-prevention system

## Risk register

| Risk | Mitigation |
| --- | --- |
| Scope becomes endless | Required path first; electives and operations have explicit later milestones. |
| Course becomes visually impressive but shallow | Content standard and compile/source gates block publication. |
| Course becomes encyclopedic and overwhelming | Required versus elective layers, prerequisites, progressive disclosure, short sessions. |
| APIs become stale | Availability metadata, quarterly review, annual WWDC audit, compile catalog. |
| Guest progress is lost during rewrite | Frozen legacy map, dual-read migration, one-release backup, browser fixtures. |
| Sync corrupts or overwrites progress | Idempotency, monotonic completion, deterministic merge, revisions, export. |
| Auth adds friction | Guest-first, one real optional provider, return to current lesson. |
| Bots spam new surfaces | No open forms by default; identity, validation, bounds, and rate controls for mutations; moderation before community. |
| Premium design harms usability | Lesson surfaces prioritize reading; mobile, keyboard, reduced-motion, and performance gates. |
| Competitor research leads to copying | Benchmark coverage and pedagogy only; original examples and assets; source and license review. |
| “Best” claims become misleading | Publish measurable evidence and avoid unprovable superlatives. |

## Working protocol

At the start of each milestone:

1. Update `docs/STATUS.md` with the active slice.
2. Reproduce the baseline relevant to that slice.
3. Make the smallest coherent set of changes.
4. Run the milestone acceptance gates.
5. Update durable docs with new facts and commands.
6. Do not begin the next milestone while required gates are red unless the status file records an explicit reason and recovery task.

This plan can change, but changes must be written here before code silently diverges from it.
