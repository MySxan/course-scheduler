export interface Course {
  id: string;
  name: string;
  daysOfWeek: DaysOfWeek[];
  startTime: string; // Format: "HH:mm" (24-hour)
  endTime: string; // Format: "HH:mm" (24-hour)
  location?: string; // Optional location
}

export type DaysOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export const DAYS_OF_WEEK: DaysOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export interface CourseFormData {
  name: string;
  daysOfWeek: DaysOfWeek[];
  startTime: string;
  endTime: string;
  location: string;
}

// For CSV parsing
export interface CSVRow {
  name: string;
  day: string;
  startTime: string;
  endTime: string;
  location?: string;
}
