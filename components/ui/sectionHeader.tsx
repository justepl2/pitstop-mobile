// components/ui/sectionHeader.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/themeProvider';

type SectionHeaderProps = {
  label: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  divider?: boolean;
  color?: 'default' | 'primary' | 'muted';
};

export default function SectionHeader({ 
  label, 
  subtitle, 
  size = 'md', 
  divider = false,
  color = 'default'
}: SectionHeaderProps) {
  const { colors, spacing, typography } = useTheme();

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return typography.sizes.base;
      case 'md':
        return typography.sizes.lg;
      case 'lg':
        return typography.sizes.xl;
      default:
        return typography.sizes.lg;
    }
  };

  const getTextColor = () => {
    switch (color) {
      case 'primary':
        return colors.primary;
      case 'muted':
        return colors.textMuted;
      default:
        return colors.text;
    }
  };

  return (
    <View style={{ 
      marginTop: spacing(3), 
      marginBottom: spacing(2),
    }}>
      <Text style={{ 
        fontSize: getFontSize(),
        fontWeight: typography.weights.bold, 
        color: getTextColor(),
        letterSpacing: -0.3,
      }}>
        {label}
      </Text>
      
      {subtitle && (
        <Text style={{ 
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.medium,
          color: colors.textSecondary,
          marginTop: spacing(0.5),
          lineHeight: 18,
        }}>
          {subtitle}
        </Text>
      )}
      
      {divider && (
        <View style={{
          height: 2,
          backgroundColor: colors.primary,
          borderRadius: 1,
          width: 40,
          marginTop: spacing(1),
        }} />
      )}
    </View>
  );
}
