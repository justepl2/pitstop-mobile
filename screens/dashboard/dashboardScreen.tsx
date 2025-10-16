// screens/dashboard/dashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import StatsCard from '../../components/ui/statsCard';
import SectionHeader from '../../components/ui/sectionHeader';
import { supabase } from '../../lib/supabase';
import { fetchDashboardStats, fetchRecentMaintenances, type MaintenanceItem } from '../../services/dashboardService';
import { useNavigation } from '@react-navigation/native';

export default function dashboardScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ vehicles: 0, recentMaintenances: 0 });
  const [recentMaints, setRecentMaints] = useState<MaintenanceItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: sessionRes } = await supabase.auth.getSession();
        const userId = sessionRes.session?.user.id;
        if (!userId) throw new Error('Session manquante.');

        const [statsData, recentData] = await Promise.all([
          fetchDashboardStats(userId),
          fetchRecentMaintenances(userId, 5),
        ]);

        setStats({
          vehicles: statsData.vehicles,
          recentMaintenances: statsData.recentMaintenances,
        });
        setRecentMaints(recentData);
      } catch (e: any) {
        Alert.alert('Erreur', e.message ?? 'Impossible de charger le tableau de bord.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing(2), alignItems: 'center', justifyContent: 'center' }} edges={['top', 'left', 'right']}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ marginTop: spacing(1), color: colors.muted }}>Chargement du tableau de bord…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing(2) }} edges={['top', 'left', 'right']}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>Tableau de bord</Text>
      <Text style={{ marginTop: spacing(1), color: colors.muted }}>
        Vue d’ensemble — vos véhicules et entretiens enregistrés.
      </Text>

      {/* Cartes de stats */}
      <View style={{ flexDirection: 'row', gap: spacing(2), marginTop: spacing(2) }}>
        <StatsCard 
          title="Véhicules" 
          value={`${stats.vehicles}`} 
          onPress={() => {
            // @ts-ignore
            navigation.navigate('Vehicles');
          }}
        />
        <StatsCard title="Entretiens ce mois" value={`${stats.recentMaintenances}`} />
      </View>

      {/* Section Derniers entretiens (depuis Supabase) */}
      <SectionHeader label="Derniers entretiens" />
      <FlatList
        data={recentMaints}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: spacing(1) }}>
            <Text style={{ fontWeight: '700', color: colors.text }}>{item.name}</Text>
            <Text style={{ color: colors.muted }}>
              {item.vehicle.brand} {item.vehicle.model}
              {item.vehicle.registration ? ` · ${item.vehicle.registration}` : ''}
              {item.lastKm != null ? ` · Dernier km: ${item.lastKm}` : ''}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: colors.muted }}>Aucun entretien récent.</Text>}
      />
    </SafeAreaView>
  );
}
