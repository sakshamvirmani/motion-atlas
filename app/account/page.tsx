import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import AccountDashboard from "./account-dashboard";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireChatGPTUser("/account");

  return (
    <main className="account-shell" id="main-content" tabIndex={-1}>
      <header className="account-header">
        <a className="account-wordmark" href="/" aria-label="Motion Atlas home">
          <span className="wordmark-mark" aria-hidden="true">M</span>
          <span>MOTION ATLAS</span>
        </a>
        <div>
          <span title={user.email}>{user.displayName}</span>
          <a className="header-link" href={chatGPTSignOutPath("/")}>Sign out</a>
        </div>
      </header>

      <section className="account-title">
        <p className="section-index">LEARNER ACCOUNT</p>
        <h1>Your progress belongs to <em>you.</em></h1>
        <p>Inspect what is synced, take a copy, or remove it completely.</p>
      </section>

      <section className="account-identity" aria-labelledby="identity-heading">
        <header>
          <p className="account-kicker">PRIVACY SNAPSHOT</p>
          <h2 id="identity-heading">Exactly what this site can see.</h2>
          <p>
            ChatGPT authenticates you, then supplies a small identity bundle to
            Motion Atlas on signed-in requests. Motion Atlas never receives your
            ChatGPT password.
          </p>
        </header>
        <dl>
          <div>
            <dt>Site-specific ID</dt>
            <dd>Received privately and used as the owner key for progress</dd>
          </div>
          <div>
            <dt>Name</dt>
            <dd>{user.fullName ?? "Not supplied"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Separate username</dt>
            <dd>Not requested or used by Motion Atlas</dd>
          </div>
        </dl>
        <p className="account-identity-note">
          D1 stores the site-specific ID, a display-name snapshot, learning
          progress, timestamps, and short anti-abuse request counters. It does
          not store your email. Your email is displayed on this private account
          page and included only in an export you request.
        </p>
      </section>

      <AccountDashboard />
    </main>
  );
}
