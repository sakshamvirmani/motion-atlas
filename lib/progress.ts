export const COURSE_LESSON_COUNT = 56;
export const PROGRESS_SCHEMA_VERSION = 2;
export const MAX_PROGRESS_BODY_BYTES = 65_536;
export const MAX_MASTERY_STAGE = 6;
export const MAX_LAB_FIELDS = 16;
export const MAX_LAB_STRING_LENGTH = 120;

export const MASTERY_LEVELS = [
  { stage: 0, label: "Not started", reviewLabel: "No review scheduled" },
  { stage: 1, label: "Touched", reviewLabel: "Later this session" },
  { stage: 2, label: "Recalled", reviewLabel: "Tomorrow" },
  { stage: 3, label: "Practiced", reviewLabel: "In 3 days" },
  { stage: 4, label: "Applied", reviewLabel: "In 7 days" },
  { stage: 5, label: "Explained", reviewLabel: "In 14 days" },
  { stage: 6, label: "Durable", reviewLabel: "In 30 days" },
] as const;

const REVIEW_INTERVALS_MS = [
  null,
  20 * 60 * 1_000,
  24 * 60 * 60 * 1_000,
  3 * 24 * 60 * 60 * 1_000,
  7 * 24 * 60 * 60 * 1_000,
  14 * 24 * 60 * 60 * 1_000,
  30 * 24 * 60 * 60 * 1_000,
] as const;

export type MasteryStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type LabValue = string | number | boolean;
export type LabState = Record<string, LabValue>;

export type LessonLearningInput = {
  bookmarked: boolean;
  masteryStage: MasteryStage;
  labState: LabState;
};

export type LessonLearningSnapshot = LessonLearningInput & {
  reviewDueAt: number | null;
  updatedAt: number;
};

export type ProgressSnapshot = {
  schemaVersion: number;
  current: number;
  completed: number[];
  quizAnswers: Record<string, number>;
  learning: Record<string, LessonLearningSnapshot>;
  revision: number;
  updatedAt: number | null;
};

export type ProgressInput = {
  current: number;
  completed: number[];
  quizAnswers: Record<string, number>;
  learning: Record<string, LessonLearningInput> | null;
  baseRevision: number;
  mode: "replace" | "merge";
};

export function emptyProgress(): ProgressSnapshot {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    current: 1,
    completed: [],
    quizAnswers: {},
    learning: {},
    revision: 0,
    updatedAt: null,
  };
}

export function reviewDueAtForStage(stage: MasteryStage, now = Date.now()) {
  const interval = REVIEW_INTERVALS_MS[stage];
  return interval === null ? null : now + interval;
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
  const quizEntries = Object.entries(quizAnswers);
  if (quizEntries.length > COURSE_LESSON_COUNT) {
    return { ok: false, error: "Too many quiz answers were submitted." };
  }

  for (const [rawLessonId, answer] of quizEntries) {
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

  const normalizedLearning = validateLearning(value.learning);
  if (!normalizedLearning.ok) return normalizedLearning;

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
      learning: normalizedLearning.value,
      baseRevision,
      mode,
    },
  };
}

export function mergeProgress(
  server: ProgressSnapshot,
  incoming: ProgressInput,
  now = Date.now(),
): Omit<ProgressSnapshot, "revision" | "updatedAt"> {
  const learning = mergeLearning(server.learning, incoming.learning, incoming.mode, now);

  if (incoming.mode === "replace") {
    return {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      current: incoming.current,
      completed: incoming.completed,
      quizAnswers: incoming.quizAnswers,
      learning,
    };
  }

  const completed = [...new Set([...server.completed, ...incoming.completed])].sort(
    (a, b) => a - b,
  );
  const serverHasWork =
    server.completed.length > 0 ||
    Object.keys(server.quizAnswers).length > 0 ||
    Object.keys(server.learning).length > 0 ||
    server.revision > 0;

  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    current: serverHasWork ? server.current : incoming.current,
    completed,
    quizAnswers: { ...incoming.quizAnswers, ...server.quizAnswers },
    learning,
  };
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function validateLearning(value: unknown):
  | { ok: true; value: Record<string, LessonLearningInput> | null }
  | { ok: false; error: string } {
  if (value === undefined) return { ok: true, value: null };
  if (!isPlainObject(value)) {
    return { ok: false, error: "Learning state must be a JSON object." };
  }

  const entries = Object.entries(value);
  if (entries.length > COURSE_LESSON_COUNT) {
    return { ok: false, error: "Too many lesson learning records were submitted." };
  }

  const normalized: Record<string, LessonLearningInput> = {};
  for (const [rawLessonId, rawRecord] of entries) {
    const lessonId = Number(rawLessonId);
    if (!isLessonId(lessonId) || !isPlainObject(rawRecord)) {
      return { ok: false, error: "A learning record is outside the course." };
    }
    if (typeof rawRecord.bookmarked !== "boolean") {
      return { ok: false, error: "Bookmark state must be true or false." };
    }
    if (!isMasteryStage(rawRecord.masteryStage)) {
      return { ok: false, error: "Mastery stage is invalid." };
    }
    const labState = validateLabState(rawRecord.labState);
    if (!labState.ok) return labState;

    normalized[String(lessonId)] = {
      bookmarked: rawRecord.bookmarked,
      masteryStage: rawRecord.masteryStage,
      labState: labState.value,
    };
  }
  return { ok: true, value: normalized };
}

function validateLabState(value: unknown):
  | { ok: true; value: LabState }
  | { ok: false; error: string } {
  if (!isPlainObject(value)) {
    return { ok: false, error: "Lab state must be a JSON object." };
  }
  const entries = Object.entries(value);
  if (entries.length > MAX_LAB_FIELDS) {
    return { ok: false, error: "A lab has too many saved controls." };
  }

  const normalized: LabState = {};
  for (const [key, rawValue] of entries) {
    if (!/^[a-z][a-zA-Z0-9]{0,31}$/.test(key)) {
      return { ok: false, error: "A lab control name is invalid." };
    }
    if (typeof rawValue === "string") {
      if (rawValue.length > MAX_LAB_STRING_LENGTH) {
        return { ok: false, error: "A saved lab value is too long." };
      }
      normalized[key] = rawValue;
      continue;
    }
    if (typeof rawValue === "number") {
      if (!Number.isFinite(rawValue) || Math.abs(rawValue) > 1_000_000) {
        return { ok: false, error: "A saved lab number is invalid." };
      }
      normalized[key] = rawValue;
      continue;
    }
    if (typeof rawValue === "boolean") {
      normalized[key] = rawValue;
      continue;
    }
    return { ok: false, error: "Lab values must be text, numbers, or true/false." };
  }
  return { ok: true, value: normalized };
}

function mergeLearning(
  server: Record<string, LessonLearningSnapshot>,
  incoming: Record<string, LessonLearningInput> | null,
  mode: ProgressInput["mode"],
  now: number,
) {
  const merged = { ...server };
  if (!incoming) return merged;

  for (const [lessonId, record] of Object.entries(incoming)) {
    const previous = server[lessonId];
    const masteryStage =
      mode === "merge" && previous
        ? (Math.max(previous.masteryStage, record.masteryStage) as MasteryStage)
        : record.masteryStage;
    const bookmarked =
      mode === "merge" && previous
        ? previous.bookmarked || record.bookmarked
        : record.bookmarked;
    const labState =
      mode === "merge" && previous
        ? { ...record.labState, ...previous.labState }
        : record.labState;
    const reviewDueAt =
      previous && previous.masteryStage === masteryStage
        ? previous.reviewDueAt
        : reviewDueAtForStage(masteryStage, now);

    merged[lessonId] = {
      bookmarked,
      masteryStage,
      labState,
      reviewDueAt,
      updatedAt: now,
    };
  }
  return merged;
}

function isMasteryStage(value: unknown): value is MasteryStage {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_MASTERY_STAGE
  );
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
