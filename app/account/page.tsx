import Link from "next/link";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import AccountDashboard from "./account-dashboard";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireChatGPTUser("/account");

  return (
    <main className="account-shell">
      <header className="account-header">
        <Link className="account-wordmark" href="/" aria-label="Motion Atlas home">
          <span className="wordmark-mark" aria-hidden="true">M</span>
          <span>MOTION ATLAS</span>
        </Link>
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

      <AccountDashboard />
    </main>
  );
}
