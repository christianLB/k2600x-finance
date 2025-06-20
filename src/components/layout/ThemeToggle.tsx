"use client";

import { Button, Icon, useTheme } from "@k2600x/design-system";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleToggle} aria-label="Toggle theme">
      <Icon name={theme === "dark" ? "Sun" : "Moon"} size="sm" aria-hidden />
    </Button>
  );
}
