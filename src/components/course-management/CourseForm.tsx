import React, { useState } from "react";
import type { Course, CourseFormData, DaysOfWeek } from "../../types/course";
import { DAYS_OF_WEEK } from "../../types/course";
import { generateId, validateTimeRange } from "../../lib/utils";

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
    location: "",
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
      location: formData.location.trim() || undefined,
    };

    onCourseAdded(newCourse);

    // Reset form
    setFormData({
      name: "",
      section: "",
      daysOfWeek: [],
      startTime: "",
      endTime: "",
      location: "",
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
    <div className="card bg-base-200 shadow-sm">
      <form onSubmit={handleSubmit} className="card-body p-4 space-y-2">
        <div className="card-title text-base flex items-center gap-2">
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
          Add Course Manually
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Course Name */}
          <div className="form-control">
            <label htmlFor="courseName" className="label mb-1">
              Course Name
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
            Day of Week
          </label>
          <div className="flex flex-wrap gap-2">
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
                  className={`btn w-8 font-normal py-1.5 rounded-md flex-1 transition-colors
                  ${
                    isSelected
                      ? "bg-primary-content text-primary shadow-[inset_0_0_0_1px] border-primary font-medium"
                      : "bg-base-100 text-base-content hover:bg-base-200"
                  }`}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Time */}
          <div className="form-control">
            <label htmlFor="startTime" className="label mb-1">
              Start Time
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

          {/* End Time */}
          <div className="form-control">
            <label htmlFor="endTime" className="label mb-1">
              End Time
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

        {/* Location */}
        <div className="form-control">
          <label htmlFor="location" className="label mb-1">
            Location (optional)
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            placeholder="e.g., Lincoln Hall 1019, Chem Lab 205"
            className="input w-full px-3 py-2 border rounded-md focus:outline-primary border-base-300"
          />
        </div>

        {/* Submit Button */}
        <div className="flex">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn btn-primary shadow-none w-full px-6 py-2 rounded-md font-medium transition-colors ${
              isSubmitting
                ? "bg-neutral cursor-not-allowed"
                : "btn-primary shadow-none"
            } text-primary-content`}
          >
            {isSubmitting ? "Adding..." : "Add Course"}
          </button>
        </div>
      </form>
    </div>
  );
};
