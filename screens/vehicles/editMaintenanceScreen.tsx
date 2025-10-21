import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { MaintenanceItem, updateMaintenance } from '../../services/maintenanceService';
import { VehicleItem } from '../../services/vehiclesService';

type EditMaintenanceRouteProp = RouteProp<{
  EditMaintenance: { maintenance: MaintenanceItem; vehicle: VehicleItem };
}, 'EditMaintenance'>;

export default function EditMaintenanceScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<EditMaintenanceRouteProp>();
  const { getCurrentUserId } = useAuth();

  const { maintenance, vehicle } = route.params;

  // États du formulaire - pré-remplis avec les données existantes
  const [name, setName] = useState(maintenance.name);
  const [intervalKm, setIntervalKm] = useState(maintenance.intervalKm ? maintenance.intervalKm.toString() : '');
  const [intervalMonth, setIntervalMonth] = useState(maintenance.intervalMonth ? maintenance.intervalMonth.toString() : '');
  const [intervalHours, setIntervalHours] = useState(maintenance.intervalHours ? maintenance.intervalHours.toString() : '');
  const [loading, setLoading] = useState(false);

  // Vérifier quels types d'intervalles sont supportés par ce véhicule
  const ageCalculation = vehicle.vehicleType?.age_calculation ?? [];
  const supportsKm = ageCalculation.includes('km');
  const supportsMonth = ageCalculation.includes('month');
  const supportsHours = ageCalculation.includes('hour');

  // Validation du formulaire
  const isFormValid = name.trim().length > 0;

  const handleSubmit = async () => {
    if (!isFormValid) {
      Alert.alert('Erreur', 'Veuillez renseigner au moins le nom de la maintenance.');
      return;
    }

    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      
      await updateMaintenance(maintenance.id, userId, {
        name: name.trim(),
        intervalKm: (supportsKm && intervalKm) ? parseInt(intervalKm) : null,
        intervalMonth: (supportsMonth && intervalMonth) ? parseInt(intervalMonth) : null,
        intervalHours: (supportsHours && intervalHours) ? parseInt(intervalHours) : null,
      });

      Alert.alert('Succès', 'Maintenance modifiée avec succès !', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
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
          title="Modifier maintenance"
          subtitle={`${vehicle.brand} ${vehicle.model}`}
        />
      </View>
      
      <ScreenContainer padding={false} edges={['bottom', 'left', 'right']}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing(4), padding: spacing(2), paddingTop: spacing(1) }}
        >
          
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

            <View style={{ marginBottom: spacing(2) }}>
              <Text style={{ color: colors.text, marginBottom: spacing(1), fontWeight: '600' }}>
                Nom de la maintenance *
              </Text>
              <TextInput
                placeholder="Ex: Vidange moteur, Contrôle technique..."
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Intervalles de maintenance */}
          {(supportsKm || supportsMonth || supportsHours) && (
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
                marginBottom: spacing(1) 
              }}>
                Intervalles de maintenance
              </Text>
              
              <Text style={{ 
                color: colors.muted, 
                fontSize: 14, 
                marginBottom: spacing(2) 
              }}>
                Modifiez la fréquence selon le type de véhicule (optionnel)
              </Text>

            {supportsKm && (
              <View style={{ marginBottom: spacing(2) }}>
                <Text style={{ color: colors.text, marginBottom: spacing(1), fontWeight: '600' }}>
                  Intervalle en kilomètres
                </Text>
                <TextInput
                  placeholder="Ex: 10000"
                  value={intervalKm}
                  onChangeText={setIntervalKm}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
            )}

            {supportsMonth && (
              <View style={{ marginBottom: spacing(2) }}>
                <Text style={{ color: colors.text, marginBottom: spacing(1), fontWeight: '600' }}>
                  Intervalle en mois
                </Text>
                <TextInput
                  placeholder="Ex: 12"
                  value={intervalMonth}
                  onChangeText={setIntervalMonth}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
            )}

            {supportsHours && (
              <View style={{ marginBottom: spacing(0) }}>
                <Text style={{ color: colors.text, marginBottom: spacing(1), fontWeight: '600' }}>
                  Intervalle en heures
                </Text>
                <TextInput
                  placeholder="Ex: 100"
                  value={intervalHours}
                  onChangeText={setIntervalHours}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            )}
          </View>
          )}

          {/* Boutons d'action */}
          <View style={{ gap: spacing(2) }}>
            <Button
              title={loading ? "Modification..." : "Enregistrer les modifications"}
              onPress={handleSubmit}
              disabled={!isFormValid || loading}
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
