import type { Course } from "../../types/course";
import { DAYS_OF_WEEK } from "../../types/course";
import { formatTime } from "../../lib/utils";
import { EmptyState } from "../ui/EmptyState";

interface CourseListProps {
  courses: Course[];
  onRemoveCourse: (courseId: string) => void;
  onEditCourse: (course: Course) => void;
}

export function CourseList({
  courses,
  onRemoveCourse,
  onEditCourse,
}: CourseListProps) {
  if (!courses.length)
    return (
      <EmptyState title="Your week starts here">
        Add a course or import a CSV file to build your schedule.
      </EmptyState>
    );
  return (
    <div className="course-list">
      {DAYS_OF_WEEK.map((day) => {
        const dayCourses = courses
          .filter((course) => course.daysOfWeek.includes(day))
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        if (!dayCourses.length) return null;
        return (
          <section key={day} className="course-day" aria-label={day}>
            <div className="course-day-heading">
              <h2>{day}</h2>
              <span>
                {dayCourses.length}{" "}
                {dayCourses.length === 1 ? "class" : "classes"}
              </span>
            </div>
            <div className="course-day-list">
              {dayCourses.map((course) => (
                <article className="course-row" key={course.id}>
                  <div className="course-row-time">
                    <span>{formatTime(course.startTime)}</span>
                    <span>{formatTime(course.endTime)}</span>
                  </div>
                  <div className="course-row-content">
                    <div className="course-row-title">
                      <h3>{course.name}</h3>
                      {course.section && (
                        <span className="section-badge">{course.section}</span>
                      )}
                    </div>
                    {course.description && (
                      <p className="course-description">
                        {course.description.replace(/;|\n/g, "\n")}
                      </p>
                    )}
                    <div className="course-days" aria-label="Meets on">
                      {course.daysOfWeek.map((courseDay) => (
                        <span
                          key={courseDay}
                          className={
                            courseDay === day ? "is-current-day" : undefined
                          }
                        >
                          {courseDay.slice(0, 2)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="course-row-actions">
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => onEditCourse(course)}
                      aria-label={`Edit ${course.name}`}
                      title="Edit course"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M13 21h8M16 3a2.1 2.1 0 0 1 3 3L7 18l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="icon-button icon-button-danger"
                      onClick={() => onRemoveCourse(course.id)}
                      aria-label={`Remove ${course.name}`}
                      title="Remove course"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 6h18M9 6V3h6v3M5 6l1 14h12l1-14M10 10v6m4-6v6" />
                      </svg>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
