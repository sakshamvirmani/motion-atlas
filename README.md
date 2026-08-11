# Motion Atlas

Motion Atlas is a free, beginner-first learning product for building purposeful,
accessible iOS animation with SwiftUI. It combines short lessons, live motion
instruments, prediction, retrieval practice, vibe-coding workflows, and
production checks. An optional, visibly separate track covers web scroll motion,
Motion for React, Framer concepts, and GSAP.

The public course is hosted with OpenAI Sites. Anyone can learn as a guest.
Optional Sign in with ChatGPT ties progress to a Sites identity and persists it
in Cloudflare D1.

## Start locally

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm audit --omit=dev
```

`npm test` builds the production worker and checks rendered product content,
auth states, course-script syntax, progress validation and merging, D1 schema,
privacy, and licensing artifacts.

After changing `db/schema.ts`, generate and inspect a migration:

```bash
npm run db:generate
```

## Project map

- `app/`: landing, sign-in, account, privacy, sources, and API routes.
- `public/motion-atlas-course.html`: current 56-lesson migration source.
- `db/` and `drizzle/`: account-progress schema and migrations.
- `docs/MASTER_PLAN.md`: durable execution plan.
- `docs/STATUS.md`: current verified milestone and resume pointer.
- `docs/CONTENT_STANDARD.md`: lesson publication gate.
- `docs/SOURCE_POLICY.md` and `docs/SOURCE_LEDGER.md`: originality and reuse controls.
- `docs/DATA_AUTH_ARCHITECTURE.md`: identity, import, sync, export, delete, and abuse-prevention design.

The standalone course remains the active learning surface while its content and
labs move into typed native routes. It must not become a second editable source
after that migration is complete.

## Identity and data

- Guest progress stays in versioned browser storage.
- Sign in with ChatGPT is optional and handled by the Sites dispatcher.
- Every server write derives ownership from trusted Sites identity headers.
- Account progress uses a D1 `DB` binding.
- Guest import merges completed work rather than replacing it.
- Learners can export and permanently delete account progress.
- No Motion Atlas password, advertising profile, or public learner profile exists.

See `docs/DOMAIN_AUTH_DECISIONS.md` for why other identity providers and a
shorter hostname are separate future decisions.

## Licensing

- Original software and code samples: [MIT](LICENSE).
- Original non-code course content: [CC BY 4.0](CONTENT_LICENSE.md).
- Third-party material remains under its own terms and is excluded from both
  grants unless an exact ledger entry says otherwise.

Copyright 2026 Saksham Virmani.
