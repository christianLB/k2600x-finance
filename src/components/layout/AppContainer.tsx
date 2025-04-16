import React from "react";

export function AppContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
        {children}
      </div>
    </div>
  );
}
