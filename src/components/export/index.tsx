import React, { useCallback, useMemo, useState } from "react";
import type { Course } from "../../types/course";
import type { TimetableSettings } from "../timetable/SettingsPanel";
import { TimetablePreview } from "./TimetablePreview";
import { toPng, toJpeg } from "html-to-image";
import { ConfirmDialog } from "../ui/ConfirmDialog";

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
  const [isExportErrorOpen, setIsExportErrorOpen] = useState(false);

  const handleDownload = useCallback(async () => {
    if (onDownload) {
      onDownload({ format, scale, transparent });
      return;
    }

    const exportEl = document.getElementById("export-area");
    if (!exportEl) {
      console.error("Export area not found");
      return;
    }

    try {
      exportEl.classList.add("preview-hidden-outline");

      let dataUrl: string;
      const pixelRatio = scale * window.devicePixelRatio;
      const backgroundColor = transparent ? "transparent" : "#ffffff";

      if (format === "png") {
        dataUrl = await toPng(exportEl, {
          pixelRatio,
          backgroundColor,
        });
      } else if (format === "jpg") {
        dataUrl = await toJpeg(exportEl, {
          pixelRatio,
          backgroundColor: transparent ? "#ffffff" : backgroundColor,
        });
      } else {
        exportEl.classList.remove("preview-hidden-outline");
        window.print();
        return;
      }

      // Download the image
      const link = document.createElement("a");
      link.download = `schedule-${new Date().getTime()}.${format}`;
      link.href = dataUrl;
      link.click();

      exportEl.classList.remove("preview-hidden-outline");
    } catch (error) {
      console.error("Error generating image:", error);
      setIsExportErrorOpen(true);
      exportEl.classList.remove("preview-hidden-outline");
    }
  }, [format, scale, transparent, onDownload]);

  return (
    <div className="flex flex-col gap-5">
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
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
              className="select inline border-base-300 rounded-md w-full focus:outline-primary focus-within:outline-primary"
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
            <div className="join flex-1 flex w-full gap-0 rounded-lg">
              <button
                type="button"
                className={`btn joined-item font-normal py-1.5 rounded-l-md rounded-r-none border flex-1 transition-colors ${
                  scale === 1
                    ? "bg-primary-content border-primary shadow-primary shadow-[inset_0_0_0_1px] text-primary"
                    : "bg-base-100"
                }`}
                onClick={() => setScale(1)}
              >
                1x
              </button>
              <button
                type="button"
                className={`btn joined-item rounded-none font-normal py-1.5 border flex-1 transition-colors ${
                  scale === 2
                    ? "bg-primary-content border-primary shadow-primary shadow-[inset_0_0_0_1px] text-primary"
                    : "bg-base-100"
                }`}
                onClick={() => setScale(2)}
              >
                2x
              </button>
              <button
                type="button"
                className={`btn joined-item rounded-r-md rounded-l-none font-normal py-1.5 border flex-1 transition-colors ${
                  scale === 4
                    ? "bg-primary-content border-primary shadow-primary shadow-[inset_0_0_0_1px] text-primary"
                    : "bg-base-100"
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
                className="toggle toggle-primary shadow-none before:shadow-none after:shadow-none bg-transparent"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
              />
            </label>
          </div>
          <button
            type="submit"
            className="btn btn-primary shadow-none w-full px-6 py-2 rounded-md font-semibold transition-colors"
            onClick={handleDownload}
          >
            Download Schedule
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isExportErrorOpen}
        title="Export failed"
        description="Failed to export image. Please try again."
        confirmLabel="OK"
        onConfirm={() => setIsExportErrorOpen(false)}
      />
    </div>
  );
};

interface ExportPreviewAreaProps {
  courses: Course[];
  settings: TimetableSettings;
  cardBackgroundPreset: "primary" | "tealFamily";
}

export const ExportPreviewArea: React.FC<ExportPreviewAreaProps> = ({
  courses,
  settings,
  cardBackgroundPreset,
}) => {
  const containerStyles = useMemo(
    () => ({ width: "100%", height: "100%" }),
    [],
  );
  return (
    <div className="flex flex-1 flex-col" style={containerStyles}>
      <TimetablePreview
        courses={courses}
        settings={settings}
        cardBackgroundPreset={cardBackgroundPreset}
      />
    </div>
  );
};
