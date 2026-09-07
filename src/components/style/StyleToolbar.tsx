import { Icon } from "../ui/Icon";
import { useRef, useState } from "react";
import type { useStyleSettings } from "../../hooks/useStyleSettings";
import { DEFAULT_STYLE, parseStyleFile, STYLE_PRESETS } from "../../lib/style";

export function StyleToolbar({
  controller,
}: {
  controller: ReturnType<typeof useStyleSettings>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const { style, change, saveState, undo, redo, canUndo, canRedo } = controller;
  const activePreset = STYLE_PRESETS.find(
    (preset) => JSON.stringify(preset.settings) === JSON.stringify(style),
  );
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(style, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "course-scheduler-style.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Style file downloaded.");
  };
  return (
    <div className="style-toolbar">
      <div className="style-toolbar-row">
        <div className="style-presets" aria-label="Style presets">
          {STYLE_PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.id}
              aria-pressed={activePreset?.id === preset.id}
              onClick={() => {
                change(preset.settings);
                setMessage(
                  `${preset.label} applied. You can undo this change.`,
                );
              }}
            >
              <span
                className={`preset-chip preset-${preset.id}`}
                aria-hidden="true"
              >
                Aa
              </span>
              {preset.label}
            </button>
          ))}
        </div>
        {!activePreset && <span className="style-custom-label">Custom</span>}
      </div>
      <div className="style-toolbar-row">
        <div className="style-actions">
          <button
            type="button"
            title="Undo"
            aria-label="Undo"
            onClick={undo}
            disabled={!canUndo}
          >
            <Icon name="undo" />
          </button>
          <button
            type="button"
            title="Redo"
            aria-label="Redo"
            onClick={redo}
            disabled={!canRedo}
          >
            <Icon name="redo" />
          </button>
          <button
            type="button"
            title="Reset style"
            aria-label="Reset style"
            onClick={() => {
              change(DEFAULT_STYLE);
              setMessage(
                "Style reset. Your courses are unchanged. Undo to restore your style.",
              );
            }}
          >
            <Icon name="reset" />
          </button>
          <button
            type="button"
            title="Save style file"
            aria-label="Save style file"
            onClick={download}
          >
            <Icon name="download" />
          </button>
          <button
            type="button"
            title="Load style file"
            aria-label="Load style file"
            onClick={() => input.current?.click()}
          >
            <Icon name="upload" />
          </button>
          <input
            ref={input}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            aria-label="Load style JSON"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              try {
                if (file.size > 100_000)
                  throw new Error("Style files must be smaller than 100 KB.");
                change(parseStyleFile(await file.text()));
                setMessage(
                  "Style loaded. Undo to restore your previous style.",
                );
              } catch (error) {
                setMessage(
                  error instanceof Error
                    ? error.message
                    : "Could not load this style file.",
                );
              }
            }}
          />
        </div>
        <span className="style-save-status" role="status">
          {saveState === "saved"
            ? "Saved"
            : "Device storage unavailable · save a style file"}
        </span>
      </div>
      {message && (
        <p className="style-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
