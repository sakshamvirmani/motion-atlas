export const COURSE_LESSON_COUNT = 56;
export const PROGRESS_SCHEMA_VERSION = 1;
export const MAX_PROGRESS_BODY_BYTES = 32_768;

export type ProgressSnapshot = {
  schemaVersion: number;
  current: number;
  completed: number[];
  quizAnswers: Record<string, number>;
  revision: number;
  updatedAt: number | null;
};

export type ProgressInput = {
  current: number;
  completed: number[];
  quizAnswers: Record<string, number>;
  baseRevision: number;
  mode: "replace" | "merge";
};

export function emptyProgress(): ProgressSnapshot {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    current: 1,
    completed: [],
    quizAnswers: {},
    revision: 0,
    updatedAt: null,
  };
}

export function validateProgressInput(value: unknown):
  | { ok: true; value: ProgressInput }
  | { ok: false; error: string } {
  if (!isPlainObject(value)) {
    return { ok: false, error: "Progress must be a JSON object." };
  }

  const current = value.current;
  const completed = value.completed;
  const quizAnswers = value.quizAnswers;
  const baseRevision = value.baseRevision;
  const mode = value.mode;

  if (!isLessonId(current)) {
    return { ok: false, error: "Current lesson is outside the course." };
  }
  if (!Array.isArray(completed) || completed.length > COURSE_LESSON_COUNT) {
    return { ok: false, error: "Completed lessons are invalid." };
  }

  const completedIds = [...new Set(completed)];
  if (!completedIds.every(isLessonId)) {
    return { ok: false, error: "Completed lessons contain an unknown lesson." };
  }
  completedIds.sort((a, b) => a - b);

  if (!isPlainObject(quizAnswers)) {
    return { ok: false, error: "Quiz answers must be a JSON object." };
  }

  const normalizedQuizAnswers: Record<string, number> = {};
  const entries = Object.entries(quizAnswers);
  if (entries.length > COURSE_LESSON_COUNT) {
    return { ok: false, error: "Too many quiz answers were submitted." };
  }

  for (const [rawLessonId, answer] of entries) {
    const lessonId = Number(rawLessonId);
    if (
      !isLessonId(lessonId) ||
      typeof answer !== "number" ||
      !Number.isInteger(answer) ||
      answer < 0 ||
      answer > 2
    ) {
      return { ok: false, error: "A quiz answer is outside the course." };
    }
    normalizedQuizAnswers[String(lessonId)] = answer;
  }

  if (
    typeof baseRevision !== "number" ||
    !Number.isInteger(baseRevision) ||
    baseRevision < 0
  ) {
    return { ok: false, error: "Progress revision is invalid." };
  }
  if (mode !== "replace" && mode !== "merge") {
    return { ok: false, error: "Progress mode must be replace or merge." };
  }

  return {
    ok: true,
    value: {
      current,
      completed: completedIds,
      quizAnswers: normalizedQuizAnswers,
      baseRevision,
      mode,
    },
  };
}

export function mergeProgress(
  server: ProgressSnapshot,
  incoming: ProgressInput,
): Omit<ProgressSnapshot, "revision" | "updatedAt"> {
  if (incoming.mode === "replace") {
    return {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      current: incoming.current,
      completed: incoming.completed,
      quizAnswers: incoming.quizAnswers,
    };
  }

  const completed = [...new Set([...server.completed, ...incoming.completed])].sort(
    (a, b) => a - b,
  );
  const serverHasWork =
    server.completed.length > 0 || Object.keys(server.quizAnswers).length > 0 || server.revision > 0;

  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    current: serverHasWork ? server.current : incoming.current,
    completed,
    quizAnswers: { ...incoming.quizAnswers, ...server.quizAnswers },
  };
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function isLessonId(value: unknown): value is number {
  return (
    Number.isInteger(value) &&
    typeof value === "number" &&
    value >= 1 &&
    value <= COURSE_LESSON_COUNT
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
