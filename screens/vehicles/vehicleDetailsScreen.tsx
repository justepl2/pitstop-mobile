import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import LoadingScreen from '../../components/ui/LoadingScreen';
import { VehicleItem, fetchVehicleById, deleteVehicle } from '../../services/vehiclesService';
import { MotorcycleItem, fetchMotorcycleById } from '../../services/motorcycleService';
import { MaintenanceItem, fetchMaintenancesByVehicle } from '../../services/maintenanceService';
import { MaintenanceHistoryItem, fetchMaintenanceHistoriesByVehicle } from '../../services/maintenanceHistoryService';
import Button from '../../components/ui/Button';
import KilometerChart from '../../components/ui/KilometerChart';
import { useAuth } from '../../hooks/useAuth';

type VehicleDetailsRouteProp = RouteProp<{
  VehicleDetails: { vehicleId: string };
}, 'VehicleDetails'>;

export default function VehicleDetailsScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<VehicleDetailsRouteProp>();
  const { getCurrentUserId } = useAuth();
  
  const [vehicle, setVehicle] = useState<VehicleItem | null>(null);
  const [motorcycle, setMotorcycle] = useState<MotorcycleItem | null>(null);
  const [maintenances, setMaintenances] = useState<MaintenanceItem[]>([]);
  const [kmHistory, setKmHistory] = useState<MaintenanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMaintenances, setLoadingMaintenances] = useState(false);
  const [loadingKmHistory, setLoadingKmHistory] = useState(false);

  const { vehicleId } = route.params;

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const userId = await getCurrentUserId();
        const vehicleData = await fetchVehicleById(vehicleId, userId);
        setVehicle(vehicleData);

        // Charger les données de la moto si motorcycle_id existe
        if (vehicleData?.motorcycleId) {
          try {
            const motorcycleData = await fetchMotorcycleById(vehicleData.motorcycleId);
            setMotorcycle(motorcycleData);
          } catch (motorcycleError) {
            console.warn('Erreur lors du chargement de la moto:', motorcycleError);
            // On continue même si la moto n'est pas trouvée
          }
        }
      } catch (error: any) {
        Alert.alert('Erreur de chargement', error.message || 'Impossible de charger le véhicule');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [vehicleId]);

  // Charger les maintenances du véhicule
  const loadMaintenances = useCallback(async () => {
    if (!vehicle) return;

    setLoadingMaintenances(true);
    try {
      const userId = await getCurrentUserId();
      const maintenancesData = await fetchMaintenancesByVehicle(vehicle.id, userId);
      setMaintenances(maintenancesData);
    } catch (error: any) {
      console.warn('Erreur lors du chargement des maintenances:', error);
      // On continue même si les maintenances ne se chargent pas
    } finally {
      setLoadingMaintenances(false);
    }
  }, [vehicle, getCurrentUserId]);

  const loadKmHistory = useCallback(async () => {
    if (!vehicle) return;

    console.log('🔄 Rechargement de l\'historique kilométrique pour le véhicule:', vehicle.id);
    setLoadingKmHistory(true);
    try {
      const historyData = await fetchMaintenanceHistoriesByVehicle(vehicle.id);
      setKmHistory(historyData);
      console.log('✅ Historique kilométrique rechargé:', historyData.length, 'entrées');
    } catch (error: any) {
      console.warn('Erreur lors du chargement de l\'historique kilométrique:', error);
      // On continue même si l'historique ne se charge pas
    } finally {
      setLoadingKmHistory(false);
    }
  }, [vehicle]);

  // Recharger les données quand on revient sur l'écran (après création d'une maintenance ou historique)
  useFocusEffect(
    useCallback(() => {
      console.log('🔃 VehicleDetailsScreen - useFocusEffect déclenché, rechargement des données...');
      loadMaintenances();
      loadKmHistory();
    }, [loadMaintenances, loadKmHistory])
  );

  const handleDelete = async () => {
    if (!vehicle) return;

    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce véhicule ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteVehicle(vehicle.id);
              Alert.alert('Succès', 'Véhicule supprimé avec succès.');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression.');
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return <LoadingScreen message="Chargement du véhicule…" />;
  }

  if (!vehicle) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Véhicule introuvable" />
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: spacing(4) }}>
          Ce véhicule n'a pas pu être trouvé.
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <>
      <View style={{ 
        backgroundColor: colors.background, 
        paddingTop: spacing(2),
        paddingHorizontal: spacing(2)
      }}>
        <ScreenHeader
          title={`${vehicle.brand} ${vehicle.model}`}
          subtitle={vehicle.registration || 'Immatriculation non renseignée'}
          action={
            <Button
              title="🗑️"
              onPress={handleDelete}
              variant="ghost"
              size="small"
            />
          }
        />
      </View>
      
      <ScreenContainer padding={false} edges={['bottom', 'left', 'right']}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: spacing(4), padding: spacing(2), paddingTop: spacing(1) }}
        >
        {/* Actions et maintenances */}
        {/* Graphique kilométrique */}
        {!loadingKmHistory && <KilometerChart data={kmHistory} />}

        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: spacing(2),
          marginBottom: spacing(2),
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing(2) }}>
            Maintenances
          </Text>

          <View style={{ marginBottom: spacing(2), gap: spacing(1) }}>
            <Button
              title="+ Nouvelle maintenance"
              onPress={() => (navigation as any).navigate('AddMaintenance', { 
                vehicle: vehicle
              })}
              variant="secondary"
            />
            
            <Button
              title="📅 Historique global"
              onPress={() => (navigation as any).navigate('AddMaintenanceHistory', { 
                vehicle: vehicle,
                multipleMode: true
              })}
              variant="ghost"
            />
          </View>

          {/* Liste des maintenances */}
          {loadingMaintenances ? (
            <Text style={{ color: colors.muted, textAlign: 'center', marginVertical: spacing(2) }}>
              Chargement des maintenances...
            </Text>
          ) : maintenances.length > 0 ? (
            <View style={{ gap: spacing(1) }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing(1) }}>
                Maintenances prévues ({maintenances.length})
              </Text>
              {maintenances.map((maintenance) => (
                <TouchableOpacity
                  key={maintenance.id}
                  onPress={() => (navigation as any).navigate('MaintenanceDetail', { 
                    maintenanceId: maintenance.id, 
                    vehicleName: `${vehicle.brand} ${vehicle.model}`,
                    vehicle: vehicle
                  })}
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 8,
                    padding: spacing(2),
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ 
                    color: colors.text, 
                    fontWeight: '600', 
                    marginBottom: maintenance.intervalKm || maintenance.intervalMonth || maintenance.intervalHours ? spacing(0.5) : 0
                  }}>
                    {maintenance.name}
                  </Text>
                  
                  {(maintenance.intervalKm || maintenance.intervalMonth || maintenance.intervalHours) && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) }}>
                      {maintenance.intervalKm && (
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '500' }}>
                          📏 {maintenance.intervalKm.toLocaleString()} km
                        </Text>
                      )}
                      {maintenance.intervalMonth && (
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '500' }}>
                          📅 {maintenance.intervalMonth} mois
                        </Text>
                      )}
                      {maintenance.intervalHours && (
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '500' }}>
                          ⏱️ {maintenance.intervalHours}h
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={{ color: colors.muted, fontSize: 14, textAlign: 'center', fontStyle: 'italic' }}>
              Aucune maintenance programmée
            </Text>
          )}
        </View>

        {/* Informations générales */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: spacing(2),
          marginBottom: spacing(2),
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing(2) }}>
            Informations générales
          </Text>

          <InfoRow label="Marque" value={vehicle.brand} colors={colors} spacing={spacing} />
          <InfoRow label="Modèle" value={vehicle.model} colors={colors} spacing={spacing} />
          {vehicle.year && <InfoRow label="Année" value={vehicle.year.toString()} colors={colors} spacing={spacing} />}
          <InfoRow label="Kilométrage" value={`${vehicle.kilometers} km`} colors={colors} spacing={spacing} />
          {vehicle.registration && <InfoRow label="Immatriculation" value={vehicle.registration} colors={colors} spacing={spacing} />}
        </View>

        {/* Informations techniques */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: spacing(2),
          marginBottom: spacing(2),
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing(2) }}>
            Informations techniques
          </Text>

          {vehicle.vehicleType && <InfoRow label="Type" value={vehicle.vehicleType.name} colors={colors} spacing={spacing} />}
          {vehicle.fuel && <InfoRow label="Carburant" value={vehicle.fuel.name} colors={colors} spacing={spacing} />}
          {vehicle.engineSize && <InfoRow label="Cylindrée" value={`${vehicle.engineSize} cc`} colors={colors} spacing={spacing} />}
          {vehicle.numberOfCylinders && <InfoRow label="Nombre de cylindres" value={vehicle.numberOfCylinders.toString()} colors={colors} spacing={spacing} />}
          
          {(!vehicle.vehicleType && !vehicle.fuel && !vehicle.engineSize && !vehicle.numberOfCylinders) && (
            <Text style={{ color: colors.muted, fontStyle: 'italic' }}>
              Aucune information technique renseignée
            </Text>
          )}
        </View>

        {/* Informations détaillées de la moto (si disponible) */}
        {motorcycle && (
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing(2),
            marginBottom: spacing(2),
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing(2) }}>
              Spécifications techniques
            </Text>

            {/* Moteur et Performance */}
            {(motorcycle.roundedDisplacement || motorcycle.power || motorcycle.torque || motorcycle.engineType || motorcycle.engineStroke) && (
              <>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing(1), marginBottom: spacing(1) }}>
                  Moteur et Performance
                </Text>
                {motorcycle.roundedDisplacement && <InfoRow label="Cylindrée" value={`${motorcycle.roundedDisplacement} cc`} colors={colors} spacing={spacing} />}
                {motorcycle.power && <InfoRow label="Puissance" value={`${motorcycle.power} ch`} colors={colors} spacing={spacing} />}
                {motorcycle.torque && <InfoRow label="Couple" value={`${motorcycle.torque} Nm`} colors={colors} spacing={spacing} />}
                {motorcycle.engineType && <InfoRow label="Type moteur" value={motorcycle.engineType} colors={colors} spacing={spacing} />}
                {motorcycle.engineStroke && <InfoRow label="Temps moteur" value={motorcycle.engineStroke} colors={colors} spacing={spacing} />}
              </>
            )}

            {/* Système et Transmission */}
            {(motorcycle.gearbox || motorcycle.fuelSystem || motorcycle.coolingSystem) && (
              <>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing(2), marginBottom: spacing(1) }}>
                  Système et Transmission
                </Text>
                {motorcycle.gearbox && <InfoRow label="Boîte de vitesses" value={motorcycle.gearbox} colors={colors} spacing={spacing} />}
                {motorcycle.fuelSystem && <InfoRow label="Système carburant" value={motorcycle.fuelSystem} colors={colors} spacing={spacing} />}
                {motorcycle.coolingSystem && <InfoRow label="Refroidissement" value={motorcycle.coolingSystem} colors={colors} spacing={spacing} />}
              </>
            )}

            {/* Dimensions et Poids */}
            {(motorcycle.weight || motorcycle.seatHeight || motorcycle.fuelCapacity) && (
              <>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing(2), marginBottom: spacing(1) }}>
                  Dimensions et Capacités
                </Text>
                {motorcycle.weight && <InfoRow label="Poids" value={`${motorcycle.weight} kg`} colors={colors} spacing={spacing} />}
                {motorcycle.seatHeight && <InfoRow label="Hauteur de selle" value={`${motorcycle.seatHeight} mm`} colors={colors} spacing={spacing} />}
                {motorcycle.fuelCapacity && <InfoRow label="Capacité réservoir" value={`${motorcycle.fuelCapacity} L`} colors={colors} spacing={spacing} />}
              </>
            )}

            {/* Pneumatiques */}
            {(motorcycle.frontTire || motorcycle.rearTire) && (
              <>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing(2), marginBottom: spacing(1) }}>
                  Pneumatiques
                </Text>
                {motorcycle.frontTire && <InfoRow label="Pneu avant" value={motorcycle.frontTire} colors={colors} spacing={spacing} />}
                {motorcycle.rearTire && <InfoRow label="Pneu arrière" value={motorcycle.rearTire} colors={colors} spacing={spacing} />}
              </>
            )}

            {/* Catégorie */}
            {motorcycle.category && (
              <>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing(2), marginBottom: spacing(1) }}>
                  Classification
                </Text>
                <InfoRow label="Catégorie" value={motorcycle.category} colors={colors} spacing={spacing} />
              </>
            )}
          </View>
        )}

        </ScrollView>
      </ScreenContainer>
    </>
  );
}

// Composant helper pour afficher une ligne d'information
function InfoRow({ 
  label, 
  value, 
  colors, 
  spacing 
}: { 
  label: string; 
  value: string; 
  colors: any; 
  spacing: (n: number) => number; 
}) {
  return (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: spacing(1),
      paddingVertical: spacing(0.5)
    }}>
      <Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text>
      <Text style={{ color: colors.text, fontWeight: '400' }}>{value}</Text>
    </View>
  );
}
