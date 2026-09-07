import type { Course } from "../types/course";
import type { TimetableSettings } from "../components/timetable/SettingsPanel";
import { getVisibleDays } from "./timetable";

export const toMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

export function getCanvasGeometry(
  availableWidth: number,
  settings: TimetableSettings,
  rootFontSize = 16,
) {
  const width = Math.max(480, (availableWidth * settings.width) / 100);
  const days = getVisibleDays(settings.showWeekends, settings.startWithSunday);
  return {
    width,
    dayWidth: (width - 76) / days.length,
    hourHeight: (4 * rootFontSize * settings.verticalScale) / 120,
    days,
  };
}

export function getCardGeometry(
  course: Course,
  dayWidth: number,
  hourHeight: number,
  gap: number,
  startHour = 0,
) {
  const duration = toMinutes(course.endTime) - toMinutes(course.startTime);
  return {
    width: Math.max(1, dayWidth - gap * 2),
    height: Math.max(1, (duration / 60) * hourHeight - gap),
    top: ((toMinutes(course.startTime) - startHour * 60) / 60) * hourHeight,
    left: gap,
  };
}
