import { useEffect, useState } from "react";
import type { Course } from "./types/course";
import { CSVUploader } from "./components/course-management";
import { CourseForm } from "./components/course-management";
import { CourseList } from "./components/course-management";
import { WeeklyTimetable } from "./components/timetable";
import { TopNav, type TabType } from "./components/layout/TopNav";
import { ContextualSidebar } from "./components/layout/ContextualSidebar";
import { ExportControlPanel, ExportPreviewArea } from "./components/export";
import { ConfirmDialog } from "./components/ui/ConfirmDialog";
import {
  StyleSidebar,
  StylePreviewGrid,
  CategoryBar,
  type StyleCategory,
} from "./components/style";
import {
  SettingsPanel,
  type TimetableSettings,
} from "./components/timetable/SettingsPanel";

function App() {
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const raw = localStorage.getItem("courseScheduler.courses");
      return raw ? (JSON.parse(raw) as Course[]) : [];
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const raw = localStorage.getItem("courseScheduler.activeTab");
      return (raw as TabType) || "courses";
    } catch {
      return "courses";
    }
  });
  const [activeStyleCategory, setActiveStyleCategory] = useState<StyleCategory>(
    () => {
      try {
        const raw = localStorage.getItem("courseScheduler.styleCategory");
        return (raw as StyleCategory) || "typography";
      } catch {
        return "typography";
      }
    },
  );
  const [settings, setSettings] = useState<TimetableSettings>(() => {
    try {
      const raw = localStorage.getItem("courseScheduler.settings");
      return raw
        ? (JSON.parse(raw) as TimetableSettings)
        : {
            showWeekends: false,
            startWithSunday: false,
            dynamicTimeRange: true,
            startHour: 7,
            endHour: 17,
            slotDuration: 60,
            verticalScale: 100,
            width: 100,
          };
    } catch {
      return {
        showWeekends: false,
        startWithSunday: false,
        dynamicTimeRange: true,
        startHour: 7,
        endHour: 17,
        slotDuration: 60,
        verticalScale: 100,
        width: 100,
      };
    }
  });
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("courseScheduler.courses", JSON.stringify(courses));
    } catch {
      // Ignore storage failures (private mode, quota)
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem("courseScheduler.activeTab", activeTab);
    } catch {
      // Ignore storage failures
    }
  }, [activeTab]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "courseScheduler.styleCategory",
        activeStyleCategory,
      );
    } catch {
      // Ignore storage failures
    }
  }, [activeStyleCategory]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "courseScheduler.settings",
        JSON.stringify(settings),
      );
    } catch {
      // Ignore storage failures
    }
  }, [settings]);

  const handleCoursesFromCSV = (newCourses: Course[]) => {
    setCourses((prevCourses) => [...prevCourses, ...newCourses]);
  };

  const handleCourseAdded = (newCourse: Course) => {
    setCourses((prevCourses) => [...prevCourses, newCourse]);
  };

  const handleRemoveCourse = (courseId: string) => {
    setCourses((prevCourses) =>
      prevCourses.filter((course) => course.id !== courseId),
    );
  };

  const handleClearAll = () => {
    setIsClearConfirmOpen(true);
  };

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <div className="h-screen bg-base-200 flex flex-col overflow-hidden">
      {/* Fixed height header - must not expand */}
      <header className="h-16 flex-none">
        <TopNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogoClick={handleLogoClick}
        />
      </header>

      {/* Main layout area - fills remaining space */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Category Bar*/}
        {activeTab === "style" && (
          <CategoryBar
            activeCategory={activeStyleCategory}
            onCategoryChange={setActiveStyleCategory}
          />
        )}

        {/* Contextual Sidebar */}
        <ContextualSidebar activeTab={activeTab}>
          {activeTab === "preview" && (
            <SettingsPanel settings={settings} onSettingsChange={setSettings} />
          )}
          {activeTab === "courses" && (
            <div className="flex flex-col gap-4">
              <CourseForm onCourseAdded={handleCourseAdded} />
              <CSVUploader onCoursesLoaded={handleCoursesFromCSV} />

              <button
                onClick={handleClearAll}
                className="btn btn-error font-semibold btn-outline w-full shadow-none rounded-md"
                disabled={courses.length === 0}
              >
                Delete All Courses
              </button>
            </div>
          )}
          {activeTab === "export" && <ExportControlPanel />}
          {activeTab === "style" && (
            <StyleSidebar activeCategory={activeStyleCategory} />
          )}
        </ContextualSidebar>

        {/* Main Content Area */}
        <main className="flex-1 min-h-0 overflow-hidden no-scrollbar p-8">
          {activeTab === "preview" && (
            <div className="flex flex-col h-full min-h-0">
              <div className="flex-col mb-6">
                <h1 className="text-2xl font-bold text-base-content mb-1">
                  Timetable Preview
                </h1>
                <p className="text-base-content/70">
                  View and customize your schedule layout
                </p>
              </div>
              <div className="flex-1 flex overflow-auto no-scrollbar min-w-full">
                <WeeklyTimetable courses={courses} settings={settings} />
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div className="flex flex-col h-full min-h-0">
              <div className="flex justify-between items-baseline mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-base-content mb-1">
                    Course List
                  </h1>
                  <p className="text-base-content/70">
                    Manage your enrolled courses
                  </p>
                </div>
                <span className="text-sm text-white/90 bg-primary px-2 py-1 rounded-md">
                  {courses.length} course{courses.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex-1 flex overflow-auto no-scrollbar min-w-full">
                <CourseList
                  courses={courses}
                  onRemoveCourse={handleRemoveCourse}
                />
              </div>
            </div>
          )}

          {activeTab === "export" && (
            <div className="flex flex-col h-full min-h-0">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-base-content mb-1">
                  Export Schedule
                </h1>
                <p className="text-base-content/70">
                  Preview and download your timetable
                </p>
              </div>
              <div className="flex-1 flex overflow-auto no-scrollbar min-w-full">
                <ExportPreviewArea courses={courses} settings={settings} />
              </div>
            </div>
          )}

          {activeTab === "style" && (
            <div className="flex flex-col h-full min-h-0">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-base-content mb-1">
                  Style System
                </h1>
                <p className="text-base-content/70">
                  Adjust global styles and preview multiple card variants
                </p>
              </div>
              <div className="flex-1 flex overflow-auto no-scrollbar min-w-full">
                <StylePreviewGrid />
              </div>
            </div>
          )}
        </main>
        <ConfirmDialog
          isOpen={isClearConfirmOpen}
          title="Remove all courses"
          description="This will permanently delete all courses from the list."
          confirmLabel="Delete All"
          cancelLabel="Cancel"
          onCancel={() => setIsClearConfirmOpen(false)}
          onConfirm={() => {
            setCourses([]);
            setIsClearConfirmOpen(false);
          }}
        />
      </div>
    </div>
  );
}

export default App;
