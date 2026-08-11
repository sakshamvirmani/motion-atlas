import Link from "next/link";
import {
  chatGPTSignOutPath,
  getChatGPTUser,
} from "./chatgpt-auth";
import MotionLabPreview from "./components/motion-lab-preview";
import { iosLessons, lessons, webLessons } from "@/content/course";

const curriculum = [
  ["00", "Begin from zero", "Apps, Xcode, Swift, and the animated-SVG myth"],
  ["01", "How SwiftUI thinks", "State, views, layout, identity, and events"],
  ["02", "Motion foundations", "Timing, easing, springs, hierarchy, and restraint"],
  ["03", "The animation system", "Transactions, transitions, content, and continuity"],
  ["04", "Responsive motion", "Gestures, velocity, scroll, phases, and keyframes"],
  ["05", "Production craft", "Reduce Motion, performance, testing, and shipping"],
];

const learningLoop = [
  ["Predict", "Commit to what you expect before the animation plays."],
  ["Touch", "Change timing, spring, state, or geometry in a live lab."],
  ["Name", "Attach the correct idea to what you just observed."],
  ["Build", "Move from a worked example to an independent variation."],
  ["Explain", "Say why the state and animation boundaries are correct."],
  ["Retrieve", "Meet the idea again later in a different context."],
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4 10 4 4 8-9" />
    </svg>
  );
}

export default async function Home() {
  const user = await getChatGPTUser();
  const coursePath = "/learn";

  return (
    <main className="landing-page" id="main-content" tabIndex={-1}>
      <span className="scroll-progress" aria-hidden="true" />
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Motion Atlas home">
          <span className="wordmark-mark" aria-hidden="true">
            M
          </span>
          <span>
            MOTION
            <br />
            ATLAS
          </span>
        </Link>

        <nav className="primary-nav" aria-label="Primary navigation">
          <a href="#curriculum">Curriculum</a>
          <a href="#method">Method</a>
          <a href="#standards">Standards</a>
        </nav>

        <div className="account-actions">
          {user ? (
            <>
              <a className="signed-in-name" href="/account" title={user.email}>
                {user.displayName}
              </a>
              <a className="header-link" href={chatGPTSignOutPath("/")}>
                Sign out
              </a>
            </>
          ) : (
            <a className="header-link" href="/signin?return_to=%2Flearn">
              Sign in to sync
            </a>
          )}
          <a className="header-course-link" href={coursePath}>
            Open course
            <ArrowIcon />
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span>Free course</span>
            <span>iOS + SwiftUI</span>
            <span>Start from zero</span>
          </p>
          <h1>
            <span className="hero-line">Make iPhone</span>
            <span className="hero-line">
              interfaces <em>move</em>
            </span>
            <span className="hero-line">with purpose.</span>
          </h1>
          <p className="hero-intro">
            Learn app building and animation together. Predict motion, tune it in
            live laboratories, understand the SwiftUI code, then prove the idea
            in your own small builds.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={coursePath}>
              {user ? "Continue the current course" : "Start learning free"}
              <ArrowIcon />
            </a>
            <a className="button button-secondary" href="#curriculum">
              See what you will learn
            </a>
          </div>
          <p className="account-note">
            No account is required. Guest progress stays on this device; sign in
            with ChatGPT to keep it with your account and continue elsewhere.
          </p>
        </div>

        <MotionLabPreview />
      </section>

      <section className="truth-strip" aria-label="Course facts">
        <div data-reveal="rise">
          <strong>{iosLessons.length}</strong>
          <span>iOS and SwiftUI lessons available now</span>
        </div>
        <div data-reveal="rise">
          <strong>{lessons.length}</strong>
          <span>knowledge checks with explanations</span>
        </div>
        <div data-reveal="rise">
          <strong>{String(webLessons.length).padStart(2, "0")}</strong>
          <span>optional web-motion lessons, clearly separate</span>
        </div>
        <div data-reveal="rise">
          <strong>$0</strong>
          <span>no paywall, trial clock, or locked chapter</span>
        </div>
      </section>

      <section className="outcomes section-shell" aria-labelledby="outcomes-title">
        <div className="section-heading" data-reveal="rise">
          <p className="section-index">01 / WHAT YOU WILL BUILD</p>
          <h2 id="outcomes-title">From a tap to a complete interaction system.</h2>
          <p>
            The goal is not a folder of copied effects. It is the ability to
            reason about state, choose the smallest right motion tool, and make
            an interface hold up under real input.
          </p>
        </div>

        <div className="outcome-grid">
          <article className="outcome-item" data-reveal="rise">
            <div className="outcome-visual outcome-feedback" aria-hidden="true">
              <span className="feedback-ring" />
              <span className="feedback-core">
                <CheckIcon />
              </span>
            </div>
            <p className="item-number">A / MICROINTERACTION</p>
            <h3>Feedback that feels immediate</h3>
            <p>
              Build favorite buttons, confirmations, counters, and status changes
              whose motion explains exactly what happened.
            </p>
          </article>

          <article className="outcome-item" data-reveal="rise">
            <div className="outcome-visual outcome-continuity" aria-hidden="true">
              <span className="continuity-list" />
              <span className="continuity-detail" />
              <span className="continuity-line" />
            </div>
            <p className="item-number">B / CONTINUITY</p>
            <h3>Transitions that preserve context</h3>
            <p>
              Move from list to detail, collapsed to expanded, and one navigation
              state to another without making the person feel lost.
            </p>
          </article>

          <article className="outcome-item" data-reveal="rise">
            <div className="outcome-visual outcome-gesture" aria-hidden="true">
              <span className="gesture-card" />
              <span className="gesture-path" />
              <span className="gesture-target" />
            </div>
            <p className="item-number">C / DIRECT MANIPULATION</p>
            <h3>Motion that follows the hand</h3>
            <p>
              Build drags, sheets, carousels, and scroll behavior with velocity,
              deterministic settlement, interruption, and button alternatives.
            </p>
          </article>
        </div>
      </section>

      <section className="curriculum section-shell" id="curriculum" aria-labelledby="curriculum-title">
        <div className="curriculum-intro" data-reveal="rise">
          <p className="section-index">02 / THE REQUIRED PATH</p>
          <h2 id="curriculum-title">Learn the system, not isolated tricks.</h2>
          <p>
            The full current library now has stable lesson URLs, search, saved
            lessons, mastery levels, and a transparent review queue. The deeper
            60-lesson rebuild remains a separately verified expansion.
          </p>
          <a className="text-link" href={coursePath}>
            Explore the current course <ArrowIcon />
          </a>
        </div>

        <ol className="curriculum-list">
          {curriculum.map(([number, title, description]) => (
            <li key={number}>
              <span className="curriculum-number">{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <span className="curriculum-status">Required</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="method section-shell" id="method" aria-labelledby="method-title">
        <div className="section-heading method-heading" data-reveal="rise">
          <p className="section-index">03 / HOW MEMORY BECOMES SKILL</p>
          <h2 id="method-title">Watching is not the same as knowing.</h2>
          <p>
            Each lesson asks you to reconstruct the idea, use it, and meet it
            again. The difficulty is staged so a total beginner is supported
            without being kept dependent on examples.
          </p>
        </div>

        <ol className="learning-loop">
          {learningLoop.map(([title, description], index) => (
            <li key={title} data-reveal="rise">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="standards section-shell" id="standards" aria-labelledby="standards-title">
        <div className="standards-panel" data-reveal="rise">
          <p className="section-index">04 / A COURSE YOU CAN TRUST</p>
          <h2 id="standards-title">Current code. Primary sources. Honest proof.</h2>
          <p className="standards-intro">
            Motion Atlas is being rebuilt against a public content standard. A
            lesson is not finished because it looks polished; it must explain the
            mental model, compile under its stated toolchain, handle reduced
            motion, and survive likely failure cases.
          </p>
          <ul className="standards-list">
            <li>
              <CheckIcon />
              Apple documentation and WWDC sources for technical claims
            </li>
            <li>
              <CheckIcon />
              Minimum iOS version and last-reviewed date on each lesson
            </li>
            <li>
              <CheckIcon />
              Compile-checked Swift examples and observable acceptance tests
            </li>
            <li>
              <CheckIcon />
              Reduce Motion, interruption, accessibility, and performance notes
            </li>
          </ul>
        </div>

        <aside className="standards-ledger" aria-label="Quality ledger" data-reveal="slide">
          <div className="ledger-header">
            <span>QUALITY LEDGER</span>
            <span>2026.08</span>
          </div>
          <dl>
            <div>
              <dt>Current build</dt>
              <dd>Public preview</dd>
            </div>
            <div>
              <dt>Primary focus</dt>
              <dd>iOS + SwiftUI</dd>
            </div>
            <div>
              <dt>Account</dt>
              <dd>Optional sync</dd>
            </div>
            <div>
              <dt>Research map</dt>
              <dd>Dated + maintained</dd>
            </div>
            <div>
              <dt>Web motion</dt>
              <dd>Separate bonus</dd>
            </div>
          </dl>
          <p>
            No fake learner totals, manufactured testimonials, or “master in seven
            days” promise. Quality is shown through evidence.
          </p>
        </aside>
      </section>

      <section className="final-cta section-shell" aria-labelledby="final-title" data-reveal="rise">
        <p className="section-index">YOUR FIRST MOVE</p>
        <h2 id="final-title">Change one value. See the system come alive.</h2>
        <p>
          You do not need prior coding knowledge. Begin with the four ingredients
          of motion, then build outward one understandable layer at a time.
        </p>
        <a className="button button-primary button-large" href={coursePath}>
          {user ? "Return to the course" : "Begin lesson one"}
          <ArrowIcon />
        </a>
      </section>

      <footer className="site-footer" id="footer">
        <div className="footer-mark">
          <span>MOTION ATLAS</span>
          <span>SwiftUI animation from first principles</span>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#curriculum">Curriculum</a>
          <a href="#method">Learning method</a>
          <a href="#standards">Quality standard</a>
          <a href={coursePath}>Current course</a>
          <a href="/sources">Sources &amp; licenses</a>
          <a href="/privacy">Privacy</a>
        </nav>
        <p className="footer-credit">
          <span>Free to learn.</span>
          <a href="https://sakshamvirmani.com" target="_blank" rel="noreferrer">
            Made by Saksham Virmani.
          </a>
        </p>
      </footer>
    </main>
  );
}
