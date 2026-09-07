import { SettingsGroup } from "../ui/SettingsGroup";
import { useEffect, useId, useState, type ReactNode } from "react";

export function SettingGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return <SettingsGroup title={title}>{children}</SettingsGroup>;
}

export function NumberControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "px",
  onChange,
  onEnd,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  onEnd: () => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return (
    <div className="style-number">
      <div className="style-number-heading">
        <label htmlFor={id}>{label}</label>
        <div className="style-number-value">
          <input
            id={id}
            type="number"
            min={min}
            max={max}
            step={step}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              const next = event.target.valueAsNumber;
              if (Number.isFinite(next) && next >= min && next <= max)
                onChange(next);
            }}
            onBlur={() => {
              const next = draft.trim() ? Number(draft) : value;
              const safe = Number.isFinite(next)
                ? Math.min(max, Math.max(min, next))
                : value;
              setDraft(String(safe));
              onChange(safe);
              onEnd();
            }}
          />
          <span>{unit}</span>
        </div>
      </div>
      <input
        type="range"
        aria-label={`${label} slider`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerUp={onEnd}
        onKeyUp={onEnd}
      />
    </div>
  );
}

export function ChoiceControl({
  label,
  value,
  options,
  onChange,
  renderOption,
  columns,
}: {
  label: string;
  value: string | number;
  options: readonly (readonly [string | number, string])[];
  onChange: (value: string) => void;
  renderOption?: (key: string | number, text: string) => ReactNode;
  columns?: number;
}) {
  const name = useId();
  return (
    <fieldset className="choice-field">
      <legend>{label}</legend>
      <div
        className="choice-options"
        style={{
          gridTemplateColumns: `repeat(${columns ?? Math.min(options.length, 3)}, minmax(0, 1fr))`,
        }}
      >
        {options.map(([key, text]) => (
          <label className="choice-option" key={key}>
            <input
              type="radio"
              name={name}
              value={key}
              aria-label={text}
              checked={String(value) === String(key)}
              onChange={() => onChange(String(key))}
            />
            <span className="choice-face" title={text}>
              {renderOption ? renderOption(key, text) : text}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ToggleControl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="setting-toggle-row">
      <span>{label}</span>
      <input
        type="checkbox"
        className="switch-input"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export function ColorControl({
  label,
  value,
  onChange,
  onEnd,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onEnd: () => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <div className="style-field">
      <span>{label}</span>
      <div className="style-color-input">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onEnd}
        />
        <input
          type="text"
          aria-label={`${label} hex`}
          value={draft}
          maxLength={7}
          spellCheck={false}
          onChange={(event) => {
            setDraft(event.target.value);
            if (/^#[0-9a-f]{6}$/i.test(event.target.value))
              onChange(event.target.value);
          }}
          onBlur={() => {
            setDraft(value);
            onEnd();
          }}
        />
      </div>
    </div>
  );
}
