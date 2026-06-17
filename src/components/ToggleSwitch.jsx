import React from "react";

export default function ToggleSwitch({ mode, setMode }) {
  return (
    <div className="toggle-wrap" role="tablist" aria-label="Explanation mode">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "technical"}
        className={`toggle-btn ${mode === "technical" ? "toggle-active" : ""}`}
        onClick={() => setMode("technical")}
      >
        Technical Breakdown
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "analogical"}
        className={`toggle-btn ${mode === "analogical" ? "toggle-active" : ""}`}
        onClick={() => setMode("analogical")}
      >
        Analogical Breakdown
      </button>
    </div>
  );
}