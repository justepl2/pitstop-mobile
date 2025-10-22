import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeProvider';
import { getContrastTextColor, getDefaultMaintenanceColor, generateRandomAccessibleColor } from '../../utils/colorUtils';

export type ColorOption = {
  name: string;
  color: string;
};

// Palette de couleurs prédéfinies pour les maintenances
export const MAINTENANCE_COLORS: ColorOption[] = [
  { name: 'Rouge', color: '#dc2626' },      // red-600 (default)
  { name: 'Bleu', color: '#2563eb' },       // blue-600
  { name: 'Vert', color: '#16a34a' },       // green-600
  { name: 'Orange', color: '#ea580c' },     // orange-600
  { name: 'Violet', color: '#9333ea' },     // purple-600
  { name: 'Rose', color: '#e11d48' },       // rose-600
  { name: 'Jaune', color: '#ca8a04' },      // yellow-600
  { name: 'Indigo', color: '#4f46e5' },     // indigo-600
  { name: 'Cyan', color: '#0891b2' },       // cyan-600
  { name: 'Gris', color: '#4b5563' },       // gray-600
  { name: 'Emeraude', color: '#059669' },   // emerald-600
  { name: 'Teal', color: '#0d9488' },       // teal-600
];

type ColorPickerProps = {
  selectedColor?: string | null;
  onColorChange: (color: string) => void;
  label?: string;
};

// Fonction pour générer une couleur aléatoire parmi les prédéfinies
export const getRandomPresetColor = (): string => {
  const randomIndex = Math.floor(Math.random() * MAINTENANCE_COLORS.length);
  return MAINTENANCE_COLORS[randomIndex].color;
};

// Fonction pour générer une couleur vraiment aléatoire avec accessibilité
export const getRandomColor = (): string => {
  return generateRandomAccessibleColor();
};

export default function ColorPicker({ 
  selectedColor, 
  onColorChange, 
  label = "Couleur de la maintenance" 
}: ColorPickerProps) {
  const { colors, spacing, typography } = useTheme();
  
  // État pour le mode de sélection
  const [isRandomMode, setIsRandomMode] = useState(false);

  // Normaliser la couleur sélectionnée (défaut si vide)
  const currentColor = selectedColor || getDefaultMaintenanceColor();

  // Fonction pour générer et appliquer une couleur aléatoire
  const handleRandomColor = () => {
    const randomColor = getRandomColor();
    onColorChange(randomColor);
  };

  return (
    <View style={{ marginBottom: spacing(3) }}>
      {/* Label */}
      <Text style={{
        fontSize: typography.sizes.base,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing(1),
      }}>
        {label}
      </Text>

      {/* Choix du mode de sélection */}
      <View style={{
        flexDirection: 'row',
        marginBottom: spacing(2),
        gap: spacing(1),
      }}>
        <TouchableOpacity
          onPress={() => setIsRandomMode(false)}
          style={{
            flex: 1,
            paddingVertical: spacing(1.5),
            paddingHorizontal: spacing(2),
            backgroundColor: !isRandomMode ? colors.primary : colors.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: !isRandomMode ? colors.primary : colors.border,
            alignItems: 'center',
          }}
        >
          <Text style={{
            color: !isRandomMode ? 'white' : colors.text,
            fontWeight: !isRandomMode ? '600' : '400',
            fontSize: 14,
          }}>
            🎨 Choisir
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => {
            setIsRandomMode(true);
            handleRandomColor();
          }}
          style={{
            flex: 1,
            paddingVertical: spacing(1.5),
            paddingHorizontal: spacing(2),
            backgroundColor: isRandomMode ? colors.primary : colors.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isRandomMode ? colors.primary : colors.border,
            alignItems: 'center',
          }}
        >
          <Text style={{
            color: isRandomMode ? 'white' : colors.text,
            fontWeight: isRandomMode ? '600' : '400',
            fontSize: 14,
          }}>
            🎲 Aléatoire
          </Text>
        </TouchableOpacity>
      </View>

      {/* Aperçu de la couleur sélectionnée */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing(2),
        padding: spacing(2),
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <View style={{
          width: 32,
          height: 32,
          backgroundColor: currentColor,
          borderRadius: 16,
          marginRight: spacing(2),
          borderWidth: 2,
          borderColor: colors.border,
        }} />
        
        <Text style={{
          fontSize: typography.sizes.base,
          color: colors.text,
          flex: 1,
        }}>
          Couleur sélectionnée
        </Text>
        
        {/* Badge avec la couleur */}
        <View style={{
          backgroundColor: currentColor,
          paddingHorizontal: spacing(1.5),
          paddingVertical: spacing(0.5),
          borderRadius: 8,
        }}>
          <Text style={{
            color: getContrastTextColor(currentColor),
            fontSize: 12,
            fontWeight: '600',
          }}>
            Aperçu
          </Text>
        </View>
      </View>

      {/* Grille de couleurs - seulement en mode manuel */}
      {!isRandomMode ? (
        <>
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: colors.textMuted,
            marginBottom: spacing(1.5),
          }}>
            Choisissez une couleur :
          </Text>

          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing(1.5),
          }}>
            {MAINTENANCE_COLORS.map((colorOption, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  onColorChange(colorOption.color);
                  setIsRandomMode(false); // S'assurer qu'on reste en mode manuel
                }}
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: colorOption.color,
                  borderRadius: 12,
                  borderWidth: 3,
                  borderColor: currentColor === colorOption.color ? colors.primary : colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                {/* Icône de validation si sélectionné */}
                {currentColor === colorOption.color && (
                  <Ionicons 
                    name="checkmark" 
                    size={24} 
                    color={getContrastTextColor(colorOption.color)} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        /* Bouton pour générer une nouvelle couleur aléatoire */
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleRandomColor}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              paddingVertical: spacing(2),
              paddingHorizontal: spacing(3),
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              gap: spacing(1.5),
            }}
          >
            <Ionicons name="refresh" size={20} color={colors.text} />
            <Text style={{
              fontSize: 16,
              fontWeight: '500',
              color: colors.text,
            }}>
              Nouvelle couleur aléatoire
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
