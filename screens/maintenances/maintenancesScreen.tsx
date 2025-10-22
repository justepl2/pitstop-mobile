import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, Alert, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ui/ScreenContainer';
import LoadingScreen from '../../components/ui/LoadingScreen';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { MaintenanceHistoryItem, fetchMaintenanceHistoriesByUser } from '../../services/maintenanceHistoryService';
import { VehicleItem, fetchVehicles } from '../../services/vehiclesService';
import { MaintenanceItem, fetchMaintenances } from '../../services/maintenanceService';
import { useAuth } from '../../hooks/useAuth';
import { getContrastTextColor, normalizeHexColor } from '../../utils/colorUtils';

type MaintenanceWithDetails = MaintenanceHistoryItem & {
  maintenanceType?: MaintenanceItem;
};

export default function MaintenancesScreen() {
  const { colors, spacing, typography, shadows } = useTheme();
  const navigation = useNavigation();
  const { getCurrentUserId } = useAuth();
  
  const [maintenances, setMaintenances] = useState<MaintenanceWithDetails[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [filteredMaintenances, setFilteredMaintenances] = useState<MaintenanceWithDetails[]>([]);

  const loadData = useCallback(async () => {
    try {
      const userId = await getCurrentUserId();
      
      // Charger les données en parallèle
      const [maintenancesData, vehiclesData, typesData] = await Promise.all([
        fetchMaintenanceHistoriesByUser(userId),
        fetchVehicles(userId),
        fetchMaintenances(userId)
      ]);
      
    // Enrichir les maintenances avec les types (les véhicules sont déjà enrichis dans fetchMaintenanceHistoriesByUser)
    const enrichedMaintenances = maintenancesData.map(maintenance => {
      const maintenanceType = typesData.find(t => t.id === maintenance.maintenanceIds);
      
      
      return {
        ...maintenance,
        maintenanceType
      };
    });
      
      setMaintenances(enrichedMaintenances);
      setVehicles(vehiclesData);
      setMaintenanceTypes(typesData);
      setFilteredMaintenances(enrichedMaintenances);
    } catch (error: any) {
      console.error('❌ ERROR loading maintenances data:', error);
      Alert.alert('Erreur de chargement', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getCurrentUserId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // Filtrer les maintenances selon les critères sélectionnés
  useEffect(() => {
    let filtered = maintenances;
    
    if (selectedVehicle !== 'all') {
      filtered = filtered.filter(m => m.vehicle?.id === selectedVehicle);
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(m => m.maintenanceType?.id.toString() === selectedType);
    }
    
    // Trier par date décroissante
    filtered.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    
    setFilteredMaintenances(filtered);
  }, [maintenances, selectedVehicle, selectedType]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatKilometers = (km?: number) => {
    if (!km) return 'N/A';
    return km.toLocaleString('fr-FR') + ' km';
  };

  const calculateNextMaintenance = (maintenance: MaintenanceWithDetails) => {
    if (!maintenance.maintenanceType || !maintenance.date || !maintenance.km) {
      return null;
    }
    
    const nextDate = maintenance.maintenanceType.intervalMonth 
      ? new Date(new Date(maintenance.date).setMonth(
          new Date(maintenance.date).getMonth() + maintenance.maintenanceType.intervalMonth
        ))
      : null;
    
    const nextKm = maintenance.maintenanceType.intervalKm 
      ? maintenance.km + maintenance.maintenanceType.intervalKm
      : null;
    
    return { date: nextDate, km: nextKm };
  };

  const renderMaintenanceCard = ({ item }: { item: MaintenanceWithDetails }) => {
    const nextMaintenance = calculateNextMaintenance(item);
    
    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          paddingTop: spacing(2),
          paddingBottom: spacing(3),
          paddingHorizontal: spacing(3),
          marginBottom: spacing(2),
          ...shadows.md,
          borderWidth: 1,
          borderColor: colors.borderLight,
        }}
        onPress={() => {
          // Navigation vers les détails
        }}
      >
        {/* Header avec type et edit */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: spacing(1),
        }}>
          <View style={{
            backgroundColor: normalizeHexColor(item.maintenanceType?.color),
            paddingHorizontal: spacing(1.5),
            paddingVertical: spacing(0.5),
            borderRadius: 12,
          }}>
            <Text style={{
              color: getContrastTextColor(normalizeHexColor(item.maintenanceType?.color)),
              fontSize: 12,
              fontWeight: '600',
            }}>
            {item.vehicle ? `${item.vehicle?.brand + ' ' + item.vehicle?.model}` : 'Type inconnu'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={{
              padding: spacing(1),
            }}
            onPress={() => {
              // Navigation vers édition
            }}
          >
            <Ionicons name="create-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Maintenance type */}
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          marginBottom: spacing(1),
          textTransform: 'capitalize',
        }}>
          {item.maintenanceName || item.maintenanceType?.name || 'Type inconnu'}
        </Text>

        {/* Date et km */}
        <View style={{
          flexDirection: 'row',
          gap: spacing(3),
          marginBottom: spacing(1),
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(0.5) }}>
            <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              {formatDate(item.date)}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(0.5) }}>
            <Ionicons name="speedometer-outline" size={16} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              {formatKilometers(item.km)}
            </Text>
          </View>
        </View>

        {/* Lieu et coût */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing(2),
        }}>
          {item.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(0.5) }}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                {item.location}
              </Text>
            </View>
          )}
          
          {item.cost && (
            <Text style={{
              color: colors.success,
              fontSize: 16,
              fontWeight: '600',
            }}>
              {item.cost.toFixed(2)}€
            </Text>
          )}
        </View>

        {/* Description */}
        {item.details && (
          <Text style={{
            color: colors.text,
            fontSize: 14,
            marginBottom: spacing(2),
            lineHeight: 20,
          }}>
            {item.details}
          </Text>
        )}

        {/* Prochaine échéance */}
        {nextMaintenance && (nextMaintenance.date || nextMaintenance.km) && (
          <View style={{
            backgroundColor: colors.backgroundSecondary,
            padding: spacing(2),
            borderRadius: 12,
            marginTop: spacing(1),
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
              marginBottom: spacing(1),
            }}>
              Prochaine échéance:
            </Text>
            
            <View style={{
              flexDirection: 'row',
              gap: spacing(3),
            }}>
              {nextMaintenance.date && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(0.5) }}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                    {formatDate(nextMaintenance.date.toISOString())}
                  </Text>
                </View>
              )}
              
              {nextMaintenance.km && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(0.5) }}>
                  <Ionicons name="speedometer-outline" size={14} color={colors.textMuted} />
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                    {formatKilometers(nextMaintenance.km)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingScreen message="Chargement des entretiens…" />;
  }

  return (
    <ScreenContainer padding={false} edges={['left', 'right']}>
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
            Entretiens
          </Text>
          
          {/* Sous-titre */}
          <Text style={{
            fontSize: 16,
            color: colors.textMuted,
            marginBottom: spacing(3),
          }}>
            Historique et gestion des entretiens
          </Text>
          
          {/* Bouton Nouvel Entretien */}
          <Button
            title="Nouvel Entretien"
            icon={{ family: 'Ionicons', name: 'add' }}
            onPress={() => {
              // Navigation vers nouvel entretien
            }}
            variant="primary"
            size="lg"
            fullWidth
          />
          
          {/* Filtres */}
          <View style={{
            flexDirection: 'row',
            gap: spacing(2),
            marginTop: spacing(2),
          }}>
            {/* Filtre véhicules */}
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: spacing(2),
                  paddingVertical: spacing(1.5),
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: colors.text,
                  fontSize: 14,
                }}>
                  Tous les véhicules
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            
            {/* Filtre types */}
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: spacing(2),
                  paddingVertical: spacing(1.5),
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: colors.text,
                  fontSize: 14,
                }}>
                  Tous les types
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Liste des entretiens */}
        <View style={{
          paddingHorizontal: spacing(3),
          paddingTop: spacing(2),
        }}>
          {filteredMaintenances.length > 0 ? (
            <FlatList
              data={filteredMaintenances}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={renderMaintenanceCard}
            />
          ) : (
            <EmptyState
              title="Aucun entretien"
              message="Vous n'avez pas encore enregistré d'entretien."
              actionTitle="Ajouter un entretien"
              onAction={() => {
                // Navigation vers nouvel entretien
              }}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
