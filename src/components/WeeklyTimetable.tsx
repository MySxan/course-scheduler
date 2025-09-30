import React, { useMemo } from "react";
import type { Course, DayOfWeek } from "../types/course";
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

const DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Generate time slots from 7:00 AM to 10:00 PM (30-minute intervals)
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 7; hour <= 22; hour++) {
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

const timeToSlotIndex = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  const startHour = 7;
  const totalMinutes = (hours - startHour) * 60 + minutes;
  return Math.floor(totalMinutes / 30);
};

const calculateDuration = (startTime: string, endTime: string): number => {
  const startSlot = timeToSlotIndex(startTime);
  const endSlot = timeToSlotIndex(endTime);
  return Math.max(1, endSlot - startSlot);
};

const detectConflicts = (courses: Course[]): Course[] => {
  const coursesWithConflicts = courses.map((course) => ({
    ...course,
    hasConflict: false,
    conflictLevel: 0,
  }));

  // Group by day
  const coursesByDay = coursesWithConflicts.reduce(
    (acc, course) => {
      if (!acc[course.dayOfWeek]) {
        acc[course.dayOfWeek] = [];
      }
      acc[course.dayOfWeek].push(course);
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

        const start1 = timeToSlotIndex(course1.startTime);
        const end1 =
          start1 + calculateDuration(course1.startTime, course1.endTime);
        const start2 = timeToSlotIndex(course2.startTime);
        const end2 =
          start2 + calculateDuration(course2.startTime, course2.endTime);

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
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const timetableCourses = useMemo(() => {
    const coursesWithConflicts = detectConflicts(courses);

    return coursesWithConflicts.map((course) => ({
      ...course,
      startSlot: timeToSlotIndex(course.startTime),
      duration: calculateDuration(course.startTime, course.endTime),
    })) as TimetableCourse[];
  }, [courses]);

  const coursesByDay = useMemo(() => {
    return timetableCourses.reduce(
      (acc, course) => {
        if (!acc[course.dayOfWeek]) {
          acc[course.dayOfWeek] = [];
        }
        acc[course.dayOfWeek].push(course);
        return acc;
      },
      {} as Record<string, TimetableCourse[]>
    );
  }, [timetableCourses]);

  const getCourseCardClasses = (course: TimetableCourse) => {
    const baseClasses =
      "card card-compact shadow-lg absolute left-1 right-1 transition-all duration-200 hover:shadow-xl cursor-pointer";

    if (course.hasConflict) {
      if (course.conflictLevel > 1) {
        return `${baseClasses} bg-error text-error-content border-2 border-error`;
      } else {
        return `${baseClasses} bg-warning text-warning-content border-2 border-warning`;
      }
    }

    return `${baseClasses} bg-primary text-primary-content`;
  };

  const getCoursePosition = (course: TimetableCourse) => {
    const top = course.startSlot * 3; // 3rem per slot (48px)
    const height = course.duration * 3; // 3rem per slot

    return {
      top: `${top}rem`,
      height: `${height}rem`,
      minHeight: "2.5rem",
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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-primary"
            >
              <path d="M8 2v4" />
              <path d="m16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-base-content">
            Weekly Timetable
          </h2>
          <div className="badge badge-outline badge-sm">
            {courses.length} courses
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
        <div className="overflow-x-auto">
          <div className="min-w-full grid grid-cols-8 gap-px bg-base-300 rounded-lg p-1">
            {/* Header Row */}
            <div className="bg-base-200 p-3 rounded-tl-lg font-semibold text-center text-sm">
              Time
            </div>
            {DAYS.map((day, index) => (
              <div
                key={day}
                className={`bg-base-200 p-3 font-semibold text-center text-sm ${
                  index === DAYS.length - 1 ? "rounded-tr-lg" : ""
                }`}
              >
                <div className="hidden sm:block">{day}</div>
                <div className="sm:hidden">{day.slice(0, 3)}</div>
              </div>
            ))}

            {/* Time Grid */}
            {timeSlots.map((slot, slotIndex) => (
              <React.Fragment key={slot.value}>
                {/* Time Label */}
                <div
                  className={`bg-base-100 p-2 text-xs text-center border-r border-base-300 relative ${
                    slotIndex === timeSlots.length - 1 ? "rounded-bl-lg" : ""
                  }`}
                >
                  <div className="font-medium">{slot.label}</div>
                </div>

                {/* Day Columns */}
                {DAYS.map((day, dayIndex) => (
                  <div
                    key={`${day}-${slot.value}`}
                    className={`bg-base-100 relative min-h-[3rem] border-b border-base-300 ${
                      slotIndex === timeSlots.length - 1 &&
                      dayIndex === DAYS.length - 1
                        ? "rounded-br-lg"
                        : ""
                    }`}
                    style={{ height: "3rem" }}
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
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
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
                        {course.dayOfWeek} • {formatTime(course.startTime)} -{" "}
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
