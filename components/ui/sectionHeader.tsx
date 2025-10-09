// components/ui/sectionHeader.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/themeProvider';

export default function sectionHeader({ label }: { label: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ marginTop: spacing(3), marginBottom: spacing(2) }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{label}</Text>
    </View>
  );
}
