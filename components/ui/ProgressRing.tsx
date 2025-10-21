import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme/themeProvider';

interface ProgressRingProps {
  percentage: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
}

export default function ProgressRing({ 
  percentage, 
  size = 60, 
  strokeWidth = 6, 
  showText = true 
}: ProgressRingProps) {
  const { colors } = useTheme();
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Couleur basée sur le pourcentage
  const getColor = () => {
    if (percentage > 90) return '#ff4444'; // Rouge - urgent (> 90%)
    if (percentage >= 66) return '#ff8800'; // Orange - attention (66-90%)  
    if (percentage >= 33) return '#ffbb00'; // Jaune - bientôt (33-66%)
    return '#00cc44'; // Vert - ok (< 33%)
  };

  return (
    <View style={{
      width: size,
      height: size,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Cercle de fond */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Cercle de progression */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      {showText && (
        <Text style={{
          fontSize: size < 50 ? 10 : 12,
          fontWeight: '600',
          color: getColor(),
        }}>
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
}
