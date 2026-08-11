"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  emptyProgress,
  reviewDueAtForStage,
  type LabState,
  type LessonLearningInput,
  type MasteryStage,
  type ProgressSnapshot,
} from "@/lib/progress";

const GUEST_STORAGE_KEY = "motion-atlas-native-v1";
const LEGACY_STORAGE_KEY = "motion-atlas-v2";
const ACCOUNT_STORAGE_PREFIX = "motion-atlas-native-account-v1:";
const IMPORT_MARKER_PREFIX = "motion-atlas-native-imported-v1:";

type SyncState = "loading" | "device" | "synced" | "saving" | "offline" | "error";

type LearningContextValue = {
  progress: ProgressSnapshot;
  hydrated: boolean;
  authenticated: boolean;
  displayName: string;
  syncState: SyncState;
  syncMessage: string;
  guestImportAvailable: boolean;
  importGuestProgress: () => Promise<void>;
  setCurrentLesson: (lessonId: number) => void;
  toggleBookmark: (lessonId: number) => void;
  recordQuizAnswer: (lessonId: number, answer: number, correct: boolean) => void;
  saveLabState: (lessonId: number, labState: LabState) => void;
  advanceMastery: (lessonId: number) => void;
  markComplete: (lessonId: number) => void;
};

const LearningContext = createContext<LearningContextValue | null>(null);

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ProgressSnapshot>(() => emptyProgress());
  const [hydrated, setHydrated] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [syncState, setSyncState] = useState<SyncState>("loading");
  const [syncMessage, setSyncMessage] = useState("Loading saved progress");
  const [guestImportAvailable, setGuestImportAvailable] = useState(false);

  const progressRef = useRef(progress);
  const storageKeyRef = useRef(GUEST_STORAGE_KEY);
  const accountKeyRef = useRef("");
  const revisionRef = useRef(0);
  const authenticatedRef = useRef(false);
  const syncTimerRef = useRef<number | null>(null);
  const syncingRef = useRef(false);
  const dirtyRef = useRef(false);

  const persist = useCallback((next: ProgressSnapshot) => {
    try {
      localStorage.setItem(storageKeyRef.current, JSON.stringify(next));
    } catch {
      setSyncState("error");
      setSyncMessage("This browser could not save progress");
    }
  }, []);

  const applyProgress = useCallback(
    (next: ProgressSnapshot) => {
      progressRef.current = next;
      revisionRef.current = next.revision;
      setProgress(next);
      persist(next);
    },
    [persist],
  );

  const pushLatest = useCallback(async () => {
    if (!authenticatedRef.current) return;
    if (syncingRef.current) {
      dirtyRef.current = true;
      return;
    }

    syncingRef.current = true;
    let attempts = 0;
    try {
      do {
        dirtyRef.current = false;
        attempts += 1;
        const outgoing = progressRef.current;
        const signature = progressSignature(outgoing);
        setSyncState("saving");
        setSyncMessage("Saving to your account");

        const response = await fetch("/api/progress", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(toProgressInput(outgoing, revisionRef.current, "replace")),
        });
        const body = (await response.json()) as {
          progress?: ProgressSnapshot;
          error?: string;
        };

        if (response.status === 409 && body.progress && attempts < 3) {
          revisionRef.current = body.progress.revision;
          dirtyRef.current = true;
          continue;
        }
        if (!response.ok || !body.progress) {
          throw new Error(body.error || "Progress could not be saved.");
        }

        revisionRef.current = body.progress.revision;
        if (signature === progressSignature(progressRef.current)) {
          applyProgress(body.progress);
        } else {
          dirtyRef.current = true;
        }
        setSyncState("synced");
        setSyncMessage("Saved with your account");
      } while (dirtyRef.current && attempts < 3);
    } catch {
      setSyncState("offline");
      setSyncMessage("Saved here. Account sync will retry when you are online");
    } finally {
      syncingRef.current = false;
    }
  }, [applyProgress]);

  const scheduleSync = useCallback(() => {
    if (!authenticatedRef.current) return;
    if (syncTimerRef.current !== null) window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = window.setTimeout(() => {
      syncTimerRef.current = null;
      void pushLatest();
    }, 650);
  }, [pushLatest]);

  const update = useCallback(
    (updater: (current: ProgressSnapshot) => ProgressSnapshot) => {
      const next = updater(progressRef.current);
      progressRef.current = next;
      setProgress(next);
      persist(next);
      if (authenticatedRef.current) {
        dirtyRef.current = true;
        scheduleSync();
      } else {
        setSyncState("device");
        setSyncMessage("Saved on this device");
      }
    },
    [persist, scheduleSync],
  );

  useEffect(() => {
    let cancelled = false;
    async function hydrate(guest: ProgressSnapshot) {
      try {
        const meResponse = await fetch("/api/me", { cache: "no-store" });
        const me = (await meResponse.json()) as {
          authenticated: boolean;
          accountKey?: string;
          displayName?: string;
        };
        if (cancelled || !me.authenticated || !me.accountKey) {
          setSyncState("device");
          setSyncMessage("Saved on this device");
          setHydrated(true);
          return;
        }

        authenticatedRef.current = true;
        setAuthenticated(true);
        setDisplayName(me.displayName || "Signed-in learner");
        accountKeyRef.current = me.accountKey;
        storageKeyRef.current = `${ACCOUNT_STORAGE_PREFIX}${me.accountKey}`;
        const cached = readStoredProgress(storageKeyRef.current);
        if (cached) {
          progressRef.current = cached;
          revisionRef.current = cached.revision;
          setProgress(cached);
        }

        const response = await fetch("/api/progress", { cache: "no-store" });
        const body = (await response.json()) as {
          progress?: ProgressSnapshot;
          error?: string;
        };
        if (!response.ok || !body.progress) {
          throw new Error(body.error || "Account progress could not be loaded.");
        }
        if (cancelled) return;
        applyProgress(body.progress);
        const imported = safeGet(`${IMPORT_MARKER_PREFIX}${me.accountKey}`) === "1";
        setGuestImportAvailable(hasLearningWork(guest) && !imported);
        setSyncState("synced");
        setSyncMessage("Saved with your account");
      } catch {
        if (!cancelled) {
          setSyncState(authenticatedRef.current ? "offline" : "device");
          setSyncMessage(
            authenticatedRef.current
              ? "Using the saved account copy on this device"
              : "Saved on this device",
          );
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    const begin = window.setTimeout(() => {
      const guest = readGuestProgress();
      storageKeyRef.current = GUEST_STORAGE_KEY;
      progressRef.current = guest;
      setProgress(guest);
      void hydrate(guest);
    }, 0);
    const handleOnline = () => void pushLatest();
    window.addEventListener("online", handleOnline);
    return () => {
      cancelled = true;
      window.clearTimeout(begin);
      window.removeEventListener("online", handleOnline);
      if (syncTimerRef.current !== null) window.clearTimeout(syncTimerRef.current);
    };
  }, [applyProgress, pushLatest]);

  const importGuestProgress = useCallback(async () => {
    if (!authenticatedRef.current || !accountKeyRef.current) return;
    const guest = readGuestProgress();
    setSyncState("saving");
    setSyncMessage("Merging this device with your account");
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(toProgressInput(guest, revisionRef.current, "merge")),
      });
      const body = (await response.json()) as {
        progress?: ProgressSnapshot;
        error?: string;
      };
      if (!response.ok || !body.progress) {
        throw new Error(body.error || "Device progress could not be imported.");
      }
      applyProgress(body.progress);
      safeSet(`${IMPORT_MARKER_PREFIX}${accountKeyRef.current}`, "1");
      setGuestImportAvailable(false);
      setSyncState("synced");
      setSyncMessage("Device progress merged with your account");
    } catch {
      setSyncState("offline");
      setSyncMessage("Import could not finish. Your device copy is still safe");
    }
  }, [applyProgress]);

  const setCurrentLesson = useCallback(
    (lessonId: number) => update((current) => ({ ...current, current: lessonId })),
    [update],
  );

  const toggleBookmark = useCallback(
    (lessonId: number) =>
      update((current) =>
        updateLearningRecord(current, lessonId, (record) => ({
          ...record,
          bookmarked: !record.bookmarked,
        })),
      ),
    [update],
  );

  const recordQuizAnswer = useCallback(
    (lessonId: number, answer: number, correct: boolean) =>
      update((current) => {
        const next = {
          ...current,
          quizAnswers: { ...current.quizAnswers, [String(lessonId)]: answer },
        };
        return updateLearningRecord(next, lessonId, (record) =>
          setMasteryStage(record, Math.max(record.masteryStage, correct ? 2 : 1) as MasteryStage),
        );
      }),
    [update],
  );

  const saveLabState = useCallback(
    (lessonId: number, labState: LabState) =>
      update((current) =>
        updateLearningRecord(current, lessonId, (record) => ({ ...record, labState })),
      ),
    [update],
  );

  const advanceMastery = useCallback(
    (lessonId: number) =>
      update((current) =>
        updateLearningRecord(current, lessonId, (record) =>
          setMasteryStage(
            record,
            Math.min(6, record.masteryStage + 1) as MasteryStage,
          ),
        ),
      ),
    [update],
  );

  const markComplete = useCallback(
    (lessonId: number) =>
      update((current) => {
        const completed = [...new Set([...current.completed, lessonId])].sort((a, b) => a - b);
        const next = { ...current, completed };
        return updateLearningRecord(next, lessonId, (record) =>
          setMasteryStage(record, Math.max(3, record.masteryStage) as MasteryStage),
        );
      }),
    [update],
  );

  const value = useMemo<LearningContextValue>(
    () => ({
      progress,
      hydrated,
      authenticated,
      displayName,
      syncState,
      syncMessage,
      guestImportAvailable,
      importGuestProgress,
      setCurrentLesson,
      toggleBookmark,
      recordQuizAnswer,
      saveLabState,
      advanceMastery,
      markComplete,
    }),
    [
      progress,
      hydrated,
      authenticated,
      displayName,
      syncState,
      syncMessage,
      guestImportAvailable,
      importGuestProgress,
      setCurrentLesson,
      toggleBookmark,
      recordQuizAnswer,
      saveLabState,
      advanceMastery,
      markComplete,
    ],
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const value = useContext(LearningContext);
  if (!value) throw new Error("useLearning must be used inside LearningProvider.");
  return value;
}

function readGuestProgress() {
  const native = readStoredProgress(GUEST_STORAGE_KEY) ?? emptyProgress();
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "{}") as {
      current?: unknown;
      completed?: unknown;
      quizAnswers?: unknown;
    };
    const legacyCompleted = Array.isArray(legacy.completed)
      ? legacy.completed.filter(isLessonId)
      : [];
    const completed = [...new Set([...native.completed, ...legacyCompleted])].sort(
      (a, b) => a - b,
    );
    const current = isLessonId(legacy.current) ? legacy.current : native.current;
    const quizAnswers = {
      ...normalizeQuizAnswers(legacy.quizAnswers),
      ...native.quizAnswers,
    };
    return { ...native, current, completed, quizAnswers };
  } catch {
    return native;
  }
}

function readStoredProgress(key: string): ProgressSnapshot | null {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null") as Partial<ProgressSnapshot> | null;
    if (!value || !isLessonId(value.current)) return null;
    return {
      schemaVersion: 2,
      current: value.current,
      completed: Array.isArray(value.completed) ? value.completed.filter(isLessonId) : [],
      quizAnswers: isRecord(value.quizAnswers) ? (value.quizAnswers as Record<string, number>) : {},
      learning: isRecord(value.learning)
        ? (value.learning as ProgressSnapshot["learning"])
        : {},
      revision: Number.isInteger(value.revision) ? Number(value.revision) : 0,
      updatedAt: typeof value.updatedAt === "number" ? value.updatedAt : null,
    };
  } catch {
    return null;
  }
}

function toProgressInput(
  progress: ProgressSnapshot,
  baseRevision: number,
  mode: "replace" | "merge",
) {
  return {
    current: progress.current,
    completed: progress.completed,
    quizAnswers: progress.quizAnswers,
    learning: Object.fromEntries(
      Object.entries(progress.learning).map(([lessonId, record]) => [
        lessonId,
        {
          bookmarked: record.bookmarked,
          masteryStage: record.masteryStage,
          labState: record.labState,
        } satisfies LessonLearningInput,
      ]),
    ),
    baseRevision,
    mode,
  };
}

function updateLearningRecord(
  progress: ProgressSnapshot,
  lessonId: number,
  updater: (record: ProgressSnapshot["learning"][string]) => ProgressSnapshot["learning"][string],
) {
  const key = String(lessonId);
  const current = progress.learning[key] ?? {
    bookmarked: false,
    masteryStage: 0,
    labState: {},
    reviewDueAt: null,
    updatedAt: Date.now(),
  };
  return {
    ...progress,
    learning: {
      ...progress.learning,
      [key]: { ...updater(current), updatedAt: Date.now() },
    },
  };
}

function setMasteryStage(
  record: ProgressSnapshot["learning"][string],
  masteryStage: MasteryStage,
) {
  if (record.masteryStage === masteryStage) return record;
  return {
    ...record,
    masteryStage,
    reviewDueAt: reviewDueAtForStage(masteryStage),
  };
}

function progressSignature(progress: ProgressSnapshot) {
  return JSON.stringify({
    current: progress.current,
    completed: progress.completed,
    quizAnswers: progress.quizAnswers,
    learning: progress.learning,
  });
}

function hasLearningWork(progress: ProgressSnapshot) {
  return (
    progress.completed.length > 0 ||
    Object.keys(progress.quizAnswers).length > 0 ||
    Object.values(progress.learning).some(
      (record) =>
        record.bookmarked ||
        record.masteryStage > 0 ||
        Object.keys(record.labState).length > 0,
    )
  );
}

function isLessonId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 56;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeQuizAnswers(value: unknown) {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([lessonId, answer]) =>
        isLessonId(Number(lessonId)) &&
        typeof answer === "number" &&
        Number.isInteger(answer) &&
        answer >= 0 &&
        answer <= 2,
    ),
  ) as Record<string, number>;
}

function safeGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Import success is already stored in D1; a missing marker only reoffers the merge.
  }
}
