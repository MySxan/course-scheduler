import React from "react";

export interface TimetableSettings {
  showWeekends: boolean;
  startWithSunday: boolean;
  dynamicTimeRange: boolean;
  startHour: number;
  endHour: number;
  slotDuration: number;
  verticalScale: number;
  width: number;
}

export interface SettingsPanelProps {
  settings: TimetableSettings;
  onSettingsChange: (settings: TimetableSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  const handleSettingChange = (
    key: keyof TimetableSettings,
    value: boolean | number
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Time Range */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-4">
          <div className="card-title text-base flex items-center gap-2 mb-4">
            <svg
              className="w-4 h-4 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Time Range
          </div>

          <div className="form-control mb-4">
            <label className="label flex items-center cursor-pointer">
              <div className="flex-1">
                <span className="label-text font-medium">Smart Time Range</span>
                <div className="label-text-alt text-xs opacity-70">
                  {settings.dynamicTimeRange
                    ? "Auto-adjust based on courses"
                    : "Use manual time range"}
                </div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-accent"
                checked={settings.dynamicTimeRange}
                onChange={(e) =>
                  handleSettingChange("dynamicTimeRange", e.target.checked)
                }
              />
            </label>
          </div>

          <div className="p-4 bg-base-100 rounded-lg border-primary">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm font-medium mb-2">
                    Start Time
                  </span>
                </label>
                <select
                  className={`select select-sm select-bordered w-full ${
                    settings.dynamicTimeRange ? "select-disabled" : ""
                  }`}
                  value={settings.startHour}
                  disabled={settings.dynamicTimeRange}
                  onChange={(e) => {
                    const newStartHour = parseInt(e.target.value);
                    if (newStartHour >= settings.endHour) {
                      handleSettingChange(
                        "endHour",
                        Math.min(newStartHour + 1, 22)
                      );
                    }
                    handleSettingChange("startHour", newStartHour);
                  }}
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const isDisabled =
                      !settings.dynamicTimeRange &&
                      i >= settings.endHour &&
                      settings.endHour === 22;
                    return (
                      <option key={i} value={i} disabled={isDisabled}>
                        {i.toString().padStart(2, "0")}:00
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm font-medium mb-2">
                    End Time
                  </span>
                </label>
                <select
                  className={`select select-sm select-bordered w-full ${
                    settings.dynamicTimeRange ? "select-disabled" : ""
                  } ${
                    !settings.dynamicTimeRange &&
                    settings.startHour >= settings.endHour
                      ? "select-error"
                      : ""
                  }`}
                  value={settings.endHour}
                  disabled={settings.dynamicTimeRange}
                  onChange={(e) => {
                    const newEndHour = parseInt(e.target.value);
                    if (newEndHour <= settings.startHour) {
                      handleSettingChange(
                        "startHour",
                        Math.max(newEndHour - 1, 0)
                      );
                    }
                    handleSettingChange("endHour", newEndHour);
                  }}
                >
                  {Array.from({ length: 23 }, (_, i) => {
                    const displayHour = i + 1;
                    const isDisabled =
                      !settings.dynamicTimeRange && i <= settings.startHour;
                    return (
                      <option key={i} value={i} disabled={isDisabled}>
                        {displayHour.toString().padStart(2, "0")}:00
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Settings */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-4">
          <div className="card-title text-base flex items-center gap-2 mb-4">
            <svg
              className="w-4 h-4 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
            Grid Settings
          </div>

          <div className="form-control mb-4">
            <label className="label flex items-center gap-4 cursor-pointer">
              <div className="flex-1">
                <span className="label-text font-medium">
                  Display 30 min slot
                </span>
                <div className="label-text-alt text-xs opacity-70">
                  {"slots for better time resolution"}
                </div>
              </div>
              <input
                type="checkbox"
                className="checkbox checkbox-accent w-5 h-5"
                checked={settings.slotDuration === 30}
                onChange={(e) =>
                  handleSettingChange(
                    "slotDuration",
                    e.target.checked ? 30 : 60
                  )
                }
              />
            </label>
          </div>

          <div className="mt-4 w-full">
            <label className="label w-full">
              <span className="label-text font-medium">Table Scale</span>
              <span className="label-text-alt">
                {settings.verticalScale}%
              </span>
            </label>
            <input
              type="range"
              min="50"
              max="200"
              step="10"
              value={settings.verticalScale}
              onChange={(e) =>
                handleSettingChange("verticalScale", parseInt(e.target.value))
              }
              className="range range-xs range-accent w-full"
            />
            <div className="w-full flex justify-between text-xs mt-1 opacity-70">
              <span>50%</span>
              <span>100%</span>
              <span>150%</span>
              <span>200%</span>
            </div>
          </div>

          <div className="mt-4 w-full">
            <label className="label w-full">
              <span className="label-text font-medium">Table Width</span>
              <span className="label-text-alt">{settings.width}%</span>
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={settings.width}
              onChange={(e) =>
                handleSettingChange("width", parseInt(e.target.value))
              }
              className="range range-xs range-accent w-full"
            />
            <div className="w-full flex justify-between text-xs mt-1 opacity-70">
              <span>20%</span>
              <span></span>
              <span></span>
              <span>50%</span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Options */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-4">
          {/* title */}
          <div className="card-title text-base flex items-center gap-2 mb-4">
            <svg
              className="w-4 h-4 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View Options
          </div>

          {/* show weekends */}
          <div className="space-y-3">
            <div className="form-control">
              <label className="label flex items-center gap-4 cursor-pointer">
                <div className="flex-1">
                  <span className="label-text font-medium">Show Weekends</span>
                  <div className="label-text-alt text-xs opacity-70">
                    Display Saturday and Sunday
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="checkbox checkbox-accent w-5 h-5"
                  checked={settings.showWeekends}
                  onChange={(e) =>
                    handleSettingChange("showWeekends", e.target.checked)
                  }
                />
              </label>
            </div>

            {/* start with Sunday */}
            <div className="form-control">
              <label className="label flex items-center gap-4 cursor-pointer">
                <div className="flex-1">
                  <span className="label-text font-medium">
                    Start with Sunday
                  </span>
                  <div className="label-text-alt text-xs opacity-70">
                    Begin the week on Sunday
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="checkbox checkbox-accent w-5 h-5"
                  checked={settings.startWithSunday}
                  onChange={(e) =>
                    handleSettingChange("startWithSunday", e.target.checked)
                  }
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
