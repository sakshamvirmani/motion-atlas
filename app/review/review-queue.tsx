"use client";

import { useMemo, useState } from "react";
import { MASTERY_LEVELS } from "@/lib/progress";
import { useLearning } from "@/app/components/learning/learning-provider";
import { useCurrentTime } from "@/app/components/learning/use-current-time";

type ReviewLesson = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  teachBack: string;
};

export default function ReviewQueue({ lessons }: { lessons: ReviewLesson[] }) {
  const { progress, hydrated, syncMessage, advanceMastery } = useLearning();
  const [revealed, setRevealed] = useState<number[]>([]);
  const now = useCurrentTime();

  const scheduled = useMemo(
    () =>
      lessons
        .map((lesson) => ({ lesson, record: progress.learning[String(lesson.id)] }))
        .filter((item) => item.record?.reviewDueAt !== null && item.record?.reviewDueAt !== undefined)
        .sort((a, b) => (a.record.reviewDueAt ?? 0) - (b.record.reviewDueAt ?? 0)),
    [lessons, progress.learning],
  );
  const due = scheduled.filter((item) => (item.record.reviewDueAt ?? Infinity) <= now);
  const upcoming = scheduled.filter((item) => (item.record.reviewDueAt ?? 0) > now).slice(0, 5);

  return (
    <main className="review-shell" id="main-content" tabIndex={-1}>
      <header className="review-header">
        <a href="/">Motion Atlas</a>
        <nav aria-label="Review navigation">
          <a href="/learn">Course library</a>
          <a href="/account">Account</a>
        </nav>
      </header>

      <section className="review-intro">
        <div>
          <p>Spaced retrieval</p>
          <h1>Return before the idea fades.</h1>
          <p>
            Motion Atlas schedules transparent intervals: later this session, then 1, 3, 7, 14, and 30 days. There is no streak punishment.
          </p>
        </div>
        <aside aria-label="Review status">
          <strong>{hydrated ? due.length : "…"}</strong>
          <span>reviews due now</span>
          <p>{syncMessage}</p>
        </aside>
      </section>

      <section className="review-list" aria-labelledby="due-heading">
        <header>
          <h2 id="due-heading">Due now</h2>
          <span>{due.length} ideas</span>
        </header>
        {hydrated && due.length === 0 ? (
          <div className="review-empty">
            <h3>Your queue is clear.</h3>
            <p>Practice a lesson or answer a retrieval check. Motion Atlas will schedule the next useful return.</p>
            <a href="/learn">Choose a lesson</a>
          </div>
        ) : null}
        {due.map(({ lesson, record }) => {
          const isRevealed = revealed.includes(lesson.id);
          return (
            <article key={lesson.id} className="review-item">
              <span>{String(lesson.id).padStart(2, "0")}</span>
              <div>
                <p>{MASTERY_LEVELS[record.masteryStage].label}</p>
                <h3>{lesson.teachBack}</h3>
                {isRevealed ? (
                  <div className="review-answer">
                    <strong>{lesson.title}</strong>
                    <p>{lesson.summary}</p>
                    <a href={`/learn/${lesson.slug}`}>Open the full lesson</a>
                  </div>
                ) : null}
              </div>
              <div className="review-actions">
                <button
                  type="button"
                  onClick={() => setRevealed((items) => [...new Set([...items, lesson.id])])}
                  disabled={isRevealed}
                >
                  {isRevealed ? "Answer shown" : "Show answer"}
                </button>
                <button
                  type="button"
                  disabled={!isRevealed || record.masteryStage >= 6}
                  onClick={() => advanceMastery(lesson.id)}
                >
                  I recalled it
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="review-upcoming" aria-labelledby="upcoming-heading">
        <header>
          <h2 id="upcoming-heading">Coming up</h2>
          <span>Next five scheduled ideas</span>
        </header>
        {upcoming.length ? (
          <ol>
            {upcoming.map(({ lesson, record }) => (
              <li key={lesson.id}>
                <a href={`/learn/${lesson.slug}`}>{lesson.title}</a>
                <time dateTime={new Date(record.reviewDueAt ?? 0).toISOString()}>
                  {formatUpcoming(record.reviewDueAt ?? 0)}
                </time>
              </li>
            ))}
          </ol>
        ) : (
          <p>Nothing else is scheduled yet.</p>
        )}
      </section>
    </main>
  );
}

function formatUpcoming(value: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}
