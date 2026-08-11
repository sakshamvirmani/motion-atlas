"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MASTERY_LEVELS } from "@/lib/progress";
import { useLearning } from "@/app/components/learning/learning-provider";
import { useCurrentTime } from "@/app/components/learning/use-current-time";

export type CourseLessonSummary = {
  id: number;
  slug: string;
  module: string;
  track: "ios" | "web";
  title: string;
  summary: string;
  minutes: number;
};

export type CourseModuleSummary = {
  id: string;
  title: string;
  track: "ios" | "web";
};

export default function CourseExplorer({
  lessons,
  modules,
}: {
  lessons: CourseLessonSummary[];
  modules: CourseModuleSummary[];
}) {
  const {
    progress,
    hydrated,
    authenticated,
    displayName,
    syncState,
    syncMessage,
    guestImportAvailable,
    importGuestProgress,
    toggleBookmark,
  } = useLearning();
  const [track, setTrack] = useState<"ios" | "web">("ios");
  const [query, setQuery] = useState("");
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const now = useCurrentTime();

  const visibleLessons = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return lessons.filter((lesson) => {
      if (lesson.track !== track) return false;
      const record = progress.learning[String(lesson.id)];
      if (bookmarksOnly && !record?.bookmarked) return false;
      if (!normalized) return true;
      const moduleTitle = modules.find((module) => module.id === lesson.module)?.title ?? "";
      return `${lesson.title} ${lesson.summary} ${moduleTitle}`.toLowerCase().includes(normalized);
    });
  }, [bookmarksOnly, lessons, modules, progress.learning, query, track]);

  const activeModules = modules.filter((module) => module.track === track);
  const currentLesson = lessons.find((lesson) => lesson.id === progress.current) ?? lessons[0];
  const coreCompleted = progress.completed.filter((lessonId) => lessonId <= 48).length;
  const bookmarkCount = Object.values(progress.learning).filter((record) => record.bookmarked).length;
  const dueCount = Object.values(progress.learning).filter(
    (record) => record.reviewDueAt !== null && now > 0 && record.reviewDueAt <= now,
  ).length;

  return (
    <main className="learn-shell" id="main-content" tabIndex={-1}>
      <aside className="learn-rail" aria-label="Course navigation">
        <Link className="learn-wordmark" href="/">
          <span aria-hidden="true">M</span>
          <strong>Motion Atlas</strong>
        </Link>
        <nav>
          <Link className="is-active" href="/learn">Course</Link>
          <Link href="/review">Review queue</Link>
          <Link href="/account">Account</Link>
          <Link href="/sources">Sources</Link>
        </nav>
        <div className="learn-module-nav">
          <p>{track === "ios" ? "iOS modules" : "Web bonus"}</p>
          {activeModules.map((module) => (
            <a key={module.id} href={`#module-${module.id}`}>{module.title}</a>
          ))}
        </div>
        <p className={`learn-sync learn-sync-${syncState}`} role="status">
          <span aria-hidden="true" />
          {hydrated ? syncMessage : "Loading saved progress"}
        </p>
      </aside>

      <div className="learn-main">
        <header className="learn-topbar">
          <span>{authenticated ? `Welcome, ${displayName}` : "No account required"}</span>
          <div>
            <Link href="/review">{dueCount} reviews due</Link>
            {authenticated ? (
              <Link href="/account">Account</Link>
            ) : (
              <Link href="/signin?return_to=%2Flearn">Sign in to sync</Link>
            )}
          </div>
        </header>

        <section className="learn-hero" aria-labelledby="course-title">
          <div>
            <p>SwiftUI animation from first principles</p>
            <h1 id="course-title">Learn motion by making it respond.</h1>
            <p className="learn-hero-copy">
              Read the mental model, predict the result, change a live lab, answer from memory, then use the idea in your own SwiftUI build.
            </p>
            <Link className="learn-primary-action" href={`/learn/${currentLesson.slug}`}>
              Continue lesson {currentLesson.id}: {currentLesson.title}
            </Link>
          </div>
          <dl className="learn-overview" aria-label="Your learning overview">
            <div><dt>iOS path</dt><dd>{coreCompleted}<span>/ 48 complete</span></dd></div>
            <div><dt>Saved lessons</dt><dd>{bookmarkCount}<span>bookmarks</span></dd></div>
            <div><dt>Review now</dt><dd>{dueCount}<span>ideas due</span></dd></div>
          </dl>
        </section>

        {guestImportAvailable ? (
          <section className="import-notice" aria-labelledby="import-title">
            <div>
              <h2 id="import-title">Bring this device’s work into your account</h2>
              <p>Completed lessons merge by union. Your account’s existing work is never removed.</p>
            </div>
            <button type="button" onClick={() => void importGuestProgress()}>
              Merge device progress
            </button>
          </section>
        ) : null}

        <section className="course-browser" aria-labelledby="library-title">
          <div className="course-browser-heading">
            <div>
              <h2 id="library-title">Course library</h2>
              <p>Search the actual lesson registry. Every result has a stable URL.</p>
            </div>
            <label className="course-search">
              <span>Search lessons</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="State, springs, Reduce Motion…"
              />
            </label>
          </div>

          <div className="course-filters" aria-label="Course filters">
            <div role="group" aria-label="Learning track">
              <button
                type="button"
                className={track === "ios" ? "is-selected" : ""}
                aria-pressed={track === "ios"}
                onClick={() => setTrack("ios")}
              >
                iOS + SwiftUI <span>48</span>
              </button>
              <button
                type="button"
                className={track === "web" ? "is-selected" : ""}
                aria-pressed={track === "web"}
                onClick={() => setTrack("web")}
              >
                Web motion bonus <span>8</span>
              </button>
            </div>
            <button
              type="button"
              className={bookmarksOnly ? "is-selected" : ""}
              aria-pressed={bookmarksOnly}
              onClick={() => setBookmarksOnly((value) => !value)}
            >
              Saved only
            </button>
          </div>

          <div className="lesson-groups">
            {activeModules.map((module) => {
              const moduleLessons = visibleLessons.filter((lesson) => lesson.module === module.id);
              if (moduleLessons.length === 0) return null;
              return (
                <section key={module.id} id={`module-${module.id}`} className="lesson-group">
                  <header>
                    <h3>{module.title}</h3>
                    <span>{moduleLessons.length} lessons</span>
                  </header>
                  <div>
                    {moduleLessons.map((lesson) => {
                      const record = progress.learning[String(lesson.id)];
                      const completed = progress.completed.includes(lesson.id);
                      const mastery = MASTERY_LEVELS[record?.masteryStage ?? 0];
                      return (
                        <article className="lesson-row" key={lesson.id}>
                          <span className="lesson-row-number">{String(lesson.id).padStart(2, "0")}</span>
                          <Link href={`/learn/${lesson.slug}`}>
                            <strong>{lesson.title}</strong>
                            <span>{lesson.summary}</span>
                          </Link>
                          <div className="lesson-row-meta">
                            <span>{lesson.minutes} min</span>
                            <span>{completed ? "Complete" : mastery.label}</span>
                          </div>
                          <button
                            type="button"
                            aria-label={`${record?.bookmarked ? "Remove" : "Save"} ${lesson.title}`}
                            aria-pressed={record?.bookmarked ?? false}
                            onClick={() => toggleBookmark(lesson.id)}
                          >
                            {record?.bookmarked ? "Saved" : "Save"}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
            {visibleLessons.length === 0 ? (
              <div className="course-empty" role="status">
                <h3>No lessons match that search.</h3>
                <p>Try a concept such as state, spring, gesture, scroll, or performance.</p>
                <button type="button" onClick={() => { setQuery(""); setBookmarksOnly(false); }}>
                  Clear filters
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
