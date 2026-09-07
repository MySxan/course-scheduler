import type { CSSProperties, Ref } from "react";
import type { Course } from "../../types/course";
import type { StyleSettings, ContentField } from "../../types/style";
import { FONT_STACKS, getCardColors } from "../../lib/style";
import { formatTime } from "../../lib/utils";

interface CourseCardProps {
  course: Course;
  styleSettings: StyleSettings;
  geometry: CSSProperties;
  conflictLevel?: number;
  contentRef?: Ref<HTMLDivElement>;
}

export function CourseCard({
  course,
  styleSettings,
  geometry,
  conflictLevel = 0,
  contentRef,
}: CourseCardProps) {
  const { typography: t, layout: l, content: c } = styleSettings;
  const colors = getCardColors(course, styleSettings);
  const time = (value: string) =>
    c.timeFormat === "24h" ? value : formatTime(value);
  const contents: Record<ContentField, string | undefined> = {
    name: course.name,
    section: c.section ? course.section : undefined,
    time: c.time
      ? `${time(course.startTime)} – ${time(course.endTime)}`
      : undefined,
    description: c.description
      ? course.description?.replace(/;|\n/g, "\n")
      : undefined,
  };
  const sizes: Record<ContentField, number> = {
    name: t.titleSize,
    section: t.sectionSize,
    time: t.timeSize,
    description: t.descriptionSize,
  };
  const summary = `${course.name}${course.section ? ` (${course.section})` : ""}, ${time(course.startTime)} – ${time(course.endTime)}${course.description ? `, ${course.description}` : ""}${conflictLevel ? ", Schedule conflict" : ""}`;
  return (
    <article
      className="schedule-card"
      title={summary}
      aria-label={summary}
      data-course-id={course.id}
      style={{
        ...geometry,
        boxSizing: "border-box",
        overflow: "hidden",
        position: "relative",
        borderRadius: l.radius,
        borderWidth:
          styleSettings.colors.surface === "outline"
            ? Math.max(1, l.borderWidth)
            : l.borderWidth,
        borderStyle: "solid",
        borderColor: colors.accent,
        background: colors.background,
        color: colors.text,
        fontFamily: FONT_STACKS[t.font],
        textAlign: l.align,
        lineHeight: t.lineHeight,
        letterSpacing: t.letterSpacing,
        fontVariantNumeric: t.tabularNumbers ? "tabular-nums" : "normal",
        boxShadow:
          l.shadow === "medium"
            ? "0 3px 8px #102b2926"
            : l.shadow === "small"
              ? "0 1px 2px #102b2926"
              : "none",
      }}
    >
      <div
        ref={contentRef}
        className="schedule-card-content"
        style={{
          padding: l.padding,
          justifyContent:
            l.verticalAlign === "center"
              ? "safe center"
              : l.verticalAlign === "bottom"
                ? "safe flex-end"
                : "flex-start",
          gap: l.gap,
        }}
      >
        {c.order.map(
          (field) =>
            contents[field] && (
              <div
                key={field}
                data-field={field}
                style={{
                  fontSize: sizes[field],
                  fontWeight: field === "name" ? t.titleWeight : 400,
                  textTransform: field === "name" ? t.capitalization : "none",
                  whiteSpace: field === "description" ? "pre-line" : "normal",
                  overflowWrap: "anywhere",
                  flexShrink: 0,
                  ...(field === "name"
                    ? {
                        display: "-webkit-box",
                        WebkitLineClamp: c.titleLines,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }
                    : {}),
                }}
              >
                {contents[field]}
              </div>
            ),
        )}
      </div>
      {conflictLevel > 0 && (
        <span
          className="schedule-conflict"
          title="Schedule conflict"
          aria-label="Schedule conflict"
        >
          !
        </span>
      )}
    </article>
  );
}
