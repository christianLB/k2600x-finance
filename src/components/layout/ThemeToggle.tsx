"use client";

import { Button, Icon, useTheme } from "@k2600x/design-system";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "futuristic" : "light";
    setTheme(nextTheme);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleToggle} aria-label="Toggle theme">
      <Icon
        name={theme === "light" ? "Moon" : theme === "dark" ? "Star" : "Sun"}
        size="sm"
        aria-hidden
      />
    </Button>
  );
}
