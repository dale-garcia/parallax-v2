import React from "react";

const RISK_STYLES = {
  danger: { color: "#ff4d6d", label: "DANGER" },
  caution: { color: "#ffb454", label: "CAUTION" },
  safe: { color: "#3ddc97", label: "SAFE" },
};

export default function RiskOverlay({ flags }) {
  if (!flags || flags.length === 0) return null;
  return (
    <div className="risk-panel">
      <div className="risk-panel-header">
        <span className="risk-pulse" />
        High-Risk Elements Detected
      </div>
      {flags.map((flag, i) => (
        <div key={i} className="risk-item">
          <span className="risk-tag" style={{ background: RISK_STYLES.danger.color }}>
            {RISK_STYLES.danger.label}
          </span>
          <div>
            <strong>{flag.element_name}</strong>
            <p>{flag.warning}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function riskBadge(level) {
  const style = RISK_STYLES[level] || RISK_STYLES.safe;
  return (
    <span className="risk-badge" style={{ color: style.color, borderColor: style.color }}>
      {style.label}
    </span>
  );
}