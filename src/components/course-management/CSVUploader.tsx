import React, { useRef, useState } from "react";
import Papa from "papaparse";
import type { Course, CSVRow, DaysOfWeek } from "../../types/course";
import { DEFAULT_COURSE_COLOR, generateId } from "../../lib/utils";
import { ConfirmDialog } from "../ui/ConfirmDialog";

interface CSVUploaderProps {
  onCoursesLoaded: (courses: Course[]) => void;
}

interface PreviewRow extends Course {
  rowNumber: number;
  error?: string;
  rawDay: string;
  rawStartTime: string;
  rawEndTime: string;
  rawSection: string;
  rawDescription: string;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({
  onCoursesLoaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewCourses, setPreviewCourses] = useState<PreviewRow[] | null>(
    null,
  );
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmMode, setConfirmMode] = useState<"replace" | "close">(
    "replace",
  );
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editLine, setEditLine] = useState("");
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
    visible: boolean;
  }>({ text: "", x: 0, y: 0, visible: false });

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSelectedFileName(null);
  };

  const normalizeTime = (time: string): string => {
    const trimmed = time.trim().replace("\uFF1A", ":");
    if (/^\d{3,4}$/.test(trimmed)) {
      const padded = trimmed.padStart(4, "0");
      return `${padded.slice(0, 2)}:${padded.slice(2)}`;
    }
    return trimmed;
  };

  const validateTime = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const normalizeDay = (day: string): DaysOfWeek | null => {
    const normalizedDay = day.trim().toLowerCase();
    const dayMap: Record<string, DaysOfWeek> = {
      monday: "Monday",
      mon: "Monday",
      mo: "Monday",
      m: "Monday",
      tuesday: "Tuesday",
      tue: "Tuesday",
      tu: "Tuesday",
      wednesday: "Wednesday",
      wed: "Wednesday",
      we: "Wednesday",
      w: "Wednesday",
      thursday: "Thursday",
      thu: "Thursday",
      th: "Thursday",
      thurs: "Thursday",
      friday: "Friday",
      fri: "Friday",
      fr: "Friday",
      f: "Friday",
      saturday: "Saturday",
      sat: "Saturday",
      sa: "Saturday",
      sunday: "Sunday",
      sun: "Sunday",
      su: "Sunday",
    };
    return dayMap[normalizedDay] || null;
  };

  const parseRawRow = (params: {
    id?: string;
    rowNumber: number;
    rawName: string;
    rawDay: string;
    rawStart: string;
    rawEnd: string;
    rawSection: string;
    rawDescription: string;
    color?: string;
  }) => {
    const {
      id,
      rowNumber,
      rawName,
      rawDay,
      rawStart,
      rawEnd,
      rawSection,
      rawDescription,
      color,
    } = params;
    const rowErrors: string[] = [];
    const rowErrorSet = new Set<string>();

    const addRowError = (message: string) => {
      if (rowErrorSet.has(message)) return;
      rowErrorSet.add(message);
      rowErrors.push(message);
    };

    if (!rawName) {
      addRowError("Course name is required");
    }

    if (!rawDay) {
      addRowError("Day of week is required");
    }

    if (!rawStart) {
      addRowError("Start time is required");
    }

    if (!rawEnd) {
      addRowError("End time is required");
    }

    const dayStrings = rawDay ? rawDay.split(",").map((d) => d.trim()) : [];
    const daysOfWeek: DaysOfWeek[] = [];

    for (const dayStr of dayStrings) {
      const dayOfWeek = normalizeDay(dayStr);
      if (!dayOfWeek) {
        addRowError(`Invalid day of week "${dayStr}"`);
        continue;
      }
      if (!daysOfWeek.includes(dayOfWeek)) {
        daysOfWeek.push(dayOfWeek);
      }
    }

    const startTime = normalizeTime(rawStart);
    const endTime = normalizeTime(rawEnd);

    if (!validateTime(startTime) && startTime) {
      addRowError(`Invalid start time format "${startTime}"`);
    }

    if (!validateTime(endTime) && endTime) {
      addRowError(`Invalid end time format "${endTime}"`);
    }

    if (validateTime(startTime) && validateTime(endTime)) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        addRowError("End time must be after start time");
      }
    }

    const previewRow: PreviewRow = {
      id: id ?? generateId(),
      rowNumber,
      name: rawName || "",
      section: rawSection || undefined,
      daysOfWeek,
      startTime,
      endTime,
      description: rawDescription || undefined,
      color: color ?? DEFAULT_COURSE_COLOR,
      error: rowErrors.length > 0 ? rowErrors.join("; ") : undefined,
      rawDay,
      rawStartTime: rawStart,
      rawEndTime: rawEnd,
      rawSection,
      rawDescription,
    };

    return { previewRow, rowErrors };
  };

  const buildRawLine = (course: PreviewRow) => {
    const rawDay =
      course.rawDay ||
      course.daysOfWeek.map((day) => day.slice(0, 3)).join(",");
    const dayValue =
      rawDay.includes(",") || rawDay.includes(" ") ? `"${rawDay}"` : rawDay;
    const descriptionValue = (
      course.rawDescription ||
      course.description ||
      ""
    ).replace(/\n/g, ";");
    return [
      course.name,
      course.rawSection || course.section || "",
      dayValue,
      course.rawStartTime || course.startTime,
      course.rawEndTime || course.endTime,
      descriptionValue,
    ].join(",");
  };

  const parseFile = (file: File) => {
    setSelectedFileName(file.name);

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please select a valid CSV file");
      resetFileInput();
      setPreviewCourses(null);
      return;
    }

    setError(null);
    setSuccess(null);
    setPreviewCourses(null);

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ",", // Explicitly set comma as delimiter
      quoteChar: '"', // Use double quotes for parsing quoted fields
      transformHeader: (header: string) => {
        // Normalize header names to match our expected format
        const normalized = header.trim().toLowerCase();
        switch (normalized) {
          case "course name":
          case "coursename":
          case "name":
            return "name";
          case "section":
          case "course section":
          case "coursesection":
            return "section";
          case "day of week":
          case "dayofweek":
          case "day":
            return "day";
          case "start time":
          case "starttime":
          case "start":
            return "startTime";
          case "end time":
          case "endtime":
          case "end":
            return "endTime";
          case "description":
          case "details":
            return "description";
          case "location":
          case "room":
            return "description";
          default:
            return header;
        }
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`CSV parsing error: ${results.errors[0].message}`);
          resetFileInput();
          return;
        }

        const validCourses: Course[] = [];
        const previewRows: PreviewRow[] = [];
        const errors: string[] = [];
        const seenRows = new Set<string>();

        results.data.forEach((row, index) => {
          const rowNumber = index + 2; // +2 because index starts at 0 and we skip header
          const rowErrors: string[] = [];
          const rowErrorSet = new Set<string>();
          const rawName = row.name?.trim() || "";
          const rawDay = row.day?.trim() || "";
          const rawStart = row.startTime?.trim() || "";
          const rawEnd = row.endTime?.trim() || "";
          const rawSection = row.section?.trim() || "";
          const rawDescription = row.description?.trim() || "";
          const color = DEFAULT_COURSE_COLOR;

          const addRowError = (message: string) => {
            if (rowErrorSet.has(message)) return;
            rowErrorSet.add(message);
            rowErrors.push(message);
          };

          // Validate required fields
          if (!rawName) {
            addRowError("Course name is required");
          }

          if (!rawDay) {
            addRowError("Day of week is required");
          }

          if (!rawStart) {
            addRowError("Start time is required");
          }

          if (!rawEnd) {
            addRowError("End time is required");
          }

          // Validate day(s) of week - handle single day or comma-separated days
          const dayStrings = rawDay
            ? rawDay.split(",").map((d) => d.trim())
            : [];
          const daysOfWeek: DaysOfWeek[] = [];

          for (const dayStr of dayStrings) {
            const dayOfWeek = normalizeDay(dayStr);
            if (!dayOfWeek) {
              addRowError(`Invalid day of week "${dayStr}"`);
              continue;
            }
            if (!daysOfWeek.includes(dayOfWeek)) {
              daysOfWeek.push(dayOfWeek);
            }
          }

          // Validate time format
          const startTime = normalizeTime(rawStart);
          const endTime = normalizeTime(rawEnd);

          if (!validateTime(startTime) && startTime) {
            addRowError(`Invalid start time format "${startTime}"`);
          }

          if (!validateTime(endTime) && endTime) {
            addRowError(`Invalid end time format "${endTime}"`);
          }

          // Validate that end time is after start time
          if (validateTime(startTime) && validateTime(endTime)) {
            const [startHour, startMin] = startTime.split(":").map(Number);
            const [endHour, endMin] = endTime.split(":").map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;

            if (endMinutes <= startMinutes) {
              addRowError("End time must be after start time");
            }
          }

          const previewRow: PreviewRow = {
            id: generateId(),
            rowNumber,
            name: rawName || "",
            section: rawSection || undefined,
            daysOfWeek,
            startTime,
            endTime,
            description: rawDescription || undefined,
            color,
            error: rowErrors.length > 0 ? rowErrors.join("; ") : undefined,
            rawDay,
            rawStartTime: rawStart,
            rawEndTime: rawEnd,
            rawSection,
            rawDescription,
          };

          const dedupeKey = [
            rawName.toLowerCase(),
            rawSection.toLowerCase(),
            rawDay.toLowerCase(),
            startTime.toLowerCase(),
            endTime.toLowerCase(),
            rawDescription.toLowerCase(),
          ].join("|");

          if (seenRows.has(dedupeKey)) {
            return;
          }

          seenRows.add(dedupeKey);

          if (rowErrors.length > 0) {
            errors.push(`Row ${rowNumber}: ${rowErrors.join("; ")}`);
          } else {
            validCourses.push({
              id: previewRow.id,
              name: rawName,
              section: previewRow.section,
              daysOfWeek,
              startTime,
              endTime,
              description: previewRow.description,
              color: previewRow.color,
            });
          }

          previewRows.push(previewRow);
        });

        if (errors.length > 0) {
          setError(null);
        }

        if (validCourses.length === 0 && errors.length === 0) {
          setError("No valid courses found in the CSV file");
          resetFileInput();
        }

        setPreviewCourses(previewRows);
      },
      error: (parseError) => {
        setError(`Failed to parse CSV: ${parseError.message}`);
        resetFileInput();
      },
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewCourses && previewCourses.length > 0) {
      setPendingFile(file);
      setConfirmMode("replace");
      setIsConfirmOpen(true);
      return;
    }

    parseFile(file);
  };

  const handleImport = () => {
    if (!previewCourses || previewCourses.length === 0) {
      return;
    }
    const importableCourses = previewCourses.filter((row) => !row.error);
    if (importableCourses.length === 0) {
      setError("Please fix errors before importing.");
      return;
    }
    onCoursesLoaded(importableCourses);
    setSuccess(`Successfully imported ${importableCourses.length} course(s)!`);
    setPreviewCourses(null);
    setIsPanelOpen(false);
    resetFileInput();
  };

  const handleDeleteRow = (id: string) => {
    setPreviewCourses((prev) => {
      if (!prev) return prev;
      const next = prev.filter((row) => row.id !== id);
      if (next.length === 0) {
        resetFileInput();
      }
      return next;
    });
    if (editingRowId === id) {
      setEditingRowId(null);
    }
  };

  const handleClosePanel = () => {
    if (previewCourses && previewCourses.length > 0) {
      setConfirmMode("close");
      setIsConfirmOpen(true);
      return;
    }
    setIsPanelOpen(false);
    setError(null);
    setPreviewCourses(null);
  };

  const handleEditStart = (course: PreviewRow) => {
    setEditingRowId(course.id);
    setEditLine(buildRawLine(course));
  };

  const handleEditConfirm = () => {
    if (!editingRowId) return;
    const parsed = Papa.parse<string[]>(editLine, { skipEmptyLines: true });
    const values = (parsed.data?.[0] || []).map((value) =>
      String(value ?? "").trim(),
    );
    const [
      rawName = "",
      rawSection = "",
      rawDay = "",
      rawStart = "",
      rawEnd = "",
      rawDescription = "",
    ] = values;

    setPreviewCourses((prev) => {
      if (!prev) return prev;
      return prev.map((row) => {
        if (row.id !== editingRowId) return row;
        const { previewRow } = parseRawRow({
          id: row.id,
          rowNumber: row.rowNumber,
          rawName,
          rawDay,
          rawStart,
          rawEnd,
          rawSection,
          rawDescription,
          color: row.color,
        });
        return previewRow;
      });
    });
    setEditingRowId(null);
    setEditLine("");
  };

  const getCellErrorClass = (
    course: PreviewRow,
    field: "name" | "day" | "time" | "description",
  ) => {
    if (!course.error) return "";
    const errorText = course.error.toLowerCase();

    if (field === "name" && errorText.includes("name")) {
      return "!text-error";
    }
    if (field === "day" && errorText.includes("day")) {
      return "!text-error";
    }
    if (
      field === "time" &&
      (errorText.includes("start time") ||
        errorText.includes("end time") ||
        errorText.includes("time"))
    ) {
      return "!text-error";
    }
    if (
      field === "description" &&
      (errorText.includes("description") || errorText.includes("location"))
    ) {
      return "!text-error";
    }

    return "";
  };

  const showErrorTooltip = (
    event: React.MouseEvent<HTMLElement>,
    text: string,
  ) => {
    if (!panelRef.current) return;
    const panelRect = panelRef.current.getBoundingClientRect();
    const cellRect = (
      event.currentTarget as HTMLElement
    ).getBoundingClientRect();
    const x = cellRect.left - panelRect.left + cellRect.width / 2;
    const y = cellRect.top - panelRect.top - 8;

    setTooltip({
      text,
      x,
      y,
      visible: true,
    });
  };

  const hideTooltip = () => {
    setTooltip((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ["name", "section", "day", "startTime", "endTime", "description"],
      ["MATH 231", "AL", "Mon,Wed,Fri", "09:00", "10:30", "Room A101"],
      ["PHY", "B1", "Mon,Wed,Fri", "14:00", "16:00", "Lab B205"],
      ["ENG 115", "", "Friday", "11:00", "12:30", "Room C301"],
    ];

    // Use Papa Parse to generate properly formatted CSV
    const csvContent = Papa.unparse(sampleData, {
      header: false,
      quotes: true, // Always quote fields to avoid comma issues
    });
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_courses.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body p-4 space-y-2">
        <div className="card-title text-base flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12" />
            <path d="m8 11 4 4 4-4" />
            <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
          </svg>
          Add Courses from File
        </div>

        <button
          type="button"
          className="btn btn-primary shadow-none w-full px-6 py-2 rounded-md font-semibold transition-colors"
          onClick={() => setIsPanelOpen(true)}
        >
          Open Upload Panel
        </button>

        {success && (
          <div className="py-2 px-3 border border-success rounded-md">
            <p className="text-success text-sm">{success}</p>
          </div>
        )}
      </div>

      {isPanelOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="uploadPanelTitle"
        >
          <div
            ref={panelRef}
            className="card bg-base-100 w-full max-w-3xl h-[90vh] shadow-xl overflow-hidden relative"
          >
            <div className="card-body p-6 flex h-full flex-col gap-5">
              <div className="flex items-center gap-3" id="uploadPanelTitle">
                <span className="text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v12" />
                    <path d="m8 11 4 4 4-4" />
                    <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
                  </svg>
                </span>
                <div className="text-xl font-bold">Upload Courses</div>
              </div>

              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between">
                  <label className="text-base font-semibold">
                    Format Requirements
                  </label>
                  <button
                    onClick={downloadSampleCSV}
                    className="label text-primary hover:text-primary/80 underline"
                  >
                    Download Sample CSV
                  </button>
                </div>

                <div
                  className="label mt-2 mb-4 border border-dashed border-base-300 rounded-md p-4 text-sm"
                  role="group"
                  aria-labelledby="csvFormatLabel"
                >
                  <p id="csvFormatLabel" className="sr-only">
                    CSV Format Requirements
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      Headers: name, section (optional), day, startTime,
                      endTime, description (optional, ";" for new lines)
                    </li>
                    <li>
                      Day: Monday/Mon/M/W/Tu/Th/F/Sa/Su, comma-separated for
                      multiple days
                    </li>
                    <li>Time: HH:mm, HHmm, or HMM (e.g. 09:00, 0900, 900)</li>
                  </ul>
                </div>

                <div className="flex-1 min-h-0">
                  {previewCourses && previewCourses.length > 0 ? (
                    <div className="border border-base-200 rounded-md h-full overflow-auto">
                      <table className="table table-sm w-full text-sm table-fixed">
                        <colgroup>
                          <col className="w-[15%]" />
                          <col className="w-[11%]" />
                          <col className="w-[16%]" />
                          <col className="w-[18%]" />
                          <col className="w-[21%]" />
                          <col className="w-[19%]" />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>name</th>
                            <th>section*</th>
                            <th>day</th>
                            <th>time</th>
                            <th>description*</th>
                            <th className="text-right">actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewCourses.map((course) => {
                            const nameErrorClass = getCellErrorClass(
                              course,
                              "name",
                            );
                            const dayErrorClass = getCellErrorClass(
                              course,
                              "day",
                            );
                            const timeErrorClass = getCellErrorClass(
                              course,
                              "time",
                            );
                            const descriptionErrorClass = getCellErrorClass(
                              course,
                              "description",
                            );
                            const rowErrorClass = course.error
                              ? "bg-error/5"
                              : "";
                            const isEditing = editingRowId === course.id;

                            return (
                              <React.Fragment key={course.id}>
                                <tr
                                  className={
                                    course.error
                                      ? "group relative bg-error/5"
                                      : "group"
                                  }
                                >
                                  <td
                                    className={`truncate max-w-[160px] ${rowErrorClass} ${nameErrorClass}`}
                                    onMouseEnter={(event) => {
                                      if (course.error && nameErrorClass) {
                                        showErrorTooltip(event, course.error);
                                      }
                                    }}
                                    onMouseLeave={hideTooltip}
                                  >
                                    {course.name}
                                  </td>
                                  <td
                                    className={`truncate max-w-[120px] ${rowErrorClass}`}
                                  >
                                    {course.rawSection || course.section || "-"}
                                  </td>
                                  <td
                                    className={`truncate max-w-[160px] ${rowErrorClass} ${dayErrorClass}`}
                                    onMouseEnter={(event) => {
                                      if (course.error && dayErrorClass) {
                                        showErrorTooltip(event, course.error);
                                      }
                                    }}
                                    onMouseLeave={hideTooltip}
                                  >
                                    {course.rawDay ||
                                      course.daysOfWeek
                                        .map((day) => day.slice(0, 3))
                                        .join(", ")}
                                  </td>
                                  <td
                                    className={`${rowErrorClass} ${timeErrorClass}`}
                                    onMouseEnter={(event) => {
                                      if (course.error && timeErrorClass) {
                                        showErrorTooltip(event, course.error);
                                      }
                                    }}
                                    onMouseLeave={hideTooltip}
                                  >
                                    {course.rawStartTime || course.startTime} -{" "}
                                    {course.rawEndTime || course.endTime}
                                  </td>
                                  <td
                                    className={`max-w-[200px] py-0 ${rowErrorClass} ${descriptionErrorClass} whitespace-pre-line`}
                                    onMouseEnter={(event) => {
                                      if (
                                        course.error &&
                                        descriptionErrorClass
                                      ) {
                                        showErrorTooltip(event, course.error);
                                      }
                                    }}
                                    onMouseLeave={hideTooltip}
                                  >
                                    {(
                                      course.rawDescription ||
                                      course.description ||
                                      "-"
                                    ).replace(/;|\n/g, "\n")}
                                  </td>
                                  <td
                                    className={`text-right p-2 ${rowErrorClass}`}
                                  >
                                    <div className="inline-flex items-center gap-2">
                                      <button
                                        type="button"
                                        className={`btn btn-ghost btn-xs shadow-none px-1 hover:bg-primary/10 hover:border-primary hover:text-primary ${
                                          isEditing
                                            ? "bg-primary/10 border-primary text-primary"
                                            : ""
                                        }`}
                                        aria-label="Edit course"
                                        title="Edit"
                                        onClick={() => {
                                          if (!isEditing) {
                                            handleEditStart(course);
                                          }
                                        }}
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-3.5 w-3.5"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M13 21h8" />
                                          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .830-.497z" />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-ghost btn-xs shadow-none px-1 hover:bg-error/10 hover:border-error hover:text-error"
                                        aria-label="Delete course"
                                        title="Delete"
                                        onClick={() =>
                                          handleDeleteRow(course.id)
                                        }
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-3.5 w-3.5"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M3 6h18" />
                                          <path d="M8 6V4h8v2" />
                                          <path d="M10 11v6" />
                                          <path d="M14 11v6" />
                                          <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
                                        </svg>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                {isEditing && (
                                  <tr className="bg-base-100">
                                    <td colSpan={6} className="p-2">
                                      <div className="flex items-center gap-2">
                                        <input
                                          className="input input-sm font-mono text-sm flex-1 border-base-300 outline outline-primary outline-2 focus:outline-primary outline-offset-2"
                                          value={editLine}
                                          onChange={(event) =>
                                            setEditLine(event.target.value)
                                          }
                                          placeholder="name,section,day,startTime,endTime,description"
                                        />
                                        <button
                                          type="button"
                                          className="btn btn-ghost btn-xs shadow-none px-1 hover:bg-primary/10 hover:border-primary hover:text-primary"
                                          aria-label="Confirm edit"
                                          title="Confirm"
                                          onClick={handleEditConfirm}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3.5 w-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <path d="M20 6 9 17l-5-5" />
                                          </svg>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="border border-base-200 rounded-md h-full flex items-center justify-center text-sm text-base-content/60">
                      Upload a file to preview parsed courses.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="csvFile"
                    className="btn btn-primary shadow-none"
                  >
                    Choose File
                  </label>
                  <input
                    ref={fileInputRef}
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="hidden"
                  />
                  <span className="text-sm text-base-content/70 truncate">
                    {selectedFileName ?? "No file selected"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="btn  shadow-none"
                    onClick={handleClosePanel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary shadow-none"
                    onClick={handleImport}
                    disabled={
                      !previewCourses ||
                      previewCourses.length === 0 ||
                      previewCourses.every((course) => course.error)
                    }
                  >
                    {previewCourses && previewCourses.length > 0
                      ? `Import ${
                          previewCourses.filter((course) => !course.error)
                            .length
                        } Courses`
                      : "Import Courses"}
                  </button>
                </div>
              </div>
            </div>
            {tooltip.visible && (
              <div
                className="absolute z-50 rounded-md border border-error bg-error-50 px-3 py-2 text-xs text-error pointer-events-none"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                  transform: "translate(-50%, -100%)",
                }}
              >
                {tooltip.text}
              </div>
            )}
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={
          confirmMode === "replace"
            ? "Replace current preview"
            : "Close upload panel"
        }
        description={
          confirmMode === "replace"
            ? "Uploading a new file will clear the current preview list."
            : "Closing the panel will clear the current preview list."
        }
        confirmLabel={confirmMode === "replace" ? "Replace" : "Close"}
        cancelLabel="Keep"
        onCancel={() => {
          setPendingFile(null);
          setIsConfirmOpen(false);
          if (confirmMode === "replace") {
            resetFileInput();
          }
        }}
        onConfirm={() => {
          if (confirmMode === "replace" && pendingFile) {
            parseFile(pendingFile);
          }
          if (confirmMode === "close") {
            setIsPanelOpen(false);
            setError(null);
            setPreviewCourses(null);
          }
          setPendingFile(null);
          setIsConfirmOpen(false);
        }}
      />
    </div>
  );
};
