import { Icon } from "../ui/Icon";
import type { StyleSettings, ContentField } from "../../types/style";
import type { StyleCategory } from "./CategoryBar";
import { FONT_STACKS, PALETTES } from "../../lib/style";
import {
  ColorControl,
  NumberControl,
  ChoiceControl,
  SettingGroup,
  ToggleControl,
} from "./controls";

interface StyleSidebarProps {
  activeCategory: StyleCategory;
  styleSettings: StyleSettings;
  onChange: (value: StyleSettings, group?: string) => void;
  onEnd: () => void;
}
const FIELD_NAMES: Record<ContentField, string> = {
  name: "Course name",
  section: "Section",
  time: "Time",
  description: "Description",
};

export function StyleSidebar({
  activeCategory,
  styleSettings: s,
  onChange,
  onEnd,
}: StyleSidebarProps) {
  const update = <
    K extends "typography" | "layout" | "content" | "colors",
    F extends keyof StyleSettings[K],
  >(
    group: K,
    field: F,
    value: StyleSettings[K][F],
    continuous = false,
  ) =>
    onChange(
      { ...s, [group]: { ...s[group], [field]: value } },
      continuous ? `${group}.${String(field)}` : undefined,
    );
  const numeric = (
    group: "typography" | "layout",
    field: string,
    label: string,
    value: number,
    min: number,
    max: number,
    step = 1,
    unit = "px",
  ) => (
    <NumberControl
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      unit={unit}
      onChange={(next) =>
        onChange(
          { ...s, [group]: { ...s[group], [field]: next } },
          `${group}.${field}`,
        )
      }
      onEnd={onEnd}
    />
  );
  const moveField = (index: number, delta: number) => {
    const order = [...s.content.order];
    [order[index], order[index + delta]] = [order[index + delta], order[index]];
    update("content", "order", order);
  };
  return (
    <div className="style-controls">
      {activeCategory === "typography" && (
        <>
          <SettingGroup title="Typeface">
            <ChoiceControl
              label="Font family"
              columns={2}
              renderOption={(key, text) => (
                <span
                  className="font-choice"
                  style={{
                    fontFamily: FONT_STACKS[key as keyof typeof FONT_STACKS],
                  }}
                >
                  <b>Aa</b>
                  <span>{text}</span>
                </span>
              )}
              value={s.typography.font}
              options={[
                ["outfit", "Outfit"],
                ["system", "System UI"],
                ["sans", "Arial / Helvetica"],
                ["serif", "Georgia / Serif"],
                ["mono", "Monospace"],
              ]}
              onChange={(v) =>
                update(
                  "typography",
                  "font",
                  v as StyleSettings["typography"]["font"],
                )
              }
            />
            <ChoiceControl
              label="Course name weight"
              columns={5}
              renderOption={(key) => (
                <span
                  aria-hidden="true"
                  className="type-choice"
                  style={{ fontWeight: Number(key) }}
                >
                  Aa
                </span>
              )}
              value={s.typography.titleWeight}
              options={[
                [400, "Regular"],
                [500, "Medium"],
                [600, "Semibold"],
                [700, "Bold"],
                [800, "Extra bold"],
              ]}
              onChange={(v) => update("typography", "titleWeight", Number(v))}
            />
            <ChoiceControl
              label="Course name case"
              columns={4}
              renderOption={(key) => (
                <span aria-hidden="true" className="type-choice">
                  {
                    {
                      none: "—",
                      uppercase: "AA",
                      capitalize: "Aa",
                      lowercase: "aa",
                    }[key]
                  }
                </span>
              )}
              value={s.typography.capitalization}
              options={[
                ["none", "As typed"],
                ["uppercase", "UPPERCASE"],
                ["capitalize", "Title Case"],
                ["lowercase", "lowercase"],
              ]}
              onChange={(v) =>
                update(
                  "typography",
                  "capitalization",
                  v as StyleSettings["typography"]["capitalization"],
                )
              }
            />
          </SettingGroup>
          <SettingGroup title="Type scale">
            {numeric(
              "typography",
              "titleSize",
              "Course name",
              s.typography.titleSize,
              10,
              36,
            )}
            {numeric(
              "typography",
              "sectionSize",
              "Section",
              s.typography.sectionSize,
              10,
              24,
            )}
            {numeric(
              "typography",
              "timeSize",
              "Time",
              s.typography.timeSize,
              10,
              24,
            )}
            {numeric(
              "typography",
              "descriptionSize",
              "Description",
              s.typography.descriptionSize,
              10,
              24,
            )}
          </SettingGroup>
          <SettingGroup title="Spacing & numbers">
            {numeric(
              "typography",
              "lineHeight",
              "Line height",
              s.typography.lineHeight,
              1,
              2,
              0.05,
              "×",
            )}
            {numeric(
              "typography",
              "letterSpacing",
              "Letter spacing",
              s.typography.letterSpacing,
              -0.5,
              3,
              0.1,
            )}
            <ToggleControl
              label="Tabular numbers"
              checked={s.typography.tabularNumbers}
              onChange={(v) => update("typography", "tabularNumbers", v)}
            />
          </SettingGroup>
        </>
      )}
      {activeCategory === "cardLayout" && (
        <>
          <SettingGroup title="Shape & spacing">
            {numeric(
              "layout",
              "radius",
              "Corner radius",
              s.layout.radius,
              0,
              24,
            )}
            {numeric(
              "layout",
              "padding",
              "Inner padding",
              s.layout.padding,
              0,
              20,
            )}
            {numeric("layout", "gap", "Field spacing", s.layout.gap, 0, 12)}
            {numeric(
              "layout",
              "cardGap",
              "Card inset",
              s.layout.cardGap,
              0,
              10,
            )}
            {numeric(
              "layout",
              "borderWidth",
              "Border width",
              s.layout.borderWidth,
              0,
              4,
            )}
          </SettingGroup>
          <SettingGroup title="Alignment & depth">
            <ChoiceControl
              label="Text alignment"
              renderOption={(key) => (
                <Icon name={key as "left" | "center" | "right"} />
              )}
              value={s.layout.align}
              options={[
                ["left", "Left"],
                ["center", "Center"],
                ["right", "Right"],
              ]}
              onChange={(v) =>
                update("layout", "align", v as StyleSettings["layout"]["align"])
              }
            />
            <ChoiceControl
              label="Vertical alignment"
              renderOption={(key) => (
                <Icon
                  name={key === "center" ? "middle" : (key as "top" | "bottom")}
                />
              )}
              value={s.layout.verticalAlign}
              options={[
                ["top", "Top"],
                ["center", "Center"],
                ["bottom", "Bottom"],
              ]}
              onChange={(v) =>
                update(
                  "layout",
                  "verticalAlign",
                  v as StyleSettings["layout"]["verticalAlign"],
                )
              }
            />
            <ChoiceControl
              label="Shadow"
              value={s.layout.shadow}
              options={[
                ["none", "None"],
                ["small", "Subtle"],
                ["medium", "Elevated"],
              ]}
              onChange={(v) =>
                update(
                  "layout",
                  "shadow",
                  v as StyleSettings["layout"]["shadow"],
                )
              }
            />
          </SettingGroup>
        </>
      )}
      {activeCategory === "contentVisibility" && (
        <>
          <SettingGroup title="Fields & order">
            <ol className="style-field-order">
              {s.content.order.map((field, index) => (
                <li key={field}>
                  <label
                    title={
                      field === "name"
                        ? "Course name is always visible"
                        : `Show ${FIELD_NAMES[field]}`
                    }
                  >
                    <input
                      type="checkbox"
                      checked={field === "name" || s.content[field]}
                      disabled={field === "name"}
                      onChange={(event) => {
                        if (field !== "name")
                          update("content", field, event.target.checked);
                      }}
                    />
                    <span>{FIELD_NAMES[field]}</span>
                  </label>
                  <div>
                    <button
                      type="button"
                      aria-label={`Move ${FIELD_NAMES[field]} up`}
                      disabled={index === 0}
                      onClick={() => moveField(index, -1)}
                    >
                      <Icon name="up" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${FIELD_NAMES[field]} down`}
                      disabled={index === s.content.order.length - 1}
                      onClick={() => moveField(index, 1)}
                    >
                      <Icon name="down" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </SettingGroup>
          <SettingGroup title="Display format">
            <ChoiceControl
              label="Time format"
              value={s.content.timeFormat}
              options={[
                ["12h", "2:30 PM"],
                ["24h", "14:30"],
              ]}
              onChange={(v) =>
                update("content", "timeFormat", v as "12h" | "24h")
              }
            />
            <ChoiceControl
              label="Maximum course name lines"
              columns={4}
              renderOption={(key) => (
                <span aria-hidden="true" className="line-choice">
                  {Array.from({ length: Number(key) }, (_, i) => (
                    <i key={i} />
                  ))}
                </span>
              )}
              value={s.content.titleLines}
              options={[
                [1, "1 line"],
                [2, "2 lines"],
                [3, "3 lines"],
                [4, "4 lines"],
              ]}
              onChange={(v) => update("content", "titleLines", Number(v))}
            />
          </SettingGroup>
        </>
      )}
      {activeCategory === "colorPresets" && (
        <>
          <SettingGroup title="Course colors">
            <ChoiceControl
              label="Color source"
              columns={2}
              renderOption={(key, text) => (
                <span className="palette-choice">
                  <span className="palette-strip" aria-hidden="true">
                    {(key === "uniform"
                      ? [s.colors.accent]
                      : key === "course"
                        ? ["#8b8b92", "#b7b7bd", "#d2d2d7"]
                        : PALETTES[key as keyof typeof PALETTES]
                    ).map((color, i) => (
                      <i key={i} style={{ backgroundColor: color }} />
                    ))}
                  </span>
                  <span>{text}</span>
                </span>
              )}
              value={s.colors.source}
              options={[
                ["uniform", "One color"],
                ["course", "My course colors"],
                ["teal", "Teal family"],
                ["spectrum", "Spectrum"],
              ]}
              onChange={(v) =>
                update(
                  "colors",
                  "source",
                  v as StyleSettings["colors"]["source"],
                )
              }
            />
            {s.colors.source === "uniform" && (
              <ColorControl
                label="Card color"
                value={s.colors.accent}
                onChange={(v) => update("colors", "accent", v, true)}
                onEnd={onEnd}
              />
            )}
            {(s.colors.source === "teal" || s.colors.source === "spectrum") && (
              <div className="style-swatches" aria-label="Palette colors">
                {PALETTES[s.colors.source].map((color) => (
                  <span
                    key={color}
                    style={{ background: color }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </SettingGroup>
          <SettingGroup title="Surface & text">
            <ChoiceControl
              label="Card surface"
              renderOption={(key, text) => (
                <span className="surface-choice">
                  <span
                    aria-hidden="true"
                    className={`surface-sample surface-${key}`}
                  >
                    <i />
                    <i />
                  </span>
                  <span>{text}</span>
                </span>
              )}
              value={s.colors.surface}
              options={[
                ["solid", "Solid"],
                ["soft", "Soft tint"],
                ["outline", "Outline"],
              ]}
              onChange={(v) =>
                update(
                  "colors",
                  "surface",
                  v as StyleSettings["colors"]["surface"],
                )
              }
            />
            <ChoiceControl
              label="Text color"
              value={s.colors.textMode}
              options={[
                ["auto", "Auto"],
                ["custom", "Custom"],
              ]}
              onChange={(v) =>
                update("colors", "textMode", v as "auto" | "custom")
              }
            />
            {s.colors.textMode === "custom" && (
              <ColorControl
                label="Custom text"
                value={s.colors.text}
                onChange={(v) => update("colors", "text", v, true)}
                onEnd={onEnd}
              />
            )}
          </SettingGroup>
        </>
      )}
    </div>
  );
}

export { StylePreviewGrid } from "./StylePreviewGrid";
export { StyleToolbar } from "./StyleToolbar";
export { CategoryBar, type StyleCategory } from "./CategoryBar";
