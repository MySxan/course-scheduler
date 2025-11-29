import React from "react";
import type { StyleCategory } from "./CategoryBar";

interface StyleSidebarProps {
  activeCategory: StyleCategory;
}

export const StyleSidebar: React.FC<StyleSidebarProps> = ({
  activeCategory,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {activeCategory === "typography" && (
        <>
          <div className="text-sm text-base-content/50 italic">Typography</div>
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
