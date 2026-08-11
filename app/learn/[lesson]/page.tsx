import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearningProvider } from "@/app/components/learning/learning-provider";
import {
  getLessonBySlug,
  getModule,
  lessonPath,
  lessons,
} from "@/content/course";
import LessonExperience from "./lesson-experience";

type LessonPageProps = {
  params: Promise<{ lesson: string }>;
};

export function generateStaticParams() {
  return lessons.map((lesson) => ({ lesson: lesson.slug }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { lesson: slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) return {};
  return {
    title: `${lesson.title} | Motion Atlas`,
    description: lesson.summary,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lesson: slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();

  const trackLessons = lessons.filter((candidate) => candidate.track === lesson.track);
  const position = trackLessons.findIndex((candidate) => candidate.id === lesson.id);
  const previous = position > 0 ? trackLessons[position - 1] : null;
  const next = position < trackLessons.length - 1 ? trackLessons[position + 1] : null;
  const courseModule = getModule(lesson.module);

  return (
    <LearningProvider>
      <main className="lesson-shell" id="main-content" tabIndex={-1}>
        <header className="lesson-header">
          <a className="lesson-brand" href="/">
            <span aria-hidden="true">M</span>
            <strong>Motion Atlas</strong>
          </a>
          <nav aria-label="Lesson navigation">
            <a href="/learn">Course library</a>
            <a href="/review">Review</a>
            <a href="/account">Account</a>
          </nav>
        </header>

        <div className="lesson-layout">
          <aside className="lesson-context" aria-label="Lesson context">
            <p>{lesson.track === "ios" ? "iOS + SwiftUI" : "Optional web motion"}</p>
            <strong>{String(lesson.id).padStart(2, "0")}</strong>
            <span>{courseModule?.title}</span>
            <dl>
              <div><dt>Level</dt><dd>{lesson.level}</dd></div>
              <div><dt>Time</dt><dd>{lesson.minutes} minutes</dd></div>
              <div><dt>Reviewed</dt><dd>{lesson.lastReviewed}</dd></div>
              {lesson.minimumIOS ? <div><dt>Target</dt><dd>iOS {lesson.minimumIOS}+</dd></div> : null}
            </dl>
            <a href="/learn">Search all lessons</a>
          </aside>

          <article className="lesson-article">
            <header className="lesson-title-block">
              <p>{courseModule?.title}</p>
              <h1>{lesson.title}</h1>
              <p>{lesson.summary}</p>
            </header>

            <section className="mental-model" aria-labelledby="mental-model-heading">
              <p>Mental model</p>
              <h2 id="mental-model-heading">{lesson.body.mentalModel}</h2>
            </section>

            <section className="lesson-prose" aria-labelledby="concept-heading">
              <h2 id="concept-heading">Build the idea</h2>
              <div dangerouslySetInnerHTML={{ __html: lesson.body.conceptHtml }} />
              <div dangerouslySetInnerHTML={{ __html: lesson.body.explanationHtml }} />
            </section>

            {lesson.code ? (
              <section className="lesson-code" aria-labelledby="code-heading">
                <header>
                  <p>{lesson.code.language}</p>
                  <h2 id="code-heading">{lesson.code.title}</h2>
                </header>
                <pre><code>{lesson.code.source}</code></pre>
              </section>
            ) : null}

            <section className="lesson-practice" aria-labelledby="practice-heading">
              <h2 id="practice-heading">Try it yourself</h2>
              <div dangerouslySetInnerHTML={{ __html: lesson.body.practiceHtml }} />
            </section>

            <LessonExperience
              lessonId={lesson.id}
              lessonTitle={lesson.title}
              lab={lesson.lab}
              quiz={lesson.quiz}
              teachBack={lesson.body.teachBack}
              nextPath={next ? lessonPath(next) : null}
            />

            <section className="lesson-sources" aria-labelledby="sources-heading">
              <div>
                <p>Evidence and further reading</p>
                <h2 id="sources-heading">Read the primary material.</h2>
              </div>
              <ul>
                {lesson.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
                  </li>
                ))}
              </ul>
            </section>

            <nav className="lesson-sequence" aria-label="Previous and next lessons">
              {previous ? (
                <a href={lessonPath(previous)}><span>Previous</span><strong>{previous.title}</strong></a>
              ) : <span />}
              {next ? (
                <a href={lessonPath(next)}><span>Next</span><strong>{next.title}</strong></a>
              ) : (
                <a href="/review"><span>Next</span><strong>Review what you learned</strong></a>
              )}
            </nav>
          </article>
        </div>
      </main>
    </LearningProvider>
  );
}
