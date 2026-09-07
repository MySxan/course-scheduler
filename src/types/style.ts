export const CONTENT_FIELDS = [
  "name",
  "section",
  "time",
  "description",
] as const;
export type ContentField = (typeof CONTENT_FIELDS)[number];

export interface StyleSettings {
  version: 1;
  typography: {
    font: "outfit" | "system" | "sans" | "serif" | "mono";
    titleSize: number;
    sectionSize: number;
    timeSize: number;
    descriptionSize: number;
    titleWeight: number;
    lineHeight: number;
    letterSpacing: number;
    capitalization: "none" | "uppercase" | "capitalize" | "lowercase";
    tabularNumbers: boolean;
  };
  layout: {
    radius: number;
    padding: number;
    gap: number;
    cardGap: number;
    borderWidth: number;
    shadow: "none" | "small" | "medium";
    align: "left" | "center" | "right";
    verticalAlign: "top" | "center" | "bottom";
  };
  content: {
    section: boolean;
    time: boolean;
    description: boolean;
    order: ContentField[];
    titleLines: number;
    timeFormat: "12h" | "24h";
  };
  colors: {
    source: "uniform" | "course" | "teal" | "spectrum";
    accent: string;
    surface: "solid" | "soft" | "outline";
    textMode: "auto" | "custom";
    text: string;
  };
}
