import React, { createContext, useState, useCallback, useMemo } from "react";
import type { Course, DayOfWeek } from "../types/course";
import { DAYS_OF_WEEK } from "../types/course";

// Timetable structure for efficient day/time organization
export interface Timetable {
  [key: string]: Course[]; // Key is DayOfWeek
}

export interface CourseContextType {
  // Core state
  courses: Course[];
  timetable: Timetable;

  // Actions
  addCourse: (course: Course) => void;
  addCourses: (courses: Course[]) => void;
  removeCourse: (courseId: string) => void;
  clearAllCourses: () => void;
  updateCourse: (courseId: string, updatedCourse: Partial<Course>) => void;

  // Computed values
  totalCourses: number;
  coursesByDay: (day: DayOfWeek) => Course[];
  hasCoursesOnDay: (day: DayOfWeek) => boolean;
  getConflictingCourses: (course: Course) => Course[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const CourseContext = createContext<CourseContextType | undefined>(
  undefined
);

interface CourseProviderProps {
  children: React.ReactNode;
}

export const CourseProvider: React.FC<CourseProviderProps> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);

  // Create timetable structure from courses array
  const timetable = useMemo(() => {
    const table: Timetable = {};

    // Initialize empty arrays for all days
    DAYS_OF_WEEK.forEach((day) => {
      table[day] = [];
    });

    // Group courses by day and sort by start time
    courses.forEach((course) => {
      table[course.dayOfWeek].push(course);
    });

    // Sort courses within each day by start time
    Object.keys(table).forEach((day) => {
      table[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return table;
  }, [courses]);

  const addCourse = useCallback((course: Course) => {
    setCourses((prev) => [...prev, course]);
  }, []);

  const addCourses = useCallback((newCourses: Course[]) => {
    setCourses((prev) => [...prev, ...newCourses]);
  }, []);

  const removeCourse = useCallback((courseId: string) => {
    setCourses((prev) => prev.filter((course) => course.id !== courseId));
  }, []);

  const clearAllCourses = useCallback(() => {
    setCourses([]);
  }, []);

  const updateCourse = useCallback(
    (courseId: string, updatedCourse: Partial<Course>) => {
      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId ? { ...course, ...updatedCourse } : course
        )
      );
    },
    []
  );

  const coursesByDay = useCallback(
    (day: DayOfWeek) => {
      return timetable[day] || [];
    },
    [timetable]
  );

  const hasCoursesOnDay = useCallback(
    (day: DayOfWeek) => {
      return timetable[day] && timetable[day].length > 0;
    },
    [timetable]
  );

  const getConflictingCourses = useCallback(
    (course: Course): Course[] => {
      const sameDayCourses = timetable[course.dayOfWeek] || [];

      return sameDayCourses.filter((existingCourse) => {
        if (existingCourse.id === course.id) return false;

        // Check for time overlap
        const newStart = timeToMinutes(course.startTime);
        const newEnd = timeToMinutes(course.endTime);
        const existingStart = timeToMinutes(existingCourse.startTime);
        const existingEnd = timeToMinutes(existingCourse.endTime);

        return (
          (newStart < existingEnd && newEnd > existingStart) ||
          (existingStart < newEnd && existingEnd > newStart)
        );
      });
    },
    [timetable]
  );

  const contextValue: CourseContextType = {
    courses,
    timetable,
    addCourse,
    addCourses,
    removeCourse,
    clearAllCourses,
    updateCourse,
    totalCourses: courses.length,
    coursesByDay,
    hasCoursesOnDay,
    getConflictingCourses,
  };

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
    </CourseContext.Provider>
  );
};

// Helper function to convert time string to minutes for comparison
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
