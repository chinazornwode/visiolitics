import { useColorScheme } from "react-native";

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    isDark,
    colors: {
      // Background colors
      background: isDark ? "#121212" : "#F6F7F9",
      surface: isDark ? "#1E1E1E" : "#FFFFFF",
      surfaceVariant: isDark ? "#2A2A2A" : "#F0F0F2",

      // Text colors
      primary: isDark ? "#DEDEDE" : "#0A0A12",
      secondary: isDark ? "#B3B3B3" : "#606060",
      tertiary: isDark ? "#888888" : "#3F3F47",
      placeholder: isDark ? "#666666" : "#C2C6CF",

      // Border colors
      border: isDark ? "#333333" : "#E5E7EB",
      borderLight: isDark ? "#404040" : "#E2E2E4",

      // UI element colors
      dragHandle: isDark ? "#555555" : "#D8D8D8",

      // Accent colors - darker for dark mode
      orange: isDark ? "#CC5A2A" : "#FF6B35",
      orangeLight: isDark ? "#2A1A16" : "#FFE8E0",
      blue: isDark ? "#5A6ACC" : "#6B73FF",
      blueLight: isDark ? "#1A1C2A" : "#E8EAFF",
      green: isDark ? "#2AA676" : "#00C896",
      greenLight: isDark ? "#162A23" : "#E0F7F0",
      yellow: isDark ? "#CC9500" : "#FFB800",
      yellowLight: isDark ? "#2A2416" : "#FFF3D6",
      yellowStar: isDark ? "#CC9500" : "#FFB800",
      purple: isDark ? "#B8A4CC" : "#D8CDFF",
      pink: isDark ? "#CC88CC" : "#FCA7FC",
      pinkVariant: isDark ? "#A65BA8" : "#CA79CF",

      // Profile specific colors
      profileGreen: isDark ? "#A0C5A0" : "#CFF7C8",
      profileBlue: isDark ? "#A0B8CC" : "#CFF5FB",
      profileOrange: isDark ? "#CCB090" : "#FFE3BE",
    },
  };
};