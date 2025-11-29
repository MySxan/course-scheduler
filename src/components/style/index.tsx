import React from "react";

export const StyleSidebar: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-md font-semibold mb-2">Typography</h2>
      </div>

      <div>
        <h2 className="text-md font-semibold mb-2">Card Shape</h2>
      </div>

      <div className="form-control">
        <label className="label w-full flex justify-between mb-1">
          <span className="label-text font-medium">Card Padding</span>
          <span className="label-text-alt">{}%</span>
        </label>
        <input
          type="range"
          min="50"
          max="200"
          step="1"
          className="range range-xs range-primary w-full"
        />
        <div className="w-full flex justify-between text-xs mt-1 opacity-70 tabular-nums">
          <span>50%</span>
          <span className="ml-2">100%</span>
          <span>150%</span>
          <span>200%</span>
        </div>
      </div>

      <div className="form-control">
        <label className="label flex items-center gap-4 cursor-pointer">
          <div className="flex-1">
            <span className="label-text font-medium">Time Display</span>
            <div className="label-text-alt text-xs opacity-70">
              Show or hide time on cards
            </div>
          </div>
          <input
            type="checkbox"
            className="checkbox checkbox-primary w-5 h-5"
          />
        </label>
      </div>

      <div>
        <h2 className="text-md font-semibold mb-2">Color Presets</h2>
        <div className="grid grid-cols-5 gap-2">
          {[
            "bg-primary",
            "bg-secondary",
            "bg-accent",
            "bg-emerald-500",
            "bg-amber-500",
            "bg-rose-500",
            "bg-cyan-500/80",
            "bg-fuchsia-500/80",
            "bg-lime-500/80",
            "bg-indigo-500/80",
          ].map((cls, idx) => (
            <button
              key={idx}
              className={`h-8 w-full rounded-md ${cls}`}
              aria-label={`Preset ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const StylePreviewGrid: React.FC = () => {
  return <div className="grid grid-cols-5 gap-4"></div>;
};

export default {};
