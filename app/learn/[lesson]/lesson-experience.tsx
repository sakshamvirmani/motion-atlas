"use client";

import { useEffect, useMemo, useState } from "react";
import { MASTERY_LEVELS, type LabState } from "@/lib/progress";
import { useLearning } from "@/app/components/learning/learning-provider";
import { useCurrentTime } from "@/app/components/learning/use-current-time";

type Quiz = {
  prompt: string;
  answers: string[];
  correctIndex: number;
  explanation: string;
};

const MOTION_LABS = new Set([
  "coreMotion",
  "timing",
  "easing",
  "spring",
  "transition",
  "transforms",
  "drag",
  "choreo",
  "keyframes",
  "fps",
  "state",
  "matched",
  "phase",
  "reduce",
  "css",
  "waapi",
  "intersection",
  "scroll",
  "motionWeb",
  "gsap",
  "webcapstone",
]);

export default function LessonExperience({
  lessonId,
  lessonTitle,
  lab,
  quiz,
  teachBack,
  nextPath,
}: {
  lessonId: number;
  lessonTitle: string;
  lab: string;
  quiz: Quiz;
  teachBack: string;
  nextPath: string | null;
}) {
  const {
    progress,
    hydrated,
    syncMessage,
    setCurrentLesson,
    toggleBookmark,
    recordQuizAnswer,
    saveLabState,
    advanceMastery,
    markComplete,
  } = useLearning();
  const record = progress.learning[String(lessonId)];
  const savedAnswer = progress.quizAnswers[String(lessonId)];
  const [answer, setAnswer] = useState<number | null>(
    typeof savedAnswer === "number" ? savedAnswer : null,
  );
  const [duration, setDuration] = useState(650);
  const [distance, setDistance] = useState(72);
  const [curve, setCurve] = useState("smooth");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const now = useCurrentTime();

  useEffect(() => {
    if (hydrated) setCurrentLesson(lessonId);
  }, [hydrated, lessonId, setCurrentLesson]);

  useEffect(() => {
    if (!record?.labState) return;
    const saved = record.labState;
    const timer = window.setTimeout(() => {
      if (typeof saved.duration === "number") setDuration(saved.duration);
      if (typeof saved.distance === "number") setDistance(saved.distance);
      if (typeof saved.curve === "string") setCurve(saved.curve);
      if (typeof saved.reduceMotion === "boolean") setReduceMotion(saved.reduceMotion);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [record?.labState]);

  useEffect(() => {
    if (typeof savedAnswer !== "number") return;
    const timer = window.setTimeout(() => setAnswer(savedAnswer), 0);
    return () => window.clearTimeout(timer);
  }, [savedAnswer]);

  const mastery = MASTERY_LEVELS[record?.masteryStage ?? 0];
  const completed = progress.completed.includes(lessonId);
  const isMotionLab = MOTION_LABS.has(lab);
  const labState = useMemo<LabState>(
    () => ({ duration, distance, curve, reduceMotion }),
    [curve, distance, duration, reduceMotion],
  );

  function persistLab(next: LabState = {}) {
    saveLabState(lessonId, { ...labState, ...next });
  }

  function chooseAnswer(index: number) {
    setAnswer(index);
    recordQuizAnswer(lessonId, index, index === quiz.correctIndex);
  }

  return (
    <>
      <section className="native-lab" aria-labelledby="lab-heading">
        <header>
          <div>
            <p>{isMotionLab ? "Live motion laboratory" : "Interactive state laboratory"}</p>
            <h2 id="lab-heading">Change a value. Predict before you play.</h2>
          </div>
          <span>{syncMessage}</span>
        </header>

        <div className="native-lab-stage" data-reduce-motion={reduceMotion ? "true" : "false"}>
          <div className="lab-state-label">
            <span>{atEnd ? "END STATE" : "START STATE"}</span>
            <strong>{isMotionLab ? `${distance} pt` : atEnd ? "Updated" : "Ready"}</strong>
          </div>
          <div className="lab-demo-track" aria-hidden="true">
            <div
              className={`lab-demo-object curve-${curve}${atEnd ? " is-at-end" : ""}`}
              style={
                {
                  "--lab-duration": `${reduceMotion ? 1 : duration}ms`,
                  "--lab-distance": `${distance}px`,
                } as React.CSSProperties
              }
            >
              <span>{isMotionLab ? "M" : atEnd ? "B" : "A"}</span>
            </div>
          </div>
          <p>
            {isMotionLab
              ? "The object is not moving by magic. A state change supplies a new value, and the timing rule describes the visible path."
              : "The control changes state first. The view is then recomputed from that state, so the visual result stays explainable."}
          </p>
        </div>

        <div className="native-lab-controls">
          <label>
            <span>Duration</span>
            <input
              type="range"
              min="120"
              max="1400"
              step="10"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              onPointerUp={() => persistLab()}
              onKeyUp={() => persistLab()}
              disabled={reduceMotion}
            />
            <output>{duration} ms</output>
          </label>
          <label>
            <span>Distance</span>
            <input
              type="range"
              min="24"
              max="180"
              step="4"
              value={distance}
              onChange={(event) => setDistance(Number(event.target.value))}
              onPointerUp={() => persistLab()}
              onKeyUp={() => persistLab()}
            />
            <output>{distance} pt</output>
          </label>
          <label>
            <span>Timing rule</span>
            <select
              value={curve}
              onChange={(event) => {
                setCurve(event.target.value);
                persistLab({ curve: event.target.value });
              }}
              disabled={reduceMotion}
            >
              <option value="smooth">Smooth</option>
              <option value="precise">Precise</option>
              <option value="spring">Spring</option>
            </select>
          </label>
          <label className="reduce-motion-control">
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(event) => {
                setReduceMotion(event.target.checked);
                persistLab({ reduceMotion: event.target.checked });
              }}
            />
            <span>Simulate Reduce Motion</span>
          </label>
          <button
            className="lab-play"
            type="button"
            onClick={() => {
              setAtEnd((value) => !value);
              persistLab();
            }}
          >
            {atEnd ? "Return to start" : "Play state change"}
          </button>
        </div>
      </section>

      <section className="retrieval-panel" aria-labelledby="retrieval-heading">
        <div>
          <p>Retrieval check</p>
          <h2 id="retrieval-heading">Answer before looking back.</h2>
        </div>
        <fieldset>
          <legend>{quiz.prompt}</legend>
          {quiz.answers.map((option, index) => (
            <label
              key={option}
              className={
                answer === index
                  ? index === quiz.correctIndex
                    ? "is-correct"
                    : "is-incorrect"
                  : ""
              }
            >
              <input
                type="radio"
                name={`lesson-${lessonId}-quiz`}
                checked={answer === index}
                onChange={() => chooseAnswer(index)}
              />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>
        {answer !== null ? (
          <div className="quiz-explanation" role="status">
            <strong>{answer === quiz.correctIndex ? "Correct." : "Not yet."}</strong>
            <p>{quiz.explanation}</p>
          </div>
        ) : null}
      </section>

      <section className="teach-back-panel" aria-labelledby="teach-back-heading">
        <div>
          <p>Teach it back</p>
          <h2 id="teach-back-heading">{teachBack}</h2>
        </div>
        <div className="mastery-actions">
          <p>
            Current level: <strong>{mastery.label}</strong>
            {record?.reviewDueAt ? ` · Next review ${formatReviewDate(record.reviewDueAt, now)}` : ""}
          </p>
          <button type="button" onClick={() => advanceMastery(lessonId)} disabled={(record?.masteryStage ?? 0) >= 6}>
            {record?.masteryStage === 6 ? "Durable understanding recorded" : "I explained it without looking"}
          </button>
          <button
            type="button"
            className={record?.bookmarked ? "is-saved" : ""}
            aria-pressed={record?.bookmarked ?? false}
            onClick={() => toggleBookmark(lessonId)}
          >
            {record?.bookmarked ? "Bookmarked for later" : "Bookmark for later"}
          </button>
        </div>
      </section>

      <section className="lesson-completion" aria-labelledby="completion-heading">
        <div>
          <p>{completed ? "Lesson complete" : "Ready to continue?"}</p>
          <h2 id="completion-heading">
            {completed ? `${lessonTitle} is in your practiced set.` : "Complete means you tried, recalled, and changed something."}
          </h2>
        </div>
        <div>
          <button type="button" onClick={() => markComplete(lessonId)}>
            {completed ? "Completed" : "Mark lesson complete"}
          </button>
          {nextPath ? <a href={nextPath}>Next lesson</a> : <a href="/review">Open review queue</a>}
        </div>
      </section>
    </>
  );
}

function formatReviewDate(value: number, now: number) {
  if (now === 0) return "is scheduled";
  const delta = value - now;
  if (delta <= 0) return "is due now";
  if (delta < 60 * 60 * 1_000) return "later this session";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(value);
}
