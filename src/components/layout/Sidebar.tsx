import React from "react";

export type PanelType = "import" | "add" | "style" | "settings" | null;

interface SidebarProps {
  activePanel: PanelType;
  onPanelSelect: (panel: PanelType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePanel,
  onPanelSelect,
}) => {
  const handlePanelClick = (panel: PanelType) => {
    if (activePanel === panel) {
      onPanelSelect(null);
    } else {
      onPanelSelect(panel);
    }
  };

  const getButtonClass = (panel: PanelType) => {
    const baseClass =
      "btn btn-circle btn-ghost hover:bg-base-100 text-base-content transition-all duration-200";
    return activePanel === panel
      ? `${baseClass} bg-primary text-primary-content hover:bg-primary hover:text-primary-content`
      : baseClass;
  };

  return (
    <div className="fixed left-0 top-0 h-full w-14 bg-base-300 flex flex-col items-center py-4 gap-4 shadow-lg z-50 border-r border-base-content/5">
      {/* Add Course */}
      <div className="tooltip tooltip-right" data-tip="Add Course">
        <button
          onClick={() => handlePanelClick("add")}
          className={getButtonClass("add")}
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

      {/* Card Style */}
      <div className="tooltip tooltip-right" data-tip="Card Style">
        <button
          onClick={() => handlePanelClick("style")}
          className={getButtonClass("style")}
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
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1" />

      {/* Settings */}
      <div className="tooltip tooltip-right" data-tip="Settings">
        <button
          onClick={() => handlePanelClick("settings")}
          className={getButtonClass("settings")}
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
