import React from "react";

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
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collections,
  selectedCollection,
  onSelect,
}) => {
  return (
    <aside style={{ minWidth: 220, borderRight: "1px solid #eee", padding: 16 }}>
      <h2 style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Collections</h2>
      <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {collections.map((col) => (
          <button
            key={col.key}
            style={{
              background: col.key === selectedCollection ? "#f0f4ff" : "transparent",
              fontWeight: col.key === selectedCollection ? 600 : 400,
              border: "none",
              borderRadius: 4,
              padding: "8px 12px",
              textAlign: "left",
              cursor: "pointer",
              color: col.key === selectedCollection ? "#1a237e" : "#333",
            }}
            onClick={() => onSelect(col.key)}
          >
            {col.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};
