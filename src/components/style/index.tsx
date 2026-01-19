import React, { useState } from "react";
import type { StyleCategory } from "./CategoryBar";

interface StyleSidebarProps {
  activeCategory: StyleCategory;
}

export const StyleSidebar: React.FC<StyleSidebarProps> = ({
  activeCategory,
}) => {
  const [capitalization, setCapitalization] = useState<
    "none" | "upper" | "title" | "lower"
  >("none");

  return (
    <div className="flex flex-col gap-4">
      {activeCategory === "typography" && (
        <>
          {/* Basic Typography Settings */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body p-4 space-y-2">
              <div className="card-title text-base flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-primary"
                >
                  <path d="M12 4v16" />
                  <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
                  <path d="M9 20h6" />
                </svg>
                Basic Settings
              </div>

              {/* Font Family */}
              <div className="form-control">
                <label className="label mb-1">
                  <span className="label-text">Font Family</span>
                </label>
                <select className="select inline border-base-300 rounded-md w-full focus:outline-primary focus-within:outline-primary">
                  <option value="sans">Sans</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Monospace</option>
                  <option value="geist">Geist Sans</option>
                </select>
              </div>

              <div className="flex flex-1 gap-4">
                {/* Font Size */}
                <div className="form-control flex-1">
                  <label className="label mb-1 flex justify-between">
                    <span className="label-text font-medium">Font Size</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="10"
                      max="24"
                      defaultValue="14"
                      className="input input-md border-base-300 focus:outline-primary"
                    />
                  </div>
                </div>

                {/* Line Height */}
                <div className="form-control flex-1">
                  <label className="label mb-1 flex justify-between">
                    <span className="label-text font-medium">Line Height</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="1"
                      max="2.5"
                      step="0.1"
                      defaultValue="1.5"
                      className="input input-md border-base-300 focus:outline-primary"
                    />
                  </div>
                </div>

                {/* Spacing */}
                <div className="form-control flex-1">
                  <label className="label mb-1 flex justify-between">
                    <span className="label-text font-medium">Spacing</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="-2"
                      max="4"
                      step="0.1"
                      defaultValue="0"
                      className="input input-md border-base-300 focus:outline-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-1 gap-4">
                {/* Title Weight */}
                <div className="form-control flex-1">
                  <label className="label mb-1">
                    <span className="label-text">Title Weight</span>
                  </label>
                  <select className="select inline border-base-300 rounded-md w-full focus:outline-primary focus-within:outline-primary">
                    <option value="300">Light (300)</option>
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600" selected>
                      Semibold (600)
                    </option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extrabold (800)</option>
                  </select>
                </div>

                {/* Content Weight */}
                <div className="form-control flex-1">
                  <label className="label mb-1">
                    <span className="label-text">Content Weight</span>
                  </label>
                  <select className="select inline border-base-300 rounded-md w-full focus:outline-primary focus-within:outline-primary">
                    <option value="300">Light (300)</option>
                    <option value="400" selected>
                      Regular (400)
                    </option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semibold (600)</option>
                    <option value="700">Bold (700)</option>
                  </select>
                </div>
              </div>

              {/* Title Weight Axis */}
              <div className="form-control">
                <label className="label py-1 flex justify-between">
                  <span className="label-text text-sm">Title Weight Axis</span>
                  <span className="label-text-alt tabular-nums">500</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="900"
                  step="10"
                  defaultValue="500"
                  className="range range-xs range-primary w-full"
                />
                <div className="w-full flex justify-between text-xs mt-1 opacity-70 tabular-nums">
                  <span>100</span>
                  <span>500</span>
                  <span>900</span>
                </div>
              </div>

              {/* Content Weight Axis */}
              <div className="form-control">
                <label className="label py-1 flex justify-between">
                  <span className="label-text text-sm">
                    Content Weight Axis
                  </span>
                  <span className="label-text-alt tabular-nums">300</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="900"
                  step="10"
                  defaultValue="300"
                  className="range range-xs range-primary w-full"
                />
                <div className="w-full flex justify-between text-xs mt-1 opacity-70 tabular-nums">
                  <span>100</span>
                  <span>500</span>
                  <span>900</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Metrics */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body p-4 space-y-2">
              <div className="card-title text-base flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-primary"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                Advanced Metrics
              </div>

              {/* Ascender Trim */}
              <div className="form-control">
                <label className="label cursor-pointer flex justify-center">
                  <div className="flex-1">
                    <span className="label-text font-medium">
                      Ascender Trim
                    </span>
                    <div className="label-text-alt text-xs opacity-70">
                      Remove excess space above capital letters
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary shadow-none before:shadow-none after:shadow-none bg-transparent"
                  />
                </label>
              </div>

              {/* Tabular Numbers */}
              <div className="form-control">
                <label className="label cursor-pointer flex justify-center">
                  <div className="flex-1">
                    <span className="label-text font-medium">
                      Tabular Numbers
                    </span>
                    <div className="label-text-alt text-xs opacity-70">
                      Fixed-width digits for alignment
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary shadow-none before:shadow-none after:shadow-none bg-transparent"
                    defaultChecked
                  />
                </label>
              </div>

              {/* Capitalization */}
              <div className="form-control">
                <label className="label mb-1">
                  <span className="label-text">Capitalization</span>
                </label>
                <div className="join flex-1 flex w-full gap-0 rounded-lg">
                  <button
                    type="button"
                    className={`btn joined-item font-normal py-1.5 rounded-l-md rounded-r-none border flex-1 transition-colors ${
                      capitalization === "none"
                        ? "bg-primary-content border-primary shadow-primary shadow-[inset_0_0_0_1px] text-primary"
                        : "bg-base-100"
                    }`}
                    onClick={() => setCapitalization("none")}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    className={`btn joined-item rounded-none font-normal py-1.5 border flex-1 transition-colors ${
                      capitalization === "upper"
                        ? "bg-primary-content border-primary shadow-primary shadow-[inset_0_0_0_1px] text-primary"
                        : "bg-base-100"
                    }`}
                    onClick={() => setCapitalization("upper")}
                  >
                    ABC
                  </button>
                  <button
                    type="button"
                    className={`btn joined-item rounded-none font-normal py-1.5 border flex-1 transition-colors ${
                      capitalization === "title"
                        ? "bg-primary-content border-primary shadow-primary shadow-[inset_0_0_0_1px] text-primary"
                        : "bg-base-100"
                    }`}
                    onClick={() => setCapitalization("title")}
                  >
                    Abc
                  </button>
                  <button
                    type="button"
                    className={`btn joined-item rounded-r-md rounded-l-none font-normal py-1.5 border flex-1 transition-colors ${
                      capitalization === "lower"
                        ? "bg-primary-content border-primary shadow-primary shadow-[inset_0_0_0_1px] text-primary"
                        : "bg-base-100"
                    }`}
                    onClick={() => setCapitalization("lower")}
                  >
                    abc
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeCategory === "cardLayout" && (
        <>
          <div className="text-sm text-base-content/50 italic">Card layout</div>
        </>
      )}

      {activeCategory === "contentVisibility" && (
        <>
          <div className="text-sm text-base-content/50 italic">
            Content visibility
          </div>
        </>
      )}

      {activeCategory === "colorPresets" && (
        <>
          <div className="text-sm text-base-content/50 italic">
            Color presets
          </div>
        </>
      )}
    </div>
  );
};

export const StylePreviewGrid: React.FC = () => {
  return <div className="grid grid-cols-5 gap-4"></div>;
};

export { CategoryBar, type StyleCategory } from "./CategoryBar";

export default {};
