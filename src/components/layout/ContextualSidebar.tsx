import React from "react";
import { type TabType } from "./TopNav";

interface ContextualSidebarProps {
  activeTab: TabType;
  children: React.ReactNode;
}

export const ContextualSidebar: React.FC<ContextualSidebarProps> = ({
  children,
}) => {
  return (
    <div className="w-96 flex-none bg-base-100 border-r border-base-200 flex flex-col overflow-visible">
      <div className="flex-1 overflow-visible">{children}</div>
    </div>
  );
};
