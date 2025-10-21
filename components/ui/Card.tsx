// components/ui/Card.tsx
import React, { ReactNode, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/themeProvider';

type CardProps = {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  background?: 'surface' | 'elevated' | 'secondary';
  onPress?: () => void;
  pressable?: boolean;
};

export default function Card({
  children,
  padding = 'md',
  shadow = 'sm',
  border = true,
  rounded = 'lg',
  background = 'surface',
  onPress,
  pressable = false
}: CardProps) {
  const { colors, spacing, radius, shadows } = useTheme();
  const [pressed, setPressed] = useState(false);

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return spacing(2);
      case 'md':
        return spacing(3);
      case 'lg':
        return spacing(4);
      default:
        return spacing(3);
    }
  };

  const getShadow = () => {
    if (shadow === 'none') return {};
    return shadows[shadow as keyof typeof shadows] || shadows.sm;
  };

  const getBorderRadius = () => {
    switch (rounded) {
      case 'none':
        return 0;
      case 'sm':
        return radius.sm;
      case 'md':
        return radius.md;
      case 'lg':
        return radius.lg;
      case 'xl':
        return radius.xl;
      case 'full':
        return radius.full;
      default:
        return radius.lg;
    }
  };

  const getBackgroundColor = () => {
    switch (background) {
      case 'elevated':
        return colors.surfaceElevated;
      case 'secondary':
        return colors.backgroundSecondary;
      default:
        return colors.surface;
    }
  };

  const cardStyles = {
    backgroundColor: pressed ? colors.backgroundSecondary : getBackgroundColor(),
    borderRadius: getBorderRadius(),
    padding: getPadding(),
    borderWidth: border ? 1 : 0,
    borderColor: pressed ? colors.borderFocus : colors.border,
    ...getShadow(),
    transform: [{ scale: pressed && pressable ? 0.98 : 1 }],
  };

  if (onPress || pressable) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={cardStyles}
        activeOpacity={0.95}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles}>
      {children}
    </View>
  );
}

