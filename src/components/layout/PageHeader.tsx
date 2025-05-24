import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  actions,
  className = "" 
}: PageHeaderProps) {
  return (
    <div className={`w-full text-left mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-center w-full">
        <h1 className="text-2xl font-bold text-left w-full">{title}</h1>
        {actions && <div className="flex items-center space-x-2 mt-2 md:mt-0">{actions}</div>}
      </div>
      {description && (
        <p className="text-muted-foreground mt-1 text-left">{description}</p>
      )}
    </div>
  );
}
