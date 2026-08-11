import Link from "next/link";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

type SignInPageProps = {
  searchParams: Promise<{ return_to?: string | string[] }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const user = await getChatGPTUser();
  const params = await searchParams;
  const requestedReturn = Array.isArray(params.return_to)
    ? params.return_to[0]
    : params.return_to;
  const returnTo = requestedReturn || "/motion-atlas-course.html";

  return (
    <main className="account-shell auth-shell" id="main-content" tabIndex={-1}>
      <Link className="account-wordmark" href="/" aria-label="Motion Atlas home">
        <span className="wordmark-mark" aria-hidden="true">M</span>
        <span>MOTION ATLAS</span>
      </Link>

      <section className="auth-panel" aria-labelledby="signin-title">
        <div className="auth-index">ACCOUNT / OPTIONAL</div>
        <h1 id="signin-title">
          Keep your learning<br />with <em>you.</em>
        </h1>
        <p className="auth-lede">
          Motion Atlas is free and works without an account. Sign in only if you
          want progress to follow you between browsers and devices.
        </p>

        <div className="auth-benefits" aria-label="What an account adds">
          <div><span>01</span><p>Continue from the same lesson elsewhere.</p></div>
          <div><span>02</span><p>Merge work already saved on this device.</p></div>
          <div><span>03</span><p>Export or permanently delete your course data.</p></div>
        </div>

        {user ? (
          <div className="auth-actions">
            <p className="auth-signed-in">Signed in as <strong>{user.displayName}</strong></p>
            <a className="button button-primary" href={returnTo}>Continue to Motion Atlas</a>
            <a className="button button-secondary" href="/account">Manage account progress</a>
          </div>
        ) : (
          <div className="auth-actions">
            <a className="button button-primary" href={chatGPTSignInPath(returnTo)}>
              Continue with ChatGPT
            </a>
            <a className="button button-secondary" href={returnTo}>
              Continue without an account
            </a>
          </div>
        )}

        <p className="auth-fineprint">
          There is no Motion Atlas password to create. Authentication is handled
          by ChatGPT, and Motion Atlas stores only the learning data described in
          its <a href="/privacy">privacy note</a>.
        </p>
      </section>
    </main>
  );
}
