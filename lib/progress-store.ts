import { asc, eq } from "drizzle-orm";
import type { ChatGPTUser } from "@/app/chatgpt-auth";
import { getD1, getDb } from "@/db";
import {
  learnerProfiles,
  lessonLearningState,
  lessonProgress,
  quizProgress,
} from "@/db/schema";
import {
  emptyProgress,
  mergeProgress,
  PROGRESS_SCHEMA_VERSION,
  type LabState,
  type MasteryStage,
  type ProgressInput,
  type ProgressSnapshot,
} from "./progress";

let schemaReady: Promise<void> | null = null;

async function ensureProgressSchema() {
  if (!schemaReady) {
    schemaReady = initializeProgressSchema().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

async function initializeProgressSchema() {
  const d1 = getD1();
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS learner_profiles (
      user_id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT,
      current_lesson INTEGER DEFAULT 1 NOT NULL,
      schema_version INTEGER DEFAULT 1 NOT NULL,
      revision INTEGER DEFAULT 0 NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_seen_at INTEGER NOT NULL
    )`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS lesson_progress (
      user_id TEXT NOT NULL,
      lesson_id INTEGER NOT NULL,
      status TEXT DEFAULT 'completed' NOT NULL,
      completed_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, lesson_id)
    )`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_updated
      ON lesson_progress (user_id, updated_at)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS quiz_progress (
      user_id TEXT NOT NULL,
      lesson_id INTEGER NOT NULL,
      selected_answer INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, lesson_id)
    )`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS idx_quiz_progress_user_updated
      ON quiz_progress (user_id, updated_at)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS lesson_learning_state (
      user_id TEXT NOT NULL,
      lesson_id INTEGER NOT NULL,
      bookmarked INTEGER DEFAULT 0 NOT NULL,
      mastery_stage INTEGER DEFAULT 0 NOT NULL,
      review_due_at INTEGER,
      lab_state TEXT DEFAULT '{}' NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, lesson_id)
    )`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS idx_lesson_learning_user_review
      ON lesson_learning_state (user_id, review_due_at)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS mutation_rate_limits (
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      window_started_at INTEGER NOT NULL,
      request_count INTEGER DEFAULT 1 NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, action)
    )`),
  ]);
}

export async function readProgress(userId: string): Promise<ProgressSnapshot> {
  await ensureProgressSchema();
  const db = getDb();
  const [profile, lessons, quizzes, learningRows] = await Promise.all([
    db
      .select()
      .from(learnerProfiles)
      .where(eq(learnerProfiles.userId, userId))
      .limit(1),
    db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId))
      .orderBy(asc(lessonProgress.lessonId)),
    db
      .select({
        lessonId: quizProgress.lessonId,
        selectedAnswer: quizProgress.selectedAnswer,
      })
      .from(quizProgress)
      .where(eq(quizProgress.userId, userId))
      .orderBy(asc(quizProgress.lessonId)),
    db
      .select({
        lessonId: lessonLearningState.lessonId,
        bookmarked: lessonLearningState.bookmarked,
        masteryStage: lessonLearningState.masteryStage,
        reviewDueAt: lessonLearningState.reviewDueAt,
        labState: lessonLearningState.labState,
        updatedAt: lessonLearningState.updatedAt,
      })
      .from(lessonLearningState)
      .where(eq(lessonLearningState.userId, userId))
      .orderBy(asc(lessonLearningState.lessonId)),
  ]);

  const row = profile[0];
  if (!row) return emptyProgress();

  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    current: row.currentLesson,
    completed: lessons.map((lesson) => lesson.lessonId),
    quizAnswers: Object.fromEntries(
      quizzes.map((quiz) => [String(quiz.lessonId), quiz.selectedAnswer]),
    ),
    learning: Object.fromEntries(
      learningRows.map((record) => [
        String(record.lessonId),
        {
          bookmarked: record.bookmarked,
          masteryStage: record.masteryStage as MasteryStage,
          reviewDueAt: record.reviewDueAt,
          labState: parseLabState(record.labState),
          updatedAt: record.updatedAt,
        },
      ]),
    ),
    revision: row.revision,
    updatedAt: row.updatedAt,
  };
}

export async function writeProgress(
  user: ChatGPTUser,
  input: ProgressInput,
): Promise<{ conflict: boolean; progress: ProgressSnapshot }> {
  const server = await readProgress(user.userId);
  if (input.mode === "replace" && input.baseRevision !== server.revision) {
    return { conflict: true, progress: server };
  }

  const merged = mergeProgress(server, input);
  const now = Date.now();
  const revision = server.revision + 1;
  const d1 = getD1();
  const statements: D1PreparedStatement[] = [
    d1
      .prepare(
        `INSERT INTO learner_profiles
          (user_id, display_name, current_lesson, schema_version, revision, created_at, updated_at, last_seen_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
          display_name = excluded.display_name,
          current_lesson = excluded.current_lesson,
          schema_version = excluded.schema_version,
          revision = excluded.revision,
          updated_at = excluded.updated_at,
          last_seen_at = excluded.last_seen_at`,
      )
      .bind(
        user.userId,
        user.displayName,
        merged.current,
        PROGRESS_SCHEMA_VERSION,
        revision,
        now,
        now,
        now,
      ),
    d1.prepare("DELETE FROM lesson_progress WHERE user_id = ?").bind(user.userId),
    d1.prepare("DELETE FROM quiz_progress WHERE user_id = ?").bind(user.userId),
    d1.prepare("DELETE FROM lesson_learning_state WHERE user_id = ?").bind(user.userId),
  ];

  for (const lessonId of merged.completed) {
    statements.push(
      d1
        .prepare(
          `INSERT INTO lesson_progress
            (user_id, lesson_id, status, completed_at, updated_at)
           VALUES (?, ?, 'completed', ?, ?)`,
        )
        .bind(user.userId, lessonId, now, now),
    );
  }

  for (const [lessonId, selectedAnswer] of Object.entries(merged.quizAnswers)) {
    statements.push(
      d1
        .prepare(
          `INSERT INTO quiz_progress
            (user_id, lesson_id, selected_answer, updated_at)
           VALUES (?, ?, ?, ?)`,
        )
        .bind(user.userId, Number(lessonId), selectedAnswer, now),
    );
  }

  for (const [lessonId, record] of Object.entries(merged.learning)) {
    statements.push(
      d1
        .prepare(
          `INSERT INTO lesson_learning_state
            (user_id, lesson_id, bookmarked, mastery_stage, review_due_at, lab_state, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          user.userId,
          Number(lessonId),
          record.bookmarked ? 1 : 0,
          record.masteryStage,
          record.reviewDueAt,
          JSON.stringify(record.labState),
          record.updatedAt,
        ),
    );
  }

  await d1.batch(statements);

  return {
    conflict: false,
    progress: {
      ...merged,
      revision,
      updatedAt: now,
    },
  };
}

export async function deleteProgress(userId: string) {
  await ensureProgressSchema();
  const d1 = getD1();
  const results = await d1.batch([
    d1.prepare("DELETE FROM lesson_learning_state WHERE user_id = ?").bind(userId),
    d1.prepare("DELETE FROM quiz_progress WHERE user_id = ?").bind(userId),
    d1.prepare("DELETE FROM lesson_progress WHERE user_id = ?").bind(userId),
    d1.prepare("DELETE FROM learner_profiles WHERE user_id = ?").bind(userId),
  ]);

  return {
    learning: Number(results[0]?.meta?.changes ?? 0),
    quizAnswers: Number(results[1]?.meta?.changes ?? 0),
    lessons: Number(results[2]?.meta?.changes ?? 0),
    profiles: Number(results[3]?.meta?.changes ?? 0),
  };
}

function parseLabState(value: string): LabState {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as LabState;
  } catch {
    return {};
  }
}
