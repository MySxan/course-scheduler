import React, { useEffect, useRef, useState } from "react";

export type TabType = "preview" | "courses" | "export" | "style";

interface TopNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLogoClick?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onLogoClick,
}) => {
  const tabs = React.useMemo<
    { id: TabType; label: string; icon: React.ReactNode }[]
  >(
    () => [
      {
        id: "courses",
        label: "Courses",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        ),
      },
      {
        id: "preview",
        label: "Preview",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        ),
      },
      {
        id: "style",
        label: "Style",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 20.5 3 21l.5-4.5 13.732-13.768z"
            />
          </svg>
        ),
      },
      {
        id: "export",
        label: "Export",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        ),
      },
    ],
    []
  );

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorLeft, setIndicatorLeft] = useState(0);
  const [indicatorWidth, setIndicatorWidth] = useState(0);

  useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    const el = tabRefs.current[activeIndex];
    if (el) {
      setIndicatorLeft(el.offsetLeft);
      setIndicatorWidth(el.offsetWidth);
    }
  }, [activeTab, tabs]);

  return (
    <div className="bg-base-100 border-b border-base-200 px-4 h-full flex items-center">
      <div className="flex-1 flex items-center">
        <button
          onClick={onLogoClick}
          className="btn btn-ghost hover:bg-transparent hover:shadow-none hover:border-transparent text-xl gap-3 px-1"
        >
          <img src="/icon-192.png" alt="Course Scheduler" className="h-8 w-8" />
          <h1>Course Scheduler</h1>
        </button>
      </div>
      <div className="flex-none h-full">
        <div className="relative flex h-full">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              onClick={() => onTabChange(tab.id)}
              className={`flex justify-center items-center w-28 gap-2 pr-1 text-sm font-bold  transition-colors ${
                activeTab === tab.id
                  ? "text-base-content"
                  : "text-base-content/60 hover:text-base-content"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}

          <span
            className="absolute bottom-0 h-[4px] bg-primary transition-all duration-100"
            style={{
              width: indicatorWidth,
              transform: `translateX(${indicatorLeft}px)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
