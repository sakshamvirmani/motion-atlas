# Motion Atlas implementation status

Last updated: 2026-08-11

## Current milestone

Milestone 11: publish and verify the validated compatibility release.

Status: local implementation is complete; public deployment and production
identity/D1 smoke testing are in progress.

This release is a strong compatibility step, not the end of the master plan.
The standalone course remains the lesson renderer while typed content and native
lesson routes are built in Milestones 2 and 3.

## Confirmed local state

- The root route is a native, server-rendered Motion Atlas landing page with no
  iframe.
- The standalone course remains reachable at `/motion-atlas-course.html` and
  retains the existing `motion-atlas-v2` guest storage key.
- The current library has 48 core iOS/SwiftUI lessons and eight clearly marked
  optional web-motion lessons, each with a quiz and interactive lab type.
- All 48 core iOS lessons have an explicit evidence-map entry; technical
  references prefer Apple documentation, WWDC, and runtime-author sources.
- Core completion is calculated from 48 iOS lessons; the web track cannot
  inflate iOS completion.
- Guests can learn without an account. Optional Sign in with ChatGPT uses the
  Sites identity headers and platform routes rather than fake credentials.
- Authenticated progress uses a D1 `DB` binding with bounded IDs and payloads,
  revision conflicts, guest import, export, and exact-confirmation deletion.
- Local authenticated API probes verified write, read, conflict, merge, export,
  rejected deletion, successful deletion, and empty state after deletion.
- Account-specific browser storage is namespaced by a hashed account key so one
  signed-in learner's cached state is not shown to another.
- Software and code examples are MIT licensed. Original non-code course content
  is CC BY 4.0. Third-party material remains excluded and reference-only unless
  an exact permission is recorded.
- Product naming and authentication decisions are recorded in
  `docs/DOMAIN_AUTH_DECISIONS.md`.

## Completed work

- [x] Evidence-backed course and documentation benchmark
- [x] Durable master plan, curriculum map, content standard, and data design
- [x] Premium native landing page and responsive/reduced-motion styling
- [x] Purposeful landing motion: sequenced hero entry, one-time live-lab
  demonstration, scroll progress, view-linked reveals, curriculum path drawing,
  and tactile child-level hover feedback
- [x] Real guest and authenticated landing states
- [x] Real sign-in explanation, account, privacy, sources, not-found, and error routes
- [x] D1 schema, generated migration, and runtime schema safety initializer
- [x] Validated progress read/write/merge/conflict/export/delete endpoints
- [x] Guest-to-account import and truthful save/sync/offline status labels
- [x] Separate 48-lesson iOS completion from the eight-lesson web track
- [x] Evidence links for every current core iOS lesson
- [x] MIT/CC BY licensing, originality policy, and source/reuse ledger
- [x] Browser verification of landing, sign-in explanation, course navigation,
  and guest progress across reload
- [x] Authenticated local API and account-page verification with test identity
- [x] Production dependency audit reported zero known production vulnerabilities

## Current verification gates

- [x] Final lint, TypeScript, production build, and product test run after the
  evidence-map and licensing additions
- [ ] Package and deploy the exact validated commit to the existing Sites project
- [ ] Verify the deployed landing, course, privacy, sources, and guest API state
- [ ] Verify real public Sign in with ChatGPT and production account persistence
  if the platform session can complete without the owner's intervention
- [ ] Record the deployment ID, commit, and any remaining device-only proof

## Known limits—not hidden as “done”

- True two-browser or two-device convergence with one real account is not proven
  until the public deployment is exercised in two independent contexts.
- The browser viewport override available in the current QA environment did not
  produce a calibrated narrow viewport. Responsive CSS and static checks pass,
  but a real narrow browser/device visual pass remains open.
- Current cloud sync covers lesson position, completion, and quiz answers. The
  planned mastery engine, bookmarks, lab-state outbox, and spaced-review model
  are later milestones.
- The course still lives in a large standalone HTML document. Canonical typed
  content and native lesson routes remain Milestones 2 and 3.
- The repository has open licenses but has not yet been announced or verified as
  a public source-code repository.
- The research benchmark is broad and dated, not a literally exhaustive claim
  about every private, regional, unpublished, or newly released course.

## Resume pointer

Read `AGENTS.md`, this file, and `docs/MASTER_PLAN.md`. If deployment completed,
start Milestone 2 by freezing the 56 legacy IDs and extracting typed content.
Do not expand cloud-progress claims until the real deployed SIWC and cross-device
matrix are recorded here.
