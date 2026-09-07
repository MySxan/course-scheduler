import {
  TimetableCanvas,
  type TimetableCanvasProps,
} from "../timetable/TimetableCanvas";

export function TimetablePreview(props: TimetableCanvasProps) {
  return <TimetableCanvas {...props} exportMode />;
}
