import React, { useState, useCallback } from "react";
import UploadZone from "./components/UploadZone.jsx";
import InterestPicker from "./components/InterestPicker.jsx";
import ToggleSwitch from "./components/ToggleSwitch.jsx";
import ResultPanel from "./components/ResultPanel.jsx";
import RiskOverlay from "./components/RiskOverlay.jsx";

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [interest, setInterest] = useState("Everyday Life");
  const [mode, setMode] = useState("technical");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);

  const handleFileSelected = useCallback((selectedFile) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResult(null);
    setStatus("idle");
    setErrorMsg("");
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      formData.append("interest", interest);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const payload = await res.json();

      if (!res.ok) {
  setStatus("error");
  if (res.status === 429 || (payload.message && payload.message.toLowerCase().includes("quota"))) {
    setErrorMsg("This demo has hit its free daily AI usage limit. Please check back tomorrow, or contact me directly for a live walkthrough.");
  } else {
    setErrorMsg(payload.message || "Analysis failed. Please try again.");
  }
  return;
}

      setResult(payload.data);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Could not reach the server. Please check your connection and try again.");
    }
  }, [file, interest]);

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <div className="app-shell">
      <div className="bg-grid" />
      <header className="app-header">
        <div className="logo-mark">◈</div>
        <div>
          <h1>PARALLAX</h1>
          <p className="tagline">Visual UI Simplifier — Translate any dashboard into plain language.</p>
        </div>
      </header>

      <main className="app-main">
        <section className="left-col">
          <UploadZone
            onFileSelected={handleFileSelected}
            previewUrl={previewUrl}
            disabled={status === "loading"}
          />

          <InterestPicker selected={interest} onSelect={setInterest} disabled={status === "loading"} />

          <div className="action-row">
            <button
              className="primary-btn"
              onClick={handleAnalyze}
              disabled={!file || status === "loading"}
              type="button"
            >
              {status === "loading" ? "Analyzing…" : "Analyze Screenshot"}
            </button>
            {file && (
              <button className="ghost-btn" onClick={handleReset} type="button">
                Reset
              </button>
            )}
          </div>

          {status === "loading" && (
            <div className="loading-box">
              <div className="spinner" />
              <p>Scanning interface elements and generating both breakdowns…</p>
            </div>
          )}

          {status === "error" && (
            <div className="error-box">
              <strong>Invalid Input</strong>
              <p>{errorMsg}</p>
            </div>
          )}
        </section>

        <section className="right-col">
          {result ? (
            <>
              <ToggleSwitch mode={mode} setMode={setMode} />
              <RiskOverlay flags={result.high_risk_flags} />
              <ResultPanel data={result} mode={mode} />
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⌬</div>
              <p>Upload a dashboard screenshot and click Analyze to see the breakdown here.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}