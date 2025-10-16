// components/vehicles/vehicleCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { VehicleItem } from '../../services/vehiclesService';

type VehicleCardProps = { 
  vehicle: VehicleItem; 
  onPress?: () => void;
};

export default function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  const { colors, spacing } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
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
        {vehicle.fuel?.name ? ` · Carburant: ${vehicle.fuel.name}` : ''}
        {vehicle.vehicleType?.name ? ` · Type: ${vehicle.vehicleType.name}` : ''}
      </Text>
    </TouchableOpacity>
  );
}
