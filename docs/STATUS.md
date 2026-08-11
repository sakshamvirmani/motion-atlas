# Motion Atlas implementation status

Last updated: 2026-08-11

## Current milestone

Milestones 2, 3, and 5: canonical content, native learning routes, and the first
learning-engine slice.

Status: released publicly. The GitHub repository and Sites version 4 are live
from the exact validated product commit recorded below.

The existing public URL is intentionally preserved. The standalone course stays
available as a compatibility surface until native lab and legacy-progress parity
are verified, but it is no longer an editable source of truth.

## Confirmed local product state

- `content/course.json` is the canonical 56-lesson registry, validated and
  exported by `content/course.ts`.
- The registry contains 48 required iOS/SwiftUI lessons and eight visibly
  separate optional web-motion lessons.
- `/learn` is a native searchable course home with track filters, saved-only
  filtering, module navigation, current lesson, honest completion, bookmarks,
  and review count.
- Every lesson has a stable `/learn/[lesson]` route with server-rendered lesson
  content, mental model, exercise, live lab, retrieval check, explanation,
  teach-back prompt, source links, and previous/next navigation.
- `/review` provides transparent due and upcoming intervals without streak
  punishment.
- Guest state covers current lesson, completion, quiz selection, bookmark,
  mastery stage, review date, and bounded lab controls.
- Optional account state uses Sites identity, an account-scoped browser cache,
  and D1. The same learning fields are included in export and deletion.
- Guest-to-account import is explicit and completion-preserving.
- Landing typography now uses one coherent Apple/system sans family. Display
  scale, line height, and tracking are calibrated without the previous narrow
  Arial/Georgia mixture.
- The price fact is `$0`, and the creator credit links to
  `https://sakshamvirmani.com`.
- The awkward curriculum path animation is removed. Remaining scroll reveals
  are restrained, do not draw over curriculum rows, and do not create
  horizontal overflow.
- Sitemap and robots metadata expose public learning routes while excluding
  account and API surfaces from indexing.
- The project includes public contribution, conduct, security, issue-template,
  source-policy, and dual-license documentation.

## Local browser evidence

Verified on 2026-08-11:

- Desktop landing at 1910 CSS pixels: no horizontal overflow, coherent system
  typography, `$0`, correct portfolio link, and no curriculum pseudo-path.
- Course search for `spring` returns the three relevant registered lessons.
- Bookmark state survives reload and updates the course overview.
- Lesson 2 lab switches to the Spring timing rule and visibly changes state.
- The lab's Reduce Motion simulation removes spatial transition time while
  preserving the endpoint.
- Correct retrieval feedback appears, completion and mastery persist across
  reload, and the lesson enters the upcoming review queue.
- Calibrated 389 CSS-pixel checks pass with zero horizontal overflow on landing,
  course, and lesson routes; the lab is 350 pixels wide inside the mobile
  lesson layout.
- Mobile course navigation retains Course, Review, and Account access; Sources
  remains reachable from the landing/footer and desktop rail.
- Semantic main landmarks, labeled controls, a global visible focus treatment,
  and a skip-to-content link are present.

The in-app browser's raw screenshot output has a device-scale rendering artifact
when its physical viewport is reduced, so overflow conclusions use calibrated
CSS viewport and DOM geometry in addition to the visual image.

## Automated verification

Final local pre-release run on 2026-08-11:

- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm test`: passed with a successful production worker build and 7/7
  product tests
- `npm audit --omit=dev`: passed with zero reported vulnerabilities

## Public release evidence

Verified on 2026-08-11:

- Public GitHub repository:
  `https://github.com/sakshamvirmani/motion-atlas`
- GitHub default branch: `main`; repository visibility: public
- Sites version: 4
- Validated and deployed commit:
  `ac2c3c80bf0ca954cd57361e09ab6c65518d0f0a`
- Sites deployment:
  `appgdep_6a7ae71bb4288191a3c12c8b6290384c`
- Public URL:
  `https://motion-atlas-swiftui-course.saksham-virmani.chatgpt.site`
- Public smoke checks passed for landing, course, lesson, review, privacy,
  sources, sign-in, sitemap, robots, and the guest identity API.
- The landing page exposes `$0`, the portfolio link, and the native learning
  route; the sitemap exposes all 56 lesson URLs.
- Production worker inspection found no runtime crash. Two JavaScript asset
  paths appeared as transient 404 probes in recent logs, and direct production
  checks immediately afterward returned `200 text/javascript` for both paths.

## Previous published rollback baseline

- Sites version: 3
- Commit: `9a399cfad4fbad6d69436903d7742776183007da`
- Deployment: `appgdep_6a7abaea77688191a2dc602c360c1c07`
- Public URL:
  `https://motion-atlas-swiftui-course.saksham-virmani.chatgpt.site`
- The public Sign in with ChatGPT action reaches OpenAI's real login screen,
  which offers OpenAI's current account choices. No credentials were entered by
  the development agent.

## Release gates

- [x] Canonical registry, native course route, stable lesson routes, and review queue
- [x] Bookmarks, mastery, review dates, and lab-state persistence
- [x] Typography, price, portfolio-credit, and curriculum-motion repairs
- [x] Calibrated desktop/mobile overflow and complete guest lesson-flow QA
- [x] Sitemap, robots, skip navigation, public contribution/security documentation
- [x] Final lint, TypeScript, production build, tests, and production dependency audit
- [x] Publish and verify the public GitHub repository
- [x] Package and deploy the exact validated commit to the existing Sites project
- [x] Smoke-check landing, course, lesson, review, sitemap, privacy, sources, and guest API publicly
- [ ] Complete a real account session and verify production D1 persistence
- [ ] Verify same-account convergence in two independent browser/device contexts

## Known limits—not hidden as done

- True account persistence and two-context convergence require the owner to
  complete real OpenAI authentication. The agent will not enter or handle those
  credentials.
- The 56 current lesson routes are usable, but the deeper curriculum rebuild,
  concept graph, varied review prompts, and full worked-example fading remain
  future milestones.
- Swift snippets are not yet covered by a complete published stable-Xcode and
  deployment-target compile matrix.
- Physical-device, VoiceOver, large-text, OS-level Reduce Motion, and real
  offline/reconnect QA remain distinct from browser semantic and responsive
  proof.
- `public/motion-atlas-course.html` remains a compatibility route until parity is
  proven. New content must not be edited there.
- The research benchmark is broad and dated, not a literally exhaustive claim
  about every private, regional, unpublished, or newly released course.

## Resume pointer

Read `AGENTS.md`, this file, and `docs/MASTER_PLAN.md`. Perform the
owner-authenticated production matrix next. After that, continue the depth and
Swift compile campaign rather than adding more surface-level lesson count.
