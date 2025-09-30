import React from 'react';
import type { Course } from '../types/course';
import { formatTime } from '../utils/helpers';

interface CourseListProps {
  courses: Course[];
  onRemoveCourse: (courseId: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({ courses, onRemoveCourse }) => {
  if (courses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Course Schedule</h2>
        <div className="text-center text-gray-500">
          <p>No courses added yet.</p>
          <p className="text-sm mt-1">Upload a CSV file or add courses manually to get started.</p>
        </div>
      </div>
    );
  }

  // Group courses by day of week
  const coursesByDay = courses.reduce((acc, course) => {
    if (!acc[course.dayOfWeek]) {
      acc[course.dayOfWeek] = [];
    }
    acc[course.dayOfWeek].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  // Sort courses within each day by start time
  Object.keys(coursesByDay).forEach(day => {
    coursesByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sortedDays = daysOrder.filter(day => coursesByDay[day]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Course Schedule</h2>
        <span className="text-sm text-gray-600">
          {courses.length} course{courses.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-6">
        {sortedDays.map(day => (
          <div key={day} className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">{day}</h3>
            <div className="space-y-2">
              {coursesByDay[day].map(course => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h4 className="font-medium text-gray-900">{course.name}</h4>
                      <span className="text-sm text-gray-600">
                        {formatTime(course.startTime)} - {formatTime(course.endTime)}
                      </span>
                      {course.location && (
                        <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          {course.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveCourse(course.id)}
                    className="ml-4 text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                    title="Remove course"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
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