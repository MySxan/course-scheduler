import { SettingsGroup } from "../ui/SettingsGroup";
import React, { useState } from "react";
import type { Course, CourseFormData, DaysOfWeek } from "../../types/course";
import { DAYS_OF_WEEK } from "../../types/course";
import {
  DEFAULT_COURSE_COLOR,
  generateId,
  validateTimeRange,
} from "../../lib/utils";

interface CourseFormProps {
  onCourseAdded: (course: Course) => void;
}

export const CourseForm: React.FC<CourseFormProps> = ({ onCourseAdded }) => {
  // Form state
  const [formData, setFormData] = useState<CourseFormData>({
    name: "",
    section: "",
    daysOfWeek: [],
    startTime: "",
    endTime: "",
    description: "",
    color: DEFAULT_COURSE_COLOR,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Validate days of week
    if (!formData.daysOfWeek || formData.daysOfWeek.length === 0) {
      newErrors.daysOfWeek = "At least one day of the week is required";
    }

    // Validate start time
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    // Validate end time
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    // Validate time range
    if (formData.startTime && formData.endTime) {
      if (!validateTimeRange(formData.startTime, formData.endTime)) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Create course object
    const newCourse: Course = {
      id: generateId(),
      name: formData.name.trim(),
      section: formData.section.trim() || undefined,
      daysOfWeek: formData.daysOfWeek as DaysOfWeek[],
      startTime: formData.startTime,
      endTime: formData.endTime,
      description: formData.description.trim() || undefined,
      color: formData.color || DEFAULT_COURSE_COLOR,
    };

    onCourseAdded(newCourse);

    // Reset form
    setFormData({
      name: "",
      section: "",
      daysOfWeek: [],
      startTime: "",
      endTime: "",
      description: "",
      color: DEFAULT_COURSE_COLOR,
    });
    setErrors({});
    setIsSubmitting(false);
  };

  // Handle input changes
  const handleInputChange = (field: keyof CourseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <SettingsGroup title="New course">
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-pair">
          {/* Course name */}
          <div className="form-control">
            <label htmlFor="courseName" className="label mb-1">
              Course name
            </label>
            <input
              id="courseName"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g. CHEM 101"
              className={`input w-full px-3 py-2 border rounded-md focus:outline-primary ${
                errors.name ? "border-error bg-error/10" : "border-base-300"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error">{errors.name}</p>
            )}
          </div>

          {/* Course Section */}
          <div className="form-control">
            <label htmlFor="courseSection" className="label mb-1">
              Section (optional)
            </label>
            <input
              id="courseSection"
              type="text"
              value={formData.section}
              onChange={(e) => handleInputChange("section", e.target.value)}
              placeholder="e.g. Y19"
              className="input w-full px-3 py-2 border border-base-300 rounded-md focus:outline-primary"
            />
          </div>
        </div>

        {/* Days of Week */}
        <div
          className="form-control"
          role="group"
          aria-labelledby="dayOfWeekLabel"
        >
          <label id="dayOfWeekLabel" className="label mb-1">
            Days of week
          </label>
          <div className="day-picker">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = Array.isArray(formData.daysOfWeek)
                ? formData.daysOfWeek.includes(day)
                : false;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    const currentDays = Array.isArray(formData.daysOfWeek)
                      ? formData.daysOfWeek
                      : [];
                    let newDays: DaysOfWeek[];
                    if (isSelected) {
                      newDays = currentDays.filter((d) => d !== day);
                    } else {
                      newDays = [...currentDays, day];
                    }
                    setFormData((prev) => ({ ...prev, daysOfWeek: newDays }));

                    if (errors.daysOfWeek) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.daysOfWeek;
                        return newErrors;
                      });
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
          {errors.daysOfWeek && (
            <p className="mt-1 text-sm text-error">{errors.daysOfWeek}</p>
          )}
        </div>

        {/* Time Inputs */}
        <div className="form-pair">
          {/* Start time */}
          <div className="form-control">
            <label htmlFor="startTime" className="label mb-1">
              Start time
            </label>
            <input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              className={`input w-full px-3 py-2 border rounded-md focus:outline-primary ${
                errors.startTime
                  ? "border-error bg-error/10"
                  : "border-base-300"
              }`}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-error">{errors.startTime}</p>
            )}
          </div>

          {/* End time */}
          <div className="form-control">
            <label htmlFor="endTime" className="label mb-1">
              End time
            </label>
            <input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
              className={`input w-full px-3 py-2 border rounded-md focus:outline-primary ${
                errors.endTime ? "border-error bg-error/10" : "border-base-300"
              }`}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-error">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="form-control">
          <label htmlFor="description" className="label mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="e.g., Lincoln Hall 1019; Chem Lab 205"
            className="textarea w-full resize-none px-3 py-2 border rounded-md focus:outline-primary border-base-300"
          />
        </div>

        {/* Submit Button */}
        <div className="flex">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn btn-primary shadow-none w-full px-6 py-2 rounded-md font-semibold transition-colors ${
              isSubmitting
                ? "bg-neutral cursor-not-allowed"
                : "btn-primary shadow-none"
            } text-primary-content`}
          >
            {isSubmitting ? "Adding..." : "Add course"}
          </button>
        </div>
      </form>
    </SettingsGroup>
  );
};
