"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <main className="account-shell empty-state-shell">
      <p className="section-index">RECOVERY / SOMETHING INTERRUPTED</p>
      <h1>The page could not finish loading.</h1>
      <p>Your progress is not changed by this screen. Try the page again, or return to the course.</p>
      <div className="hero-actions">
        <button className="button button-primary" type="button" onClick={reset}>Try again</button>
        <a className="button button-secondary" href="/motion-atlas-course.html">Open the course</a>
      </div>
    </main>
  );
}
