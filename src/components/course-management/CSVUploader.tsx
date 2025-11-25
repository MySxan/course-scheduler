import React, { useRef, useState } from "react";
import Papa from "papaparse";
import type { Course, CSVRow, DaysOfWeek } from "../../types/course";
import { generateId } from "../../lib/utils";

interface CSVUploaderProps {
  onCoursesLoaded: (courses: Course[]) => void;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({
  onCoursesLoaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateTime = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const normalizeDay = (day: string): DaysOfWeek | null => {
    const normalizedDay = day.trim().toLowerCase();
    const dayMap: Record<string, DaysOfWeek> = {
      monday: "Monday",
      mon: "Monday",
      tuesday: "Tuesday",
      tue: "Tuesday",
      wednesday: "Wednesday",
      wed: "Wednesday",
      thursday: "Thursday",
      thu: "Thursday",
      friday: "Friday",
      fri: "Friday",
      saturday: "Saturday",
      sat: "Saturday",
      sunday: "Sunday",
      sun: "Sunday",
    };
    return dayMap[normalizedDay] || null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please select a valid CSV file");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

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
          case "location":
          case "room":
            return "location";
          default:
            return header;
        }
      },
      complete: (results) => {
        setIsLoading(false);

        if (results.errors.length > 0) {
          setError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }

        const validCourses: Course[] = [];
        const errors: string[] = [];

        results.data.forEach((row, index) => {
          const rowNumber = index + 2; // +2 because index starts at 0 and we skip header

          // Validate required fields
          if (!row.name?.trim()) {
            errors.push(`Row ${rowNumber}: Course name is required`);
            return;
          }

          if (!row.day?.trim()) {
            errors.push(`Row ${rowNumber}: Day of week is required`);
            return;
          }

          if (!row.startTime?.trim()) {
            errors.push(`Row ${rowNumber}: Start time is required`);
            return;
          }

          if (!row.endTime?.trim()) {
            errors.push(`Row ${rowNumber}: End time is required`);
            return;
          }

          // Validate day(s) of week - handle single day or comma-separated days
          const dayStrings = row.day.split(",").map((d) => d.trim());
          const daysOfWeek: DaysOfWeek[] = [];

          for (const dayStr of dayStrings) {
            const dayOfWeek = normalizeDay(dayStr);
            if (!dayOfWeek) {
              errors.push(`Row ${rowNumber}: Invalid day of week "${dayStr}"`);
              return;
            }
            if (!daysOfWeek.includes(dayOfWeek)) {
              daysOfWeek.push(dayOfWeek);
            }
          }

          if (daysOfWeek.length === 0) {
            errors.push(`Row ${rowNumber}: No valid days of week found`);
            return;
          }

          // Validate time format
          const startTime = row.startTime.trim();
          const endTime = row.endTime.trim();

          if (!validateTime(startTime)) {
            errors.push(
              `Row ${rowNumber}: Invalid start time format "${startTime}". Use HH:mm format`
            );
            return;
          }

          if (!validateTime(endTime)) {
            errors.push(
              `Row ${rowNumber}: Invalid end time format "${endTime}". Use HH:mm format`
            );
            return;
          }

          // Validate that end time is after start time
          const [startHour, startMin] = startTime.split(":").map(Number);
          const [endHour, endMin] = endTime.split(":").map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;

          if (endMinutes <= startMinutes) {
            errors.push(`Row ${rowNumber}: End time must be after start time`);
            return;
          }

          // Create valid course
          validCourses.push({
            id: generateId(),
            name: row.name.trim(),
            section: row.section?.trim() || undefined,
            daysOfWeek,
            startTime,
            endTime,
            location: row.location?.trim() || undefined,
          });
        });

        if (errors.length > 0) {
          setError(
            `Found ${errors.length} error(s):\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? "\n...and more" : ""}`
          );
          return;
        }

        if (validCourses.length === 0) {
          setError("No valid courses found in the CSV file");
          return;
        }

        onCoursesLoaded(validCourses);
        setSuccess(`Successfully imported ${validCourses.length} course(s)`);

        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      error: (error) => {
        setIsLoading(false);
        setError(`Failed to parse CSV: ${error.message}`);
      },
    });
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ["name", "section", "day", "startTime", "endTime", "location"],
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
          Add Courses from CSV
        </div>

        <div className="form-control">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer"
          />
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            <span>Processing CSV file...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-md">
            <p className="text-error text-sm whitespace-pre-line">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-success/10 border border-success/20 rounded-md">
            <p className="text-success text-sm">{success}</p>
          </div>
        )}

        <div className="text-base-content/70">
          <label className="label mb-2">CSV Format Requirements:</label>
          <ul className="list-disc list-inside space-y-2 opacity-50 text-sm">
            <li>
              Headers: name, section (optional), day, startTime, endTime,
              location (optional)
            </li>
            <li>
              Day: Full day name (Monday) or abbreviation (Mon). Use
              comma-separated for multiple days (Monday,Wednesday,Friday)
            </li>
            <li>Time: 24-hour format (HH:mm) like 09:00 or 14:30</li>
            <li>End time must be after start time</li>
          </ul>
        </div>
        <button
          onClick={downloadSampleCSV}
          className="text-left text-sm text-primary hover:text-primary/80 underline"
        >
          Download Sample CSV
        </button>
      </div>
    </div>
  );
};
