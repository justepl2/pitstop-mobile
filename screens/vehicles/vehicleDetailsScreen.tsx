import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeProvider';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import LoadingScreen from '../../components/ui/LoadingScreen';
import { VehicleItem, fetchVehicleById, deleteVehicle } from '../../services/vehiclesService';
import { MotorcycleItem, fetchMotorcycleById } from '../../services/motorcycleService';
import { MaintenanceItem, fetchMaintenancesByVehicle } from '../../services/maintenanceService';
import { MaintenanceHistoryItem, fetchKilometerDataForChart, getLastMaintenanceHistoryForType } from '../../services/maintenanceHistoryService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import KilometerChart from '../../components/ui/KilometerChart';
import ProgressRing from '../../components/ui/ProgressRing';
import { calculateMaintenanceProgress } from '../../utils/maintenanceProgress';
import { useAuth } from '../../hooks/useAuth';

type VehicleDetailsRouteProp = RouteProp<{
  VehicleDetails: { vehicleId: string };
}, 'VehicleDetails'>;

export default function VehicleDetailsScreen() {
  const { colors, spacing, radius, shadows } = useTheme();
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
  const [activeTab, setActiveTab] = useState<'vehicle' | 'maintenance'>('vehicle');
  const [maintenanceProgress, setMaintenanceProgress] = useState<Record<number, number>>({});
  const [maintenanceHistories, setMaintenanceHistories] = useState<Record<number, MaintenanceHistoryItem | null>>({}); // Stocker les historiques

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

  // Charger les maintenances du véhicule et calculer leurs progressions
  const loadMaintenances = useCallback(async () => {
    if (!vehicle) return;

    setLoadingMaintenances(true);
    try {
      const userId = await getCurrentUserId();
      const maintenancesData = await fetchMaintenancesByVehicle(vehicle.id, userId);
      setMaintenances(maintenancesData);

      // Calculer les pourcentages de progression pour chaque maintenance
      const progressData: Record<number, number> = {};
      const historiesData: Record<number, MaintenanceHistoryItem | null> = {};
      
      for (const maintenance of maintenancesData) {
        try {
          // Récupérer la dernière maintenance history pour ce type
          const lastHistory = await getLastMaintenanceHistoryForType(vehicle.id, maintenance.id);
          
          // Stocker l'historique
          historiesData[maintenance.id] = lastHistory;
          
          // Calculer le pourcentage de progression
          const percentage = calculateMaintenanceProgress({
            maintenance,
            lastHistory,
            currentKm: vehicle.kilometers,
            currentDate: new Date()
          });
          
          progressData[maintenance.id] = percentage;
        } catch (error) {
          console.warn('Erreur lors du calcul de progression pour maintenance', maintenance.id, error);
          progressData[maintenance.id] = 0;
          historiesData[maintenance.id] = null;
        }
      }
      
      setMaintenanceProgress(progressData);
      setMaintenanceHistories(historiesData);
    } catch (error: any) {
      console.warn('Erreur lors du chargement des maintenances:', error);
      // On continue même si les maintenances ne se chargent pas
    } finally {
      setLoadingMaintenances(false);
    }
  }, [vehicle, getCurrentUserId]);

  // Fonctions helper pour calculer chaque type de progression individuellement
  const calculateKmProgress = (maintenance: MaintenanceItem, lastHistory: MaintenanceHistoryItem | null): number => {
    if (!maintenance.intervalKm || !vehicle) return 0;
    
    if (lastHistory?.km !== undefined && lastHistory?.km !== null) {
      const kmSinceLastMaintenance = vehicle.kilometers - lastHistory.km;
      return Math.min(100, Math.round((kmSinceLastMaintenance / maintenance.intervalKm) * 100));
    } else {
      // Pas d'historique : comparer avec le kilométrage total
      return Math.min(100, Math.round((vehicle.kilometers / maintenance.intervalKm) * 100));
    }
  };

  const calculateMonthProgress = (maintenance: MaintenanceItem, lastHistory: MaintenanceHistoryItem | null): number => {
    if (!maintenance.intervalMonth || !lastHistory?.date) return 0;
    
    const lastMaintenanceDate = new Date(lastHistory.date);
    const currentDate = new Date();
    const monthsSinceLastMaintenance = (currentDate.getFullYear() - lastMaintenanceDate.getFullYear()) * 12 + 
                                       (currentDate.getMonth() - lastMaintenanceDate.getMonth());
    
    return Math.min(100, Math.round((monthsSinceLastMaintenance / maintenance.intervalMonth) * 100));
  };

  const calculateHourProgress = (maintenance: MaintenanceItem, lastHistory: MaintenanceHistoryItem | null): number => {
    if (!maintenance.intervalHours || !lastHistory?.date) return 0;
    
    const lastMaintenanceDate = new Date(lastHistory.date);
    const currentDate = new Date();
    const hoursSinceLastMaintenance = (currentDate.getTime() - lastMaintenanceDate.getTime()) / (1000 * 60 * 60);
    
    return Math.min(100, Math.round((hoursSinceLastMaintenance / maintenance.intervalHours) * 100));
  };

  const loadKmHistory = useCallback(async () => {
    if (!vehicle) return;

    setLoadingKmHistory(true);
    try {
      const historyData = await fetchKilometerDataForChart(vehicle.id);
      setKmHistory(historyData);
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
    <ScreenContainer padding={false} edges={['left', 'right', 'bottom']}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing(4) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={{
          backgroundColor: colors.background,
          paddingHorizontal: spacing(3),
          paddingTop: spacing(1),
          paddingBottom: spacing(2),
        }}>
          {/* Titre principal avec bouton */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: spacing(0.5),
          }}>
            <Text style={{
              fontSize: 32,
              fontWeight: '800',
              color: colors.text,
              flex: 1,
            }}>
              {vehicle.brand} {vehicle.model}
            </Text>
            
            {/* Bouton Supprimer */}
            <Button
              title=""
              icon={{ family: 'Ionicons', name: 'trash-outline' }}
              onPress={handleDelete}
              variant="danger"
              size="sm"
              fullWidth={false}
            />
          </View>
          
          {/* Sous-titre */}
          <Text style={{
            fontSize: 16,
            color: colors.textMuted,
            marginBottom: spacing(3),
          }}>
            {vehicle.registration || 'Immatriculation non renseignée'}
          </Text>
        </View>

        {/* Onglets */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          marginHorizontal: spacing(3),
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: spacing(2),
              borderBottomWidth: 2,
              borderBottomColor: activeTab === 'vehicle' ? colors.primary : 'transparent',
              alignItems: 'center',
            }}
            onPress={() => setActiveTab('vehicle')}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: activeTab === 'vehicle' ? '600' : '400',
              color: activeTab === 'vehicle' ? colors.primary : colors.text,
            }}>
              Véhicule
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: spacing(2),
              borderBottomWidth: 2,
              borderBottomColor: activeTab === 'maintenance' ? colors.primary : 'transparent',
              alignItems: 'center',
            }}
            onPress={() => setActiveTab('maintenance')}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: activeTab === 'maintenance' ? '600' : '400',
              color: activeTab === 'maintenance' ? colors.primary : colors.text,
            }}>
              Maintenances
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenu */}
        <View style={{
          paddingHorizontal: spacing(3),
          paddingTop: spacing(2),
        }}>
        
        {/* Contenu de l'onglet Véhicule */}
        {activeTab === 'vehicle' && (
          <>
            {/* Graphique kilométrique */}
            {!loadingKmHistory && (
              <View style={{ marginBottom: spacing(3) }}>
                <Card padding="md" shadow="md">
                    <Text style={{ 
                      fontSize: 20, 
                      fontWeight: '700', 
                      color: colors.text, 
                      marginBottom: spacing(2),
                      letterSpacing: -0.3
                    }}>
                      <Ionicons name="bar-chart-outline" size={20} color={colors.text} /> Historique kilométrique
                    </Text>
                    <KilometerChart data={kmHistory} />
                </Card>
              </View>
            )}

              {/* Informations générales */}
              <View style={{ marginBottom: spacing(3) }}>
                <Card padding="md" shadow="md">
                  <Text style={{ 
                    fontSize: 20, 
                    fontWeight: '700', 
                    color: colors.text, 
                    marginBottom: spacing(2),
                    letterSpacing: -0.3
                  }}>
                    <Ionicons name="clipboard-outline" size={20} color={colors.text} /> Informations générales
                  </Text>

                  <InfoRow label="Marque" value={vehicle.brand} colors={colors} spacing={spacing} />
                  <InfoRow label="Modèle" value={vehicle.model} colors={colors} spacing={spacing} />
                  {vehicle.year && <InfoRow label="Année" value={vehicle.year.toString()} colors={colors} spacing={spacing} />}
                  <InfoRow label="Kilométrage" value={`${vehicle.kilometers} km`} colors={colors} spacing={spacing} />
                  {vehicle.registration && <InfoRow label="Immatriculation" value={vehicle.registration} colors={colors} spacing={spacing} />}
                </Card>
              </View>

              {/* Informations techniques */}
              <View style={{ marginBottom: spacing(3) }}>
                <Card padding="md" shadow="md">
                  <Text style={{ 
                    fontSize: 20, 
                    fontWeight: '700', 
                    color: colors.text, 
                    marginBottom: spacing(2),
                    letterSpacing: -0.3
                  }}>
                    <Ionicons name="settings-outline" size={20} color={colors.text} /> Informations techniques
                  </Text>

                  {vehicle.vehicleType && <InfoRow label="Type" value={vehicle.vehicleType.name} colors={colors} spacing={spacing} />}
                  {vehicle.fuel && <InfoRow label="Carburant" value={vehicle.fuel.name} colors={colors} spacing={spacing} />}
                  {vehicle.engineSize && <InfoRow label="Cylindrée" value={`${vehicle.engineSize} cc`} colors={colors} spacing={spacing} />}
                  {vehicle.numberOfCylinders && <InfoRow label="Nombre de cylindres" value={vehicle.numberOfCylinders.toString()} colors={colors} spacing={spacing} />}
                  
                  {(!vehicle.vehicleType && !vehicle.fuel && !vehicle.engineSize && !vehicle.numberOfCylinders) && (
                    <Text style={{ color: colors.textMuted, fontStyle: 'italic' }}>
                      Aucune information technique renseignée
                    </Text>
                  )}
                </Card>
              </View>

              {/* Informations détaillées de la moto (si disponible) */}
              {motorcycle && (
                <View style={{ marginBottom: spacing(3) }}>
                  <Card padding="md" shadow="md">
                    <Text style={{ 
                      fontSize: 20, 
                      fontWeight: '700', 
                      color: colors.text, 
                      marginBottom: spacing(2),
                      letterSpacing: -0.3
                    }}>
                      <Ionicons name="construct-outline" size={20} color={colors.text} /> Spécifications techniques
                    </Text>

                {/* Moteur et Performance */}
                {(motorcycle.displacement || motorcycle.power || motorcycle.torque || motorcycle.engineType || motorcycle.engineStroke) && (
                  <>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing(1), marginBottom: spacing(1) }}>
                      Moteur et Performance
                    </Text>
                    {motorcycle.displacement && <InfoRow label="Cylindrée" value={`${motorcycle.displacement} cc`} colors={colors} spacing={spacing} />}
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
                      Catégorie
                    </Text>
                    <InfoRow label="Type" value={motorcycle.category} colors={colors} spacing={spacing} />
                  </>
                )}
                  </Card>
                </View>
              )}
            </>
          )}

          {/* Contenu de l'onglet Maintenances */}
          {activeTab === 'maintenance' && (
            <View style={{ marginBottom: spacing(3) }}>
              <Card padding="md" shadow="md">
                <Text style={{ 
                  fontSize: 20, 
                  fontWeight: '700', 
                  color: colors.text, 
                  marginBottom: spacing(2),
                  letterSpacing: -0.3
                }}>
                  <Ionicons name="construct-outline" size={20} color={colors.text} /> Maintenances
                </Text>

            <View style={{ marginBottom: spacing(2), gap: spacing(1) }}>
              <Button
                title="Nouvelle maintenance"
                icon={{ family: 'Ionicons', name: 'add' }}
                onPress={() => (navigation as any).navigate('AddMaintenance', { 
                  vehicle: vehicle
                })}
                variant="secondary"
              />
              
              <Button
                title="Historique global"
                icon={{ family: 'Ionicons', name: 'calendar-outline' }}
                onPress={() => (navigation as any).navigate('AddMaintenanceHistory', { 
                  vehicle: vehicle,
                  multipleMode: true
                })}
                variant="ghost"
              />
            </View>

            {/* Liste des maintenances */}
            {loadingMaintenances ? (
              <Text style={{ color: colors.textMuted, textAlign: 'center', marginVertical: spacing(2) }}>
                Chargement des maintenances...
              </Text>
            ) : maintenances.length > 0 ? (
              <View style={{ gap: spacing(1) }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing(1) }}>
                  Maintenances prévues ({maintenances.length})
                </Text>
                {maintenances
                  .sort((a, b) => {
                    const progressA = maintenanceProgress[a.id] || 0;
                    const progressB = maintenanceProgress[b.id] || 0;
                    console.log(`🔄 Tri maintenances: ${a.name}(${progressA}%) vs ${b.name}(${progressB}%)`);
                    return progressB - progressA;
                  })
                  .map((maintenance) => {
                    const currentProgress = maintenanceProgress[maintenance.id] || 0;
                    console.log(`📊 Affichage: ${maintenance.name} - ${currentProgress}%`);
                    return (
                    <TouchableOpacity
                      key={maintenance.id}
                      onPress={() => (navigation as any).navigate('MaintenanceDetail', { 
                        maintenanceId: maintenance.id, 
                        vehicleName: `${vehicle.brand} ${vehicle.model}`,
                        vehicle: vehicle
                      })}
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        padding: spacing(2.5),
                        borderWidth: 1,
                        borderColor: colors.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                        marginVertical: spacing(0.5),
                      }}
                    >
                      {/* Contenu de la maintenance */}
                      <View style={{ flex: 1 }}>
                      <Text style={{ 
                        color: colors.text, 
                        fontWeight: '600', 
                        marginBottom: maintenance.intervalKm || maintenance.intervalMonth || maintenance.intervalHours ? spacing(0.5) : 0
                      }}>
                        {maintenance.name}
                      </Text>
                      
                      {(maintenance.intervalKm || maintenance.intervalMonth || maintenance.intervalHours) && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) }}>
                          {maintenance.intervalKm && (() => {
                            const lastHistory = maintenanceHistories[maintenance.id];
                            const kmProgress = calculateKmProgress(maintenance, lastHistory);
                            const isKmOverdue = kmProgress >= 100;
                            console.log(`🔴 Debug KM: ${maintenance.name} - KmProgress: ${kmProgress}% - Overdue: ${isKmOverdue}`);
                            return (
                              <Text style={{ 
                                color: isKmOverdue ? '#ff4444' : colors.text, 
                                fontSize: 12, 
                                fontWeight: '500' 
                              }}>
                                <Ionicons name="speedometer-outline" size={12} color={isKmOverdue ? '#ff4444' : colors.text} /> {maintenance.intervalKm.toLocaleString()} km
                              </Text>
                            );
                          })()}
                          {maintenance.intervalMonth && (() => {
                            const lastHistory = maintenanceHistories[maintenance.id];
                            const monthProgress = calculateMonthProgress(maintenance, lastHistory);
                            const isMonthOverdue = monthProgress >= 100;
                            console.log(`🟡 Debug MONTH: ${maintenance.name} - MonthProgress: ${monthProgress}% - Overdue: ${isMonthOverdue}`);
                            return (
                              <Text style={{ 
                                color: isMonthOverdue ? '#ff4444' : colors.text, 
                                fontSize: 12, 
                                fontWeight: '500' 
                              }}>
                                <Ionicons name="calendar-outline" size={12} color={isMonthOverdue ? '#ff4444' : colors.text} /> {maintenance.intervalMonth} mois
                              </Text>
                            );
                          })()}
                          {maintenance.intervalHours && (() => {
                            const lastHistory = maintenanceHistories[maintenance.id];
                            const hourProgress = calculateHourProgress(maintenance, lastHistory);
                            const isHourOverdue = hourProgress >= 100;
                            console.log(`🟢 Debug HOURS: ${maintenance.name} - HourProgress: ${hourProgress}% - Overdue: ${isHourOverdue}`);
                            return (
                              <Text style={{ 
                                color: isHourOverdue ? '#ff4444' : colors.text, 
                                fontSize: 12, 
                                fontWeight: '500' 
                              }}>
                                <Ionicons name="time-outline" size={12} color={isHourOverdue ? '#ff4444' : colors.text} /> {maintenance.intervalHours}h
                              </Text>
                            );
                          })()}
                        </View>
                      )}
                    </View>

                      {/* Progress Ring avec style amélioré - à droite */}
                      <View style={{ 
                        marginLeft: spacing(3),
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: colors.background,
                        borderWidth: 1,
                        borderColor: colors.border,
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                        elevation: 2,
                      }}>
                        <ProgressRing 
                          percentage={maintenanceProgress[maintenance.id] || 0}
                          size={45}
                          strokeWidth={4}
                          showText={false}
                        />
                      </View>
                  </TouchableOpacity>
                    );
                  })}
              </View>
            ) : (
                <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center', fontStyle: 'italic' }}>
                  Aucune maintenance programmée
                </Text>
              )}
              </Card>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// Component InfoRow pour afficher les informations
function InfoRow({ 
  label, 
  value, 
  colors, 
  spacing 
}: { 
  label: string; 
  value: string; 
  colors: any; 
  spacing: (value: number) => number; 
}) {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing(0.5),
    }}>
      <Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text>
      <Text style={{ color: colors.text, fontWeight: '400' }}>{value}</Text>
    </View>
  );
}