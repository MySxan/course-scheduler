import { ChoiceControl } from "../style/controls";
import { SettingsGroup } from "../ui/SettingsGroup";
import React, { useCallback, useState } from "react";
import type { TimetableCanvasProps } from "../timetable/TimetableCanvas";
import { TimetablePreview } from "./TimetablePreview";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { ConfirmDialog } from "../ui/ConfirmDialog";

type ExportFormat = "png" | "jpg" | "svg";

interface ExportControlPanelProps {
  disabled?: boolean;
  onDownload?: (options: {
    format: ExportFormat;
    scale: number;
    transparent: boolean;
  }) => void;
}

export const ExportControlPanel: React.FC<ExportControlPanelProps> = ({
  onDownload,
  disabled = false,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("png");
  const [scale, setScale] = useState<number>(1);
  const [transparent, setTransparent] = useState<boolean>(true);
  const [isExportErrorOpen, setIsExportErrorOpen] = useState(false);

  const handleDownload = useCallback(async () => {
    if (disabled || isExporting) return;
    if (onDownload) {
      onDownload({ format, scale, transparent });
      return;
    }

    const exportEl = document.getElementById("export-area");
    if (!exportEl) {
      setIsExportErrorOpen(true);
      return;
    }

    setIsExporting(true);
    try {
      await document.fonts.ready;
      exportEl.classList.add("preview-hidden-outline");

      let dataUrl: string;
      const pixelRatio = scale;
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
        dataUrl = await toSvg(exportEl, { backgroundColor });
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
    } finally {
      exportEl.classList.remove("preview-hidden-outline");
      setIsExporting(false);
    }
  }, [format, scale, transparent, onDownload, disabled, isExporting]);

  return (
    <div className="inspector-stack">
      <SettingsGroup title="Image settings">
        <ChoiceControl
          label="Format"
          value={format}
          options={[
            ["png", "PNG"],
            ["jpg", "JPG"],
            ["svg", "SVG"],
          ]}
          onChange={(value) => setFormat(value as ExportFormat)}
        />
        <div className="style-field">
          <span id="resolution-label">Resolution</span>
          <div
            className="segmented-control"
            role="group"
            aria-labelledby="resolution-label"
          >
            {[1, 2, 4].map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={scale === value}
                onClick={() => setScale(value)}
              >
                {value}×
              </button>
            ))}
          </div>
        </div>
        <label className="setting-toggle-row">
          <span>
            <span className="label-text">Transparent background</span>
            {format === "jpg" && <small>JPG uses a white background</small>}
          </span>
          <input
            type="checkbox"
            role="switch"
            className="switch-input"
            checked={format !== "jpg" && transparent}
            disabled={format === "jpg"}
            onChange={(event) => setTransparent(event.target.checked)}
          />
        </label>
        <button
          type="button"
          className="btn btn-primary w-full"
          disabled={disabled || isExporting}
          onClick={handleDownload}
        >
          {isExporting ? "Preparing image…" : "Download schedule"}
        </button>
      </SettingsGroup>
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

export function ExportPreviewArea(props: TimetableCanvasProps) {
  return <TimetablePreview {...props} />;
}
