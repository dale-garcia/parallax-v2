import React, { useRef, useState, useCallback } from "react";

export default function UploadZone({ onFileSelected, previewUrl, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file (PNG, JPG, or WEBP).");
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div
      className={`upload-zone ${dragging ? "upload-zone-active" : ""} ${disabled ? "upload-zone-disabled" : ""}`}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        hidden
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
      {previewUrl ? (
        <img src={previewUrl} alt="Uploaded screenshot preview" className="preview-img" />
      ) : (
        <div className="upload-prompt">
          <div className="upload-icon">▣</div>
          <p className="upload-title">Drop a screenshot here</p>
          <p className="upload-sub">or click to browse — PNG, JPG, WEBP (max 10MB)</p>
        </div>
      )}
    </div>
  );
}