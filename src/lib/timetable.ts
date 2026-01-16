import type { Course, DaysOfWeek } from "../types/course";
import { formatTime } from "./utils";

// Types for timetable utilities
export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  value: string;
}

export interface TimetableCourse extends Course {
  startSlot: number;
  duration: number;
  hasConflict: boolean;
  conflictLevel: number; // number of overlapping courses
}

export interface TimeRange {
  startHour: number;
  endHour: number;
}

// Type for courses organized by day with strict typing
export type CoursesByDay = Partial<Record<DaysOfWeek, TimetableCourse[]>>;

/**
 * Generate time slots - always generates hourly slots for display, regardless of slot duration
 */
export const generateTimeSlots = (
  startHour: number = 7,
  endHour: number = 22,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _slotDuration?: number
): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    const timeString = `${hour.toString().padStart(2, "0")}:00`;
    const label = formatTime(timeString);
    slots.push({
      hour,
      minute: 0,
      label,
      value: timeString,
    });
  }
  return slots;
};

/**
 * Generate all time slots for positioning calculations (based on actual slot duration)
 */
export const generateAllTimeSlots = (
  startHour: number = 7,
  endHour: number = 22,
  slotDuration: number = 60
): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
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
}; /**
 * Calculate dynamic time range based on courses - floor to nearest full hour (min) and ceil to nearest full hour (max)
 */
export const calculateTimeRange = (courses: Course[]): TimeRange => {
  if (courses.length === 0) {
    return { startHour: 7, endHour: 22 };
  }

  let earliestHour = 24;
  let latestHour = 0;

  courses.forEach((course) => {
    const startHour = parseInt(course.startTime.split(":")[0]);
    const startMinutes = parseInt(course.startTime.split(":")[1]);
    const endHour = parseInt(course.endTime.split(":")[0]);
    const endMinutes = parseInt(course.endTime.split(":")[1]);

    // Floor start time to nearest full hour
    const flooredStart = startMinutes > 0 ? startHour : startHour;
    // Ceil end time to nearest full hour
    const ceiledEnd = endMinutes > 0 ? endHour + 1 : endHour;

    earliestHour = Math.min(earliestHour, flooredStart);
    latestHour = Math.max(latestHour, ceiledEnd);
  });

  return {
    startHour: Math.max(0, earliestHour - 1),
    endHour: Math.min(23, latestHour),
  };
};

/**
 * Convert time string to slot index
 */
export const timeToSlotIndex = (
  time: string,
  startHour: number = 7,
  slotDuration: number = 30
): number => {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = (hours - startHour) * 60 + minutes;
  return Math.floor(totalMinutes / slotDuration);
};

/**
 * Calculate duration in configurable slots
 */
export const calculateDuration = (
  startTime: string,
  endTime: string,
  startHour: number = 7,
  slotDuration: number = 30
): number => {
  const startSlot = timeToSlotIndex(startTime, startHour, slotDuration);
  const endSlot = timeToSlotIndex(endTime, startHour, slotDuration);
  return Math.max(1, endSlot - startSlot);
};

/**
 * Interface for course with time slot information (internal use)
 */
interface CourseWithSlots extends Course {
  startSlot: number;
  endSlot: number;
  hasConflict: boolean;
  conflictLevel: number;
}

/**
 * Optimized conflict detection with sorting for better performance
 */
export const detectConflicts = (
  courses: Course[],
  startHour: number = 7,
  slotDuration: number = 30
): (Course & { hasConflict: boolean; conflictLevel: number })[] => {
  const coursesWithConflicts: CourseWithSlots[] = courses.map((course) => ({
    ...course,
    startSlot: timeToSlotIndex(course.startTime, startHour, slotDuration),
    endSlot:
      timeToSlotIndex(course.startTime, startHour, slotDuration) +
      calculateDuration(
        course.startTime,
        course.endTime,
        startHour,
        slotDuration
      ),
    hasConflict: false,
    conflictLevel: 0,
  }));

  // Group by day and optimize conflict detection
  const coursesByDay: Partial<Record<DaysOfWeek, CourseWithSlots[]>> = {};

  coursesWithConflicts.forEach((course) => {
    course.daysOfWeek.forEach((day) => {
      if (!coursesByDay[day]) {
        coursesByDay[day] = [];
      }
      coursesByDay[day]!.push(course);
    });
  });

  // Check for conflicts within each day - sort by start time for optimization
  Object.values(coursesByDay).forEach((dayCourses) => {
    if (!dayCourses) return;

    // Sort courses by start time for more efficient conflict detection
    dayCourses.sort((a, b) => a.startSlot - b.startSlot);

    for (let i = 0; i < dayCourses.length; i++) {
      const course1 = dayCourses[i];

      // Only check courses that could potentially overlap (optimization)
      for (let j = i + 1; j < dayCourses.length; j++) {
        const course2 = dayCourses[j];

        // If course2 starts after course1 ends, no more conflicts possible for course1
        if (course2.startSlot >= course1.endSlot) {
          break;
        }

        // Check for overlap: courses overlap if start1 < end2 && start2 < end1
        if (
          course1.startSlot < course2.endSlot &&
          course2.startSlot < course1.endSlot
        ) {
          course1.hasConflict = true;
          course2.hasConflict = true;
          course1.conflictLevel++;
          course2.conflictLevel++;
        }
      }
    }
  });

  // Return courses without the temporary endSlot property
  return coursesWithConflicts.map((course) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { endSlot, ...courseWithoutEndSlot } = course;
    return courseWithoutEndSlot;
  });
};

/**
 * Transform courses with conflict detection into timetable courses
 */
export const createTimetableCourses = (
  courses: Course[],
  startHour: number,
  slotDuration: number = 30
): TimetableCourse[] => {
  const coursesWithConflicts = detectConflicts(
    courses,
    startHour,
    slotDuration
  );

  return coursesWithConflicts.map((course) => ({
    ...course,
    startSlot: timeToSlotIndex(course.startTime, startHour, slotDuration),
    duration: calculateDuration(
      course.startTime,
      course.endTime,
      startHour,
      slotDuration
    ),
  }));
};

/**
 * Group timetable courses by day with proper typing
 */
export const groupCoursesByDay = (courses: TimetableCourse[]): CoursesByDay => {
  return courses.reduce<CoursesByDay>((acc, course) => {
    // Handle multiple days per course
    course.daysOfWeek.forEach((day) => {
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day]!.push(course);
    });
    return acc;
  }, {});
};

/**
 * Get visible days based on settings
 */
export const getVisibleDays = (
  showWeekends: boolean,
  startWithSunday: boolean
): DaysOfWeek[] => {
  const DAYS: DaysOfWeek[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  let days = [...DAYS];

  if (!showWeekends) {
    days = days.filter((day) => !["Saturday", "Sunday"].includes(day));
  }

  if (startWithSunday && showWeekends) {
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
};
