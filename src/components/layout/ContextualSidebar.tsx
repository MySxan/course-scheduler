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
    <div className="w-96 bg-base-100 border-r border-base-200 h-[calc(100vh-64px)] flex flex-col sticky top-16 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">{children}</div>
    </div>
  );
};
