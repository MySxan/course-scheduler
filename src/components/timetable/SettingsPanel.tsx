import React from "react";
import { formatTime } from "../../lib/utils";

export interface TimetableSettings {
  showWeekends: boolean;
  startWithSunday: boolean;
  dynamicTimeRange: boolean;
}

export interface TimetableSettingsPanelProps {
  settings: TimetableSettings;
  onSettingsChange: (settings: TimetableSettings) => void;
  showSettings: boolean;
  onToggleSettings: () => void;
  startHour: number;
  endHour: number;
}

export const TimetableSettingsPanel: React.FC<TimetableSettingsPanelProps> = ({
  settings,
  onSettingsChange,
  showSettings,
  onToggleSettings,
  startHour,
  endHour,
}) => {
  const handleSettingChange = (
    key: keyof TimetableSettings,
    value: boolean
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="mb-6">
      {/* Settings Toggle Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={onToggleSettings}
          className="btn btn-sm btn-outline gap-2 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 transition-transform duration-200 ${
              showSettings ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
          {showSettings ? "Hide Settings" : "Show Settings"}
        </button>
      </div>

      {/* Collapsible Settings Panel */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showSettings ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-base-200 rounded-lg p-6 mb-6 border border-base-300">
          <h3 className="text-lg font-semibold mb-4 text-base-content">
            Display Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Show Weekends Setting */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={settings.showWeekends}
                  onChange={(e) =>
                    handleSettingChange("showWeekends", e.target.checked)
                  }
                />
                <div>
                  <span className="label-text font-medium">Show Weekends</span>
                  <div className="text-xs text-base-content/60">
                    Display Saturday and Sunday
                  </div>
                </div>
              </label>
            </div>

            {/* Start with Sunday Setting */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={settings.startWithSunday}
                  onChange={(e) =>
                    handleSettingChange("startWithSunday", e.target.checked)
                  }
                />
                <div>
                  <span className="label-text font-medium">
                    Start with Sunday
                  </span>
                  <div className="text-xs text-base-content/60">
                    Begin the week on Sunday
                  </div>
                </div>
              </label>
            </div>

            {/* Dynamic Time Range Setting */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={settings.dynamicTimeRange}
                  onChange={(e) =>
                    handleSettingChange("dynamicTimeRange", e.target.checked)
                  }
                />
                <div>
                  <span className="label-text font-medium">
                    Smart Time Range
                  </span>
                  <div className="text-xs text-base-content/60">
                    {settings.dynamicTimeRange
                      ? `${formatTime(
                          `${startHour.toString().padStart(2, "0")}:00`
                        )} - ${formatTime(
                          `${endHour.toString().padStart(2, "0")}:00`
                        )}`
                      : "Show only relevant hours"}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
