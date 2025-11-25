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
  const [activeTab, setActiveTab] = useState<"timetable" | "list">("timetable");

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

  const getPanelTitle = (panel: PanelType) => {
    switch (panel) {
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
        {activePanel === "add" && (
          <div className="flex flex-col gap-6 pb-8">
            <CourseForm onCourseAdded={handleCourseAdded} />
            <CSVUploader onCoursesLoaded={handleCoursesFromCSV} />
          </div>
        )}
        {activePanel === "style" && (
          <div className="p-4 text-center opacity-50">Card Style Settings</div>
        )}
        {activePanel === "settings" && (
          <SettingsPanel settings={settings} onSettingsChange={setSettings} />
        )}
      </SlidePanel>

      <div className="flex-1 ml-14 transition-all duration-300 ease-in-out">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-base-content mb-1">
              Course Scheduler
            </h1>
            <p className="text-base-content/70 label text-">
              Manage your weekly schedule efficiently
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-base-300 mb-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("timetable")}
                className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 text-sm font-medium ${
                  activeTab === "timetable"
                    ? "border-primary text-base-content"
                    : "border-transparent text-base-content/60 hover:text-base-content hover:border-base-300"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Timetable
              </button>

              <button
                onClick={() => setActiveTab("list")}
                className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 text-sm font-medium ${
                  activeTab === "list"
                    ? "border-primary text-base-content"
                    : "border-transparent text-base-content/60 hover:text-base-content hover:border-base-300"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                Course List
                {courses.length > 0 && (
                  <span className="ml-1 bg-base-300 text-base-content/80 text-xs py-0.5 px-1.5 rounded-full">
                    {courses.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {activeTab === "timetable" ? (
              <WeeklyTimetable courses={courses} settings={settings} />
            ) : (
              <div className="space-y-6">
                <CourseList
                  courses={courses}
                  onRemoveCourse={handleRemoveCourse}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center text-sm text-base-content/50 border-t border-base-300 pt-8">
            <p>Built with React, TypeScript, and Tailwind CSS</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
