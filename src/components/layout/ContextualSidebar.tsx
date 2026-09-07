import type { ReactNode } from "react";
import type { TabType } from "./TopNav";

const titles: Record<TabType, string> = {
  courses: "Course details",
  preview: "Layout",
  style: "Appearance",
  export: "Export options",
};

export function ContextualSidebar({
  activeTab,
  children,
}: {
  activeTab: TabType;
  children: ReactNode;
}) {
  return (
    <aside className="contextual-sidebar" aria-label={titles[activeTab]}>
      <div className="inspector-header">
        <h2>{titles[activeTab]}</h2>
      </div>
      <div className="inspector-content">{children}</div>
    </aside>
  );
}
