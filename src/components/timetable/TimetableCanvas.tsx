import { EmptyState } from "../ui/EmptyState";
import type { Course } from "../../types/course";
import type { StyleSettings } from "../../types/style";
import type { TimetableSettings } from "./SettingsPanel";
import {
  calculateTimeRange,
  createTimetableCourses,
} from "../../lib/timetable";
import { getCanvasGeometry, getCardGeometry } from "../../lib/geometry";
import { CourseCard } from "./CourseCard";

export interface TimetableCanvasProps {
  courses: Course[];
  settings: TimetableSettings;
  styleSettings: StyleSettings;
  availableWidth: number;
  rootFontSize?: number;
  exportMode?: boolean;
}

export function TimetableCanvas({
  courses,
  settings,
  styleSettings,
  availableWidth,
  rootFontSize = 16,
  exportMode = false,
}: TimetableCanvasProps) {
  const { startHour, endHour } = settings.dynamicTimeRange
    ? calculateTimeRange(courses)
    : settings;
  const { width, dayWidth, hourHeight, days } = getCanvasGeometry(
    availableWidth,
    settings,
    rootFontSize,
  );
  const hours = Math.max(1, endHour - startHour + 1);
  // Detect on each occurrence's day so a Monday overlap does not mark Wednesday.
  const byDay = Object.fromEntries(
    days.map((day) => [
      day,
      createTimetableCourses(
        courses
          .filter((course) => course.daysOfWeek.includes(day))
          .map((course) => ({ ...course, daysOfWeek: [day] })),
        startHour,
        settings.slotDuration,
      ),
    ]),
  );
  if (!courses.length)
    return (
      <EmptyState title="No courses yet">
        Add courses in the Courses tab to preview and export your week.
      </EmptyState>
    );
  return (
    <div
      id={exportMode ? "export-area" : undefined}
      className={`timetable-canvas${exportMode ? " timetable-export" : ""}`}
      aria-label="Weekly timetable"
      style={{
        width,
        gridTemplateColumns: `60px repeat(${days.length}, ${dayWidth}px)`,
        gridTemplateRows: `40px ${hours * hourHeight}px 16px`,
      }}
    >
      <div />
      {days.map((day) => (
        <div className="timetable-day" key={day}>
          {dayWidth < 95 ? day.slice(0, 3) : day}
        </div>
      ))}
      <div className="relative" style={{ gridColumn: 1, gridRow: 2 }}>
        {Array.from({ length: hours + 1 }, (_, i) => (
          <span
            key={i}
            className="timetable-hour"
            style={{ top: i * hourHeight }}
          >
            {startHour + i}:00
          </span>
        ))}
      </div>
      {days.map((day, index) => (
        <div
          key={day}
          className="relative overflow-hidden"
          style={{ gridColumn: index + 2, gridRow: 2 }}
        >
          {Array.from({ length: hours }, (_, i) => (
            <div
              key={i}
              className="timetable-line"
              style={{ top: i * hourHeight, height: hourHeight }}
            >
              {settings.slotDuration === 30 && (
                <div className="timetable-half" />
              )}
            </div>
          ))}
          {byDay[day]?.map((course) => {
            const rect = getCardGeometry(
              course,
              dayWidth,
              hourHeight,
              styleSettings.layout.cardGap,
              startHour,
            );
            return (
              <div
                key={course.id}
                style={{
                  position: "absolute",
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height,
                }}
              >
                <CourseCard
                  course={course}
                  styleSettings={styleSettings}
                  conflictLevel={course.conflictLevel}
                  geometry={{ width: "100%", height: "100%" }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
