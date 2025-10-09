// screens/maintenances/maintenancesScreen.tsx
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/themeProvider';

export default function maintenancesScreen() {
  const { colors, spacing } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing(2) }} edges={['top', 'left', 'right']}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Historique des entretiens</Text>
      <Text style={{ marginTop: spacing(1), color: colors.muted }}>
        Les entretiens et prochains rappels s’afficheront ici.
      </Text>
    </SafeAreaView>
  );
}
