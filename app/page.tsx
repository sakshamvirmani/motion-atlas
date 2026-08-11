export default function Home() {
  return (
    <main className="course-shell">
      <iframe
        className="course-frame"
        src="/motion-atlas-course.html"
        title="Motion Atlas — SwiftUI animation course"
      />
      <noscript>
        <p className="course-fallback">
          Motion Atlas needs JavaScript for its interactive lessons. Open the{" "}
          <a href="/motion-atlas-course.html">course directly</a> to continue.
        </p>
      </noscript>
    </main>
  );
}
