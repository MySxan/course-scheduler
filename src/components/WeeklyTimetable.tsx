import React, { useMemo, useState } from "react";
import type { Course, DaysOfWeek } from "../types/course";
import { formatTime } from "../utils/helpers";

interface WeeklyTimetableProps {
  courses: Course[];
}

interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  value: string; // "HH:MM" format
}

interface TimetableCourse extends Course {
  startSlot: number;
  duration: number; // in 30-minute slots
  hasConflict: boolean;
  conflictLevel: number; // number of overlapping courses
}

interface TimetableSettings {
  showWeekends: boolean;
  startWithSunday: boolean;
  dynamicTimeRange: boolean;
}

const DAYS: DaysOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Generate time slots with dynamic range support
const generateTimeSlots = (
  startHour: number = 7,
  endHour: number = 22
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const label = formatTime(timeString);
      slots.push({
        hour,
        minute,
        label,
        value: timeString,
      });
    }
  }
  return slots;
};

// Calculate dynamic time range based on courses
const calculateTimeRange = (
  courses: Course[]
): { startHour: number; endHour: number } => {
  if (courses.length === 0) {
    return { startHour: 7, endHour: 22 };
  }

  let earliestHour = 24;
  let latestHour = 0;

  courses.forEach((course) => {
    const startHour = parseInt(course.startTime.split(":")[0]);
    const endHour = parseInt(course.endTime.split(":")[0]);
    const endMinutes = parseInt(course.endTime.split(":")[1]);

    earliestHour = Math.min(earliestHour, startHour);
    latestHour = Math.max(latestHour, endMinutes > 0 ? endHour + 1 : endHour);
  });

  // Add 1 hour buffer before and after
  const bufferedStart = Math.max(0, earliestHour - 1);
  const bufferedEnd = Math.min(23, latestHour + 1);

  return { startHour: bufferedStart, endHour: bufferedEnd };
};

const timeToSlotIndex = (time: string, startHour: number = 7): number => {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = (hours - startHour) * 60 + minutes;
  return Math.floor(totalMinutes / 30);
};

const calculateDuration = (
  startTime: string,
  endTime: string,
  startHour: number = 7
): number => {
  const startSlot = timeToSlotIndex(startTime, startHour);
  const endSlot = timeToSlotIndex(endTime, startHour);
  return Math.max(1, endSlot - startSlot);
};

const detectConflicts = (courses: Course[]): Course[] => {
  const coursesWithConflicts = courses.map((course) => ({
    ...course,
    hasConflict: false,
    conflictLevel: 0,
  }));

  // Group by day (expand courses that occur on multiple days)
  const coursesByDay = coursesWithConflicts.reduce(
    (acc, course) => {
      course.daysOfWeek.forEach((day) => {
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(course);
      });
      return acc;
    },
    {} as Record<string, typeof coursesWithConflicts>
  );

  // Check for conflicts within each day
  Object.keys(coursesByDay).forEach((day) => {
    const dayCourses = coursesByDay[day];

    for (let i = 0; i < dayCourses.length; i++) {
      for (let j = i + 1; j < dayCourses.length; j++) {
        const course1 = dayCourses[i];
        const course2 = dayCourses[j];

        const start1 = timeToSlotIndex(course1.startTime, 7);
        const end1 =
          start1 + calculateDuration(course1.startTime, course1.endTime, 7);
        const start2 = timeToSlotIndex(course2.startTime, 7);
        const end2 =
          start2 + calculateDuration(course2.startTime, course2.endTime, 7);

        // Check for overlap
        if (start1 < end2 && start2 < end1) {
          course1.hasConflict = true;
          course2.hasConflict = true;
          course1.conflictLevel++;
          course2.conflictLevel++;
        }
      }
    }
  });

  return coursesWithConflicts;
};

export const WeeklyTimetable: React.FC<WeeklyTimetableProps> = ({
  courses,
}) => {
  const [settings, setSettings] = useState<TimetableSettings>({
    showWeekends: true,
    startWithSunday: false,
    dynamicTimeRange: true,
  });
  const [showSettings, setShowSettings] = useState(false);

  const { startHour, endHour } = useMemo(() => {
    return settings.dynamicTimeRange
      ? calculateTimeRange(courses)
      : { startHour: 7, endHour: 22 };
  }, [courses, settings.dynamicTimeRange]);

  const timeSlots = useMemo(
    () => generateTimeSlots(startHour, endHour),
    [startHour, endHour]
  );

  const timetableCourses = useMemo(() => {
    const coursesWithConflicts = detectConflicts(courses);

    return coursesWithConflicts.map((course) => ({
      ...course,
      startSlot: timeToSlotIndex(course.startTime, startHour),
      duration: calculateDuration(course.startTime, course.endTime, startHour),
    })) as TimetableCourse[];
  }, [courses, startHour]);

  const visibleDays = useMemo(() => {
    let days = [...DAYS];

    if (!settings.showWeekends) {
      days = days.filter((day) => !["Saturday", "Sunday"].includes(day));
    }

    if (settings.startWithSunday && settings.showWeekends) {
      const sundayIndex = days.findIndex((day) => day === "Sunday");
      if (sundayIndex !== -1) {
        days = [
          days[sundayIndex],
          ...days.slice(0, sundayIndex),
          ...days.slice(sundayIndex + 1),
        ];
      }
    }

    return days;
  }, [settings.showWeekends, settings.startWithSunday]);

  const coursesByDay = useMemo(() => {
    return timetableCourses.reduce(
      (acc, course) => {
        // Handle multiple days per course
        course.daysOfWeek.forEach((day) => {
          if (!acc[day]) {
            acc[day] = [];
          }
          acc[day].push(course);
        });
        return acc;
      },
      {} as Record<string, TimetableCourse[]>
    );
  }, [timetableCourses]);

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
    // Each slot is 3rem (48px) tall, courses should fill the slot precisely
    const height = course.duration * 3; // 3rem per slot duration

    return {
      top: "0.125rem", // Small top margin
      bottom: "0.125rem", // Small bottom margin
      left: "0.25rem", // 4px left margin
      right: "0.25rem", // 4px right margin
      height: `calc(${height}rem - 0.25rem)`, // Account for margins
      minHeight: "2.5rem", // Minimum height for single slot
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

          {/* Settings Toggle Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
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
                className={`h-4 w-4 transition-transform duration-200 ${showSettings ? "rotate-180" : ""}`}
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
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={settings.showWeekends}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          showWeekends: e.target.checked,
                        }))
                      }
                    />
                    <div>
                      <span className="label-text font-medium">
                        Show Weekends
                      </span>
                      <div className="text-xs text-base-content/60">
                        Display Saturday and Sunday
                      </div>
                    </div>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={settings.startWithSunday}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          startWithSunday: e.target.checked,
                        }))
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

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={settings.dynamicTimeRange}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          dynamicTimeRange: e.target.checked,
                        }))
                      }
                    />
                    <div>
                      <span className="label-text font-medium">
                        Smart Time Range
                      </span>
                      <div className="text-xs text-base-content/60">
                        {settings.dynamicTimeRange
                          ? `${formatTime(`${startHour.toString().padStart(2, "0")}:00`)} - ${formatTime(`${endHour.toString().padStart(2, "0")}:00`)}`
                          : "Show only relevant hours"}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                <div className="bg-base-100 p-3 text-xs text-center border-b border-r border-base-300 flex items-center justify-center">
                  <div className="font-medium text-base-content/70">
                    {slot.label}
                  </div>
                </div>

                {/* Day Columns */}
                {visibleDays.map((day) => (
                  <div
                    key={`${day}-${slot.value}`}
                    className="bg-base-100 relative border-b border-r border-base-300 last:border-r-0"
                    style={{ height: "3rem", minHeight: "3rem" }}
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
