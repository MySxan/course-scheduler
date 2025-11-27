import { useState } from "react";
import type { Course } from "./types/course";
import { CSVUploader } from "./components/course-management";
import { CourseForm } from "./components/course-management";
import { CourseList } from "./components/course-management";
import { WeeklyTimetable } from "./components/timetable";
import { TopNav, type TabType } from "./components/layout/TopNav";
import { ContextualSidebar } from "./components/layout/ContextualSidebar";
import { ExportControlPanel, ExportPreviewArea } from "./components/export";
import {
  SettingsPanel,
  type TimetableSettings,
} from "./components/timetable/SettingsPanel";

function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("preview");
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
    <div className="min-h-screen bg-base-200 flex flex-col">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-1 items-start">
        {/* Contextual Sidebar */}
        <ContextualSidebar activeTab={activeTab}>
          {activeTab === "preview" && (
            <SettingsPanel settings={settings} onSettingsChange={setSettings} />
          )}
          {activeTab === "courses" && (
            <div className="flex flex-col gap-4">
              <CourseForm onCourseAdded={handleCourseAdded} />
              <CSVUploader onCoursesLoaded={handleCoursesFromCSV} />
              <div className="divider"></div>
              <button
                onClick={handleClearAll}
                className="btn btn-error btn-outline w-full"
                disabled={courses.length === 0}
              >
                Delete All Courses
              </button>
            </div>
          )}
          {activeTab === "export" && <ExportControlPanel />}
        </ContextualSidebar>

        {/* Main Content Area */}
        <main className="flex flex-1 p-8 min-h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar">
          <div className="container mx-auto flex flex-col flex-1">
            {activeTab === "preview" && (
              <div className="flex flex-col flex-1">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-base-content">
                    Timetable Preview
                  </h1>
                  <p className="text-base-content/70">
                    View and customize your schedule layout
                  </p>
                </div>
                <div className="flex-1 flex min-w-full">
                  <WeeklyTimetable courses={courses} settings={settings} />
                </div>
              </div>
            )}

            {activeTab === "courses" && (
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-center">
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-base-content">
                      Course List
                    </h1>
                    <p className="text-base-content/70">
                      Manage your enrolled courses
                    </p>
                  </div>
                  <span className="badge badge-neutral p-4">
                    {courses.length} course{courses.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex-1">
                  <CourseList
                    courses={courses}
                    onRemoveCourse={handleRemoveCourse}
                  />
                </div>
              </div>
            )}

            {activeTab === "export" && (
              <div className="flex flex-col flex-1">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-base-content">
                    Export Schedule
                  </h1>
                  <p className="text-base-content/70">
                    Preview and download your timetable
                  </p>
                </div>
                <div className="flex-1 flex min-w-full ">
                  <ExportPreviewArea courses={courses} settings={settings} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
