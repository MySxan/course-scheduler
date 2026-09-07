import React from "react";

export type StyleCategory =
  | "typography"
  | "cardLayout"
  | "contentVisibility"
  | "colorPresets";

interface CategoryBarProps {
  activeCategory: StyleCategory;
  onCategoryChange: (category: StyleCategory) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  const categories: {
    id: StyleCategory;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "typography",
      label: "Typography",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-type-icon lucide-type p-0.5"
        >
          <path d="M12 4v16" />
          <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
          <path d="M9 20h6" />
        </svg>
      ),
    },
    {
      id: "cardLayout",
      label: "Layout",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-panel-top-dashed-icon lucide-panel-top-dashed p-0.5"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M14 9h1" />
          <path d="M19 9h2" />
          <path d="M3 9h2" />
          <path d="M9 9h1" />
        </svg>
      ),
    },
    {
      id: "contentVisibility",
      label: "Content",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-eye-off-icon lucide-eye-off p-0.5"
        >
          <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
          <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
          <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
          <path d="m2 2 20 20" />
        </svg>
      ),
    },
    {
      id: "colorPresets",
      label: "Colors",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-palette-icon lucide-palette p-0.5"
        >
          <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <div className="style-category-bar">
      <div className="style-category-grid">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            aria-pressed={activeCategory === category.id}
            className="style-category"
            title={category.label}
          >
            {category.icon}
            <span className="style-category-label">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
