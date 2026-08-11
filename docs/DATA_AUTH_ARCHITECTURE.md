# Identity, authentication, and progress architecture

Decision date: 2026-08-11

## Decision

Motion Atlas will be public and guest-first, with optional real account sync.

A mandatory account would create friction before a beginner experiences value. Device-only storage is insufficient for a serious multi-week course. The balanced model is:

```text
Public visitor
  -> starts immediately
  -> guest progress saved locally
  -> may sign in with ChatGPT
  -> one-time guest import
  -> account progress syncs through D1
  -> can export or delete progress
```

This is not a placeholder authentication design. The production sign-in action uses the Sites-provided `Sign in with ChatGPT` flow already supported by `app/chatgpt-auth.ts`.

## What not to build

- No custom passwords.
- No password reset UI.
- No email-verification system.
- No social provider matrix.
- No public username requirement.
- No custom session cookie containing identity.
- No anonymous server-side user fingerprinting.
- No mandatory marketing consent.

Those systems add security and privacy work without improving the learning task.

## User states

### Guest

- Can read every lesson and use every lab.
- Progress and preferences are stored in versioned browser storage.
- Sees a clear local-only label, not an alarming banner.
- Can export a JSON progress file.
- Can sign in at any time and choose to import guest work.

### Authenticated learner

- Identity comes from trusted Sites request headers through `getChatGPTUser()`.
- Sees actual account display name or email returned by the platform.
- Progress, lab state, review schedule, bookmarks, and preferences sync to D1.
- Can continue offline; pending updates retry later.
- Can export data and permanently delete all Motion Atlas learner data.

### Signed out after prior use

- Cloud data remains tied to the account.
- New work on that device becomes guest work unless the learner signs in again.
- Do not silently expose cached account progress to a different signed-in user.

## Authentication routes

Existing helpers:

- `getChatGPTUser()` reads trusted identity headers.
- `requireChatGPTUser(returnTo)` protects account-only pages and handlers.
- `chatGPTSignInPath(returnTo)` produces `/signin-with-chatgpt?return_to=...`.
- `chatGPTSignOutPath(returnTo)` produces `/signout-with-chatgpt?return_to=...`.

Planned product routes:

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Product landing page and course promise. |
| `/learn` | Public | Course home for guest or signed-in learner. |
| `/learn/[lesson]` | Public | Stable lesson route. |
| `/account` | Authenticated | Sync state, export, deletion, and sign-out. |
| `/api/me` | Public response | Returns `{ authenticated: false }` or minimal learner identity. |
| `/api/progress` | Authenticated | Reads the learner's current progress snapshot. |
| `/api/progress/lesson` | Authenticated | Idempotently writes lesson position and status. |
| `/api/progress/quiz` | Authenticated | Records a quiz attempt and updates review state. |
| `/api/progress/lab` | Authenticated | Saves bounded lab state. |
| `/api/progress/import` | Authenticated | One-time, idempotent guest-state merge. |
| `/api/progress/export` | Authenticated | Downloads a learner-readable JSON export. |
| `/api/progress/delete` | Authenticated | Deletes all Motion Atlas learner rows after explicit confirmation. |

Every authenticated handler derives `user_id` from server-side trusted headers. A client-provided user ID must be ignored.

## D1 binding and migrations

Use the existing Drizzle setup and bind Cloudflare D1 as `DB` in `.openai/hosting.json` when the persistence milestone begins.

Requirements:

- Schema changes are migration files committed with the code.
- Migrations are applied before code that depends on them is published.
- Local tests use a real temporary SQLite-compatible database or the Sites D1 test path, not mocked happy-path objects alone.
- Production binding state is verified after deployment.

## Minimal database model

The database stores learning state, not a duplicate auth directory. Email is not required for ownership because the platform user ID is authoritative.

### `learner_profiles`

| Column | Type | Rule |
| --- | --- | --- |
| `user_id` | text primary key | Trusted Sites user ID. |
| `display_name` | text nullable | Convenience snapshot only; never used for authorization. |
| `schema_version` | integer | Current server progress schema. |
| `preferences_json` | text | Validated bounded JSON for learning preferences. |
| `created_at` | integer | Unix milliseconds. |
| `updated_at` | integer | Unix milliseconds. |
| `last_seen_at` | integer | Unix milliseconds. |

### `lesson_progress`

| Column | Type | Rule |
| --- | --- | --- |
| `user_id` | text | Composite primary key with `lesson_slug`. |
| `lesson_slug` | text | Must exist in the canonical lesson registry. |
| `status` | text | `not_started`, `started`, or `completed`. |
| `last_section` | text nullable | Stable section ID, not a pixel scroll offset. |
| `started_at` | integer nullable | First start time. |
| `completed_at` | integer nullable | Latest explicit completion time. |
| `updated_at` | integer | Conflict timestamp assigned by server. |
| `revision` | integer | Monotonic row version for conflict detection. |

Indexes: `(user_id, status)`, `(user_id, updated_at)`.

### `quiz_attempts`

| Column | Type | Rule |
| --- | --- | --- |
| `attempt_id` | text primary key | Client-generated UUID accepted once for idempotency. |
| `user_id` | text | Trusted identity. |
| `lesson_slug` | text | Canonical lesson. |
| `question_id` | text | Canonical question. |
| `selected_answer` | integer | Valid option index. |
| `is_correct` | integer | Computed on server, never trusted from client. |
| `attempted_at` | integer | Server time. |

Indexes: `(user_id, lesson_slug, question_id)`, `(user_id, attempted_at)`.

### `lab_progress`

| Column | Type | Rule |
| --- | --- | --- |
| `user_id` | text | Composite primary key with `lab_id`. |
| `lab_id` | text | Must exist in canonical registry. |
| `state_json` | text | Versioned, validated, and size-limited to 8 KB. |
| `completed_at` | integer nullable | Explicit lab completion. |
| `updated_at` | integer | Server time. |
| `revision` | integer | Monotonic row version. |

### `review_schedule`

| Column | Type | Rule |
| --- | --- | --- |
| `user_id` | text | Composite primary key with `concept_id`. |
| `concept_id` | text | Stable concept registry ID. |
| `stage` | integer | 0 through 5. |
| `due_at` | integer | Server-calculated next review time. |
| `last_result` | text | `again`, `hard`, or `got_it`. |
| `last_reviewed_at` | integer | Server time. |

Initial intervals are transparent: same session, 1 day, 3 days, 7 days, 14 days, and 30 days. A wrong answer returns the concept to the 1-day stage after same-session correction. This can evolve only after observing real learner outcomes.

### `bookmarks`

| Column | Type | Rule |
| --- | --- | --- |
| `user_id` | text | Composite primary key with lesson and target IDs. |
| `lesson_slug` | text | Canonical lesson. |
| `target_id` | text | Stable section, code, or lab ID. |
| `created_at` | integer | Server time. |

Free-form notes are intentionally deferred. They introduce sensitive-content storage, moderation, export, and deletion concerns. Add them only with a separate privacy review.

## Guest storage schema

Use a new key such as `motion-atlas-v3` and preserve the old `motion-atlas-v2` reader during migration.

```ts
type GuestProgressV3 = {
  schemaVersion: 3;
  installationId: string;
  currentLessonSlug: string | null;
  lessons: Record<string, {
    status: "not_started" | "started" | "completed";
    lastSection: string | null;
    updatedAt: number;
  }>;
  quizAttempts: Array<{
    attemptId: string;
    lessonSlug: string;
    questionId: string;
    selectedAnswer: number;
    attemptedAt: number;
  }>;
  labs: Record<string, {
    version: number;
    state: unknown;
    updatedAt: number;
  }>;
  outbox: Array<PendingMutation>;
};
```

Do not store trusted correctness, authorization, email, or account user IDs in guest state.

## Legacy `motion-atlas-v2` migration

The old state contains completed lesson IDs, a current lesson, and quiz answers without robust timestamps.

Migration steps:

1. Read and parse the old key defensively.
2. Validate lesson IDs against a frozen legacy ID-to-slug map.
3. Convert valid completed lessons to `completed` with a migration timestamp.
4. Convert the current lesson to `started` unless already complete.
5. Convert quiz answers to local historical attempts marked `legacy: true`; the server recomputes correctness from the canonical question registry.
6. Write `motion-atlas-v3` before changing or archiving the old key.
7. Keep the old key untouched for one release so migration is recoverable.
8. Record a local migration version, not personal data.

## Guest-to-account import

Import is explicit and idempotent.

1. After the first authenticated load on a device with guest work, show the real counts that can be imported.
2. Offer `Merge this device's progress` and `Keep account progress only`.
3. Upload bounded validated records with an `import_id` UUID.
4. The server records or recognizes that import ID and returns the merged canonical snapshot.
5. The client stores `motion-atlas-v3-imported:<hashed-user-id>` and retains a local backup until the server snapshot is confirmed.

Merge rules:

- Completed lessons merge by union.
- `completed` outranks `started`, which outranks `not_started`.
- Explicit later uncompletion is a separate authenticated mutation and must not happen during import.
- Quiz attempts merge by attempt ID.
- Lab state uses the higher revision when both are server-originated; an unsynced guest state wins only when its `updatedAt` is later and its schema validates.
- Current lesson is the most recently updated non-complete position. Legacy records without timestamps lose to a real account timestamp unless the account has no current position.
- Review schedule is recalculated from merged attempts rather than trusting client due dates.

## Offline and conflict behavior

- UI writes to local state first for immediate feedback.
- Authenticated mutations enter a small deduplicated outbox.
- Send after a short debounce, on page visibility change, and when connectivity returns.
- Server writes are transactional.
- The server returns the accepted revision and canonical state.
- A `409` conflict triggers a fetch, deterministic merge, and one retry.
- Completion is monotonic during ordinary sync; only an explicit learner action can mark a lesson incomplete.
- Never block navigation on a progress request.

## Validation and abuse prevention

Progress APIs are not public submission forms. The strongest anti-spam controls are identity, bounded schemas, and idempotency:

- Require authenticated platform identity for every server mutation.
- Enforce same-origin requests and reject unexpected content types.
- Validate every lesson, question, concept, and lab ID against the canonical registry.
- Recompute quiz correctness on the server.
- Cap request body size, batch count, string length, and lab JSON size.
- Coalesce frequent position writes and reject implausible bulk payloads.
- Use idempotency keys on attempts, imports, and destructive operations.
- Escape all user-derived display values and never render saved JSON as HTML.
- Add per-user and per-IP rate limits at the platform edge if abuse appears.

Do not add CAPTCHA to ordinary learning or sign-in. If a public feedback, forum, or contact form is added later, protect that separate surface with moderation, rate limits, honeypots, and a bot challenge such as Turnstile only when necessary.

## Privacy and learner control

- Store the minimum data needed for learning continuity.
- Do not sell progress or use it for advertising.
- Do not expose a public profile by default.
- Do not store raw IP addresses in learner tables.
- Provide a plain-language privacy page before cloud sync launches.
- Export returns profile settings, lesson progress, quiz attempts, lab progress, review schedule, and bookmarks.
- Delete removes all rows for the trusted user ID in one transaction and confirms the row counts removed.
- Account deletion in ChatGPT and Motion Atlas progress deletion are distinct; explain that plainly.

## UI requirements

### Landing header

- Guest: `Sign in to sync progress` linking to the real platform sign-in route.
- Authenticated: learner avatar substitute or initials, current course percentage, and account menu.

### Sign-in explanation

Do not show a fake email/password form. Use one real action:

`Continue with ChatGPT`

Explain in one sentence: “Your account is optional. Sign in to keep progress across devices.” Include `Continue without an account`.

### Sync states

Use quiet truthful labels: `Saved on this device`, `Saving`, `Synced`, `Offline, will retry`, or `Needs attention`. Never claim `Synced` before the server acknowledges the current revision.

## Test matrix

### Unit and database

- Safe auth return paths reject external and reserved routes.
- Guest schema validation rejects malformed and oversized data.
- Legacy ID migration is deterministic.
- Import is idempotent.
- Merge is commutative where expected and never loses completion.
- Quiz correctness ignores client claims.
- Unknown curriculum IDs are rejected.
- Delete removes every learner-owned row and no other rows.

### Browser

- Guest begins with no modal and progress survives reload.
- Real sign-in returns to the requested lesson.
- Account with no guest work loads cloud progress.
- Account plus guest work shows an accurate import decision.
- Same account on a second browser receives completion.
- Two concurrent tabs converge.
- Offline completion stays visible and syncs after reconnect.
- Sign-out changes the UI to guest without leaking account state.
- Export downloads valid JSON.
- Delete requires explicit confirmation and results in an empty account state.

### Deployment acceptance

Cloud progress is complete only when:

1. D1 is bound as `DB` in the target Sites project.
2. Production migrations are applied.
3. Deployed sign-in uses actual Sites identity headers.
4. Cross-device sync is verified with the same real account.
5. Guest migration is verified on the public URL.
6. Export and deletion are verified on the public URL.
7. No auth or progress error appears in browser console or server logs.
