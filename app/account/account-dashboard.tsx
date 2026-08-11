"use client";

import { useEffect, useMemo, useState } from "react";

type Progress = {
  current: number;
  completed: number[];
  quizAnswers: Record<string, number>;
  revision: number;
  updatedAt: number | null;
};

export default function AccountDashboard() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [status, setStatus] = useState("Loading your progress…");
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/progress", { cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json()) as { progress?: Progress; error?: string };
        if (!response.ok || !body.progress) throw new Error(body.error || "Progress could not be loaded.");
        if (!cancelled) {
          setProgress(body.progress);
          setStatus("Synced with your account");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) setStatus(error instanceof Error ? error.message : "Progress could not be loaded.");
      });
    return () => { cancelled = true; };
  }, []);

  const coreCompleted = useMemo(
    () => progress?.completed.filter((lesson) => lesson <= 48).length ?? 0,
    [progress],
  );
  const webCompleted = useMemo(
    () => progress?.completed.filter((lesson) => lesson > 48).length ?? 0,
    [progress],
  );
  const percentage = Math.round((coreCompleted / 48) * 100);

  async function deleteAllProgress() {
    if (confirmation !== "DELETE MY PROGRESS") return;
    setDeleting(true);
    setStatus("Deleting your Motion Atlas data…");
    try {
      const response = await fetch("/api/progress/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Progress could not be deleted.");
      setProgress({ current: 1, completed: [], quizAnswers: {}, revision: 0, updatedAt: null });
      setConfirmation("");
      setStatus("Your account progress has been permanently deleted.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Progress could not be deleted.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="account-dashboard">
      <section className="account-progress-card" aria-labelledby="progress-heading">
        <div className="account-progress-ring" style={{ "--account-progress": `${percentage * 3.6}deg` } as React.CSSProperties}>
          <div><strong>{percentage}%</strong><span>complete</span></div>
        </div>
        <div>
          <p className="account-kicker">COURSE PROGRESS</p>
          <h2 id="progress-heading">{coreCompleted} of 48 iOS lessons completed</h2>
          <p>Current position: lesson {progress?.current ?? 1}. Quiz answers saved: {Object.keys(progress?.quizAnswers ?? {}).length}. Optional web lessons completed: {webCompleted} of 8.</p>
          <p className="sync-readout" role="status"><i aria-hidden="true" />{status}</p>
          <a className="button button-primary" href="/motion-atlas-course.html">Continue learning</a>
        </div>
      </section>

      <section className="account-data-grid" aria-label="Progress controls">
        <article>
          <p className="account-kicker">YOUR COPY</p>
          <h2>Export progress</h2>
          <p>Download a readable JSON file containing your course position, completions, and quiz selections.</p>
          <a className="button button-secondary" href="/api/progress/export">Download my data</a>
        </article>

        <article className="danger-card">
          <p className="account-kicker">PERMANENT ACTION</p>
          <h2>Delete account progress</h2>
          <p>This removes Motion Atlas learning data. It does not delete your ChatGPT account or device-only guest progress.</p>
          <label htmlFor="delete-confirmation">Type <strong>DELETE MY PROGRESS</strong> to confirm</label>
          <input
            id="delete-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            className="button button-danger"
            type="button"
            disabled={confirmation !== "DELETE MY PROGRESS" || deleting}
            onClick={deleteAllProgress}
          >
            {deleting ? "Deleting…" : "Delete my progress"}
          </button>
        </article>
      </section>
    </div>
  );
}
