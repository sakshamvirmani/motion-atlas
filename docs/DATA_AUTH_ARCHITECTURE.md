# Identity, authentication, and progress architecture

Decision date: 2026-08-11
Implementation snapshot: 2026-08-11

## Product decision

Motion Atlas is public and guest-first. An account is optional and exists only
to keep learning state with the learner across contexts.

```text
Public visitor
  -> starts immediately
  -> native progress saved in browser storage
  -> may use Sign in with ChatGPT
  -> explicitly merges guest work
  -> account state syncs through Sites identity and D1
  -> can export or delete Motion Atlas progress
```

This is a real platform-authentication design, not an email/password mockup.
Motion Atlas does not collect passwords, issue its own session cookies, or run
an auth directory.

## Identity fields and storage boundary

On an authenticated request, Sites supplies a stable site-specific user ID, an
email address, and an optional percent-encoded full name. Motion Atlas reads
those fields in `app/chatgpt-auth.ts`. It does not request or read a separate
username, avatar, ChatGPT password, or OpenAI session credential.

- The site-specific ID authorizes and owns the learner's rows in D1.
- The optional name is saved as a display-name snapshot in `learner_profiles`.
- The email is used to identify the active account on private signed-in pages
  and is included in an export only when the learner requests one.
- The email is not written to D1 and is no longer returned by `/api/me`.
- `/account` shows the identity fields the app reads and the exact progress
  snapshot returned for the current account.

The consent screen describes what the platform may provide. The application
source and the private account page describe what Motion Atlas actually reads
and persists.

## Current user states

### Guest

- Can read every lesson, use every lab, search, bookmark, complete lessons, and
  use the review queue.
- Native state is stored under `motion-atlas-native-v1`.
- The legacy `motion-atlas-v2` record is read defensively and converted in
  memory; it is not deleted.
- The interface says `Saved on this device`.

### Authenticated learner

- Identity comes from trusted Sites request headers through
  `getChatGPTUser()`.
- The browser cache is namespaced by a stable account key returned by
  `/api/me`, so another account does not inherit the visible cached state.
- The same bounded snapshot is saved to D1 through `/api/progress`.
- Updates are local-first, debounced, retried when connectivity returns, and
  reconciled with a monotonic profile revision.
- The learner can export and permanently delete Motion Atlas progress.

### Signed out after prior use

- D1 state remains tied to the platform account.
- New work is guest work until the learner signs in again.
- Cached account state stays under its account-specific key and must not be
  shown as the new guest's progress.

## Authentication routes

- `getChatGPTUser()` reads trusted identity headers.
- `requireChatGPTUser(returnTo)` protects account-only pages and handlers.
- `chatGPTSignInPath(returnTo)` produces the Sites platform sign-in path.
- `chatGPTSignOutPath(returnTo)` produces the Sites platform sign-out path.
- Return paths are restricted to safe local application paths.

Current routes:

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page and course promise. |
| `/learn` | Public | Searchable course library and learner overview. |
| `/learn/[lesson]` | Public | Stable lesson, lab, retrieval, and mastery surface. |
| `/review` | Public | Due and upcoming spaced-retrieval queue. |
| `/signin` | Public | Explains the optional account before invoking Sites auth. |
| `/account` | Authenticated | Account state, export, deletion, and sign-out. |
| `/api/me` | Public response | Minimal auth state and non-identifying account cache key. |
| `/api/progress` | Authenticated | Reads or writes the bounded progress snapshot. |
| `/api/progress/export` | Authenticated | Downloads the current learner snapshot. |
| `/api/progress/delete` | Authenticated | Deletes every learning-progress row after exact confirmation. |

Every authenticated handler derives the owner from trusted request headers. No
client-supplied user ID participates in authorization.

## Current progress snapshot

The shared schema is version 2:

```ts
type ProgressSnapshot = {
  schemaVersion: 2;
  current: number;
  completed: number[];
  quizAnswers: Record<string, number>;
  learning: Record<string, {
    bookmarked: boolean;
    masteryStage: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    reviewDueAt: number | null;
    labState: Record<string, string | number | boolean>;
    updatedAt: number;
  }>;
  revision: number;
  updatedAt: number | null;
};
```

Mastery stages are transparent practice signals:

| Stage | Label | Next return |
| --- | --- | --- |
| 0 | Not started | None |
| 1 | Touched | Later this session |
| 2 | Recalled | Tomorrow |
| 3 | Practiced | In 3 days |
| 4 | Applied | In 7 days |
| 5 | Explained | In 14 days |
| 6 | Durable | In 30 days |

These labels are learner-facing self-assessment and interaction state. They are
not a grade, certificate, identity claim, or server-verified credential. The
server validates their bounded shape and calculates the due timestamp whenever
the stage changes.

## D1 model

The production binding is named `DB`. Migrations live in `drizzle/` and the
runtime initializer creates missing tables defensively before progress access.

### `learner_profiles`

One row per trusted platform user. Stores display-name snapshot, current lesson,
schema version, global revision, and timestamps.

### `lesson_progress`

One row per user and completed lesson ID. Completion is unioned during guest
merge and is not silently removed.

### `quiz_progress`

One row per user and lesson ID containing the selected option and update time.
The answer index is bounded to the canonical three-option quiz shape. The
current product does not treat this table as a secure assessment record.

### `lesson_learning_state`

One row per user and lesson ID containing bookmark state, mastery stage,
server-calculated due time, bounded lab JSON, and update time. It is indexed by
user and due time for the review queue.

### `mutation_rate_limits`

One short fixed-window counter per user and mutation class. It stores the
site-specific ID, action label, request count, window start, and update time. It
does not store email, name, request bodies, IP addresses, or lesson content.
Counters are overwritten as their next window starts and exist only to reduce
automated write pressure.

Free-form notes are intentionally absent. They would introduce sensitive-text
storage, moderation, export, and deletion concerns without being necessary for
the current learning loop.

## Local-first and conflict behavior

1. A UI action updates the in-memory snapshot immediately.
2. The snapshot is written to the correct browser-storage namespace.
3. For an authenticated learner, a 650 ms debounce coalesces changes.
4. The client posts a `replace` snapshot with its base revision.
5. A stale revision returns `409` and the server's current snapshot.
6. The client updates its revision and retries the latest local state, at most
   three attempts in one cycle.
7. A network failure keeps the local copy and changes the status to an honest
   offline/retry message.
8. The browser retries when connectivity returns.

Navigation never waits for a progress request.

## Guest import

After the first signed-in load, Motion Atlas offers an explicit merge when the
device has guest work and the account-specific import marker is absent.

- Completed lesson IDs merge by union.
- Existing account quiz selections win over the guest copy.
- Existing account bookmarks and mastery never move backward.
- Existing account lab fields win on key conflicts in the current compatibility
  merge.
- The account's current lesson wins when it already has work; otherwise the
  guest current lesson is adopted.
- The marker is written only after the server confirms the merged snapshot.

This first implementation is idempotent at the resulting state level. A future
event/outbox model should add mutation IDs if per-attempt history is introduced.

## Validation and bot resistance

Motion Atlas has no anonymous public write form. Account writes are protected by
the most useful controls for this product:

- authenticated Sites identity on every server mutation;
- same-origin checks;
- JSON content-type checks;
- request bodies capped at 65,536 bytes;
- lesson IDs bounded to the 56-record registry;
- quiz selections bounded to integer options 0 through 2;
- no more than 56 completion, answer, or learning records;
- no more than 16 lab fields per lesson;
- strict lab field names and primitive-only values;
- string and numeric limits;
- account-scoped fixed-window limits of 180 progress writes per five minutes
  and 10 deletion attempts per hour;
- monotonic revision conflict handling; and
- escaped React rendering instead of saved HTML.

CAPTCHA is not added to ordinary learning or sign-in. If a public feedback,
forum, or contact form is introduced, that separate surface needs rate limits,
moderation, honeypot checks, and an edge challenge only if abuse justifies the
friction.

## Privacy and learner control

- Store only learning continuity data.
- Do not sell progress or build an advertising profile.
- Do not create a public learner profile.
- Do not store raw IP addresses in learner tables.
- D1 does not store the account email.
- Export returns the complete current learning snapshot plus the active
  account name and email supplied for that request.
- Deletion removes learning, quiz, completion, and profile rows in that order.
- Deleting Motion Atlas progress is distinct from deleting a ChatGPT account.

## Verification boundary

Locally verified:

- guest progress, bookmark, lab, quiz, completion, and review persistence across
  reload;
- input validation, revision conflict, merge, export, and exact-confirmation
  deletion behavior;
- generated migration and runtime schema safety;
- account-scoped browser-cache keying; and
- real Sites sign-in routing reaching OpenAI authentication.

The owner has completed the real production sign-in flow. A write, reload, and
direct account-page JSON read have proven same-context D1 persistence. Still
required:

1. Open the same account in a genuinely independent browser or device context.
2. Verify a learning change converges there.
3. Exercise guest import, export, sign-out isolation, and deletion publicly.
4. Confirm no client or server error appears during that matrix.

Do not describe cross-device sync as production-proven until those four steps
are recorded in `docs/STATUS.md`.
