import { useContext } from "react";
import {
  CourseContext,
  type CourseContextType,
} from "../context/CourseContext";

export const useCourses = (): CourseContextType => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourses must be used within a CourseProvider");
  }
  return context;
};
