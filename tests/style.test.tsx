import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DEFAULT_STYLE,
  migrateStyle,
  normalizeStyle,
  parseStyleFile,
  STYLE_PRESETS,
  getCourseAccent,
  getCardColors,
  contrastRatio,
  styleHistoryReducer,
  type StyleHistory,
} from "../src/lib/style";
import { getCanvasGeometry, getCardGeometry } from "../src/lib/geometry";
import { detectConflicts } from "../src/lib/timetable";
import { CourseCard } from "../src/components/timetable/CourseCard";
import { WeeklyTimetable } from "../src/components/timetable/WeeklyTimetable";
import { TimetablePreview } from "../src/components/export/TimetablePreview";
import { TimetableCanvas } from "../src/components/timetable/TimetableCanvas";
import type { Course } from "../src/types/course";

const course: Course = {
  id: "design-1",
  name: "Design studio",
  section: "A1",
  description: "Room 210;Bring sketchbook",
  daysOfWeek: ["Monday", "Wednesday"],
  startTime: "09:10",
  endTime: "10:00",
  color: "#7c3aed",
};
const settings = {
  showWeekends: false,
  startWithSunday: false,
  dynamicTimeRange: true,
  startHour: 7,
  endHour: 17,
  slotDuration: 60,
  verticalScale: 100,
  width: 100,
};

test("normalization recovers malformed settings and completes unique field order", () => {
  const style = normalizeStyle({
    typography: { titleSize: 999, timeSize: NaN, font: "remote-font" },
    layout: { padding: -12 },
    content: { order: ["time", "time", "garbage"] },
    colors: { accent: "url(unsafe)" },
  });
  assert.equal(style.typography.titleSize, 36);
  assert.equal(style.typography.timeSize, 12);
  assert.equal(style.typography.font, DEFAULT_STYLE.typography.font);
  assert.equal(style.layout.padding, 0);
  assert.equal(style.colors.accent, "#0d9488");
  assert.deepEqual(style.content.order, [
    "time",
    "name",
    "section",
    "description",
  ]);
  assert.deepEqual(normalizeStyle(null), DEFAULT_STYLE);
  assert.deepEqual(normalizeStyle({ version: 500 }), DEFAULT_STYLE);
});

test("legacy palette migration preserves course colors and new settings win", () => {
  const saved = normalizeStyle({
    typography: { font: "system" },
    layout: { shadow: "small" },
  });
  assert.equal(saved.typography.font, "system");
  assert.equal(saved.layout.shadow, "small");
  assert.equal(migrateStyle(null, "tealFamily").colors.source, "course");
  assert.equal(migrateStyle(null, "primary").colors.source, "uniform");
  assert.equal(
    migrateStyle(DEFAULT_STYLE, "tealFamily").colors.source,
    "uniform",
  );
});

test("style files round-trip and reject unsupported versions or unrelated files", () => {
  const custom = normalizeStyle({
    ...DEFAULT_STYLE,
    layout: { ...DEFAULT_STYLE.layout, padding: 17 },
  });
  assert.deepEqual(parseStyleFile(JSON.stringify(custom)), custom);
  assert.throws(() => parseStyleFile("bad json"));
  assert.throws(() => parseStyleFile('{"version":2}'));
  assert.throws(() => parseStyleFile('{"courses":[]}'));
});

test("palette assignment is deterministic and never mutates a course", () => {
  const original = structuredClone(course);
  const style = normalizeStyle({
    ...DEFAULT_STYLE,
    colors: { ...DEFAULT_STYLE.colors, source: "spectrum" },
  });
  assert.equal(
    getCourseAccent(course, style),
    getCourseAccent({ ...course }, style),
  );
  getCourseAccent({ ...course, id: "other" }, style);
  assert.deepEqual(course, original);
  assert.equal(
    getCourseAccent(course, migrateStyle(null, "tealFamily")),
    "#7c3aed",
  );
});

test("automatic text contrast remains readable on light and dark surfaces", () => {
  for (const accent of [
    "#000000",
    "#ffffff",
    "#0d9488",
    "#e82e86",
    "#cccccc",
  ]) {
    for (const surface of ["solid", "soft", "outline"]) {
      const style = normalizeStyle({
        ...DEFAULT_STYLE,
        colors: { ...DEFAULT_STYLE.colors, accent, surface },
      });
      const colors = getCardColors(course, style);
      assert.ok(contrastRatio(colors.background, colors.text) >= 4.5);
    }
  }
});

test("continuous adjustments form one undo step; new edits discard redo", () => {
  let state: StyleHistory = { past: [], present: DEFAULT_STYLE, future: [] };
  for (const padding of [5, 10, 15])
    state = styleHistoryReducer(state, {
      type: "change",
      value: normalizeStyle({
        ...state.present,
        layout: { ...state.present.layout, padding },
      }),
      group: "padding",
    });
  assert.equal(state.past.length, 1);
  state = styleHistoryReducer(state, { type: "undo" });
  assert.deepEqual(state.present, DEFAULT_STYLE);
  state = styleHistoryReducer(state, { type: "redo" });
  assert.equal(state.present.layout.padding, 15);
  state = styleHistoryReducer(state, { type: "undo" });
  state = styleHistoryReducer(state, {
    type: "change",
    value: STYLE_PRESETS[1].settings,
  });
  assert.equal(state.future.length, 0);
});

test("card dimensions follow days, exact minutes, root font size and scale", () => {
  const canvas = getCanvasGeometry(1076, settings);
  assert.equal(canvas.dayWidth, 200);
  const card = getCardGeometry(
    course,
    canvas.dayWidth,
    canvas.hourHeight,
    3,
    9,
  );
  assert.equal(card.width, 194);
  assert.ok(
    Math.abs(card.height - (((50 / 60) * 64 * 100) / 120 - 3)) < 0.0001,
  );
  assert.ok(Math.abs(card.top - (10 / 60) * canvas.hourHeight) < 0.0001);
  const seven = getCanvasGeometry(
    1076,
    {
      ...settings,
      showWeekends: true,
      startWithSunday: true,
      verticalScale: 200,
    },
    20,
  );
  assert.equal(seven.days[0], "Sunday");
  assert.equal(seven.days.length, 7);
  assert.equal(seven.dayWidth, 1000 / 7);
  assert.equal(seven.hourHeight, (4 * 20 * 200) / 120);
  assert.equal(getCanvasGeometry(320, { ...settings, width: 20 }).width, 480);
});

test("conflicts use exact minutes independently of half/hour grid; touching endpoints do not overlap", () => {
  const a = {
    ...course,
    startTime: "09:00",
    endTime: "09:20",
    daysOfWeek: ["Monday"],
  } as Course;
  const b = { ...a, id: "b", startTime: "09:20", endTime: "09:40" };
  for (const slots of [30, 60]) {
    assert.equal(
      detectConflicts([a, b], 7, slots).some((c) => c.hasConflict),
      false,
    );
    assert.equal(
      detectConflicts([a, { ...b, startTime: "09:19" }], 7, slots).every(
        (c) => c.hasConflict,
      ),
      true,
    );
  }
  assert.equal(
    detectConflicts([
      a,
      { ...b, startTime: "09:10", daysOfWeek: ["Tuesday"] },
    ]).some((c) => c.hasConflict),
    false,
  );
});

test("card renderer honors hidden fields, order, typography and conflict semantics", () => {
  const style = normalizeStyle({
    ...DEFAULT_STYLE,
    typography: { ...DEFAULT_STYLE.typography, titleSize: 25 },
    content: {
      ...DEFAULT_STYLE.content,
      section: false,
      timeFormat: "24h",
      order: ["time", "description", "name", "section"],
    },
  });
  const html = renderToStaticMarkup(
    <CourseCard
      course={course}
      styleSettings={style}
      geometry={{ width: 190, height: 80 }}
      conflictLevel={1}
    />,
  );
  assert.ok(!html.includes('data-field="section"'));
  assert.ok(
    html.indexOf('data-field="time"') < html.indexOf('data-field="name"'),
  );
  assert.ok(html.includes("font-size:25px"));
  assert.ok(html.includes("09:10 – 10:00"));
  assert.ok(html.includes('aria-label="Schedule conflict"'));
});

test("weekly, style and export canvases use identical course rendering for every preset", () => {
  for (const { settings: styleSettings } of STYLE_PRESETS) {
    const props = {
      courses: [course],
      settings,
      styleSettings,
      availableWidth: 1076,
    };
    const weekly = renderToStaticMarkup(<WeeklyTimetable {...props} />);
    const styleWeek = renderToStaticMarkup(<TimetableCanvas {...props} />);
    const exported = renderToStaticMarkup(<TimetablePreview {...props} />)
      .replace(' id="export-area"', "")
      .replace("timetable-canvas timetable-export", "timetable-canvas");
    assert.equal(weekly, styleWeek);
    assert.equal(weekly, exported);
  }
});

test("conflict marker only appears on the affected day occurrence", () => {
  const other = {
    ...course,
    id: "other",
    daysOfWeek: ["Monday"],
    startTime: "09:30",
    endTime: "10:20",
  } as Course;
  const html = renderToStaticMarkup(
    <TimetableCanvas
      courses={[course, other]}
      settings={settings}
      styleSettings={DEFAULT_STYLE}
      availableWidth={1000}
    />,
  );
  assert.equal((html.match(/class="schedule-conflict"/g) ?? []).length, 2);
});
