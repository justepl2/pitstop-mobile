import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, Alert } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import LoadingScreen from '../../components/ui/LoadingScreen';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import VehicleCard from '../../components/vehicles/vehicleCard';
import { fetchVehicles, type VehicleItem } from '../../services/vehiclesService';
import { useAuth } from '../../hooks/useAuth';

export default function VehiclesScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const { getCurrentUserId } = useAuth();
  
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVehicles = useCallback(async () => {
    try {
      const userId = await getCurrentUserId();
      const data = await fetchVehicles(userId);
      setVehicles(data);
    } catch (error: any) {
      Alert.alert('Erreur de chargement des véhicules', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getCurrentUserId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadVehicles();
  }, [loadVehicles]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadVehicles();
    }, [loadVehicles])
  );

  if (loading) {
    return <LoadingScreen message="Chargement des véhicules…" />;
  }

  return (
    <>
      <View style={{ 
        backgroundColor: colors.background, 
        paddingTop: spacing(2),
        paddingHorizontal: spacing(2)
      }}>
        <ScreenHeader
          title="Vos véhicules"
          action={
            <Button
              title="Ajouter"
              onPress={() => {
                // @ts-ignore
                navigation.navigate('AddVehicle');
              }}
              size="small"
            />
          }
        />
      </View>
      
      <ScreenContainer padding={false} edges={['bottom', 'left', 'right']}>
        <FlatList
        data={vehicles || []}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: spacing(2) }} />}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('VehicleDetails', { vehicleId: item.id });
            }}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="Aucun véhicule"
            message="Vous n'avez pas encore ajouté de véhicule."
            actionTitle="Ajouter un véhicule"
            onAction={() => {
              // @ts-ignore
              navigation.navigate('AddVehicle');
            }}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={{ paddingBottom: spacing(4), padding: spacing(2), paddingTop: spacing(1) }}
      />
      </ScreenContainer>
    </>
  );
}
