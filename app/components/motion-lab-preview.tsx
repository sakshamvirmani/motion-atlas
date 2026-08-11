"use client";

import { useEffect, useState, type CSSProperties } from "react";

const curves = {
  calm: {
    label: "Calm",
    css: "cubic-bezier(0.22, 1, 0.36, 1)",
    code: ".smooth(duration: 0.65)",
  },
  precise: {
    label: "Precise",
    css: "cubic-bezier(0.2, 0.75, 0.25, 1)",
    code: ".easeOut(duration: 0.65)",
  },
  elastic: {
    label: "Elastic",
    css: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    code: ".spring(duration: 0.65, bounce: 0.28)",
  },
} as const;

type CurveName = keyof typeof curves;

export default function MotionLabPreview() {
  const [atEnd, setAtEnd] = useState(false);
  const [curve, setCurve] = useState<CurveName>("calm");
  const [duration, setDuration] = useState(650);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const style = {
    "--preview-duration": `${reduceMotion ? 1 : duration}ms`,
    "--preview-curve": curves[curve].css,
  } as CSSProperties;

  return (
    <aside className="hero-lab" aria-labelledby="hero-lab-title">
      <div className="lab-titlebar">
        <div>
          <span className="lab-kicker">LIVE INSTRUMENT / 001</span>
          <h2 id="hero-lab-title">Motion anatomy</h2>
        </div>
        <span className="lab-status">
          <i aria-hidden="true" /> Ready
        </span>
      </div>

      <div className="lab-stage" style={style}>
        <div className="stage-labels" aria-hidden="true">
          <span>START / 0 PT</span>
          <span>END / 100%</span>
        </div>
        <div className="stage-track">
          <span
            className={`stage-orb${atEnd ? " is-at-end" : ""}${
              reduceMotion ? " is-reduced" : ""
            }`}
            aria-hidden="true"
          />
          <span className="stage-origin" aria-hidden="true" />
          <span className="stage-endpoint" aria-hidden="true" />
        </div>
        <div className="stage-ruler" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="lab-controls">
        <label>
          <span>FEEL</span>
          <select
            value={curve}
            onChange={(event) => setCurve(event.target.value as CurveName)}
          >
            {Object.entries(curves).map(([value, item]) => (
              <option value={value} key={value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>DURATION</span>
          <select
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
          >
            <option value={220}>220 ms</option>
            <option value={650}>650 ms</option>
            <option value={1100}>1100 ms</option>
          </select>
        </label>

        <button type="button" onClick={() => setAtEnd((value) => !value)}>
          <span aria-hidden="true">{atEnd ? "↶" : "▶"}</span>
          {atEnd ? "Reset" : "Play"}
        </button>
      </div>

      <div className="lab-readout" aria-live="polite">
        <span>SWIFTUI</span>
        <code>
          withAnimation({curves[curve].code}) {"{"} state.toggle() {"}"}
        </code>
      </div>

      <p className="lab-caption">
        {reduceMotion
          ? "Reduced Motion detected: the state changes without spatial travel."
          : "Change the feel, predict the result, then play it again."}
      </p>
    </aside>
  );
}
