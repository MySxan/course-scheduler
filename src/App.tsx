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
  StylePreviewGrid,
  CategoryBar,
  type StyleCategory,
} from "./components/style";
import {
  SettingsPanel,
  type TimetableSettings,
} from "./components/timetable/SettingsPanel";
import { DEFAULT_COURSE_COLOR, validateTimeRange } from "./lib/utils";

type CardBackgroundPreset = "primary" | "tealFamily";

const TEAL_FAMILY_COLORS = [
  "#30A685",
  "#0D9488",
  "#14BBB0",
  "#4A6A92",
  "#00B89F",
  "#4788C5",
  "#26669E",
  "#358BB6",
  "#4391A4",
];

const shuffleColors = (colors: string[]) => {
  const next = [...colors];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const applyTealPalette = (courses: Course[]) => {
  const palette = shuffleColors(TEAL_FAMILY_COLORS);
  let index = 0;
  return courses.map((course) => {
    const color = palette[index % palette.length];
    index += 1;
    return { ...course, color };
  });
};

const getNextTealColor = (courses: Course[]) => {
  const counts = new Map<string, number>(
    TEAL_FAMILY_COLORS.map((color) => [color, 0]),
  );
  courses.forEach((course) => {
    if (counts.has(course.color)) {
      counts.set(course.color, (counts.get(course.color) || 0) + 1);
    }
  });
  const minCount = Math.min(...counts.values());
  const candidates = TEAL_FAMILY_COLORS.filter(
    (color) => counts.get(color) === minCount,
  );
  return candidates[Math.floor(Math.random() * candidates.length)];
};

function App() {
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
  const [cardBackgroundPreset, setCardBackgroundPreset] =
    useState<CardBackgroundPreset>(() => {
      try {
        const raw = localStorage.getItem(
          "courseScheduler.cardBackgroundPreset",
        );
        return (raw as CardBackgroundPreset) || "primary";
      } catch {
        return "primary";
      }
    });
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
        "courseScheduler.cardBackgroundPreset",
        cardBackgroundPreset,
      );
    } catch {
      // Ignore storage failures
    }
  }, [cardBackgroundPreset]);

  useEffect(() => {
    if (cardBackgroundPreset !== "tealFamily") return;
    setCourses((prevCourses) => applyTealPalette(prevCourses));
  }, [cardBackgroundPreset]);

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
    setCourses((prevCourses) => {
      if (cardBackgroundPreset !== "tealFamily") {
        return [
          ...prevCourses,
          ...newCourses.map((course) => ({
            ...course,
            color: course.color ?? DEFAULT_COURSE_COLOR,
          })),
        ];
      }

      const nextCourses: Course[] = [...prevCourses];
      const additions = newCourses.map((course) => {
        const color = getNextTealColor(nextCourses);
        const next = { ...course, color };
        nextCourses.push(next);
        return next;
      });
      return [...prevCourses, ...additions];
    });
  };

  const handleCourseAdded = (newCourse: Course) => {
    setCourses((prevCourses) => {
      const color =
        cardBackgroundPreset === "tealFamily"
          ? getNextTealColor(prevCourses)
          : newCourse.color ?? DEFAULT_COURSE_COLOR;
      return [...prevCourses, { ...newCourse, color }];
    });
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
          <div className="relative h-full">
            <div className="h-full overflow-y-auto p-4 no-scrollbar">
              {activeTab === "preview" && (
                <SettingsPanel
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              )}
              {activeTab === "courses" && (
                <div className="flex flex-col gap-5">
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
                <StyleSidebar
                  activeCategory={activeStyleCategory}
                  cardBackgroundPreset={cardBackgroundPreset}
                  onCardBackgroundPresetChange={setCardBackgroundPreset}
                />
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
                <WeeklyTimetable
                  courses={courses}
                  settings={settings}
                  cardBackgroundPreset={cardBackgroundPreset}
                />
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
                  onEditCourse={handleEditCourse}
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
                <ExportPreviewArea
                  courses={courses}
                  settings={settings}
                  cardBackgroundPreset={cardBackgroundPreset}
                />
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
