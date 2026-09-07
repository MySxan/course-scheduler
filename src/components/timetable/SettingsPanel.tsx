import { SettingsGroup } from "../ui/SettingsGroup";
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
    value: boolean | number,
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="inspector-stack">
      {/* Time Range */}
      <SettingsGroup title="Time range">
        <div className="form-control">
          <label className="setting-toggle-row">
            <div className="flex-1">
              <span className="label-text font-medium">Smart time range</span>
            </div>
            <input
              type="checkbox"
              className="switch-input"
              role="switch"
              checked={settings.dynamicTimeRange}
              onChange={(e) =>
                handleSettingChange("dynamicTimeRange", e.target.checked)
              }
            />
          </label>
        </div>

        <div className="inset-field-pair">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label htmlFor="startHour" className="label mb-1">
                Start time
              </label>
              <select
                id="startHour"
                className={`select select-sm inline border-base-300 select-bordered rounded-md w-full focus:outline-primary focus-within:outline-primary ${
                  settings.dynamicTimeRange ? "select-disabled" : ""
                }`}
                value={settings.startHour}
                disabled={settings.dynamicTimeRange}
                onChange={(e) => {
                  const newStartHour = parseInt(e.target.value);
                  onSettingsChange({
                    ...settings,
                    startHour: newStartHour,
                    endHour: Math.max(newStartHour, settings.endHour),
                  });
                }}
              >
                {Array.from({ length: 24 }, (_, i) => {
                  return (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, "0")}:00
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-control">
              <label htmlFor="endHour" className="label mb-1">
                End time
              </label>
              <select
                id="endHour"
                className={`select select-sm inline border-base-300 select-bordered rounded-md w-full focus:outline-primary focus-within:outline-primary ${
                  settings.dynamicTimeRange ? "select-disabled" : ""
                } ${
                  !settings.dynamicTimeRange &&
                  settings.startHour > settings.endHour
                    ? "select-error"
                    : ""
                }`}
                value={settings.endHour}
                disabled={settings.dynamicTimeRange}
                onChange={(e) => {
                  const newEndHour = parseInt(e.target.value);
                  onSettingsChange({
                    ...settings,
                    endHour: newEndHour,
                    startHour: Math.min(settings.startHour, newEndHour),
                  });
                }}
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const displayHour = i + 1;
                  const isDisabled =
                    !settings.dynamicTimeRange && i < settings.startHour;
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
      </SettingsGroup>

      {/* Grid Settings */}
      <SettingsGroup title="Grid">
        <div className="form-control">
          <label className="setting-toggle-row">
            <div className="flex-1">
              <span className="label-text font-medium">
                Display 30 min slot
              </span>
            </div>
            <input
              type="checkbox"
              className="switch-input"
              role="switch"
              checked={settings.slotDuration === 30}
              onChange={(e) =>
                handleSettingChange("slotDuration", e.target.checked ? 30 : 60)
              }
            />
          </label>
        </div>

        <div className="form-control">
          <label className="label w-full flex justify-between mb-1">
            <span className="label-text font-medium">Table scale</span>
            <span className="label-text-alt">{settings.verticalScale}%</span>
          </label>
          <input
            type="range"
            aria-label="Table scale"
            min="50"
            max="200"
            step="1"
            value={settings.verticalScale}
            onChange={(e) =>
              handleSettingChange("verticalScale", parseInt(e.target.value))
            }
            className="slider-input"
          />
          <div className="w-full flex justify-between text-xs mt-1 opacity-70 tabular-nums">
            <span>50%</span>
            <span className="ml-2">100%</span>
            <span>150%</span>
            <span>200%</span>
          </div>
        </div>

        <div className="form-control">
          <label className="label w-full flex justify-between mb-1">
            <span className="label-text font-medium">Table width</span>
            <span className="label-text-alt">{settings.width}%</span>
          </label>
          <input
            type="range"
            aria-label="Table width"
            min="20"
            max="100"
            value={settings.width}
            onChange={(e) =>
              handleSettingChange("width", parseInt(e.target.value))
            }
            className="slider-input"
          />
          <div className="w-full flex justify-between text-xs mt-1 opacity-70">
            <span>20%</span>
            <span></span>
            <span></span>
            <span className="-ml-1">50%</span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span>100%</span>
          </div>
        </div>
      </SettingsGroup>

      {/* View Options */}
      <SettingsGroup title="Week">
        {/* show weekends */}
        <div className="form-control">
          <label className="setting-toggle-row">
            <div className="flex-1">
              <span className="label-text font-medium">Show weekends</span>
            </div>
            <input
              type="checkbox"
              className="switch-input"
              role="switch"
              checked={settings.showWeekends}
              onChange={(e) =>
                handleSettingChange("showWeekends", e.target.checked)
              }
            />
          </label>
        </div>

        {/* start with Sunday */}
        <div className="form-control">
          <label className="setting-toggle-row">
            <div className="flex-1">
              <span className="label-text font-medium">Start with Sunday</span>
            </div>
            <input
              type="checkbox"
              className="switch-input"
              role="switch"
              checked={settings.startWithSunday}
              onChange={(e) =>
                handleSettingChange("startWithSunday", e.target.checked)
              }
            />
          </label>
        </div>
      </SettingsGroup>
    </div>
  );
};
