import { useState } from "react";
import type { Course } from "./types/course";
import { CSVUploader } from "./components/course-management";
import { CourseForm } from "./components/course-management";
import { CourseList } from "./components/course-management";
import { WeeklyTimetable } from "./components/timetable";

function App() {
  const [courses, setCourses] = useState<Course[]>([]);

  const handleCoursesFromCSV = (newCourses: Course[]) => {
    setCourses((prevCourses) => [...prevCourses, ...newCourses]);
  };

  const handleCourseAdded = (newCourse: Course) => {
    setCourses((prevCourses) => [...prevCourses, newCourse]);
  };

  const handleRemoveCourse = (courseId: string) => {
    setCourses((prevCourses) =>
      prevCourses.filter((course) => course.id !== courseId)
    );
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to remove all courses?")) {
      setCourses([]);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Course Scheduler
          </h1>
          <p className="text-base-content/70">
            Upload courses from CSV or add them manually to create your schedule
          </p>
        </div>

        {/* Input Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CSVUploader onCoursesLoaded={handleCoursesFromCSV} />
          <CourseForm onCourseAdded={handleCourseAdded} />
        </div>

        {/* Course Display Tabs */}
        <div className="space-y-6">
          {/* Weekly Timetable Grid */}
          <WeeklyTimetable courses={courses} />

          {/* Clear All Button */}
          {courses.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm bg-error text-error-content rounded-md hover:bg-error/90 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 transition-colors"
              >
                Clear All Courses
              </button>
            </div>
          )}

          {/* Course List */}
          <CourseList courses={courses} onRemoveCourse={handleRemoveCourse} />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-base-content/50">
          <p>Built with React, TypeScript, and Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
