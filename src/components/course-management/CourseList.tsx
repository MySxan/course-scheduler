import React from "react";
import type { Course } from "../../types/course";
import { formatTime } from "../../lib/utils";

interface CourseListProps {
  courses: Course[];
  onRemoveCourse: (courseId: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  onRemoveCourse,
}) => {
  // Group courses by day of week (expand courses that occur on multiple days)
  const coursesByDay = courses.reduce(
    (acc, course) => {
      course.daysOfWeek.forEach((day) => {
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(course);
      });
      return acc;
    },
    {} as Record<string, Course[]>
  );

  // Sort courses within each day by start time
  Object.keys(coursesByDay).forEach((day) => {
    coursesByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  const daysOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const sortedDays = daysOrder.filter((day) => coursesByDay[day]);
  
  if (courses.length === 0) {
    return (
      <div className="card flex flex-col flex-1 h-full justify-center items-center">
        <div className="flex-none card-body text-center -mt-16">
          <div className="mx-auto w-12 h-12 bg-base-100 rounded-full flex items-center justify-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="h-6 w-6 text-base-content/40"
            >
              <path d="M3 5h.01" />
              <path d="M3 12h.01" />
              <path d="M3 19h.01" />
              <path d="M8 5h13" />
              <path d="M8 12h13" />
              <path d="M8 19h13" />
            </svg>
          </div>
          <h3 className="text-lg font-bold">No courses in your schedule</h3>
          <p className="text-sm text-base-content/70">
            Upload a CSV file or add courses manually to get started
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="card">
      <div className="space-y-6">
        {sortedDays.map((day) => (
          <div key={day} className="border-l-4 border-primary pl-4">
            <h3 className="text-lg font-bold text-base-content mb-3">{day}</h3>
            <div className="space-y-2">
              {coursesByDay[day].map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 bg-base-200 rounded-md border border-base-300 hover:bg-base-300 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 flex-wrap">
                      <h4 className="font-bold text-base-content">
                        {course.name}
                        {course.section && (
                          <span className="text-sm font-normal text-base-content/70 ml-1">
                            - {course.section}
                          </span>
                        )}
                      </h4>

                      {/* Time Range tag */}
                      <span className="text-sm text-base-content/70">
                        {formatTime(course.startTime)} -{" "}
                        {formatTime(course.endTime)}
                      </span>

                      {/* Days of Week Tags */}
                      <div className="flex gap-1 flex-wrap">
                        {course.daysOfWeek.map((courseDay) => (
                          <span
                            key={courseDay}
                            className={`text-xs px-2 py-1 rounded ${
                              courseDay === day
                                ? "bg-primary/20 text-primary font-medium"
                                : "bg-base-200 text-base-content/60"
                            }`}
                          >
                            {courseDay.slice(0, 2)}
                          </span>
                        ))}
                      </div>

                      {/* Location Tag */}
                      {course.location && (
                        <span className="text-sm text-neutral-content bg-neutral px-2 py-1 rounded">
                          {course.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Remove Course Button */}
                  <button
                    onClick={() => onRemoveCourse(course.id)}
                    className="ml-4 text-error hover:text-error/80 hover:bg-error/10 p-1 rounded transition-colors"
                    title="Remove course"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" x2="10" y1="11" y2="17" />
                      <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
