// components/ui/statsCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/themeProvider';

type StatsCardProps = {
  title: string;
  value: string;
  onPress?: () => void; // Ajout de la prop onPress
};

export default function StatsCard({ title, value, onPress }: StatsCardProps) {
  const { colors, spacing } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing(2),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 80,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{title}</Text>
      <Text style={{ fontSize: 24, fontWeight: '800', color: colors.primary, marginTop: spacing(1) }}>{value}</Text>
    </TouchableOpacity>
  );
}
