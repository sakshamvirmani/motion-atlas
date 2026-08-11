# Hosting name and authentication decisions

Last verified: 2026-08-11

## Product name

The public product name is **Motion Atlas**. “Made by Saksham Virmani” appears
in the site footer and project attribution, but the creator name does not need
to be part of the product title.

## Current Sites address

- Site slug: `motion-atlas-swiftui-course`
- Generated live URL:
  `https://motion-atlas-swiftui-course.saksham-virmani.chatgpt.site`
- Access: public

The generated Sites URL includes both the site slug and the Sites namespace.
The currently exposed Sites tools do not offer an in-place slug rename.
Do not create a replacement Site merely to shorten the address because that
would split deployment history, authentication identity, and D1 user IDs.

## Clean-name options

1. Keep the existing generated URL and market the product as Motion Atlas.
2. Connect a custom apex or subdomain already owned by Saksham, such as
   `motionatlas.example` or `learn.example.com`. Sites supports this and returns
   DNS validation records, but it does not register the domain.
3. Consider a new Sites project with a shorter slug only after a migration plan
   covers redirects, D1 data, authentication identity, analytics, and links.

`motionatlas.chatgpt.site` cannot be promised. It is not an available naming
shape in the current project controls. A custom owned domain is the reliable
route to a creator-independent public address.

## Authentication

The implemented native option is dispatch-owned **Sign in with ChatGPT**.
Visitors may have created or accessed their ChatGPT account through Google,
Apple, Microsoft, password, passkey, or workspace SSO, but Motion Atlas receives
one Sites-provided ChatGPT identity.

Google OAuth, email magic links, and other app-owned providers are technically
possible in a different supported authentication architecture, but they are not
drop-in choices in the current Sites starter. Adding them would require a
confirmed provider integration, callback and cookie security, account linking,
email/privacy policies, abuse protection, recovery behavior, and a migration
away from or alongside the current site-specific user IDs.

Decision for the current release: keep guest access plus optional Sign in with
ChatGPT. Revisit other providers only when real learner demand justifies the
additional security and support burden and the hosting platform path is
confirmed.
