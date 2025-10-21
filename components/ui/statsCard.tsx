// components/ui/statsCard.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';

type CategoryIcon = {
  family: 'MaterialIcons' | 'Ionicons' | 'FontAwesome' | 'Feather';
  name: string;
  gradientColors: string[];
};

type StatsCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  layout?: 'center' | 'left'; // Nouveau: layout aligné à gauche
  categoryIcon?: CategoryIcon; // Nouveau: icône de catégorie avec dégradé
  onPress?: () => void;
};

export default function StatsCard({ 
  title, 
  value, 
  subtitle,
  icon,
  color = 'primary',
  size = 'md',
  layout = 'center',
  categoryIcon,
  onPress 
}: StatsCardProps) {
  const { colors, spacing, radius, shadows, typography } = useTheme();
  const [pressed, setPressed] = useState(false);

  const getColorScheme = () => {
    switch (color) {
      case 'success':
        return { 
          primary: colors.success, 
          light: colors.successLight,
          background: colors.successLight + '20'
        };
      case 'warning':
        return { 
          primary: colors.warning, 
          light: colors.warningLight,
          background: colors.warningLight + '20'
        };
      case 'danger':
        return { 
          primary: colors.danger, 
          light: colors.dangerLight,
          background: colors.dangerLight + '20'
        };
      case 'info':
        return { 
          primary: colors.info, 
          light: colors.infoLight,
          background: colors.infoLight + '20'
        };
      default:
        return { 
          primary: colors.primary, 
          light: colors.primary + '20',
          background: colors.primary + '10'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: spacing(2),
          minHeight: 70,
          borderRadius: radius.md,
        };
      case 'md':
        return {
          padding: spacing(3),
          minHeight: 90,
          borderRadius: radius.lg,
        };
      case 'lg':
        return {
          padding: spacing(4),
          minHeight: 110,
          borderRadius: radius.xl,
        };
      default:
        return {
          padding: spacing(3),
          minHeight: 90,
          borderRadius: radius.lg,
        };
    }
  };

  const getValueFontSize = () => {
    switch (size) {
      case 'sm':
        return typography.sizes.xl;
      case 'md':
        return typography.sizes['2xl'];
      case 'lg':
        return typography.sizes['3xl'];
      default:
        return typography.sizes['2xl'];
    }
  };

  const colorScheme = getColorScheme();

  if (layout === 'left') {
    // Layout aligné à gauche avec carré de catégorie
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        disabled={!onPress}
        style={{
          backgroundColor: pressed ? colors.backgroundSecondary : colors.surface,
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          borderWidth: 0, // Suppression de la bordure
          transform: [{ scale: pressed ? 0.98 : 1 }],
          ...getSizeStyles(),
          ...shadows.lg, // Ombre plus marquée
          position: 'relative', // Pour positionner le carré
          overflow: 'hidden', // Pour couper l'arc qui dépasse
        }}
      >
        {/* Arc de cercle décoratif en haut à droite */}
        {categoryIcon && (
          <View style={{
            position: 'absolute',
            top: -150, // Décalé vers le haut pour centrer sur l'angle (3x plus)
            right: -150, // Décalé vers la droite pour centrer sur l'angle (3x plus)
            width: 300, // 3 fois plus gros (100 * 3)
            height: 300, // 3 fois plus gros (100 * 3)
            borderRadius: 150, // Cercle parfait (300/2)
          }}>
            <LinearGradient
              colors={[
                `${categoryIcon.gradientColors[0]}20`, // 20 = ~12% opacité au centre
                `${categoryIcon.gradientColors[1]}08`, // 08 = ~3% opacité aux bords
                `${categoryIcon.gradientColors[1]}00`, // 00 = 0% opacité complètement transparent
              ]}
              start={{ x: 0, y: 0 }} // Début en haut-gauche
              end={{ x: 1, y: 1 }}   // Fin en bas-droite (diagonal)
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 150, // Appliquer le borderRadius au gradient lui-même
              }}
            />
          </View>
        )}

        {/* Carré de catégorie au milieu à droite */}
        {categoryIcon && (
          <View style={{
            position: 'absolute',
            top: '50%',
            transform: [{ translateY: -4 }], // Encore moins de décalage pour descendre davantage
            right: spacing(3), // Augmenté de spacing(2) à spacing(3) pour plus d'espace
            width: 56,
            height: 56,
            borderRadius: radius.lg,
            overflow: 'hidden',
          }}>
            <LinearGradient
              colors={categoryIcon.gradientColors as [string, string]}
              style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {categoryIcon.family === 'MaterialIcons' && (
                <MaterialIcons 
                  name={categoryIcon.name as any}
                  size={28} // Agrandi de 20 à 28 (proportionnel au carré)
                  color="white"
                />
              )}
              {categoryIcon.family === 'Ionicons' && (
                <Ionicons 
                  name={categoryIcon.name as any}
                  size={28} // Agrandi de 20 à 28 (proportionnel au carré)
                  color="white"
                />
              )}
              {categoryIcon.family === 'FontAwesome' && (
                <FontAwesome 
                  name={categoryIcon.name as any}
                  size={28} // Agrandi de 20 à 28 (proportionnel au carré)
                  color="white"
                />
              )}
              {categoryIcon.family === 'Feather' && (
                <Feather 
                  name={categoryIcon.name as any}
                  size={28} // Agrandi de 20 à 28 (proportionnel au carré)
                  color="white"
                />
              )}
            </LinearGradient>
          </View>
        )}

        {/* Titre en gras et plus grand */}
        <Text style={{ 
          fontSize: typography.sizes.lg, // Plus grand
          fontWeight: typography.weights.bold, // En gras
          color: colors.text,
          textAlign: 'left',
          marginBottom: spacing(0.5),
        }}>
          {title}
        </Text>
        
        {/* Valeur en noir et gras - maintenant avant le sous-titre */}
        <Text style={{ 
          fontSize: getValueFontSize(),
          fontWeight: typography.weights.bold,
          color: colors.text, // Noir au lieu de la couleur du thème
          textAlign: 'left',
          letterSpacing: -0.5,
          marginBottom: spacing(0.5),
        }}>
          {value}
        </Text>
        
        {/* Sous-titre aligné à gauche - maintenant après le chiffre */}
        {subtitle && (
          <Text style={{ 
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.normal,
            color: colors.textMuted,
            textAlign: 'left',
          }}>
            {subtitle}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // Layout centré original avec icône
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={!onPress}
      style={{
        backgroundColor: pressed ? colors.backgroundSecondary : colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0, // Suppression de la bordure
        transform: [{ scale: pressed ? 0.98 : 1 }],
        ...getSizeStyles(),
        ...shadows.lg, // Ombre plus marquée
      }}
    >
      {icon && (
        <View style={{
          width: 40,
          height: 40,
          backgroundColor: colorScheme.background,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing(1),
        }}>
          <Text style={{ 
            fontSize: typography.sizes.lg,
            color: colorScheme.primary
          }}>
            {icon}
          </Text>
        </View>
      )}

      <Text style={{ 
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing(0.5),
      }}>
        {title}
      </Text>
      
      <Text style={{ 
        fontSize: getValueFontSize(),
        fontWeight: typography.weights.bold,
        color: colorScheme.primary,
        textAlign: 'center',
        letterSpacing: -0.5,
      }}>
        {value}
      </Text>

      {subtitle && (
        <Text style={{ 
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.normal,
          color: colors.textMuted,
          textAlign: 'center',
          marginTop: spacing(0.5),
        }}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}
