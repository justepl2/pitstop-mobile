// theme/themeProvider.tsx
import React, { ReactNode, createContext, useContext } from 'react';
import { View } from 'react-native';

type Theme = {
  colors: { primary: string; background: string; surface: string; text: string; muted: string; border: string; danger: string };
  spacing: (n: number) => number;
};

const theme: Theme = {
  colors: {
    primary: '#E10600',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#121212',
    muted: '#666666',
    border: '#E9EAEC',
    danger: '#FF3B30',
  },
  spacing: (n: number) => n * 8,
};

const ThemeContext = createContext<Theme>(theme);
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>{children}</View>
    </ThemeContext.Provider>
  );
}
