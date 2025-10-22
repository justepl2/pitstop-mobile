import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import ColorSelector from '../../components/ui/ColorSelector';
import { useAuth } from '../../hooks/useAuth';
import { createMaintenance } from '../../services/maintenanceService';
import { VehicleItem } from '../../services/vehiclesService';
import { MaintenanceTemplateItem, fetchMaintenanceTemplatesByVehicleType } from '../../services/maintenanceTemplatesService';
import { getDefaultMaintenanceColor } from '../../utils/colorUtils';
import { getRandomColor } from '../../components/ui/ColorPicker';

type AddMaintenanceRouteProp = RouteProp<{
  AddMaintenance: { vehicle: VehicleItem };
}, 'AddMaintenance'>;

export default function AddMaintenanceScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<AddMaintenanceRouteProp>();
  const { getCurrentUserId } = useAuth();

  const { vehicle } = route.params;

  // États du formulaire
  const [name, setName] = useState('');
  const [intervalKm, setIntervalKm] = useState('');
  const [intervalMonth, setIntervalMonth] = useState('');
  const [intervalHours, setIntervalHours] = useState('');
  const [color, setColor] = useState(getRandomColor()); // Couleur aléatoire par défaut
  const [loading, setLoading] = useState(false);

  // États pour les templates
  const [templates, setTemplates] = useState<MaintenanceTemplateItem[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Vérifier quels types d'intervalles sont supportés par ce véhicule
  const ageCalculation = vehicle.vehicleType?.age_calculation ?? [];
  const supportsKm = ageCalculation.includes('km');
  const supportsMonth = ageCalculation.includes('month');
  const supportsHours = ageCalculation.includes('hour');

  // Charger les templates de maintenance
  useEffect(() => {
    const loadTemplates = async () => {
      if (!vehicle.vehicleType?.id) {
        return;
      }
      
      setLoadingTemplates(true);
      try {
        const templatesData = await fetchMaintenanceTemplatesByVehicleType(vehicle.vehicleType.id);
        setTemplates(templatesData);
      } catch (error) {
        console.warn('Erreur lors du chargement des templates:', error);
        // On continue même si les templates ne se chargent pas
      } finally {
        setLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, [vehicle.vehicleType?.id]);

  // Fonction pour sélectionner un template
  const selectTemplate = (template: MaintenanceTemplateItem) => {
    setName(template.name);
    // Pré-remplir seulement les champs supportés par le véhicule
    if (supportsKm) {
      setIntervalKm(template.intervalKm ? template.intervalKm.toString() : '');
    }
    if (supportsMonth) {
      setIntervalMonth(template.intervalMonths ? template.intervalMonths.toString() : '');
    }
    if (supportsHours) {
      setIntervalHours(template.intervalHours ? template.intervalHours.toString() : '');
    }
    // Les templates ne contiennent pas encore de couleur, on garde la couleur par défaut
  };

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
      
      await createMaintenance(userId, {
        name: name.trim(),
        vehicleId: vehicle.id,
        intervalKm: (supportsKm && intervalKm) ? parseInt(intervalKm) : null,
        intervalMonth: (supportsMonth && intervalMonth) ? parseInt(intervalMonth) : null,
        intervalHours: (supportsHours && intervalHours) ? parseInt(intervalHours) : null,
        color: color,
      });

      Alert.alert('Succès', 'Maintenance créée avec succès !', [
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
          title="Nouvelle maintenance"
          subtitle={`${vehicle.brand} ${vehicle.model}`}
        />
      </View>
      
      <ScreenContainer padding={false} edges={['bottom', 'left', 'right']}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing(4), padding: spacing(2), paddingTop: spacing(1) }}
        >
          
          {/* Templates suggérés (discret) */}
          {vehicle.vehicleType && templates.length > 0 && !loadingTemplates && (
            <View style={{
              marginBottom: spacing(2),
            }}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '500', 
                color: colors.muted, 
                marginBottom: spacing(1),
                marginLeft: spacing(0.5)
              }}>
                Suggestions rapides :
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1) }}>
                {templates.slice(0, 4).map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    onPress={() => selectTemplate(template)}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 6,
                      paddingHorizontal: spacing(1.5),
                      paddingVertical: spacing(1),
                      borderWidth: 1,
                      borderColor: colors.border,
                      opacity: 0.8,
                    }}
                  >
                    <Text style={{ 
                      color: colors.text, 
                      fontSize: 13,
                      fontWeight: '500'
                    }}>
                      {template.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
            
            {/* Couleur de la maintenance */}
            <ColorSelector
              selectedColor={color}
              onColorChange={setColor}
              label="Couleur de la maintenance"
            />
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
                Définissez la fréquence selon le type de véhicule (optionnel)
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
              title={loading ? "Création..." : "Créer la maintenance"}
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
