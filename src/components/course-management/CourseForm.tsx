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
      newErrors.name = "Course name is required";
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
    <div className="bg-base-100 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-base-content">
        Add Course Manually
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Course Name */}
        <div>
          <label
            htmlFor="courseName"
            className="block text-sm font-medium text-base-content mb-1"
          >
            Course Name
          </label>
          <input
            id="courseName"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., Mathematics 101"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.name ? "border-error bg-error/10" : "border-base-300"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-error">{errors.name}</p>
          )}
        </div>

        {/* Course Section */}
        <div>
          <label
            htmlFor="courseSection"
            className="block text-sm font-medium text-base-content mb-1"
          >
            Section <span className="text-base-content/60">(Optional)</span>
          </label>
          <input
            id="courseSection"
            type="text"
            value={formData.section}
            onChange={(e) => handleInputChange("section", e.target.value)}
            placeholder="e.g., AL, B1, Y19"
            className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Days of Week */}
        <div>
          <label
            htmlFor="dayOfWeek"
            className="block text-sm font-medium text-base-content mb-1"
          >
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
                  className={`px-3 py-2 rounded-md border flex-1 transition
                  ${
                    isSelected
                      ? "bg-primary/20 text-primary border-primary font-medium"
                      : "bg-base-100 text-base-content border-base-300 hover:bg-base-200"
                  }`}
                >
                  {day.slice(0, 3)}
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
          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-base-content mb-1"
            >
              Start Time
            </label>
            <input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
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
          <div>
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-base-content mb-1"
            >
              End Time
            </label>
            <input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.endTime ? "border-error bg-error/10" : "border-base-300"
              }`}
            />

            {errors.endTime && (
              <p className="mt-1 text-sm text-error">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-base-content mb-1"
          >
            Location (Optional)
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            placeholder="e.g., Lincoln Hall 1019, Chem Lab 205"
            className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isSubmitting
                ? "bg-neutral/50 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 focus:bg-primary/90"
            } text-primary-content focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
          >
            {isSubmitting ? "Adding..." : "Add Course"}
          </button>
        </div>
      </form>
    </div>
  );
};
