const sourceFamilies = [
  {
    source: "Apple documentation, Human Interface Guidelines, and WWDC",
    role: "Primary technical evidence",
    treatment: "Linked and independently explained. No Apple video, transcript, slide, screenshot, or brand asset is republished.",
  },
  {
    source: "Swift and open-source runtime documentation",
    role: "API and ecosystem verification",
    treatment: "Reference-only unless a future artifact’s exact license and required notice are recorded first.",
  },
  {
    source: "Commercial and free SwiftUI courses",
    role: "Coverage benchmarking",
    treatment: "Used only to identify broad topics and gaps. No wording, examples, exercises, media, or distinctive course design is copied.",
  },
  {
    source: "Learning-science papers",
    role: "Teaching-method evidence",
    treatment: "Findings inform original activities such as retrieval and spacing; the papers’ expression and figures are not reproduced.",
  },
  {
    source: "Recent and other design galleries",
    role: "Market-level visual observation",
    treatment: "Only general principles such as hierarchy and restraint are considered. Showcased pages and assets are not cloned.",
  },
];

export default function SourcesPage() {
  return (
    <main className="account-shell document-shell sources-shell" id="main-content" tabIndex={-1}>
      <a className="account-wordmark" href="/" aria-label="Motion Atlas home">
        <span className="wordmark-mark" aria-hidden="true">M</span>
        <span>MOTION ATLAS</span>
      </a>

      <article>
        <p className="section-index">SOURCES / ORIGINALITY / LICENSES</p>
        <h1>Learn widely.<br />Copy <em>nothing.</em></h1>
        <p className="document-lede">
          Motion Atlas uses authoritative references to verify facts, then builds
          its explanations, examples, exercises, diagrams, and interface
          independently.
        </p>

        <div className="license-grid" aria-label="Motion Atlas licenses">
          <section>
            <p className="account-kicker">SOFTWARE</p>
            <h2>MIT License</h2>
            <p>Original site software and lesson code samples can be used, modified, redistributed, and sold with the copyright and license notice preserved.</p>
            <a href="https://opensource.org/license/mit" target="_blank" rel="noreferrer">Read the standard license</a>
          </section>
          <section>
            <p className="account-kicker">ORIGINAL COURSE CONTENT</p>
            <h2>CC BY 4.0</h2>
            <p>Original non-code educational material can be shared and adapted, including commercially, with credit, a license link, and a note describing changes.</p>
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">Read the license deed</a>
          </section>
        </div>

        <h2>Can someone charge for a copy?</h2>
        <p>
          Yes. The current MIT and CC BY 4.0 licenses both allow commercial
          reuse when their conditions are followed. A person may not remove the
          required notices or omit the attribution required for course content.
          If Motion Atlas should prohibit commercial reuse in the future, the
          content license must be changed deliberately; grants already made for
          earlier copies cannot simply be withdrawn.
        </p>

        <h2>How external work is used</h2>
        <div className="source-ledger-public">
          {sourceFamilies.map((entry, index) => (
            <section key={entry.source}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{entry.source}</h3>
                <p className="source-role">{entry.role}</p>
                <p>{entry.treatment}</p>
              </div>
            </section>
          ))}
        </div>

        <h2>The publication gate</h2>
        <p>
          If a license is missing or ambiguous, that material does not ship. A
          credit line is added only when reuse is actually permitted; credit by
          itself is never treated as permission. As of 11 August 2026, the audit
          identified no copied third-party prose, screenshots, illustrations,
          animation files, or tutorial code in the published course.
        </p>

        <p className="document-updated">Policy and ledger last reviewed 11 August 2026.</p>
        <a className="button button-primary" href="/">Return home</a>
      </article>
    </main>
  );
}
