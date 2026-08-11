export default function PrivacyPage() {
  return (
    <main className="account-shell document-shell" id="main-content" tabIndex={-1}>
      <a className="account-wordmark" href="/" aria-label="Motion Atlas home">
        <span className="wordmark-mark" aria-hidden="true">M</span>
        <span>MOTION ATLAS</span>
      </a>
      <article>
        <p className="section-index">PRIVACY / PLAIN LANGUAGE</p>
        <h1>Your learning data is not the product.</h1>
        <p className="document-lede">Motion Atlas stores only what is needed to continue your course. It does not sell progress, run advertising profiles, or publish learner activity.</p>
        <h2>Without an account</h2>
        <p>Completed lessons, your current lesson, quiz selections, bookmarks, mastery stages, review dates, and bounded lab controls stay in this browser. Clearing browser storage can remove them.</p>
        <h2>When you sign in</h2>
        <p>ChatGPT provides Motion Atlas with a site-specific user identifier, email address, and sometimes a display name. Motion Atlas does not request a separate username and never receives your ChatGPT password.</p>
        <h2>What the course stores</h2>
        <p>In D1, Motion Atlas stores the site-specific identifier, a display-name snapshot, your current lesson, completed lessons, quiz selections, bookmarks, mastery stages, server-calculated review dates, bounded lab controls, a progress revision, timestamps, and short anti-abuse request counters. Those counters contain an action label and count, not request content or an IP address. D1 does not store your email, password, public profile, free-form private notes, or payment details. Your email is used only on signed-in pages and in an export that you request.</p>
        <h2>Your controls</h2>
        <p>The account page shows the identity fields Motion Atlas receives, lets you inspect the exact saved progress JSON, download a readable copy, and permanently delete all account-tied Motion Atlas progress. Deleting course progress does not delete your ChatGPT account. Signing out does not delete either guest or account progress.</p>
        <h2>Abuse prevention</h2>
        <p>Writes require a signed-in identity, same-origin requests, bounded JSON, known course identifiers, and account-scoped rate limits. Motion Atlas does not use a CAPTCHA for ordinary learning. These controls reduce application abuse; they are not a promise that every denial-of-service attack can be prevented.</p>
        <p className="document-updated">Last updated 11 August 2026.</p>
        <a className="button button-primary" href="/">Return home</a>
      </article>
    </main>
  );
}
