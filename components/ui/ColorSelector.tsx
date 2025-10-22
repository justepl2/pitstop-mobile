import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeProvider';
import { getContrastTextColor, normalizeHexColor } from '../../utils/colorUtils';
import ColorPicker from './ColorPicker';

type ColorSelectorProps = {
  selectedColor?: string | null;
  onColorChange: (color: string) => void;
  label?: string;
};

export default function ColorSelector({ 
  selectedColor, 
  onColorChange, 
  label = "Couleur" 
}: ColorSelectorProps) {
  const { colors, spacing, typography } = useTheme();
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  // Normaliser la couleur sélectionnée
  const currentColor = normalizeHexColor(selectedColor);

  const handleColorChange = (newColor: string) => {
    onColorChange(newColor);
    setIsPickerVisible(false); // Fermer le modal après sélection
  };

  return (
    <>
      {/* Ligne de sélection de couleur */}
      <View style={{ marginBottom: spacing(2) }}>
        <Text style={{ 
          color: colors.text, 
          marginBottom: spacing(1), 
          fontWeight: '600',
          fontSize: typography.sizes.base,
        }}>
          {label}
        </Text>
        
        <TouchableOpacity
          onPress={() => setIsPickerVisible(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingVertical: spacing(2),
            paddingHorizontal: spacing(2.5),
            gap: spacing(2),
          }}
        >
          {/* Aperçu de la couleur */}
          <View style={{
            width: 32,
            height: 32,
            backgroundColor: currentColor,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.borderLight,
          }} />
          
          {/* Badge avec la couleur */}
          <View style={{
            backgroundColor: currentColor,
            paddingHorizontal: spacing(2),
            paddingVertical: spacing(1),
            borderRadius: 8,
            flex: 1,
            alignItems: 'center',
          }}>
            <Text style={{
              color: getContrastTextColor(currentColor),
              fontSize: 14,
              fontWeight: '600',
            }}>
              Aperçu du badge
            </Text>
          </View>
          
          {/* Icône pour indiquer que c'est cliquable */}
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
        
        {/* Code couleur */}
        <Text style={{
          fontSize: 12,
          color: colors.textMuted,
          marginTop: spacing(0.5),
          marginLeft: spacing(0.5),
        }}>
          {currentColor.toUpperCase()}
        </Text>
      </View>

      {/* Modal ColorPicker */}
      <Modal
        visible={isPickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: spacing(2),
        }}>
          {/* Header du modal */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing(3),
            paddingBottom: spacing(3),
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.text,
            }}>
              Choisir une couleur
            </Text>
            
            <TouchableOpacity
              onPress={() => setIsPickerVisible(false)}
              style={{
                padding: spacing(1),
              }}
            >
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          
          {/* ColorPicker */}
          <View style={{
            flex: 1,
            paddingHorizontal: spacing(3),
            paddingTop: spacing(3),
          }}>
            <ColorPicker
              selectedColor={selectedColor}
              onColorChange={handleColorChange}
              label="" // Pas de label car déjà dans le header
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
