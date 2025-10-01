import React, { useRef, useState, useCallback, useEffect } from "react";

interface ScaleSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

export const ScaleSlider: React.FC<ScaleSliderProps> = ({
  value,
  onChange,
  min = 0.5,
  max = 1.5,
  step = 0.1,
  label = "Scale",
  className = "",
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate thumb position as percentage
  const thumbPosition = ((value - min) / (max - min)) * 100;

  // Clamp and step value
  const clampValue = useCallback(
    (newValue: number) => {
      const steppedValue = Math.round(newValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    },
    [min, max, step]
  );

  // Update value based on mouse position
  const updateValueFromPosition = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      const newValue = min + (max - min) * percentage;
      onChange(clampValue(newValue));
    },
    [min, max, onChange, clampValue]
  );

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      updateValueFromPosition(e.clientX);
    },
    [updateValueFromPosition]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      updateValueFromPosition(e.clientX);
    },
    [isDragging, updateValueFromPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newValue = value;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown":
          e.preventDefault();
          newValue = value - step;
          break;
        case "ArrowRight":
        case "ArrowUp":
          e.preventDefault();
          newValue = value + step;
          break;
        case "Home":
          e.preventDefault();
          newValue = min;
          break;
        case "End":
          e.preventDefault();
          newValue = max;
          break;
        default:
          return;
      }

      onChange(clampValue(newValue));
    },
    [value, step, min, max, onChange, clampValue]
  );

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={`w-full ${className}`}>
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">{label}</span>
          <span className="label-text-alt badge badge-primary badge-sm font-mono">
            {value.toFixed(1)}x
          </span>
        </label>

        <div className="relative w-full">
          <div
            ref={sliderRef}
            className="relative h-6 rounded-full bg-base-300 cursor-pointer shadow-inner focus:outline-2 focus:outline-primary focus:outline-offset-2"
            onMouseDown={handleMouseDown}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="slider"
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-label={`${label} slider`}
          >
            {/* Track background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/40" />

            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-blue-400 transition-all duration-200 ease-out"
              style={{ width: `${thumbPosition}%` }}
            />

            {/* Thumb */}
            <div
              className={`absolute top-1/2 w-10 h-6 rounded-full bg-blue-500 border-2 border-primary shadow-lg transition-all duration-200 ease-out transform -translate-y-1/2 -translate-x-1/2 ${
                isDragging
                  ? "scale-110 shadow-xl cursor-grabbing"
                  : "hover:scale-105 cursor-grab focus:scale-105"
              }`}
              style={{ left: `${thumbPosition}%` }}
            />
          </div>

          {/* Scale markers */}
          <div className="flex justify-between text-xs text-base-content/60 mt-2 px-1">
            <span className="badge badge-ghost badge-xs">{min}x</span>
            <span className="badge badge-ghost badge-xs">1.0x</span>
            <span className="badge badge-ghost badge-xs">{max}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};

