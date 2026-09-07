import { useEffect, useRef, useState } from "react";
import type { Course } from "../../types/course";
import {
  getCanvasGeometry,
  getCardGeometry,
  toMinutes,
} from "../../lib/geometry";
import { contrastRatio, getCardColors } from "../../lib/style";
import { CourseCard } from "../timetable/CourseCard";
import {
  TimetableCanvas,
  type TimetableCanvasProps,
} from "../timetable/TimetableCanvas";

const SAMPLES: Course[] = [
  {
    id: "sample-30",
    name: "IS 226",
    section: "Discussion",
    daysOfWeek: ["Monday", "Wednesday"],
    startTime: "09:00",
    endTime: "09:30",
    description: "Room 210",
    color: "#0d9488",
  },
  {
    id: "sample-50",
    name: "CS 225",
    section: "AL1",
    daysOfWeek: ["Tuesday", "Thursday"],
    startTime: "10:00",
    endTime: "10:50",
    description: "Siebel Center;Room 1404",
    color: "#2563eb",
  },
  {
    id: "sample-75",
    name: "Design studio",
    section: "B2",
    daysOfWeek: ["Monday", "Wednesday"],
    startTime: "11:00",
    endTime: "12:15",
    description: "Art + Design Building;Bring your sketchbook",
    color: "#7c3aed",
  },
  {
    id: "sample-120",
    name: "Music production",
    section: "Studio",
    daysOfWeek: ["Friday"],
    startTime: "09:00",
    endTime: "11:00",
    description: "Recording studio;Project workshop",
    color: "#c2410c",
  },
  {
    id: "sample-long",
    name: "Introduction to Human–Computer Interaction and User Experience Design",
    section: "Lecture A1",
    daysOfWeek: ["Thursday"],
    startTime: "13:00",
    endTime: "14:15",
    description:
      "Siebel Center for Design;Room 1002;Weekly critique and project discussion",
    color: "#0369a1",
  },
];

export function StylePreviewGrid(
  props: TimetableCanvasProps & { onLayoutClick: () => void },
) {
  const {
    courses,
    settings,
    styleSettings,
    availableWidth,
    rootFontSize,
    onLayoutClick,
  } = props;
  const [selectedKey, setSelectedKey] = useState(
    courses.length ? `course:${courses[0].id}` : "sample:sample-75",
  );
  const [simulateConflict, setSimulateConflict] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const options = [
    ...courses.map((course) => ({
      key: `course:${course.id}`,
      course,
      sample: false,
    })),
    ...SAMPLES.map((course) => ({
      key: `sample:${course.id}`,
      course,
      sample: true,
    })),
  ];
  const selected =
    options.find((item) => item.key === selectedKey) ?? options[0];
  const { course } = selected;
  const canvas = getCanvasGeometry(availableWidth, settings, rootFontSize);
  const rect = getCardGeometry(
    course,
    canvas.dayWidth,
    canvas.hourHeight,
    styleSettings.layout.cardGap,
  );
  const colors = getCardColors(course, styleSettings);
  const contrast = contrastRatio(colors.background, colors.text);
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    const update = () =>
      setOverflow(
        element.scrollHeight > element.clientHeight + 1 ||
          element.scrollWidth > element.clientWidth + 1 ||
          Array.from(element.children).some(
            (child) => child.scrollHeight > child.clientHeight + 1,
          ),
      );
    const observer = new ResizeObserver(update);
    observer.observe(element);
    Array.from(element.children).forEach((child) => observer.observe(child));
    update();
    return () => observer.disconnect();
  }, [course, styleSettings, rect.width, rect.height]);
  const isClippedByRange =
    !settings.dynamicTimeRange &&
    (toMinutes(course.startTime) < settings.startHour * 60 ||
      toMinutes(course.endTime) > (settings.endHour + 1) * 60);
  return (
    <div className="style-preview-stack">
      <section className="style-specimen">
        <div className="style-section-heading">
          <div>
            <h2>Course card</h2>
            <p>Actual size · 100%</p>
          </div>
          <span className="style-dimension">
            {rect.width.toFixed(1)} × {rect.height.toFixed(1)} px
          </span>
        </div>
        <div className="style-sample-controls">
          <label>
            Preview course
            <select
              value={selected.key}
              onChange={(event) => setSelectedKey(event.target.value)}
            >
              {options.map(({ key, course: item, sample }) => (
                <option key={key} value={key}>
                  {sample ? "Example · " : "My course · "}
                  {item.name} ·{" "}
                  {toMinutes(item.endTime) - toMinutes(item.startTime)} min
                </option>
              ))}
            </select>
          </label>
          <label className="style-conflict-toggle">
            <input
              type="checkbox"
              checked={simulateConflict}
              onChange={(event) => setSimulateConflict(event.target.checked)}
            />
            Show conflict marker
          </label>
        </div>
        <div className="style-specimen-stage">
          <div className="style-specimen-card">
            <CourseCard
              course={course}
              styleSettings={styleSettings}
              geometry={{ width: rect.width, height: rect.height }}
              conflictLevel={simulateConflict ? 1 : 0}
              contentRef={contentRef}
            />
          </div>
        </div>
        <div className="style-specimen-footer">
          <span>
            {toMinutes(course.endTime) - toMinutes(course.startTime)} min ·{" "}
            {canvas.days.length} day columns · {settings.verticalScale}% table
            scale
          </span>
          <button type="button" onClick={onLayoutClick}>
            Adjust timetable size
          </button>
        </div>
        {overflow && (
          <p className="style-notice" role="status">
            Some content is clipped at this size. Reduce type size or padding,
            hide a field, or increase Table Scale in Preview.
          </p>
        )}
        {isClippedByRange && (
          <p className="style-notice">
            This card extends outside your manual time range. The timetable
            shows only the portion inside that range.
          </p>
        )}
        {contrast < 4.5 && (
          <p className="style-notice" role="status">
            Text contrast is {contrast.toFixed(2)}:1. Try Automatic contrast or
            a lighter / darker text color for small text.
          </p>
        )}
      </section>
      <section className="style-week-preview">
        <div className="style-section-heading">
          <div>
            <h2>{courses.length ? "Your week" : "Example week"}</h2>
          </div>
          <span className="style-dimension">
            {canvas.width.toFixed(0)} px wide · 100%
          </span>
        </div>
        <div className="style-week-scroll">
          <TimetableCanvas
            {...props}
            courses={courses.length ? courses : SAMPLES}
          />
        </div>
      </section>
    </div>
  );
}
