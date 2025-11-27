import React from "react";

export const ExportControlPanel: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-4 space-y-2">
          <div className="card-title text-base flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 21h8" />
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
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
      <button className="btn btn-primary w-full">Download Schedule</button>
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
