import React, { useState } from "react";

const PRESETS = ["Aviation", "Culinary", "Gaming", "Sports", "Art & Design", "Everyday Life"];

export default function InterestPicker({ selected, onSelect, disabled }) {
  const [customText, setCustomText] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const handleChipClick = (item) => {
    setUseCustom(false);
    setCustomText("");
    onSelect(item);
  };

  const handleCustomChange = (e) => {
    const value = e.target.value;
    setCustomText(value);
    setUseCustom(true);
    onSelect(value.trim() ? value : "Everyday Life");
  };

  return (
    <div className="interest-picker">
      <p className="interest-label">Explain things using analogies from:</p>
      <div className="interest-chips">
        {PRESETS.map((item) => (
          <button
            key={item}
            disabled={disabled}
            className={`chip ${!useCustom && selected === item ? "chip-active" : ""}`}
            onClick={() => handleChipClick(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      <input
        type="text"
        className="custom-interest-input"
        placeholder="Or type your own (e.g. baking, motorcycles, K-pop)"
        value={customText}
        disabled={disabled}
        onChange={handleCustomChange}
      />
    </div>
  );
}