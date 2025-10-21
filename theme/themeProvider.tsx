// theme/themeProvider.tsx
import React, { ReactNode, createContext, useContext } from 'react';
import { View } from 'react-native';

type Theme = {
  colors: {
    // Couleurs primaires
    primary: string;
    primaryLight: string;
    primaryDark: string;
    
    // Couleurs de fond
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceElevated: string;
    
    // Couleurs de texte
    text: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    muted: string; // Couleur muted pour compatibilité
    
    // Couleurs de bordures
    border: string;
    borderLight: string;
    borderFocus: string;
    
    // Couleurs sémantiques
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    danger: string;
    dangerLight: string;
    info: string;
    infoLight: string;
    
    // Couleurs de gradients
    gradientStart: string;
    gradientEnd: string;
  };
  spacing: (n: number) => number;
  radius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    sm: object;
    md: object;
    lg: object;
    xl: object;
  };
  typography: {
    sizes: {
      xs: number;
      sm: number;
      base: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
    };
    weights: {
      normal: '400';
      medium: '500';
      semibold: '600';
      bold: '700';
    };
  };
};

const theme: Theme = {
  colors: {
    // Couleurs primaires - Rouge moderne
    primary: '#E10600', // Rouge Pitstop
    primaryLight: '#FF1744',
    primaryDark: '#B71C1C',
    
    // Couleurs de fond
    background: '#FAFBFC', // Gris très clair au lieu du blanc pur
    backgroundSecondary: '#F1F5F9',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    
    // Couleurs de texte
    text: '#0F172A', // Noir plus doux
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',
    muted: '#666666', // Couleur muted pour compatibilité (comme l'ancien thème)
    
    // Couleurs de bordures
    border: '#E2E8F0', // Bordures plus subtiles
    borderLight: '#F1F5F9',
    borderFocus: '#E10600',
    
    // Couleurs sémantiques modernes
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    info: '#06B6D4',
    infoLight: '#CFFAFE',
    
    // Couleurs de gradients
    gradientStart: '#667EEA',
    gradientEnd: '#764BA2',
  },
  spacing: (n: number) => n * 8,
  radius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 32,
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
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
