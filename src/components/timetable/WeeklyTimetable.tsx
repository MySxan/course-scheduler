import React, { useMemo, useState, useCallback } from "react";
import type { Course } from "../../types/course";
import { formatTime } from "../../lib/utils";
import {
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
    slotDuration: 60,
    verticalScale: 0.8,
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
      "card card-compact shadow-lg absolute transition-all duration-200 hover:shadow-xl cursor-pointer rounded-lg border-2 backdrop-blur-sm opacity-90";

    if (course.hasConflict) {
      if (course.conflictLevel > 1) {
        return `${baseClasses} bg-error text-error-content border-error hover:bg-error/90 hover:scale-[1.02]`;
      } else {
        return `${baseClasses} bg-warning text-warning-content border-warning hover:bg-warning/90 hover:scale-[1.02]`;
      }
    }

    return `${baseClasses} bg-primary text-primary-content border-primary hover:bg-primary/90 hover:scale-[1.02]`;
  };

  const getCoursePosition = (
    course: TimetableCourse,
    startHour: number,
    verticalScale: number
  ) => {
    const [startH, startM] = course.startTime.split(":").map(Number);
    const [endH, endM] = course.endTime.split(":").map(Number);

    const courseStartMinutes = (startH - startHour) * 60 + startM;
    const courseEndMinutes = (endH - startHour) * 60 + endM;
    const durationMinutes = courseEndMinutes - courseStartMinutes;

    // 每分钟高度 (4rem / 60min) * verticalScale
    const minuteHeight = (4 / 60) * verticalScale;

    return {
      top: `${courseStartMinutes * minuteHeight}rem`,
      height: `${durationMinutes * minuteHeight}rem`,
      left: "0.2rem",
      right: "0.2rem",
      position: "absolute" as const,
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
          <div className="badge badge-primary badge-lg align-middle">
            {courses.length} courses
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
        {/* <div className="flex flex-wrap gap-3 mb-6">
          <div className="badge badge-primary badge-lg gap-2">
            Normal Course
          </div>
          <div className="badge badge-warning badge-lg gap-2">
            Minor Conflict
          </div>
          <div className="badge badge-error badge-lg gap-2">Major Conflict</div>
        </div> */}

        <div
          className="min-w-full grid gap-0 bg-base rounded-lg overflow-hidden relative"
          style={{
            gridTemplateColumns: `60px repeat(${visibleDays.length}, 1fr)`,
            gridTemplateRows: `40px repeat(${endHour - startHour + 1}, ${4 * settings.verticalScale}rem)`,
          }}
        >
          {/* Header Row */}
          <div className="bg-base"></div>
          {visibleDays.map((day) => (
            <div
              key={day}
              className="bg-base font-bold text-center text-sm border-b border-slate-400"
            >
              <div className="hidden sm:block text-base-content">{day}</div>
              <div className="sm:hidden text-base-content">
                {day.slice(0, 3)}
              </div>
            </div>
          ))}

          {/* Time Labels */}
          {Array.from({ length: endHour - startHour + 2 }, (_, i) => {
            const hour = startHour + i;
            const isExtraRow = i === endHour - startHour + 1;
            return (
              <div
                key={hour}
                className="text-xs text-right flex items-start justify-end mr-6"
                style={{
                  gridColumn: 1,
                  gridRow: i + 2,
                  transform: "translateY(-0.5rem)",
                }}
              >
                {!isExtraRow ? `${hour}:00` : `${endHour + 1}:00`}{" "}
              </div>
            );
          })}

          {/* Hour slots */}
          {Array.from({ length: endHour - startHour + 1 }, (_, i) =>
            visibleDays.map((day, dayIndex) => (
              <div
                key={`${day}-${i}`}
                className="relative border-b border-slate-400 "
                style={{ gridColumn: dayIndex + 2, gridRow: i + 2 }}
              >
                {/* 30-min divider */}
                {settings.slotDuration === 30 && (
                  <div
                    className="absolute w-full border-t border-slate-200"
                    style={{ top: "50%", left: 0 }}
                  />
                )}
              </div>
            ))
          )}

          {/* Day overlays (课程卡片) */}
          {visibleDays.map((day, dayIndex) => (
            <div
              key={day}
              className="relative"
              style={{
                gridColumn: dayIndex + 2,
                gridRow: "2 / -1",
              }}
            >
              {coursesByDay[day]?.map((course) => (
                <div
                  key={course.id}
                  className={getCourseCardClasses(course)}
                  style={getCoursePosition(
                    course,
                    startHour,
                    settings.verticalScale
                  )}
                  title={`${course.name} - ${formatTime(course.startTime)} to ${formatTime(course.endTime)}${course.location ? ` at ${course.location}` : ""}`}
                >
                  <div className="card-body p-1">
                    <div className="text-lg font-bold leading-tight line-clamp-2">
                      {course.name}
                    </div>
                    <div className="text-xs text-base-content/60 -mt-1.5">
                      {formatTime(course.startTime)} -{" "}
                      {formatTime(course.endTime)}
                    </div>
                    {course.location && (
                      <div className="truncate text-xs -mt-1.5">
                        {course.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Mobile-friendly course list for small screens */}
        <div className="sm:hidden mt-6">
          <div className="alert alert-info mb-4">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">Course Details</span>
          </div>
          <div className="space-y-3">
            {timetableCourses.map((course) => (
              <div
                key={course.id}
                className={`card shadow-md ${
                  course.hasConflict
                    ? course.conflictLevel > 1
                      ? "bg-error text-error-content border-error"
                      : "bg-warning text-warning-content border-warning"
                    : "bg-primary text-primary-content border-primary"
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
                      <div className="badge badge-ghost badge-sm gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
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
