import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // State to ensure the toggle group value is updated when the theme changes
  const [currentTheme, setCurrentTheme] = useState("system");

  // Update the toggle group value when the theme changes
  useEffect(() => {
    if (theme) setCurrentTheme(theme);
  }, [theme]);

  return (
    <ToggleGroup
      type="single"
      value={currentTheme}
      onValueChange={setTheme}
      variant="outline"
      size="sm">
      <ToggleGroupItem value="light" aria-label="Light theme">
        <Sun className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Dark theme">
        <Moon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="system" aria-label="System theme">
        <Monitor className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
