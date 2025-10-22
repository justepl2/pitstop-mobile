import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, Alert, Text, ScrollView } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import LoadingScreen from '../../components/ui/LoadingScreen';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import EmptyState from '../../components/ui/EmptyState';
import VehicleCard from '../../components/vehicles/vehicleCard';
import { fetchVehicles, type VehicleItem } from '../../services/vehiclesService';
import { useAuth } from '../../hooks/useAuth';

export default function VehiclesScreen() {
  const { colors, spacing, typography } = useTheme();
  const navigation = useNavigation();
  const { getCurrentUserId } = useAuth();
  
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleItem[]>([]);

  const loadVehicles = useCallback(async () => {
    try {
      const userId = await getCurrentUserId();
      const data = await fetchVehicles(userId);
      setVehicles(data);
      setFilteredVehicles(data);
    } catch (error: any) {
      console.error('❌ ERROR loading vehicles:', error);
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

  // Filtrer les véhicules selon la recherche
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVehicles(vehicles);
    } else {
      const filtered = vehicles.filter(vehicle => 
        vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle.registration && vehicle.registration.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredVehicles(filtered);
    }
  }, [searchQuery, vehicles]);

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
    <ScreenContainer padding={false} edges={['left', 'right', 'bottom']}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing(4) }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Header Section */}
        <View style={{
          backgroundColor: colors.background,
          paddingHorizontal: spacing(3),
          paddingTop: spacing(1),
          paddingBottom: spacing(2),
        }}>
          {/* Titre principal */}
          <Text style={{
            fontSize: 32,
            fontWeight: '800',
            color: colors.text,
            marginBottom: spacing(0.5),
          }}>
            Mes Véhicules
          </Text>
          
          {/* Sous-titre */}
          <Text style={{
            fontSize: 16,
            color: colors.textMuted,
            marginBottom: spacing(3),
          }}>
            Gérez votre flotte de véhicules
          </Text>
          
          {/* Bouton Ajouter */}
          <Button
            title="+ Ajouter un Véhicule"
            onPress={() => {
              // @ts-ignore
              navigation.navigate('AddVehicle');
            }}
            variant="primary"
            size="lg"
            fullWidth
          />
          
          {/* Barre de recherche */}
          <View style={{ marginTop: spacing(2) }}>
            <TextInput
              placeholder="Rechercher par marque, modèle ou immatriculation"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Liste des véhicules */}
        <View style={{
          paddingHorizontal: spacing(3),
          paddingTop: spacing(2),
        }}>
          {filteredVehicles.length > 0 ? (
            <FlatList
              data={filteredVehicles}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
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
            />
          ) : (
            <EmptyState
              title={searchQuery ? "Aucun résultat" : "Aucun véhicule"}
              message={searchQuery ? "Aucun véhicule ne correspond à votre recherche." : "Vous n'avez pas encore ajouté de véhicule."}
              actionTitle="Ajouter un véhicule"
              onAction={() => {
                // @ts-ignore
                navigation.navigate('AddVehicle');
              }}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
