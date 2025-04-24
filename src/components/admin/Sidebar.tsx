import React from "react";

interface SidebarProps {
  collections: { key: string; label: string }[];
  selectedCollection: string | null;
  onSelectCollection: (key: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collections, selectedCollection, onSelectCollection }) => {
  return (
    <nav
      style={{
        width: 220,
        minHeight: "100vh",
        borderRight: "1px solid #eee",
        padding: "1rem 0.5rem",
        background: "#fafbfc",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
      aria-label="Collections navigation"
    >
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18, paddingLeft: 8 }}>Collections</div>
      {collections.map((col) => (
        <button
          key={col.key}
          onClick={() => onSelectCollection(col.key)}
          style={{
            textAlign: "left",
            background: col.key === selectedCollection ? "#e6f0fa" : "transparent",
            border: "none",
            padding: "8px 12px",
            borderRadius: 6,
            fontWeight: col.key === selectedCollection ? 600 : 400,
            color: col.key === selectedCollection ? "#1565c0" : "#222",
            cursor: "pointer",
            marginBottom: 2,
            outline: col.key === selectedCollection ? "2px solid #1976d2" : undefined,
          }}
          aria-current={col.key === selectedCollection ? "page" : undefined}
        >
          {col.label}
        </button>
      ))}
    </nav>
  );
};
