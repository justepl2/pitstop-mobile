import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import LoadingScreen from '../../components/ui/LoadingScreen';
import { MaintenanceItem, fetchMaintenanceById, deleteMaintenance } from '../../services/maintenanceService';
import { VehicleItem } from '../../services/vehiclesService';
import { MaintenanceHistoryItem, fetchMaintenanceHistoriesByMaintenance, deleteMaintenanceHistory } from '../../services/maintenanceHistoryService';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

type MaintenanceDetailRouteProp = RouteProp<{
  MaintenanceDetail: { maintenanceId: number; vehicleName: string; vehicle: VehicleItem };
}, 'MaintenanceDetail'>;

export default function MaintenanceDetailScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<MaintenanceDetailRouteProp>();
  const { getCurrentUserId } = useAuth();
  
  const [maintenance, setMaintenance] = useState<MaintenanceItem | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { maintenanceId, vehicleName, vehicle } = route.params;

  // Fonction pour charger la maintenance
  const loadMaintenance = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      const maintenanceData = await fetchMaintenanceById(maintenanceId, userId);
      setMaintenance(maintenanceData);
    } catch (error: any) {
      Alert.alert('Erreur de chargement', error.message || 'Impossible de charger la maintenance');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [maintenanceId, getCurrentUserId]);

  useEffect(() => {
    loadMaintenance();
  }, [loadMaintenance]);

  // Fonction pour charger l'historique de maintenance
  const loadMaintenanceHistory = useCallback(async () => {
    if (!maintenance) return;

    setLoadingHistory(true);
    try {
      const historyData = await fetchMaintenanceHistoriesByMaintenance(maintenance.id);
      setMaintenanceHistory(historyData);
    } catch (error: any) {
      console.warn('Erreur lors du chargement de l\'historique:', error);
      // On continue même si l'historique ne se charge pas
    } finally {
      setLoadingHistory(false);
    }
  }, [maintenance]);

  // Charger l'historique après le chargement de la maintenance
  useEffect(() => {
    if (maintenance) {
      loadMaintenanceHistory();
    }
  }, [maintenance, loadMaintenanceHistory]);

  // Recharger les données quand on revient sur l'écran (après modification/ajout historique)
  useFocusEffect(
    useCallback(() => {
      loadMaintenance();
    }, [loadMaintenance])
  );

  const handleDelete = async () => {
    if (!maintenance) return;

    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cette maintenance ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const userId = await getCurrentUserId();
              await deleteMaintenance(maintenance.id, userId);
              Alert.alert('Succès', 'Maintenance supprimée avec succès.');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression.');
            }
          }
        },
      ]
    );
  };

  const handleDeleteHistory = async (historyId: number) => {
    Alert.alert(
      'Supprimer l\'historique',
      'Êtes-vous sûr de vouloir supprimer cet historique de maintenance ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteMaintenanceHistory(historyId);
              
              // Recharger l'historique local après suppression
              loadMaintenanceHistory();
              
              Alert.alert('Succès', 'Historique supprimé avec succès !', [
                { 
                  text: 'OK', 
                  onPress: () => {
                    // Retourner vers vehicleDetailsScreen pour déclencher le refresh
                    (navigation as any).navigate('VehicleDetails', { vehicleId: vehicle.id });
                  }
                }
              ]);
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la suppression');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <LoadingScreen message="Chargement de la maintenance…" />;
  }

  if (!maintenance) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Maintenance introuvable" />
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: spacing(4) }}>
          Cette maintenance n'a pas pu être trouvée.
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
          title={maintenance.name || 'Maintenance'}
          subtitle={vehicleName}
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

            <InfoRow label="Nom" value={maintenance.name || 'Maintenance'} colors={colors} spacing={spacing} />
            <InfoRow label="Véhicule" value={vehicleName} colors={colors} spacing={spacing} />
          </View>

          {/* Intervalles de maintenance */}
          {(maintenance.intervalKm || maintenance.intervalMonth || maintenance.intervalHours) && (
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: spacing(2),
              marginBottom: spacing(2),
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing(2) }}>
                Intervalles programmés
              </Text>

              {maintenance.intervalKm && <InfoRow label="Kilomètres" value={`${maintenance.intervalKm.toLocaleString()} km`} colors={colors} spacing={spacing} />}
              {maintenance.intervalMonth && <InfoRow label="Mois" value={`${maintenance.intervalMonth} mois`} colors={colors} spacing={spacing} />}
              {maintenance.intervalHours && <InfoRow label="Heures" value={`${maintenance.intervalHours} heures`} colors={colors} spacing={spacing} />}
            </View>
          )}

          {/* Actions */}
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing(2),
            marginBottom: spacing(2),
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing(2) }}>
              Actions
            </Text>

            <View style={{ gap: spacing(2) }}>
              <Button
                title="✏️ Modifier la maintenance"
                onPress={() => {
                  if (maintenance) {
                    (navigation as any).navigate('EditMaintenance', { 
                      maintenance: maintenance,
                      vehicle: vehicle
                    });
                  }
                }}
                variant="secondary"
              />
              
              <Button
                title="📋 Ajouter un historique"
                onPress={() => {
                  if (maintenance) {
                    (navigation as any).navigate('AddMaintenanceHistory', { 
                      maintenance: maintenance,
                      vehicle: vehicle
                    });
                  }
                }}
                variant="secondary"
              />

              <Button
                title="🗑️ Supprimer cette maintenance"
                onPress={handleDelete}
                variant="danger"
              />
            </View>
          </View>

          {/* Historique des maintenances */}
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing(2),
            marginBottom: spacing(2),
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing(2) }}>
              📅 Historique
            </Text>

            {loadingHistory ? (
              <Text style={{ color: colors.muted, textAlign: 'center', marginVertical: spacing(2) }}>
                Chargement de l'historique...
              </Text>
            ) : maintenanceHistory.length > 0 ? (
              <View style={{ gap: spacing(2) }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: spacing(1) }}>
                  {maintenanceHistory.length} maintenance{maintenanceHistory.length > 1 ? 's' : ''} effectuée{maintenanceHistory.length > 1 ? 's' : ''}
                </Text>
                
                {maintenanceHistory.map((history) => (
                  <View
                    key={history.id}
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 8,
                      padding: spacing(2),
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        {/* Date */}
                        <Text style={{ 
                          color: colors.text, 
                          fontWeight: '600', 
                          marginBottom: spacing(1)
                        }}>
                          📅 {history.date ? new Date(history.date).toLocaleDateString('fr-FR') : 'Date non renseignée'}
                        </Text>
                        
                        {/* Informations conditionnelles */}
                        {(history.km || history.cost || history.details) && (
                          <View style={{ gap: spacing(0.5) }}>
                            {history.km && (
                              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '500' }}>
                                📏 {history.km.toLocaleString()} km
                              </Text>
                            )}
                            
                            {history.cost && (
                              <Text style={{ color: colors.success, fontSize: 14, fontWeight: '600' }}>
                                💰 {history.cost.toFixed(2)} €
                              </Text>
                            )}
                            
                            {history.details && (
                              <Text style={{ 
                                color: colors.muted, 
                                fontSize: 14,
                                marginTop: spacing(0.5),
                                fontStyle: 'italic'
                              }}>
                                {history.details}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                      
                      {/* Bouton de suppression */}
                      <TouchableOpacity
                        onPress={() => handleDeleteHistory(history.id)}
                        style={{
                          padding: spacing(1),
                          borderRadius: 6,
                          backgroundColor: colors.background,
                          borderWidth: 1,
                          borderColor: '#ff4444',
                          marginLeft: spacing(1),
                        }}
                      >
                        <Text style={{ color: '#ff4444', fontSize: 16 }}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: colors.muted, fontSize: 14, textAlign: 'center', fontStyle: 'italic' }}>
                Aucun historique pour cette maintenance
              </Text>
            )}
          </View>

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
