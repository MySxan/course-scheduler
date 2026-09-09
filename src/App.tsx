import { useEffect, useState } from "react";
import type { Course, CourseFormData, DaysOfWeek } from "./types/course";
import { CSVUploader } from "./components/course-management";
import { CourseForm } from "./components/course-management";
import { CourseList } from "./components/course-management";
import { EditCoursePanel } from "./components/course-management/EditCoursePanel";
import { WeeklyTimetable } from "./components/timetable";
import { TopNav, type TabType } from "./components/layout/TopNav";
import { ContextualSidebar } from "./components/layout/ContextualSidebar";
import { ExportControlPanel, ExportPreviewArea } from "./components/export";
import { ConfirmDialog } from "./components/ui/ConfirmDialog";
import {
  StyleSidebar,
  StyleToolbar,
  StylePreviewGrid,
  CategoryBar,
  type StyleCategory,
} from "./components/style";
import {
  SettingsPanel,
  type TimetableSettings,
} from "./components/timetable/SettingsPanel";
import { DEFAULT_COURSE_COLOR, validateTimeRange } from "./lib/utils";

import { useStyleSettings } from "./hooks/useStyleSettings";
import { PageHeader } from "./components/ui/PageHeader";
import { useCanvasSize } from "./hooks/useCanvasSize";

function App() {
  const styleController = useStyleSettings();
  const { ref: mainRef, availableWidth, rootFontSize } = useCanvasSize();
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const raw = localStorage.getItem("courseScheduler.courses");
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Array<
        Course & { location?: string; color?: string }
      >;
      return parsed.map((course) => ({
        ...course,
        description: course.description ?? course.location,
        color: course.color ?? DEFAULT_COURSE_COLOR,
      }));
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const raw = localStorage.getItem("courseScheduler.activeTab");
      return ["courses", "preview", "style", "export"].includes(raw ?? "")
        ? (raw as TabType)
        : "courses";
    } catch {
      return "courses";
    }
  });
  const [activeStyleCategory, setActiveStyleCategory] = useState<StyleCategory>(
    () => {
      try {
        const raw = localStorage.getItem("courseScheduler.styleCategory");
        return [
          "typography",
          "cardLayout",
          "contentVisibility",
          "colorPresets",
        ].includes(raw ?? "")
          ? (raw as StyleCategory)
          : "typography";
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
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editPanelPhase, setEditPanelPhase] = useState<"enter" | "exit">(
    "enter",
  );
  const [pendingEditCourse, setPendingEditCourse] = useState<Course | null>(
    null,
  );
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editData, setEditData] = useState<CourseFormData>({
    name: "",
    section: "",
    daysOfWeek: [],
    startTime: "",
    endTime: "",
    description: "",
    color: DEFAULT_COURSE_COLOR,
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

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

  useEffect(() => {
    if (activeTab === "courses" || !isEditPanelOpen) return;
    setPendingEditCourse(null);
    setIsEditPanelOpen(false);
    setEditingCourseId(null);
    setEditErrors({});
    setEditPanelPhase("enter");
  }, [activeTab, isEditPanelOpen]);

  const handleCoursesFromCSV = (newCourses: Course[]) => {
    setCourses((previous) => [
      ...previous,
      ...newCourses.map((course) => ({
        ...course,
        color: course.color ?? DEFAULT_COURSE_COLOR,
      })),
    ]);
  };

  const handleCourseAdded = (newCourse: Course) => {
    setCourses((previous) => [
      ...previous,
      { ...newCourse, color: newCourse.color ?? DEFAULT_COURSE_COLOR },
    ]);
  };

  const handleRemoveCourse = (courseId: string) => {
    setCourses((prevCourses) =>
      prevCourses.filter((course) => course.id !== courseId),
    );
  };

  const loadEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setEditData({
      name: course.name,
      section: course.section || "",
      daysOfWeek: course.daysOfWeek,
      startTime: course.startTime,
      endTime: course.endTime,
      description: course.description || "",
      color: course.color ?? DEFAULT_COURSE_COLOR,
    });
    setEditErrors({});
    setEditPanelPhase("enter");
    setIsEditPanelOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    if (!isEditPanelOpen) {
      loadEditCourse(course);
      return;
    }
    if (editingCourseId === course.id) {
      return;
    }
    setPendingEditCourse(course);
    setEditPanelPhase("exit");
  };

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};
    if (!editData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!editData.daysOfWeek || editData.daysOfWeek.length === 0) {
      newErrors.daysOfWeek = "At least one day of the week is required";
    }
    if (!editData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!editData.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (
      editData.startTime &&
      editData.endTime &&
      !validateTimeRange(editData.startTime, editData.endTime)
    ) {
      newErrors.endTime = "End time must be after start time";
    }
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSave = () => {
    if (!editingCourseId || !validateEditForm()) {
      return;
    }
    setCourses((prev) =>
      prev.map((course) =>
        course.id === editingCourseId
          ? {
              ...course,
              name: editData.name.trim(),
              section: editData.section.trim() || undefined,
              daysOfWeek: editData.daysOfWeek as DaysOfWeek[],
              startTime: editData.startTime,
              endTime: editData.endTime,
              description: editData.description.trim() || undefined,
              color: editData.color || DEFAULT_COURSE_COLOR,
            }
          : course,
      ),
    );
    setEditPanelPhase("exit");
  };

  const handleEditCancel = () => {
    setPendingEditCourse(null);
    setEditPanelPhase("exit");
  };

  const handleEditPanelExited = () => {
    if (pendingEditCourse) {
      const nextCourse = pendingEditCourse;
      setPendingEditCourse(null);
      loadEditCourse(nextCourse);
      return;
    }
    setIsEditPanelOpen(false);
    setEditingCourseId(null);
    setEditErrors({});
  };

  const handleClearAll = () => {
    setIsClearConfirmOpen(true);
  };

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <div className="app-shell">
      {/* Fixed height header - must not expand */}
      <header className="app-header">
        <TopNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogoClick={handleLogoClick}
        />
      </header>

      {/* Main layout area - fills remaining space */}
      <div className="app-workspace">
        {/* Contextual Sidebar */}
        <ContextualSidebar activeTab={activeTab}>
          <div className="relative h-full">
            <div className="sidebar-scroll">
              {activeTab === "preview" && (
                <SettingsPanel
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              )}
              {activeTab === "courses" && (
                <div className="inspector-stack">
                  <CourseForm onCourseAdded={handleCourseAdded} />
                  <CSVUploader onCoursesLoaded={handleCoursesFromCSV} />

                  <button
                    onClick={handleClearAll}
                    className="btn btn-danger-quiet w-full"
                    disabled={courses.length === 0}
                  >
                    Delete all courses
                  </button>
                </div>
              )}
              {activeTab === "export" && (
                <ExportControlPanel
                  courses={courses}
                  disabled={!courses.length}
                />
              )}
              {activeTab === "style" && (
                <>
                  <CategoryBar
                    activeCategory={activeStyleCategory}
                    onCategoryChange={setActiveStyleCategory}
                  />
                  <StyleSidebar
                    activeCategory={activeStyleCategory}
                    styleSettings={styleController.style}
                    onChange={styleController.change}
                    onEnd={styleController.endGroup}
                  />
                </>
              )}
            </div>

            <EditCoursePanel
              isOpen={isEditPanelOpen}
              phase={editPanelPhase}
              editData={editData}
              editErrors={editErrors}
              onChange={setEditData}
              onErrorChange={setEditErrors}
              onCancel={handleEditCancel}
              onSave={handleEditSave}
              onExited={handleEditPanelExited}
            />
          </div>
        </ContextualSidebar>

        {/* Main Content Area */}
        <main ref={mainRef} className="app-main">
          {activeTab === "preview" && (
            <div className="workspace-page">
              <PageHeader title="Timetable" />
              <div className="content-scroll">
                <WeeklyTimetable
                  courses={courses}
                  settings={settings}
                  styleSettings={styleController.style}
                  availableWidth={availableWidth}
                  rootFontSize={rootFontSize}
                />
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div className="workspace-page">
              <PageHeader
                title="Your courses"
                accessory={
                  <span className="count-badge">
                    {courses.length} course{courses.length !== 1 ? "s" : ""}
                  </span>
                }
              />
              <div className="content-scroll">
                <CourseList
                  courses={courses}
                  onRemoveCourse={handleRemoveCourse}
                  onEditCourse={handleEditCourse}
                />
              </div>
            </div>
          )}

          {activeTab === "export" && (
            <div className="workspace-page">
              <PageHeader title="Export" />
              <div className="content-scroll">
                <ExportPreviewArea
                  courses={courses}
                  settings={settings}
                  styleSettings={styleController.style}
                  availableWidth={availableWidth}
                  rootFontSize={rootFontSize}
                />
              </div>
            </div>
          )}

          {activeTab === "style" && (
            <div className="workspace-page">
              <PageHeader title="Style" />
              <div className="content-scroll">
                <div className="style-studio-content">
                  <StyleToolbar controller={styleController} />
                  <StylePreviewGrid
                    courses={courses}
                    settings={settings}
                    styleSettings={styleController.style}
                    availableWidth={availableWidth}
                    rootFontSize={rootFontSize}
                    onLayoutClick={() => setActiveTab("preview")}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
        <ConfirmDialog
          isOpen={isClearConfirmOpen}
          tone="danger"
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
