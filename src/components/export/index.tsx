import React, { useCallback, useMemo, useState } from "react";
import type { Course } from "../../types/course";
import type { TimetableSettings } from "../timetable/SettingsPanel";
import { WeeklyTimetable } from "../timetable";

type ExportFormat = "png" | "jpg" | "svg";

interface ExportControlPanelProps {
  onDownload?: (options: {
    format: ExportFormat;
    scale: number;
    transparent: boolean;
  }) => void;
}

export const ExportControlPanel: React.FC<ExportControlPanelProps> = ({
  onDownload,
}) => {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [scale, setScale] = useState<number>(1);
  const [transparent, setTransparent] = useState<boolean>(true);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload({ format, scale, transparent });
      return;
    }
    // Fallback: print the export area for a basic export without dependencies
    const exportEl = document.getElementById("export-area");
    if (!exportEl) {
      window.print();
      return;
    }
    const prevBg = exportEl.style.backgroundColor;
    if (transparent) exportEl.style.backgroundColor = "transparent";
    // Open print dialog focusing on export area
    window.print();
    exportEl.style.backgroundColor = prevBg;
  }, [format, scale, transparent, onDownload]);

  return (
    <div className="flex flex-col gap-4">
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-4 space-y-2">
          <div className="card-title text-base flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="w-4 h-4 text-primary"
            >
              <path d="M14 17H5" />
              <path d="M19 7h-9" />
              <circle cx="17" cy="17" r="3" />
              <circle cx="7" cy="7" r="3" />
            </svg>
            Export Settings
          </div>

          {/* Format */}
          <div className="form-control">
            <label className="label mb-1">
              <span className="label-text">Format</span>
            </label>
            <select
              className="select inline border-base-300 rounded-md w-full"
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
            >
              <option value="png">PNG Image</option>
              <option value="jpg">JPG Image</option>
              <option value="svg">SVG Vector</option>
            </select>
          </div>

          {/* Resolution */}
          <div className="form-control">
            <label className="label mb-1">
              <span className="label-text">Resolution</span>
            </label>
            <div className="join w-full gap-rounded-full ">
              <button
                type="button"
                className={`join-item font-normal py-1.5 rounded-md border flex-1 transition-colors ${
                  scale === 1 ? "bg-primary/20 border-primary" : ""
                }`}
                onClick={() => setScale(1)}
              >
                1x
              </button>
              <button
                type="button"
                className={`join-item font-normal py-1.5 rounded-md border flex-1 transition-colors ${
                  scale === 2 ? "bg-primary/20 border-primary" : ""
                }`}
                onClick={() => setScale(2)}
              >
                2x
              </button>
              <button
                type="button"
                className={`join-item font-normal py-1.5 rounded-md border flex-1 transition-colors ${
                  scale === 4 ? "bg-primary/20 border-primary" : ""
                }`}
                onClick={() => setScale(4)}
              >
                4x
              </button>
            </div>
          </div>

          {/* Background */}
          <div className="form-control">
            <label className="label cursor-pointer flex justify-center">
              <div className="flex-1">
                <span className="label-text font-medium">
                  Transparent Background
                </span>
                <div className="label-text-alt text-xs opacity-70">
                  Export without background color
                </div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
              />
            </label>
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full px-6 py-2 rounded-md font-medium transition-colors"
        onClick={handleDownload}
      >
        Download Schedule
      </button>
    </div>
  );
};

interface ExportPreviewAreaProps {
  courses: Course[];
  settings: TimetableSettings;
}

export const ExportPreviewArea: React.FC<ExportPreviewAreaProps> = ({
  courses,
  settings,
}) => {
  const containerStyles = useMemo(
    () => ({ width: "100%", height: "100%" }),
    []
  );
  return (
    <div
      id="export-area"
      className="card h-full w-full border-dotted border-primary border-2 flex flex-col items-center justify-center"
      style={containerStyles}
    >
      <div className="w-full h-full flex items-center justify-center p-4">
        <WeeklyTimetable courses={courses} settings={settings} />
      </div>
    </div>
  );
};
