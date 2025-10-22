// components/vehicles/vehicleCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeProvider';
import { VehicleItem } from '../../services/vehiclesService';
import { getFuelColors } from '../../utils/fuelColors';

type VehicleCardProps = { 
  vehicle: VehicleItem; 
  onPress?: () => void;
};

export default function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  const { colors, spacing, shadows } = useTheme();

  const formatKilometers = (km: number) => {
    return km.toLocaleString('fr-FR');
  };

  // Récupérer les couleurs pour le carburant
  const fuelColors = getFuelColors(vehicle.fuel?.name);

  // Récupérer l'icône selon le type de véhicule
  const getVehicleIcon = () => {
    const vehicleTypeId = vehicle.vehicleType?.id;
    
    switch (vehicleTypeId) {
      case 1:
        return { library: 'FontAwesome6', name: 'car' }; // 🚗 Voiture
      case 2:
        return { library: 'FontAwesome5', name: 'motorcycle' }; // 🏍️ Moto
      case 7:
        return { library: 'FontAwesome6', name: 'motorcycle' }; // 🏔️ Cross/Terrain
      default:
        return { library: 'Ionicons', name: 'car' }; // 🚗 Par défaut
    }
  };

  // Fonction pour rendre l'icône selon la bibliothèque
  const renderVehicleIcon = () => {
    const iconConfig = getVehicleIcon();
    const iconProps = {
      size: 40,
      color: colors.textMuted
    };

    switch (iconConfig.library) {
      case 'FontAwesome6':
        return <FontAwesome6 name={iconConfig.name as any} {...iconProps} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={iconConfig.name as any} {...iconProps} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconConfig.name as any} {...iconProps} />;
      case 'Ionicons':
      default:
        return <Ionicons name={iconConfig.name as any} {...iconProps} />;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing(3),
        ...shadows.md,
        borderWidth: 1,
        borderColor: colors.borderLight,
      }}
    >
      {/* Icône du véhicule */}
      <View style={{
        alignItems: 'center',
        marginBottom: spacing(3),
      }}>
        <View style={{
          width: 80,
          height: 80,
          backgroundColor: colors.backgroundSecondary,
          borderRadius: 40,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing(2),
        }}>
          {renderVehicleIcon()}
        </View>
      </View>

      {/* Informations du véhicule */}
      <View>
        {/* Nom du véhicule */}
        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          marginBottom: spacing(1),
          textTransform: 'lowercase',
        }}>
          {vehicle.brand} {vehicle.model}
        </Text>

        {/* Badges carburant, année et cylindrée */}
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing(1),
          marginBottom: spacing(2),
        }}>
          {vehicle.fuel?.name && (
            <View style={{
              backgroundColor: fuelColors.background,
              paddingHorizontal: spacing(1.5),
              paddingVertical: spacing(0.5),
              borderRadius: 12,
            }}>
              <Text style={{
                color: fuelColors.text,
                fontSize: 12,
                fontWeight: '600',
              }}>
                {fuelColors.name.toLowerCase()}
              </Text>
            </View>
          )}
          
          {vehicle.year && (
            <View style={{
              backgroundColor: colors.textMuted,
              paddingHorizontal: spacing(1.5),
              paddingVertical: spacing(0.5),
              borderRadius: 12,
            }}>
              <Text style={{
                color: 'white',
                fontSize: 12,
                fontWeight: '600',
              }}>
                {vehicle.year}
              </Text>
            </View>
          )}

          {vehicle.engineSize && (
            <View style={{
              backgroundColor: colors.borderFocus,
              paddingHorizontal: spacing(1.5),
              paddingVertical: spacing(0.5),
              borderRadius: 12,
            }}>
              <Text style={{
                color: 'white',
                fontSize: 12,
                fontWeight: '600',
              }}>
                {vehicle.engineSize} cc
              </Text>
            </View>
          )}
        </View>

        {/* Plaque d'immatriculation */}
        {vehicle.registration && (
          <View style={{
            backgroundColor: '#2d3748',
            paddingHorizontal: spacing(2),
            paddingVertical: spacing(1),
            borderRadius: 8,
            alignSelf: 'flex-start',
            marginBottom: spacing(2),
          }}>
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '700',
              letterSpacing: 1,
            }}>
              {vehicle.registration.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Kilométrage */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing(1),
        }}>
          <Ionicons 
            name="speedometer-outline" 
            size={16} 
            color={colors.textMuted}
          />
          <Text style={{
            color: colors.textMuted,
            fontSize: 14,
            fontWeight: '500',
          }}>
            {formatKilometers(vehicle.kilometers || 0)} km
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
