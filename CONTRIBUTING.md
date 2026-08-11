# Contributing to Motion Atlas

Thank you for helping make SwiftUI motion easier to learn. Small, well-tested
improvements are especially welcome: clearer explanations, accessibility
repairs, corrected API availability, focused labs, and reproducible bugs.

## Before you begin

1. Search existing issues before opening a new one.
2. For a large curriculum or architecture change, open an issue describing the
   learner problem and proposed scope before building it.
3. Keep iOS and SwiftUI as the required path. Web motion belongs in the clearly
   separate bonus track.
4. Never include credentials, private learner data, or production exports.

## Local workflow

```bash
npm install
npm run dev
```

Before a pull request:

```bash
npm run lint
npm run typecheck
npm test
```

Report the commands you actually ran and any device-only check that remains.

## Course-content rules

Every lesson change must follow `docs/CONTENT_STANDARD.md` and
`docs/SOURCE_POLICY.md`.

- Teach the mental model before syntax.
- Prefer current first-party Apple material for technical claims.
- Write explanations, examples, exercises, diagrams, and motion independently.
- Do not copy another course's wording, sequence, code, media, or distinctive
  interface unless the exact license or written permission allows this use.
- Update `docs/SOURCE_LEDGER.md` before any licensed reuse, quotation, or new
  design-research dependency ships.
- Include availability, last-reviewed metadata, expected behavior, and a
  meaningful reduced-motion path where relevant.

Public availability, “free,” and “on GitHub” are not reuse licenses. When in
doubt, link to the original and create a new explanation.

## Code and data

- Keep one canonical course dataset in `content/course.json`.
- Use stable lesson IDs and slugs; existing learner progress depends on them.
- Validate all client-supplied learning state before persistence.
- Add a committed migration for every D1 schema change.
- Preserve guest-first use and avoid collecting data that is not needed for
  learning continuity.

## Pull requests

The repository is public, but public access does not grant write or merge
permission. People without write access contribute through a fork and pull
request. Only a maintainer with repository write access can merge the change.

Every pull request runs the repository quality workflow: TypeScript, lint, the
production build, and product tests. Passing automation is necessary but not
sufficient. The code owner reviews the learner experience, source evidence,
accessibility, privacy impact, and visual behavior before accepting a change.

Keep the title concrete. In the description, include:

- the learner or product problem;
- the changed files and behavior;
- verification results;
- source and license impact; and
- screenshots or recordings for meaningful visual or motion changes.

By contributing, you agree that original code contributions are provided under
the MIT License and original non-code course contributions under CC BY 4.0,
unless an accepted contribution explicitly records different compatible terms.
