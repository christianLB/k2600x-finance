import React from "react";
import { Button } from "@k2600x/design-system";

/**
 * Sidebar navigation for admin collections.
 * @param collections Array of collections to show (key/label)
 * @param selectedCollection Currently selected collection key
 * @param onSelect Callback when a collection is selected
 */
export interface AdminSidebarProps {
  collections: { key: string; label: string }[];
  selectedCollection: string | null;
  onSelect: (key: string) => void;
  className?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collections,
  selectedCollection,
  onSelect,
  className = "",
}) => {
  return (
    <aside className={`p-4 h-full ${className}`}>
      <h2 className="text-lg font-semibold mb-4">Collections</h2>
      <nav className="flex flex-col space-y-1">
        {collections.map((col) => (
          <Button
            key={col.key}
            variant="ghost"
            className={`justify-start px-3 py-2 text-left ${
              col.key === selectedCollection
                ? "bg-primary/10 font-medium text-primary"
                : "hover:bg-muted text-foreground"
            }`}
            onClick={() => onSelect(col.key)}
          >
            {col.label}
          </Button>
        ))}
      </nav>
    </aside>
  );
};
