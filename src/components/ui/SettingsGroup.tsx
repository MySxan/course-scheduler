import { useId, type ReactNode } from "react";

/** Shared inspector section. The surface belongs to the inspector, not each field. */
export function SettingsGroup({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <section className={`settings-group ${className}`} aria-labelledby={id}>
      <h3 className="section-heading" id={id}>
        {title}
      </h3>
      <div className="settings-group-body">{children}</div>
    </section>
  );
}
