import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/themeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  size = 'medium'
}: ButtonProps) {
  const { colors, spacing } = useTheme();

  const getBackgroundColor = () => {
    if (disabled || loading) return '#B0B0B0';
    
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.surface;
      case 'danger':
        return colors.danger;
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
      case 'ghost':
        return colors.text;
      default:
        return '#FFFFFF';
    }
  };

  const getBorderStyle = () => {
    if (variant === 'secondary' || variant === 'ghost') {
      return {
        borderWidth: 1,
        borderColor: colors.border,
      };
    }
    return {};
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: spacing(1), paddingHorizontal: spacing(2) };
      case 'medium':
        return { paddingVertical: spacing(1.5), paddingHorizontal: spacing(3) };
      case 'large':
        return { paddingVertical: spacing(2), paddingHorizontal: spacing(4) };
      default:
        return { paddingVertical: spacing(1.5), paddingHorizontal: spacing(3) };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: getBackgroundColor(),
          ...getPadding(),
          ...getBorderStyle(),
        }
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={{ 
          color: getTextColor(), 
          fontWeight: '700',
          fontSize: 16
        }}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
