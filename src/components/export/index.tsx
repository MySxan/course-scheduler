import React from "react";

export const ExportControlPanel: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-4">
          <h3 className="card-title text-base mb-4">Export Settings</h3>

          {/* Format */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Format</span>
            </label>
            <select className="select select-bordered w-full">
              <option>PNG Image</option>
              <option>JPG Image</option>
              <option>SVG Vector</option>
            </select>
          </div>

          {/* Resolution */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Resolution</span>
            </label>
            <div className="join w-full">
              <button className="join-item btn btn-sm flex-1 btn-active">
                1x
              </button>
              <button className="join-item btn btn-sm flex-1">2x</button>
              <button className="join-item btn btn-sm flex-1">4x</button>
            </div>
          </div>

          {/* Background */}
          <div className="form-control w-full mt-4">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                defaultChecked
              />
              <span className="label-text">Transparent Background</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-4">
          <button className="btn btn-primary w-full">Download Schedule</button>
        </div>
      </div>
    </div>
  );
};

export const ExportPreviewArea: React.FC = () => {
  return (
    <div className="card border-dotted border-primary border-2 flex items-center justify-center">
      <div className="card-body h-full p-8 flex flex-col items-center text-center">
        
          
       
        <h3 className="text-lg font-bold">Export Preview</h3>
        <p className="text-sm">A snapshot of your schedule will appear here</p>
      </div>
    </div>
  );
};
