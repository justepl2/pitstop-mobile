import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeProvider';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import { MaintenanceItem, fetchMaintenancesByVehicle } from '../../services/maintenanceService';
import { VehicleItem } from '../../services/vehiclesService';
import { createMaintenanceHistory } from '../../services/maintenanceHistoryService';
import { useAuth } from '../../hooks/useAuth';
import DateTimePicker from '@react-native-community/datetimepicker';

type AddMaintenanceHistoryRouteProp = RouteProp<{
  AddMaintenanceHistory: { 
    maintenance?: MaintenanceItem; // Optionnel pour mode multiple
    vehicle: VehicleItem;
    multipleMode?: boolean; // Nouveau paramètre pour le mode multiple
  };
}, 'AddMaintenanceHistory'>;

export default function AddMaintenanceHistoryScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<AddMaintenanceHistoryRouteProp>();

  const { maintenance, vehicle, multipleMode = false } = route.params;
  const { getCurrentUserId } = useAuth();

  // États du formulaire
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [km, setKm] = useState('');
  const [hours, setHours] = useState('');
  const [details, setDetails] = useState('');
  const [cost, setCost] = useState('');
  const [loading, setLoading] = useState(false);

  // États pour le mode multiple
  const [allMaintenances, setAllMaintenances] = useState<MaintenanceItem[]>([]);
  const [selectedMaintenances, setSelectedMaintenances] = useState<Set<number>>(new Set());
  const [loadingMaintenances, setLoadingMaintenances] = useState(false);

  // Vérifier quels types d'intervalles sont supportés par ce véhicule
  const ageCalculation = vehicle.vehicleType?.age_calculation ?? [];
  const supportsKm = ageCalculation.includes('km');
  const supportsHours = ageCalculation.includes('hour');

  // Charger toutes les maintenances du véhicule si mode multiple
  useEffect(() => {
    if (multipleMode) {
      loadMaintenances();
    }
  }, [multipleMode, vehicle.id]);

  const loadMaintenances = async () => {
    setLoadingMaintenances(true);
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        const maintenances = await fetchMaintenancesByVehicle(vehicle.id, userId);
        setAllMaintenances(maintenances);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des maintenances:', error);
    } finally {
      setLoadingMaintenances(false);
    }
  };

  // Gestion de la sélection des maintenances
  const toggleMaintenanceSelection = (maintenanceId: number) => {
    setSelectedMaintenances(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(maintenanceId)) {
        newSelection.delete(maintenanceId);
      } else {
        newSelection.add(maintenanceId);
      }
      return newSelection;
    });
  };

  const selectAllMaintenances = () => {
    setSelectedMaintenances(new Set(allMaintenances.map(m => m.id)));
  };

  const clearSelection = () => {
    setSelectedMaintenances(new Set());
  };

  // Formatage de la date pour l'affichage
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR');
  };

  // Formatage de la date pour la base de données (YYYY-MM-DD)
  const formatDateForDB = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (multipleMode) {
        // Mode multiple : créer un historique pour chaque maintenance sélectionnée
        if (selectedMaintenances.size === 0) {
          Alert.alert('Erreur', 'Veuillez sélectionner au moins une maintenance.');
          return;
        }

        const promises: Promise<any>[] = [];
        selectedMaintenances.forEach(maintenanceId => {
          promises.push(
            createMaintenanceHistory({
              maintenanceIds: maintenanceId,
              date: formatDateForDB(date),
              km: (supportsKm && km) ? parseInt(km) : undefined,
              details: details.trim() || undefined,
              cost: cost ? parseFloat(cost) : undefined,
            })
          );
        });

        await Promise.all(promises);

        Alert.alert(
          'Succès', 
          `Historique ajouté pour ${selectedMaintenances.size} maintenance${selectedMaintenances.size > 1 ? 's' : ''} !`, 
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        // Mode simple : maintenance unique
        await createMaintenanceHistory({
          maintenanceIds: maintenance!.id,
          date: formatDateForDB(date),
          km: (supportsKm && km) ? parseInt(km) : undefined,
          details: details.trim() || undefined,
          cost: cost ? parseFloat(cost) : undefined,
        });

        Alert.alert('Succès', 'Historique de maintenance ajouté avec succès !', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <>
      <View style={{ 
        backgroundColor: colors.background, 
        paddingTop: spacing(2),
        paddingHorizontal: spacing(2)
      }}>
        <ScreenHeader
          title={multipleMode ? "Historique multiple" : "Ajouter historique"}
          subtitle={multipleMode ? `${vehicle.brand} ${vehicle.model}` : maintenance?.name}
        />
      </View>
      
      <ScreenContainer padding={false} edges={['bottom', 'left', 'right']}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing(4), padding: spacing(2), paddingTop: spacing(1) }}
        >
          
          {/* Sélection des maintenances en mode multiple */}
          {multipleMode && (
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: spacing(2),
              marginBottom: spacing(3),
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(2) }}>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: '700', 
                  color: colors.text 
                }}>
                  Sélectionner les maintenances
                </Text>
                <Text style={{ color: colors.muted, fontSize: 14 }}>
                  {selectedMaintenances.size}/{allMaintenances.length}
                </Text>
              </View>

              {loadingMaintenances ? (
                <Text style={{ color: colors.muted, textAlign: 'center', padding: spacing(2) }}>
                  Chargement des maintenances...
                </Text>
              ) : allMaintenances.length === 0 ? (
                <Text style={{ color: colors.muted, textAlign: 'center', padding: spacing(2) }}>
                  Aucune maintenance trouvée pour ce véhicule.
                </Text>
              ) : (
                <>
                  {/* Boutons de sélection rapide */}
                  <View style={{ flexDirection: 'row', gap: spacing(1), marginBottom: spacing(2) }}>
                    <TouchableOpacity
                      onPress={selectAllMaintenances}
                      style={{
                        backgroundColor: colors.primary + '20',
                        paddingHorizontal: spacing(2),
                        paddingVertical: spacing(1),
                        borderRadius: 8,
                        flex: 1,
                      }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
                        Tout sélectionner
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={clearSelection}
                      style={{
                        backgroundColor: colors.muted + '20',
                        paddingHorizontal: spacing(2),
                        paddingVertical: spacing(1),
                        borderRadius: 8,
                        flex: 1,
                      }}
                    >
                      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
                        Désélectionner
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Liste des maintenances */}
                  {allMaintenances.map((maintenanceItem) => (
                    <TouchableOpacity
                      key={maintenanceItem.id}
                      onPress={() => toggleMaintenanceSelection(maintenanceItem.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: spacing(1.5),
                        paddingHorizontal: spacing(1),
                        borderRadius: 8,
                        backgroundColor: selectedMaintenances.has(maintenanceItem.id) 
                          ? colors.primary + '10' 
                          : 'transparent',
                        marginBottom: spacing(1),
                      }}
                    >
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: selectedMaintenances.has(maintenanceItem.id) 
                          ? colors.primary 
                          : colors.border,
                        backgroundColor: selectedMaintenances.has(maintenanceItem.id) 
                          ? colors.primary 
                          : 'transparent',
                        marginRight: spacing(2),
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {selectedMaintenances.has(maintenanceItem.id) && (
                          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                        )}
                      </View>
                      
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          color: colors.text, 
                          fontWeight: '600',
                          marginBottom: spacing(0.5)
                        }}>
                          {maintenanceItem.name}
                        </Text>
                        
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) }}>
                          {maintenanceItem.intervalKm && (
                            <Text style={{ color: colors.muted, fontSize: 12 }}>
                              <Ionicons name="speedometer-outline" size={12} color={colors.muted} /> {maintenanceItem.intervalKm.toLocaleString()} km
                            </Text>
                          )}
                          {maintenanceItem.intervalMonth && (
                            <Text style={{ color: colors.muted, fontSize: 12 }}>
                              <Ionicons name="calendar-outline" size={12} color={colors.muted} /> {maintenanceItem.intervalMonth} mois
                            </Text>
                          )}
                          {maintenanceItem.intervalHours && (
                            <Text style={{ color: colors.muted, fontSize: 12 }}>
                              <Ionicons name="time-outline" size={12} color={colors.muted} /> {maintenanceItem.intervalHours}h
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          )}

          {/* Informations de base */}
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing(2),
            marginBottom: spacing(3),
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '700', 
              color: colors.text, 
              marginBottom: spacing(2) 
            }}>
              Informations de base
            </Text>

            {/* Date */}
            <View style={{ marginBottom: spacing(2) }}>
              <Text style={{ color: colors.text, marginBottom: spacing(1), fontWeight: '600' }}>
                Date de la maintenance *
              </Text>
              <Button
                title={formatDate(date)}
                onPress={() => setShowDatePicker(true)}
                variant="secondary"
              />
              
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Kilométrage conditionnel */}
            {supportsKm && (
              <View style={{ marginBottom: spacing(2) }}>
                <Text style={{ color: colors.text, marginBottom: spacing(1), fontWeight: '600' }}>
                  Kilométrage au compteur
                </Text>
                <TextInput
                  placeholder="Ex: 75000"
                  value={km}
                  onChangeText={setKm}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
            )}

            {/* Heures conditionnelles */}
            {supportsHours && (
              <View style={{ marginBottom: spacing(2) }}>
                <Text style={{ color: colors.text, marginBottom: spacing(1), fontWeight: '600' }}>
                  Heures de fonctionnement
                </Text>
                <TextInput
                  placeholder="Ex: 250"
                  value={hours}
                  onChangeText={setHours}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
            )}

            {/* Détails */}
            <View style={{ marginBottom: spacing(2) }}>
              <Text style={{ color: colors.text, marginBottom: spacing(1), fontWeight: '600' }}>
                Détails et notes
              </Text>
              <TextInput
                placeholder="Ex: Filtre à huile changé, liquide de frein vérifié..."
                value={details}
                onChangeText={setDetails}
                multiline
                numberOfLines={3}
                returnKeyType="next"
              />
            </View>

            {/* Coût */}
            <View style={{ marginBottom: spacing(0) }}>
              <Text style={{ color: colors.text, marginBottom: spacing(1), fontWeight: '600' }}>
                Coût (€)
              </Text>
              <TextInput
                placeholder="Ex: 85.50"
                value={cost}
                onChangeText={setCost}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Information contextuelle */}
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing(2),
            marginBottom: spacing(3),
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: colors.text, 
              marginBottom: spacing(1) 
            }}>
              {multipleMode ? '🚗 Véhicule concerné' : '📋 Maintenance concernée'}
            </Text>
            
            {!multipleMode && (
              <Text style={{ color: colors.text, marginBottom: spacing(1) }}>
                <Text style={{ fontWeight: '600' }}>Type:</Text> {maintenance?.name}
              </Text>
            )}
            
            <Text style={{ color: colors.text, marginBottom: spacing(1) }}>
              <Text style={{ fontWeight: '600' }}>Véhicule:</Text> {vehicle.brand} {vehicle.model}
            </Text>

            {multipleMode && selectedMaintenances.size > 0 && (
              <Text style={{ color: colors.text, marginBottom: spacing(1) }}>
                <Text style={{ fontWeight: '600' }}>Maintenances sélectionnées:</Text> {selectedMaintenances.size}
              </Text>
            )}

            {/* Intervalles programmés pour mode simple */}
            {!multipleMode && maintenance && (maintenance.intervalKm || maintenance.intervalMonth || maintenance.intervalHours) && (
              <View style={{ marginTop: spacing(1) }}>
                <Text style={{ color: colors.muted, fontSize: 14, fontWeight: '600', marginBottom: spacing(0.5) }}>
                  Intervalles programmés:
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) }}>
                  {maintenance.intervalKm && (
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '500' }}>
                      <Ionicons name="speedometer-outline" size={12} color={colors.primary} /> {maintenance.intervalKm.toLocaleString()} km
                    </Text>
                  )}
                  {maintenance.intervalMonth && (
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '500' }}>
                      <Ionicons name="calendar-outline" size={12} color={colors.primary} /> {maintenance.intervalMonth} mois
                    </Text>
                  )}
                  {maintenance.intervalHours && (
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '500' }}>
                      <Ionicons name="time-outline" size={12} color={colors.primary} /> {maintenance.intervalHours}h
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Boutons d'action */}
          <View style={{ gap: spacing(2) }}>
            <Button
              title={loading 
                ? "Ajout en cours..." 
                : multipleMode 
                  ? `Ajouter historique (${selectedMaintenances.size})`
                  : "Ajouter à l'historique"
              }
              onPress={handleSubmit}
              disabled={loading || (multipleMode && selectedMaintenances.size === 0)}
            />
            
            <Button
              title="Annuler"
              variant="secondary"
              onPress={handleCancel}
              disabled={loading}
            />
          </View>

        </ScrollView>
      </ScreenContainer>
    </>
  );
}
