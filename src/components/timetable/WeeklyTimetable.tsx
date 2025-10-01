import React, { useMemo, useState, useCallback } from "react";
import type { Course } from "../../types/course";
import { formatTime } from "../../lib/utils";
import {
  generateTimeSlots,
  calculateTimeRange,
  createTimetableCourses,
  groupCoursesByDay,
  getVisibleDays,
  type TimetableCourse,
  type CoursesByDay,
} from "../../lib/timetable";
import {
  TimetableSettingsPanel,
  type TimetableSettings,
} from "./SettingsPanel";

interface WeeklyTimetableProps {
  courses: Course[];
}

export const WeeklyTimetable: React.FC<WeeklyTimetableProps> = ({
  courses,
}) => {
  const [settings, setSettings] = useState<TimetableSettings>({
    showWeekends: true,
    startWithSunday: false,
    dynamicTimeRange: true,
    startHour: 7,
    endHour: 22,
    slotDuration: 30,
    verticalScale: 1.0,
  });
  const [showSettings, setShowSettings] = useState(false);

  // Memoized time range calculation
  const { startHour, endHour } = useMemo(() => {
    return settings.dynamicTimeRange
      ? calculateTimeRange(courses)
      : { startHour: settings.startHour, endHour: settings.endHour };
  }, [
    courses,
    settings.dynamicTimeRange,
    settings.startHour,
    settings.endHour,
  ]);

  // Memoized time slots generation
  const timeSlots = useMemo(
    () => generateTimeSlots(startHour, endHour, settings.slotDuration),
    [startHour, endHour, settings.slotDuration]
  );

  // Memoized timetable courses with optimized conflict detection
  const timetableCourses = useMemo(() => {
    return createTimetableCourses(courses, startHour, settings.slotDuration);
  }, [courses, startHour, settings.slotDuration]);

  // Memoized visible days calculation
  const visibleDays = useMemo(() => {
    return getVisibleDays(settings.showWeekends, settings.startWithSunday);
  }, [settings.showWeekends, settings.startWithSunday]);

  // Memoized courses grouped by day
  const coursesByDay: CoursesByDay = useMemo(() => {
    return groupCoursesByDay(timetableCourses);
  }, [timetableCourses]);

  // Settings change handler
  const handleSettingsChange = useCallback((newSettings: TimetableSettings) => {
    setSettings(newSettings);
  }, []);

  // Toggle settings handler
  const handleToggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  const getCourseCardClasses = (course: TimetableCourse) => {
    const baseClasses =
      "card card-compact shadow-sm absolute transition-all duration-200 hover:shadow-md cursor-pointer rounded-lg border border-opacity-30 backdrop-blur-sm";

    if (course.hasConflict) {
      if (course.conflictLevel > 1) {
        return `${baseClasses} bg-error/90 text-error-content border-error hover:bg-error hover:scale-[1.01]`;
      } else {
        return `${baseClasses} bg-warning/90 text-warning-content border-warning hover:bg-warning hover:scale-[1.01]`;
      }
    }

    return `${baseClasses} bg-primary/90 text-primary-content border-primary hover:bg-primary hover:scale-[1.01]`;
  };

  const getCoursePosition = (course: TimetableCourse) => {
    // Each slot is 3rem * scale (48px * scale) tall, courses should fill the slot precisely
    const height = course.duration * 3 * settings.verticalScale; // 3rem per slot duration * scale
    const topMargin = 0.125 * settings.verticalScale; // Scale margins proportionally
    const bottomMargin = 0.125 * settings.verticalScale;

    return {
      top: `${topMargin}rem`, // Scaled top margin
      bottom: `${bottomMargin}rem`, // Scaled bottom margin
      left: "0.25rem", // Keep horizontal margins constant
      right: "0.25rem", // Keep horizontal margins constant
      height: `calc(${height}rem - ${topMargin + bottomMargin}rem)`, // Account for scaled margins
      minHeight: `${2.5 * settings.verticalScale}rem`, // Scaled minimum height for single slot
    };
  };

  if (courses.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body text-center py-12">
          <div className="mx-auto w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="h-8 w-8 text-base-content/40"
            >
              <path d="M8 2v4" />
              <path d="m16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Weekly Timetable</h3>
          <p className="text-base-content/60">
            Add courses to see your weekly schedule
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
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
                className="h-6 w-6 text-primary"
              >
                <path d="M8 2v4" />
                <path d="m16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
              </svg>
              <h2 className="text-2xl font-bold text-base-content">
                Weekly Timetable
              </h2>
            </div>
            <div className="badge badge-primary badge-lg">
              {courses.length} courses
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <TimetableSettingsPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          showSettings={showSettings}
          onToggleSettings={handleToggleSettings}
        />

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span>Normal Course</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-warning rounded border-2 border-warning"></div>
            <span>Minor Conflict</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-error rounded border-2 border-error"></div>
            <span>Major Conflict</span>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <div
            className={`min-w-full grid gap-0 bg-base-300 rounded-lg overflow-hidden`}
            style={{
              gridTemplateColumns: `120px repeat(${visibleDays.length}, 1fr)`,
              transform: `scaleY(${settings.verticalScale})`,
              transformOrigin: "top",
              marginBottom: `${(settings.verticalScale - 1) * 50}%`,
            }}
          >
            {/* Header Row */}
            <div className="bg-base-200 p-4 font-bold text-center text-sm border-r border-base-300">
              <div className="text-base-content/80">Time</div>
            </div>
            {visibleDays.map((day) => (
              <div
                key={day}
                className="bg-base-200 p-4 font-bold text-center text-sm border-r border-base-300 last:border-r-0"
              >
                <div className="hidden sm:block text-base-content">{day}</div>
                <div className="sm:hidden text-base-content">
                  {day.slice(0, 3)}
                </div>
              </div>
            ))}

            {/* Time Grid */}
            {timeSlots.map((slot, slotIndex) => (
              <React.Fragment key={slot.value}>
                {/* Time Label */}
                <div className="bg-base-100 text-xs border-b border-r border-base-300 flex items-start justify-center relative">
                  <div
                    className="font-medium text-base-content/70 absolute -top-2 left-1/2 transform -translate-x-1/2 bg-base-100 px-2 text-center"
                    style={{
                      fontSize: `${0.75 / settings.verticalScale}rem`,
                      lineHeight: "1.2",
                    }}
                  >
                    {slot.label}
                  </div>
                </div>

                {/* Day Columns */}
                {visibleDays.map((day) => (
                  <div
                    key={`${day}-${slot.value}`}
                    className="bg-base-100 relative border-b border-r border-base-300 last:border-r-0"
                    style={{
                      height: `${3 * settings.verticalScale}rem`,
                      minHeight: `${3 * settings.verticalScale}rem`,
                    }}
                  >
                    {/* Render courses for this day and time slot */}
                    {coursesByDay[day]?.map((course) => {
                      if (course.startSlot === slotIndex) {
                        return (
                          <div
                            key={course.id}
                            className={getCourseCardClasses(course)}
                            style={getCoursePosition(course)}
                            title={`${course.name} - ${formatTime(course.startTime)} to ${formatTime(course.endTime)}${course.location ? ` at ${course.location}` : ""}`}
                          >
                            <div className="card-body p-2">
                              <div className="font-semibold text-xs leading-tight line-clamp-2">
                                {course.name}
                              </div>
                              <div className="text-xs opacity-90 mt-1">
                                {formatTime(course.startTime)} -{" "}
                                {formatTime(course.endTime)}
                              </div>
                              {course.location && (
                                <div className="text-xs opacity-80 flex items-center gap-1 mt-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    className="h-3 w-3"
                                  >
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                  </svg>
                                  <span className="truncate">
                                    {course.location}
                                  </span>
                                </div>
                              )}
                              {course.hasConflict && (
                                <div className="text-xs font-medium mt-1 flex items-center gap-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-3 w-3"
                                  >
                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                    <path d="M12 9v4" />
                                    <path d="m12 17 .01 0" />
                                  </svg>
                                  Conflict
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Mobile-friendly course list for small screens */}
        <div className="sm:hidden mt-6">
          <div className="text-sm font-medium mb-3">Course Details:</div>
          <div className="space-y-2">
            {timetableCourses.map((course) => (
              <div
                key={course.id}
                className={`card card-compact ${
                  course.hasConflict
                    ? course.conflictLevel > 1
                      ? "bg-error text-error-content"
                      : "bg-warning text-warning-content"
                    : "bg-primary text-primary-content"
                }`}
              >
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{course.name}</div>
                      <div className="text-sm opacity-90">
                        {course.daysOfWeek.join(", ")} •{" "}
                        {formatTime(course.startTime)} -{" "}
                        {formatTime(course.endTime)}
                      </div>
                      {course.location && (
                        <div className="text-sm opacity-80">
                          {course.location}
                        </div>
                      )}
                    </div>
                    {course.hasConflict && (
                      <div className="badge badge-outline badge-sm">
                        Conflict
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
