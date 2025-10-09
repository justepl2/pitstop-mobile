// screens/vehicles/vehiclesScreen.tsx
// AJOUT: navigation vers l’écran d’ajout sur le bouton “Ajouter”
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { supabase } from '../../lib/supabase';
import VehicleCard from '../../components/vehicles/vehicleCard';
import { fetchVehicles, type VehicleItem } from '../../services/vehiclesService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { reportSupabaseError } from '../../utils/errorHandler';

export default function vehiclesScreen() {
  const { colors, spacing } = useTheme();
  const nav = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data: sessionRes, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) throw sessionErr;
      const userId = sessionRes.session?.user.id;
      if (!userId) throw new Error('Session manquante.');
      const items = await fetchVehicles(userId);
      setVehicles(items);
    } catch (e: any) {
      setVehicles([]);
      reportSupabaseError('Erreur de chargement des véhicules', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (active) await load();
      })();
      return () => {
        active = false;
      };
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background, padding: spacing(2), alignItems: 'center', justifyContent: 'center' }}
        edges={['top', 'left', 'right']}
      >
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ marginTop: spacing(1), color: colors.muted }}>Chargement des véhicules…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing(2) }} edges={['top', 'left', 'right']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing(2) }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Vos véhicules</Text>
        <TouchableOpacity
          onPress={() => {
            // @ts-ignore
            nav.navigate('AddVehicle');
          }}
          style={{ backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: spacing(2) }} />}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onDelete={async () => {
              await load(); // Recharge la liste des véhicules après suppression
            }}
          />
        )}
        ListEmptyComponent={
          <View style={{ paddingVertical: spacing(2) }}>
            <Text style={{ color: colors.muted }}>Aucun véhicule enregistré.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: spacing(4) }}
      />
    </SafeAreaView>
  );
}
