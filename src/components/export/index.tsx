import React from "react";

export const ExportControlPanel: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
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
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="w-4 h-4 text-primary"
            >
              <path d="M14 17H5" />
              <path d="M19 7h-9" />
              <circle cx="17" cy="17" r="3" />
              <circle cx="7" cy="7" r="3" />
            </svg>
            Export Settings
          </div>

          {/* Format */}
          <div className="form-control">
            <label className="label mb-1">
              <span className="label-text">Format</span>
            </label>
            <select className="select inline border-base-300 rounded-md w-full">
              <option>PNG Image</option>
              <option>JPG Image</option>
              <option>SVG Vector</option>
            </select>
          </div>

          {/* Resolution */}
          <div className="form-control">
            <label className="label mb-1">
              <span className="label-text">Resolution</span>
            </label>
            <div className="join w-full gap-rounded-full ">
              <button className="join-item font-normal py-1.5 rounded-md border flex-1 transition-colors">
                1x
              </button>
              <button className="join-item font-normal py-1.5 rounded-md border flex-1 transition-colors">
                2x
              </button>
              <button className="join-item font-normal py-1.5 rounded-md border flex-1 transition-colors">
                4x
              </button>
            </div>
          </div>

          {/* Background */}
          <div className="form-control">
            <label className="label cursor-pointer flex justify-center">
              <div className="flex-1">
                <span className="label-text font-medium">
                  Transparent Background
                </span>
                <div className="label-text-alt text-xs opacity-70">
                  Export without background color
                </div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                defaultChecked
              />
            </label>
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full px-6 py-2 rounded-md font-medium transition-colors"
      >
        Download Schedule
      </button>
    </div>
  );
};

export const ExportPreviewArea: React.FC = () => {
  return (
    <div className="card h-full w-full border-dotted border-primary border-2 flex flex-col items-center justify-center">
      <div className="flex flex-col gap-2 items-center justify-center -mt-16">
        <h3 className="text-lg font-bold">Export Preview</h3>
        <p className="text-sm">A snapshot of your schedule will appear here</p>
      </div>
    </div>
  );
};
