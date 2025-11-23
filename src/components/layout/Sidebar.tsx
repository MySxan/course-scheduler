import React from "react";

interface SidebarProps {
  onOpenUpload: () => void;
  onOpenManual: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenUpload,
  onOpenManual,
}) => {
  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-base-300 flex flex-col items-center py-8 gap-6 shadow-lg z-50">
      <div className="tooltip tooltip-right" data-tip="Upload CSV">
        <button
          onClick={onOpenUpload}
          className="btn btn-circle btn-ghost hover:bg-base-100 text-base-content"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        </button>
      </div>

      <div className="tooltip tooltip-right" data-tip="Add Manually">
        <button
          onClick={onOpenManual}
          className="btn btn-circle btn-ghost hover:bg-base-100 text-base-content"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
