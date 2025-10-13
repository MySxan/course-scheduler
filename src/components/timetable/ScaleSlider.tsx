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
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);

  const THUMB_WIDTH_PX = 40;
  const THUMB_HALF = THUMB_WIDTH_PX / 2;
  const percentage = Math.max(0, Math.min(1, (value - min) / (max - min)));

  // measure slider width on mount and when resized
  useEffect(() => {
    const measure = () => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      setSliderWidth(rect.width);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (sliderRef.current) ro.observe(sliderRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // usable width for movement (thumb center moves between THUMB_HALF .. sliderWidth - THUMB_HALF)
  const usableWidth = Math.max(0, sliderWidth - THUMB_WIDTH_PX);

  // compute pixel positions that keep fill and thumb perfectly aligned
  const thumbCenterPx = THUMB_HALF + percentage * usableWidth; // thumb center x in px from container left
  const fillWidthPx = thumbCenterPx; // fill should extend to thumb center

  // Clamp helper for stepping and bounds
  const clampValue = useCallback(
    (newValue: number) => {
      const steppedValue = Math.round(newValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    },
    [min, max, step]
  );

  // Update value based on mouse position (uses measured width)
  const updateValueFromPosition = useCallback(
    (clientX: number) => {
      if (!sliderRef.current || sliderWidth === 0) return;
      const rect = sliderRef.current.getBoundingClientRect();
      // compute position relative to left edge, then clamp to THUMB_HALF .. sliderWidth - THUMB_HALF
      const relativeX = clientX - rect.left;
      const clampedX = Math.max(
        THUMB_HALF,
        Math.min(rect.width - THUMB_HALF, relativeX)
      );
      // percentage across usable width
      const pct = (clampedX - THUMB_HALF) / Math.max(1, usableWidth);
      const newValue = min + (max - min) * pct;
      onChange(clampValue(newValue));
    },
    [sliderWidth, THUMB_HALF, usableWidth, min, max, onChange, clampValue]
  );

  // Mouse handling
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

  // touch support
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      updateValueFromPosition(e.touches[0].clientX);
    };
    const handleTouchEnd = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
      document.addEventListener("touchcancel", handleTouchEnd);
      return () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
        document.removeEventListener("touchcancel", handleTouchEnd);
      };
    }
  }, [isDragging, updateValueFromPosition]);

  return (
    <div className={`w-full ${className}`}>
      <div className="form-control">
        <label className="label  mb-2 flex justify-between">
          <span className="label-text font-medium">{label}</span>
          <span className="label-text-alt badge badge-outline badge-sm font-mono">
            {value.toFixed(1)}x
          </span>
        </label>

        <div className="relative w-full">
          {/* slider container */}
          <div
            ref={sliderRef}
            className="relative h-6 rounded-full bg-base-300 cursor-pointer shadow-inner focus:outline-2 focus:outline-primary focus:outline-offset-2 overflow-hidden select-none"
            onMouseDown={handleMouseDown}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="slider"
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-label={`${label} slider`}
            onTouchStart={(e) => {
              e.preventDefault();
              setIsDragging(true);
              updateValueFromPosition(e.touches[0].clientX);
            }}
          >
            {/* Track background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/40" />

            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-accent transition-all duration-150 ease-out"
              style={{
                width: `${fillWidthPx}px`,
              }}
            />

            {/* Thumb */}
            <div
              className={`absolute top-1/2 w-10 h-6 rounded-full bg-accent border-2 border-accent-content shadow-lg transition-all duration-150 ease-out transform -translate-y-1/2 ${
                isDragging
                  ? "scale-110 shadow-xl cursor-grabbing"
                  : "hover:scale-105 cursor-grab focus:scale-105"
              }`}
              style={{
                left: `${thumbCenterPx}px`,
                transform: `${isDragging ? "translate(-50%, -50%)" : "translate(-50%, -50%)"}`,
              }}
            />
          </div>

          {/* Scale markers */}
          <div className="flex justify-between text-xs text-base-content/60 mt-2 px-0.5">
            <span className="badge badge-xs">{min}x</span>
            <span className="badge badge-xs">1.0x</span>
            <span className="badge badge-xs">{max}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};
