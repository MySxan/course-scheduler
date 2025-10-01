import React, { useRef, useState, useCallback, useEffect } from "react";

interface HorizontalScaleSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const VerticalScaleSlider: React.FC<HorizontalScaleSliderProps> = ({
  value,
  onChange,
  min = 0.5,
  max = 1.5,
  step = 0.1,
  className = "",
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width)
      );
      const newValue = min + (max - min) * percentage;
      const steppedValue = Math.round(newValue / step) * step;

      onChange(Math.max(min, Math.min(max, steppedValue)));
    },
    [isDragging, min, max, step, onChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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

  // Calculate thumb position for horizontal slider
  const thumbPosition = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Vertical Scale</span>
          <span className="label-text-alt badge badge-primary badge-sm font-mono">
            {value.toFixed(1)}x
          </span>
        </label>

        {/* Horizontal Slider */}
        <div className="relative w-full">
          <div
            ref={sliderRef}
            className="relative h-6 rounded-full bg-base-300 cursor-pointer shadow-inner"
            onMouseDown={handleMouseDown}
          >
            {/* Track with gradient */}
            <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-primary/30 to-primary/60" />

            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-150"
              style={{ width: `${thumbPosition}%` }}
            />

            {/* Thumb */}
            <div
              className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary-content border-2 border-primary shadow-lg transition-all duration-150 cursor-grab ${
                isDragging
                  ? "scale-110 shadow-xl cursor-grabbing"
                  : "hover:scale-105"
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
