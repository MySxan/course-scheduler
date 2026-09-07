import type { Course } from "../types/course";
import { CONTENT_FIELDS, type StyleSettings } from "../types/style";

export const STYLE_STORAGE_KEY = "courseScheduler.style.v1";
export const DEFAULT_STYLE: StyleSettings = {
  version: 1,
  typography: {
    font: "outfit",
    titleSize: 18,
    sectionSize: 12,
    timeSize: 12,
    descriptionSize: 12,
    titleWeight: 700,
    lineHeight: 1.2,
    letterSpacing: 0,
    capitalization: "none",
    tabularNumbers: true,
  },
  layout: {
    radius: 8,
    padding: 4,
    gap: 2,
    cardGap: 3,
    borderWidth: 0,
    shadow: "none",
    align: "left",
    verticalAlign: "top",
  },
  content: {
    section: true,
    time: true,
    description: true,
    order: [...CONTENT_FIELDS],
    titleLines: 2,
    timeFormat: "12h",
  },
  colors: {
    source: "uniform",
    accent: "#0d9488",
    surface: "solid",
    textMode: "auto",
    text: "#ffffff",
  },
};

export const FONT_STACKS = {
  outfit:
    "Outfit, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  system:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  sans: "Arial, Helvetica, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, 'Cascadia Code', Consolas, monospace",
};
export const PALETTES = {
  teal: [
    "#30a685",
    "#0d9488",
    "#14bbb0",
    "#4a6a92",
    "#00b89f",
    "#4788c5",
    "#26669e",
    "#358bb6",
    "#4391a4",
  ],
  spectrum: ["#2563eb", "#7c3aed", "#db2777", "#c2410c", "#047857", "#0369a1"],
};

const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const number = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
const choice = <T extends string>(
  value: unknown,
  choices: readonly T[],
  fallback: T,
): T => (choices.includes(value as T) ? (value as T) : fallback);
const bool = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;
export const hexColor = (value: unknown, fallback: string) =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)
    ? value.toLowerCase()
    : fallback;

/** Normalize each field: local storage and imported JSON are untrusted inputs. */
export function normalizeStyle(value: unknown): StyleSettings {
  const raw = record(value);
  if (raw.version !== undefined && raw.version !== 1)
    return structuredClone(DEFAULT_STYLE);
  const t = record(raw.typography),
    l = record(raw.layout),
    c = record(raw.content),
    p = record(raw.colors);
  const d = DEFAULT_STYLE;
  const order = Array.isArray(c.order)
    ? c.order.filter((v): v is (typeof CONTENT_FIELDS)[number] =>
        CONTENT_FIELDS.includes(v),
      )
    : [];
  return {
    version: 1,
    typography: {
      font: choice(
        t.font,
        ["outfit", "system", "sans", "serif", "mono"],
        d.typography.font,
      ),
      titleSize: number(t.titleSize, 18, 10, 36),
      sectionSize: number(t.sectionSize, 12, 10, 24),
      timeSize: number(t.timeSize, 12, 10, 24),
      descriptionSize: number(t.descriptionSize, 12, 10, 24),
      titleWeight: Math.round(number(t.titleWeight, 700, 400, 800) / 100) * 100,
      lineHeight: number(t.lineHeight, 1.2, 1, 2),
      letterSpacing: number(t.letterSpacing, 0, -0.5, 3),
      capitalization: choice(
        t.capitalization,
        ["none", "uppercase", "capitalize", "lowercase"],
        "none",
      ),
      tabularNumbers: bool(t.tabularNumbers, true),
    },
    layout: {
      radius: number(l.radius, 8, 0, 24),
      padding: number(l.padding, 4, 0, 20),
      gap: number(l.gap, 2, 0, 12),
      cardGap: number(l.cardGap, 3, 0, 10),
      borderWidth: number(l.borderWidth, 0, 0, 4),
      shadow: choice(l.shadow, ["none", "small", "medium"], "none"),
      align: choice(l.align, ["left", "center", "right"], "left"),
      verticalAlign: choice(
        l.verticalAlign,
        ["top", "center", "bottom"],
        "top",
      ),
    },
    content: {
      section: bool(c.section, true),
      time: bool(c.time, true),
      description: bool(c.description, true),
      order: [...new Set([...order, ...CONTENT_FIELDS])],
      titleLines: Math.round(number(c.titleLines, 2, 1, 4)),
      timeFormat: choice(c.timeFormat, ["12h", "24h"], "12h"),
    },
    colors: {
      source: choice(
        p.source,
        ["uniform", "course", "teal", "spectrum"],
        "uniform",
      ),
      accent: hexColor(p.accent, d.colors.accent),
      surface: choice(p.surface, ["solid", "soft", "outline"], "solid"),
      textMode: choice(p.textMode, ["auto", "custom"], "auto"),
      text: hexColor(p.text, "#ffffff"),
    },
  };
}

export function migrateStyle(
  value: unknown,
  legacyPreset: string | null,
): StyleSettings {
  if (value) return normalizeStyle(value);
  const next = normalizeStyle(DEFAULT_STYLE);
  if (legacyPreset === "tealFamily") next.colors.source = "course";
  return next;
}

export function parseStyleFile(text: string): StyleSettings {
  const raw = record(JSON.parse(text));
  if (
    raw.version !== 1 ||
    [raw.typography, raw.layout, raw.content, raw.colors].some(
      (part) =>
        part === null || typeof part !== "object" || Array.isArray(part),
    )
  ) {
    throw new Error("Choose a Course Scheduler style file (version 1).");
  }
  return normalizeStyle(raw);
}

export function getCourseAccent(course: Course, settings: StyleSettings) {
  const { source, accent } = settings.colors;
  if (source === "uniform") return accent;
  if (source === "course") return hexColor(course.color, accent);
  // Stable across renders, reordering, insertion and reload. No writes to Course.color.
  const hash = Array.from(course.id).reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0,
    0,
  );
  const palette = PALETTES[source];
  return palette[hash % palette.length];
}

function luminance(hex: string) {
  const values = [1, 3, 5].map((index) => {
    const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
export function contrastRatio(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function getCardColors(course: Course, settings: StyleSettings) {
  const accent = getCourseAccent(course, settings);
  const background =
    settings.colors.surface === "solid"
      ? accent
      : settings.colors.surface === "outline"
        ? "#ffffff"
        : "#" +
          [1, 3, 5]
            .map((i) =>
              Math.round(
                parseInt(accent.slice(i, i + 2), 16) * 0.14 + 255 * 0.86,
              )
                .toString(16)
                .padStart(2, "0"),
            )
            .join("");
  const text =
    settings.colors.textMode === "custom"
      ? settings.colors.text
      : contrastRatio(background, "#ffffff") >= 4.5
        ? "#ffffff"
        : contrastRatio(background, "#102b29") >= 4.5
          ? "#102b29"
          : "#000000";
  return { accent, background, text };
}

export const STYLE_PRESETS = [
  { id: "classic", label: "Classic", settings: normalizeStyle(DEFAULT_STYLE) },
  {
    id: "soft",
    label: "Soft",
    settings: normalizeStyle({
      ...DEFAULT_STYLE,
      colors: { ...DEFAULT_STYLE.colors, source: "spectrum", surface: "soft" },
      layout: {
        ...DEFAULT_STYLE.layout,
        radius: 12,
        padding: 6,
        shadow: "none",
      },
    }),
  },
  {
    id: "minimal",
    label: "Minimal",
    settings: normalizeStyle({
      ...DEFAULT_STYLE,
      colors: { ...DEFAULT_STYLE.colors, source: "course", surface: "outline" },
      layout: {
        ...DEFAULT_STYLE.layout,
        radius: 2,
        borderWidth: 1,
        shadow: "none",
      },
    }),
  },
  {
    id: "compact",
    label: "Compact",
    settings: normalizeStyle({
      ...DEFAULT_STYLE,
      typography: {
        ...DEFAULT_STYLE.typography,
        titleSize: 14,
        lineHeight: 1.1,
      },
      layout: { ...DEFAULT_STYLE.layout, padding: 3, gap: 0, radius: 4 },
      content: {
        ...DEFAULT_STYLE.content,
        section: false,
        description: false,
        timeFormat: "24h",
        titleLines: 1,
      },
    }),
  },
];

export interface StyleHistory {
  past: StyleSettings[];
  present: StyleSettings;
  future: StyleSettings[];
  group?: string;
}
export type StyleAction =
  | { type: "change"; value: StyleSettings; group?: string }
  | { type: "undo" | "redo" | "endGroup" };
export function styleHistoryReducer(
  state: StyleHistory,
  action: StyleAction,
): StyleHistory {
  if (action.type === "endGroup") return { ...state, group: undefined };
  if (action.type === "undo") {
    const previous = state.past.at(-1);
    return previous
      ? {
          past: state.past.slice(0, -1),
          present: previous,
          future: [state.present, ...state.future],
        }
      : state;
  }
  if (action.type === "redo") {
    const next = state.future[0];
    return next
      ? {
          past: [...state.past, state.present],
          present: next,
          future: state.future.slice(1),
        }
      : state;
  }
  if (action.type !== "change") return state;
  const next = normalizeStyle(action.value);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return {
    past:
      action.group && action.group === state.group
        ? state.past
        : [...state.past, state.present].slice(-50),
    present: next,
    future: [],
    group: action.group,
  };
}
