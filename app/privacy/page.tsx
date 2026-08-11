import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="account-shell document-shell">
      <Link className="account-wordmark" href="/" aria-label="Motion Atlas home">
        <span className="wordmark-mark" aria-hidden="true">M</span>
        <span>MOTION ATLAS</span>
      </Link>
      <article>
        <p className="section-index">PRIVACY / PLAIN LANGUAGE</p>
        <h1>Your learning data is not the product.</h1>
        <p className="document-lede">Motion Atlas stores only what is needed to continue your course. It does not sell progress, run advertising profiles, or publish learner activity.</p>
        <h2>Without an account</h2>
        <p>Completed lessons, your current lesson, and quiz selections stay in this browser. Clearing browser storage can remove them.</p>
        <h2>When you sign in</h2>
        <p>ChatGPT provides Motion Atlas with a site-specific user identifier, email address, and sometimes a display name. The identifier owns your saved lesson progress. Email and display name are used only to show which account is active.</p>
        <h2>What the course stores</h2>
        <p>Motion Atlas stores your current lesson, completed lessons, quiz selections, a progress revision, and update times. It does not store a password, public profile, free-form private notes, or payment details.</p>
        <h2>Your controls</h2>
        <p>The account page lets you download a readable copy and permanently delete all account-tied Motion Atlas progress. Deleting course progress does not delete your ChatGPT account. Signing out does not delete either guest or account progress.</p>
        <h2>Abuse prevention</h2>
        <p>Writes require a signed-in identity, same-origin requests, bounded JSON, and known course identifiers. Motion Atlas does not use a CAPTCHA for ordinary learning.</p>
        <p className="document-updated">Last updated 11 August 2026.</p>
        <Link className="button button-primary" href="/">Return home</Link>
      </article>
    </main>
  );
}
