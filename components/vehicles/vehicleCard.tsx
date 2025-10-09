// components/vehicles/vehicleCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { VehicleItem, deleteVehicle } from '../../services/vehiclesService';

type VehicleCardProps = { vehicle: VehicleItem; onDelete?: () => void };

export default function VehicleCard({ vehicle, onDelete }: VehicleCardProps) {
  const { colors, spacing } = useTheme();

  const handleDelete = async () => {
    try {
      await deleteVehicle(vehicle.id); // Appelle la fonction centralisée
      Alert.alert('Succès', 'Véhicule supprimé avec succès.');
      if (onDelete) onDelete(); // Appelle une fonction de rappel pour mettre à jour la liste
    } catch (e) {
      console.error('Erreur lors de la suppression du véhicule :', e);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression.');
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: spacing(2),
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
        {vehicle.brand} {vehicle.model}
      </Text>
      <Text style={{ color: colors.muted, marginTop: spacing(0.5) }}>
        {vehicle.registration ? `Immatriculation: ${vehicle.registration}` : 'Immatriculation: —'}
      </Text>
      <Text style={{ color: colors.muted }}>
        {vehicle.year ? `Année: ${vehicle.year} · ` : ''}
        Kilométrage: {vehicle.kilometers} km
      </Text>
      <Text style={{ color: colors.muted }}>
        {vehicle.engineSize ? `Cylindrée: ${vehicle.engineSize} cc` : ''}
        {vehicle.numberOfCylinders ? ` · Cylindres: ${vehicle.numberOfCylinders}` : ''}
        {vehicle.fuelType ? ` · Carburant: ${vehicle.fuelType}` : ''}
        {vehicle.type ? ` · Type: ${vehicle.type}` : ''}
      </Text>

      {/* Bouton de suppression */}
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            'Confirmation',
            'Êtes-vous sûr de vouloir supprimer ce véhicule ?',
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Supprimer', style: 'destructive', onPress: handleDelete },
            ]
          );
        }}
        style={{
          marginTop: spacing(2),
          backgroundColor: colors.danger,
          paddingVertical: spacing(1),
          paddingHorizontal: spacing(2),
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  );
}
