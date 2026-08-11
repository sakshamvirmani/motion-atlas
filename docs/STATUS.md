# Motion Atlas implementation status

Last updated: 2026-08-11

## Current milestone

Milestones 2, 3, and 5: canonical content, native learning routes, and the first
learning-engine slice.

Status: released publicly. Sites version 7 contains the navigation, account
transparency, abuse-resistance, responsive-source-navigation, branded-favicon,
and motion repair described below.

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
- The private account page identifies the exact Sites identity fields the app
  reads and exposes the saved learning snapshot as readable JSON. D1 does not
  store the account email.
- Primary application routes use resilient semantic anchors because the current
  production vinext `next/link` client chunk throws during hydration.
- Signed-in mutations have bounded payload validation and D1-backed per-account
  rate limits. These reduce application abuse without claiming to prevent every
  denial-of-service attack.
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
- The landing header and footer expose the public GitHub source repository, and
  the site publishes a dedicated 1200x630 Open Graph/X large-image card.

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
- Mobile course navigation retains Course, Review, Account, and Sources access.
  The landing footer also keeps Sources and Privacy visible below desktop width.
- Semantic main landmarks, labeled controls, a global visible focus treatment,
  and a skip-to-content link are present.
- The landing hero loops continuously, pauses on focus, and resumes; its
  Reduced Motion path is static. A separate scroll-linked motion instrument
  visibly changes position, scale, shape, and rotation with page progress.
- Landing to course, course to review, course to sources, wordmark to home, and
  course to lesson all complete real document navigation.
- The new bookmark label explains that it saves a lesson for later without
  marking completion or mastery, and the bookmarked state survives reload.
- The local browser console remained free of warnings and errors across the
  repaired route matrix.

The in-app browser's raw screenshot output has a device-scale rendering artifact
when its physical viewport is reduced, so overflow conclusions use calibrated
CSS viewport and DOM geometry in addition to the visual image.

## Automated verification

Final local pre-release run on 2026-08-11:

- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm test`: passed with a successful production worker build and 8/8
  product tests
- `npm audit --omit=dev`: passed with zero reported vulnerabilities

## Public release evidence

Verified on 2026-08-11:

- Public GitHub repository:
  `https://github.com/sakshamvirmani/motion-atlas`
- GitHub default branch: `main`; repository visibility: public
- Draft review pull request for this release:
  `https://github.com/sakshamvirmani/motion-atlas/pull/1`
- Sites version: 7
- Validated and deployed commit:
  `8ada4f75a1f47738100199fb7e2baa4db2eb70ae`
- Sites deployment:
  `appgdep_6a7b063c6f5481919223a864329e3fe7`
- Public URL:
  `https://motion-atlas-swiftui-course.saksham-virmani.chatgpt.site`
- Public smoke checks passed for landing, course, lesson, review, privacy,
  sources, account, sign-in, sitemap, robots, and the identity/progress path.
- The landing page exposes `$0`, the portfolio link, and the native learning
  route; the sitemap exposes all 56 lesson URLs.
- Wordmark, account, review, sources, privacy, course, and lesson navigation all
  completed real production route changes at the calibrated browser width.
- The owner-authenticated D1 round trip is proven. A temporary lesson 2 bookmark
  reached `Saved with your account`, survived reload, and appeared in the
  account page's direct progress JSON with revision 4 and bookmarked IDs 1 and
  2. The test bookmark was removed, resynced, and the account returned to its
  original one-bookmark state.
- Version 7 produced no fresh browser console warnings or errors during the
  final signed-in route and persistence smoke, and the final worker error query
  returned zero events. `/favicon.ico` redirects to the branded SVG instead of
  returning the previous 404.

## Previous published rollback baseline

- Sites version: 6
- Commit: `14b9e243131f85d027b8d8aa8fdf30f88b478a91`
- Deployment: `appgdep_6a7b050a2d6c81919733d59c4915f997`
- Public URL:
  `https://motion-atlas-swiftui-course.saksham-virmani.chatgpt.site`
- This version contains the navigation, account, motion, bot-resistance, and
  responsive-source repairs. Version 7 adds the branded favicon and
  `/favicon.ico` compatibility response.

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
- [x] Complete a real account session and verify production D1 persistence
- [ ] Verify same-account convergence in two independent browser/device contexts

## Known limits—not hidden as done

- The owner has completed real OpenAI authentication and same-context D1
  persistence is proven. Same-account convergence in a genuinely independent
  browser or device context remains open; the agent will not enter, expose, or
  handle account credentials.
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

Read `AGENTS.md`, this file, and `docs/MASTER_PLAN.md`. Perform the independent
same-account convergence check next. After that, continue the depth and Swift
compile campaign rather than adding more surface-level lesson count.
