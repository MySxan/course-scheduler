import React, { useEffect } from "react";
import type { CourseFormData, DaysOfWeek } from "../../types/course";
import { DAYS_OF_WEEK } from "../../types/course";

interface EditCoursePanelProps {
  isOpen: boolean;
  phase: "enter" | "exit";
  editData: CourseFormData;
  editErrors: Record<string, string>;
  onChange: (data: CourseFormData) => void;
  onErrorChange: (errors: Record<string, string>) => void;
  onCancel: () => void;
  onSave: () => void;
  onExited?: () => void;
}

export const EditCoursePanel: React.FC<EditCoursePanelProps> = ({
  isOpen,
  phase,
  editData,
  editErrors,
  onChange,
  onErrorChange,
  onCancel,
  onSave,
  onExited,
}) => {
  useEffect(() => {
    if (!isOpen || phase !== "exit") return;
    const timer = window.setTimeout(() => {
      onExited?.();
    }, 220);
    return () => window.clearTimeout(timer);
  }, [isOpen, phase, onExited]);

  if (!isOpen) return null;

  return (
    <div className="edit-panel-layer">
      <div
        className={`edit-panel ${
          phase === "exit"
            ? "animate-sidebar-slide-out"
            : "animate-sidebar-slide-in"
        }`}
      >
        <div className="edit-panel-heading">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 21h8" />
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
          </svg>
          <h3>Edit course</h3>
        </div>

        <div className="edit-panel-scroll">
          <div className="edit-panel-fields">
            <div className="form-control">
              <label htmlFor="editCourseName" className="label mb-1">
                Course name
              </label>
              <input
                id="editCourseName"
                type="text"
                value={editData.name}
                onChange={(e) =>
                  onChange({ ...editData, name: e.target.value })
                }
                className={`input w-full px-3 py-2 border rounded-md focus:outline-primary ${
                  editErrors.name
                    ? "border-error bg-error/10"
                    : "border-base-300"
                }`}
              />
              {editErrors.name && (
                <p className="mt-1 text-sm text-error">{editErrors.name}</p>
              )}
            </div>

            <div className="form-control">
              <label htmlFor="editCourseSection" className="label mb-1">
                Section (optional)
              </label>
              <input
                id="editCourseSection"
                type="text"
                value={editData.section}
                onChange={(e) =>
                  onChange({ ...editData, section: e.target.value })
                }
                className="input w-full px-3 py-2 border border-base-300 rounded-md focus:outline-primary"
              />
            </div>

            <div
              className="form-control"
              role="group"
              aria-labelledby="editDayOfWeekLabel"
            >
              <label id="editDayOfWeekLabel" className="label mb-1">
                Days of week
              </label>
              <div className="day-picker">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = editData.daysOfWeek.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const newDays = isSelected
                          ? editData.daysOfWeek.filter((d) => d !== day)
                          : [...editData.daysOfWeek, day];
                        onChange({
                          ...editData,
                          daysOfWeek: newDays as DaysOfWeek[],
                        });
                        if (editErrors.daysOfWeek) {
                          const next = { ...editErrors };
                          delete next.daysOfWeek;
                          onErrorChange(next);
                        }
                      }}
                      aria-pressed={isSelected}
                      aria-label={day}
                      className="day-button"
                    >
                      {day.slice(0, 2)}
                    </button>
                  );
                })}
              </div>
              {editErrors.daysOfWeek && (
                <p className="mt-1 text-sm text-error">
                  {editErrors.daysOfWeek}
                </p>
              )}
            </div>

            <div className="form-pair">
              <div className="form-control">
                <label htmlFor="editStartTime" className="label mb-1">
                  Start time
                </label>
                <input
                  id="editStartTime"
                  type="time"
                  value={editData.startTime}
                  onChange={(e) =>
                    onChange({ ...editData, startTime: e.target.value })
                  }
                  className={`input w-full px-3 py-2 border rounded-md focus:outline-primary ${
                    editErrors.startTime
                      ? "border-error bg-error/10"
                      : "border-base-300"
                  }`}
                />
                {editErrors.startTime && (
                  <p className="mt-1 text-sm text-error">
                    {editErrors.startTime}
                  </p>
                )}
              </div>

              <div className="form-control">
                <label htmlFor="editEndTime" className="label mb-1">
                  End time
                </label>
                <input
                  id="editEndTime"
                  type="time"
                  value={editData.endTime}
                  onChange={(e) =>
                    onChange({ ...editData, endTime: e.target.value })
                  }
                  className={`input w-full px-3 py-2 border rounded-md focus:outline-primary ${
                    editErrors.endTime
                      ? "border-error bg-error/10"
                      : "border-base-300"
                  }`}
                />
                {editErrors.endTime && (
                  <p className="mt-1 text-sm text-error">
                    {editErrors.endTime}
                  </p>
                )}
              </div>
            </div>

            <div className="form-control">
              <label htmlFor="editDescription" className="label mb-1">
                Description (optional)
              </label>
              <textarea
                id="editDescription"
                rows={3}
                value={editData.description}
                onChange={(e) =>
                  onChange({ ...editData, description: e.target.value })
                }
                className="textarea w-full resize-none px-3 py-2 border rounded-md focus:outline-primary border-base-300"
              />
            </div>
          </div>
        </div>

        <div className="edit-panel-actions">
          <button
            type="button"
            className="btn bg-white shadow-none flex-1 hover:bg-base-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary shadow-none flex-1"
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
