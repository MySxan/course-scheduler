import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  accessory,
}: {
  title: string;
  description?: string;
  accessory?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {accessory && <div className="page-header-accessory">{accessory}</div>}
    </div>
  );
}
