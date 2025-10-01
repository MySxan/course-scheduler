﻿import React from "react";
import { VerticalScaleSlider } from "./VerticalScaleSlider";

export interface TimetableSettings {
  showWeekends: boolean;
  startWithSunday: boolean;
  dynamicTimeRange: boolean;
  startHour: number;
  endHour: number;
  slotDuration: number;
  verticalScale: number;
}

export interface TimetableSettingsPanelProps {
  settings: TimetableSettings;
  onSettingsChange: (settings: TimetableSettings) => void;
  showSettings: boolean;
  onToggleSettings: () => void;
}

export const TimetableSettingsPanel: React.FC<TimetableSettingsPanelProps> = ({
  settings,
  onSettingsChange,
  showSettings,
  onToggleSettings,
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
    <div className="mb-6">
      <div className="flex justify-center mb-4">
        <button
          onClick={onToggleSettings}
          className="btn btn-sm btn-outline flex items-center gap-2 transition-all duration-200"
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
          <span>{showSettings ? "Hide Settings" : "Show Settings"}</span>
        </button>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showSettings ? "max-h-2000 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  <div className="card-title text-base flex items-center gap-2 mb-4">
                    <svg
                      className="w-4 h-4 text-secondary"
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
                    <label className="label cursor-pointer">
                      <div className="flex-1">
                        <span className="label-text font-medium">
                          Smart Time Range
                        </span>
                        <div className="label-text-alt text-xs opacity-70">
                          {settings.dynamicTimeRange
                            ? "Auto-adjust based on courses"
                            : "Use manual time range"}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={settings.dynamicTimeRange}
                        onChange={(e) =>
                          handleSettingChange(
                            "dynamicTimeRange",
                            e.target.checked
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="p-4 bg-base-200 rounded-lg border-l-4 border-primary">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-sm font-medium">
                            Start
                          </span>
                        </label>
                        <select
                          className={`select select-sm select-bordered w-full ${
                            settings.dynamicTimeRange ? "select-disabled" : ""
                          }`}
                          value={settings.startHour}
                          disabled={settings.dynamicTimeRange}
                          onChange={(e) =>
                            handleSettingChange(
                              "startHour",
                              parseInt(e.target.value)
                            )
                          }
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>
                              {i.toString().padStart(2, "0")}:00
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-sm font-medium">
                            End
                          </span>
                        </label>
                        <select
                          className={`select select-sm select-bordered w-full ${
                            settings.dynamicTimeRange ? "select-disabled" : ""
                          }`}
                          value={settings.endHour}
                          disabled={settings.dynamicTimeRange}
                          onChange={(e) =>
                            handleSettingChange(
                              "endHour",
                              parseInt(e.target.value)
                            )
                          }
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>
                              {i.toString().padStart(2, "0")}:00
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-sm">
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
                    <label className="label">
                      <span className="label-text font-medium">
                        Slot Duration
                      </span>
                      <span className="label-text-alt badge badge-neutral badge-sm">
                        {settings.slotDuration}min
                      </span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={settings.slotDuration}
                      onChange={(e) =>
                        handleSettingChange(
                          "slotDuration",
                          parseInt(e.target.value)
                        )
                      }
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>

                  <VerticalScaleSlider
                    value={settings.verticalScale}
                    onChange={(value) =>
                      handleSettingChange("verticalScale", value)
                    }
                    min={1.0}
                    max={1.5}
                    step={0.1}
                  />
                </div>
              </div>

              <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
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

                  <div className="space-y-3">
                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <div className="flex-1">
                          <span className="label-text font-medium">
                            Show Weekends
                          </span>
                          <div className="label-text-alt text-xs opacity-70">
                            Display Saturday and Sunday
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-success"
                          checked={settings.showWeekends}
                          onChange={(e) =>
                            handleSettingChange(
                              "showWeekends",
                              e.target.checked
                            )
                          }
                        />
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer">
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
                          className="toggle toggle-success"
                          checked={settings.startWithSunday}
                          onChange={(e) =>
                            handleSettingChange(
                              "startWithSunday",
                              e.target.checked
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
