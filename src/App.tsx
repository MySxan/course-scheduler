import { useState } from "react";
import type { Course } from "./types/course";
import { CSVUploader } from "./components/course-management";
import { CourseForm } from "./components/course-management";
import { CourseList } from "./components/course-management";
import { WeeklyTimetable } from "./components/timetable";
import { Sidebar, type PanelType } from "./components/layout/Sidebar";
import { SlidePanel } from "./components/layout/SlidePanel";
import {
  SettingsPanel,
  type TimetableSettings,
} from "./components/timetable/SettingsPanel";

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [settings, setSettings] = useState<TimetableSettings>({
    showWeekends: true,
    startWithSunday: false,
    dynamicTimeRange: true,
    startHour: 7,
    endHour: 17,
    slotDuration: 60,
    verticalScale: 100,
    width: 100,
  });

  const handleCoursesFromCSV = (newCourses: Course[]) => {
    setCourses((prevCourses) => [...prevCourses, ...newCourses]);
    setActivePanel(null);
  };

  const handleCourseAdded = (newCourse: Course) => {
    setCourses((prevCourses) => [...prevCourses, newCourse]);
    setActivePanel(null);
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

  const getPanelTitle = (panel: PanelType) => {
    switch (panel) {
      case "import":
        return "Import Courses";
      case "add":
        return "Add Course";
      case "style":
        return "Card Style";
      case "settings":
        return "Settings";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex">
      <Sidebar activePanel={activePanel} onPanelSelect={setActivePanel} />

      <SlidePanel
        isOpen={activePanel !== null}
        onClose={() => setActivePanel(null)}
        title={getPanelTitle(activePanel)}
      >
        {activePanel === "import" && (
          <CSVUploader onCoursesLoaded={handleCoursesFromCSV} />
        )}
        {activePanel === "add" && (
          <CourseForm onCourseAdded={handleCourseAdded} />
        )}
        {activePanel === "style" && (
          <div className="p-4 text-center opacity-50">
            Card Style Settings (Coming Soon)
          </div>
        )}
        {activePanel === "settings" && (
          <SettingsPanel settings={settings} onSettingsChange={setSettings} />
        )}
      </SlidePanel>

      <div className="flex-1 ml-14 transition-all duration-300 ease-in-out">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-base-content mb-2">
              Course Scheduler
            </h1>
            <p className="text-base-content/70">
              Use the sidebar to add courses and customize your view
            </p>
          </div>

          {/* Course Display Tabs */}
          <div className="space-y-6">
            {/* Weekly Timetable Grid */}
            <WeeklyTimetable courses={courses} settings={settings} />

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
    </div>
  );
}

export default App;
