export default function NotFound() {
  return (
    <main className="account-shell empty-state-shell" id="main-content" tabIndex={-1}>
      <p className="section-index">404 / OFF THE MAP</p>
      <h1>This page is not in the atlas.</h1>
      <p>The lesson may have moved, or the address may be incomplete.</p>
      <div className="hero-actions">
        <a className="button button-primary" href="/motion-atlas-course.html">Open the course</a>
        <a className="button button-secondary" href="/">Return home</a>
      </div>
    </main>
  );
}
