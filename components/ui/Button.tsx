import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Animated } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning' | 'gradient';

type VectorIcon = {
  family: 'MaterialIcons' | 'Ionicons' | 'FontAwesome' | 'Feather';
  name: string;
};

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  icon?: string | VectorIcon; // Peut être un emoji ou une icône vectorielle
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  size = 'md',
  fullWidth = false,
  icon
}: ButtonProps) {
  const { colors, spacing, radius, shadows, typography } = useTheme();
  const [pressed, setPressed] = useState(false);

  const getBackgroundColor = () => {
    if (disabled || loading) return colors.textMuted;
    
    switch (variant) {
      case 'primary':
        return pressed ? colors.primaryDark : colors.primary;
      case 'secondary':
        return pressed ? colors.backgroundSecondary : colors.surface;
      case 'danger':
        return pressed ? '#DC2626' : colors.danger;
      case 'success':
        return pressed ? '#059669' : colors.success;
      case 'warning':
        return pressed ? '#D97706' : colors.warning;
      case 'ghost':
        return pressed ? colors.backgroundSecondary : 'transparent';
      case 'gradient':
        return colors.gradientStart; // Sera remplacé par un gradient
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled || loading) return colors.textInverse;
    
    switch (variant) {
      case 'primary':
      case 'danger':
      case 'success':
      case 'warning':
      case 'gradient':
        return colors.textInverse;
      case 'secondary':
      case 'ghost':
        return colors.text;
      default:
        return colors.textInverse;
    }
  };

  const getBorderStyle = () => {
    if (variant === 'secondary' || variant === 'ghost') {
      return {
        borderWidth: 1,
        borderColor: pressed ? colors.borderFocus : colors.border,
      };
    }
    return {};
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return {
          paddingVertical: spacing(1),
          paddingHorizontal: spacing(2),
          borderRadius: radius.sm,
          minHeight: 32,
        };
      case 'sm':
        return {
          paddingVertical: spacing(1.5),
          paddingHorizontal: spacing(3),
          borderRadius: radius.md,
          minHeight: 40,
        };
      case 'md':
        return {
          paddingVertical: spacing(2),
          paddingHorizontal: spacing(4),
          borderRadius: radius.lg,
          minHeight: 48,
        };
      case 'lg':
        return {
          paddingVertical: spacing(2.5),
          paddingHorizontal: spacing(5),
          borderRadius: radius.lg,
          minHeight: 56,
        };
      case 'xl':
        return {
          paddingVertical: spacing(3),
          paddingHorizontal: spacing(6),
          borderRadius: radius.xl,
          minHeight: 64,
        };
      default:
        return {
          paddingVertical: spacing(2),
          paddingHorizontal: spacing(4),
          borderRadius: radius.lg,
          minHeight: 48,
        };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'xs':
        return typography.sizes.xs;
      case 'sm':
        return typography.sizes.sm;
      case 'md':
        return typography.sizes.base;
      case 'lg':
        return typography.sizes.lg;
      case 'xl':
        return typography.sizes.xl;
      default:
        return typography.sizes.base;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 16;
      case 'sm':
        return 18;
      case 'md':
        return 22; // Réduit de 32 à 22
      case 'lg':
        return 26; // Réduit de 38 à 26
      case 'xl':
        return 30; // Réduit de 44 à 30
      default:
        return 22;
    }
  };

  const getShadow = () => {
    if (variant === 'ghost' || disabled) return {};
    return shadows.sm;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          backgroundColor: getBackgroundColor(),
          ...getSizeStyles(),
          ...getBorderStyle(),
          ...getShadow(),
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.6 : 1,
        }
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && (
            typeof icon === 'string' ? (
              // Emoji
              <Text style={{ 
                marginRight: spacing(1), 
                fontSize: getIconSize(), // Icône plus grande aussi pour les emojis
                color: getTextColor()
              }}>
                {icon}
              </Text>
            ) : (
              // Icône vectorielle
              <>
                {icon.family === 'MaterialIcons' && (
                  <MaterialIcons 
                    name={icon.name as any}
                    size={getIconSize()}
                    color={getTextColor()}
                    style={{ marginRight: spacing(1) }}
                  />
                )}
                {icon.family === 'Ionicons' && (
                  <Ionicons 
                    name={icon.name as any}
                    size={getIconSize()}
                    color={getTextColor()}
                    style={{ marginRight: spacing(1) }}
                  />
                )}
                {icon.family === 'FontAwesome' && (
                  <FontAwesome 
                    name={icon.name as any}
                    size={getIconSize()}
                    color={getTextColor()}
                    style={{ marginRight: spacing(1) }}
                  />
                )}
                {icon.family === 'Feather' && (
                  <Feather 
                    name={icon.name as any}
                    size={getIconSize()}
                    color={getTextColor()}
                    style={{ marginRight: spacing(1) }}
                  />
                )}
              </>
            )
          )}
          <Text style={{ 
            color: getTextColor(), 
            fontWeight: typography.weights.semibold,
            fontSize: getFontSize(),
            textAlign: 'center',
          }}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
