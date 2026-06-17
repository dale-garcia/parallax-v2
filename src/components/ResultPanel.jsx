import React from "react";
import { riskBadge } from "./RiskOverlay.jsx";

function groupByCategory(elements) {
  const groups = {};
  for (const el of elements || []) {
    const cat = el.category || "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(el);
  }
  return groups;
}

export default function ResultPanel({ data, mode }) {
  const summary = mode === "technical" ? data.technical_summary : data.analogical_summary;
  const grouped = groupByCategory(data.elements);

  return (
    <div className="result-panel">
      <div className="result-meta">
        <span className="platform-tag">{data.platform_guess || "Unknown Platform"}</span>
        <span className="confidence-tag">Confidence: {data.confidence ?? "—"}%</span>
        <span className="confidence-tag">{data.elements?.length ?? 0} elements found</span>
      </div>

      <div className="summary-box">
        <h3>{mode === "technical" ? "Technical Overview" : "Analogical Overview"}</h3>
        <p>{summary}</p>
      </div>

      {mode === "technical" && data.safe_action_path?.length > 0 && (
        <div className="safe-path-box">
          <h4>Suggested Safe Action Path</h4>
          <ol>
            {data.safe_action_path.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="category-group">
          <div className="category-divider">
            <span>{category}</span>
          </div>
          <div className="elements-list">
            {items.map((el, i) => (
              <div key={i} className={`element-card risk-${el.risk_level}`}>
                <div className="element-card-head">
                  <strong>{el.name}</strong>
                  {riskBadge(el.risk_level)}
                </div>
                <p>{mode === "technical" ? el.technical_explanation : el.analogical_explanation}</p>
                {el.risk_level !== "safe" && el.risk_reason && (
                  <p className="risk-reason">⚠ {el.risk_reason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}