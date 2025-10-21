import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/themeProvider';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  gradient?: boolean;
  size?: 'sm' | 'md' | 'lg';
  alignment?: 'left' | 'center';
};

export default function ScreenHeader({ 
  title, 
  subtitle, 
  action,
  gradient = false,
  size = 'md',
  alignment = 'left'
}: ScreenHeaderProps) {
  const { colors, spacing, typography, shadows } = useTheme();
  
  const getTitleSize = () => {
    switch (size) {
      case 'sm':
        return typography.sizes.lg;
      case 'md':
        return typography.sizes['2xl'];
      case 'lg':
        return typography.sizes['3xl'];
      default:
        return typography.sizes['2xl'];
    }
  };

  const getHeaderStyles = () => {
    const baseStyles = {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      justifyContent: alignment === 'center' ? 'center' : 'space-between',
      marginBottom: spacing(3),
      paddingBottom: spacing(2),
    };

    if (gradient) {
      return {
        ...baseStyles,
        backgroundColor: colors.surface,
        padding: spacing(3),
        borderRadius: 16,
        ...shadows.md,
      };
    }

    return baseStyles;
  };
  
  return (
    <View style={getHeaderStyles()}>
      <View style={{ 
        flex: 1,
        alignItems: alignment === 'center' ? 'center' : 'flex-start'
      }}>
        <Text style={{ 
          fontSize: getTitleSize(),
          fontWeight: typography.weights.bold, 
          color: gradient ? colors.primary : colors.text,
          textAlign: alignment,
          letterSpacing: -0.5,
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ 
            marginTop: spacing(0.5), 
            color: colors.textMuted,
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            textAlign: alignment,
            lineHeight: 20,
          }}>
            {subtitle}
          </Text>
        )}
      </View>
      {action && alignment !== 'center' && (
        <View style={{ marginLeft: spacing(3) }}>
          {action}
        </View>
      )}
    </View>
  );
}
