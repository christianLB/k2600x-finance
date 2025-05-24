import React from "react";

interface SectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, description, children, className }: SectionProps) {
  return (
    <section className={`mb-8 ${className || ""}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
