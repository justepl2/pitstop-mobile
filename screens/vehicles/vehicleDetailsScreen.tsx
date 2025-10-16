import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import LoadingScreen from '../../components/ui/LoadingScreen';
import { VehicleItem, fetchVehicleById, deleteVehicle } from '../../services/vehiclesService';
import Button from '../../components/ui/Button';
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
  const [loading, setLoading] = useState(true);

  const { vehicleId } = route.params;

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const userId = await getCurrentUserId();
        const data = await fetchVehicleById(vehicleId, userId);
        setVehicle(data);
      } catch (error: any) {
        Alert.alert('Erreur de chargement', error.message || 'Impossible de charger le véhicule');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [vehicleId]);

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
