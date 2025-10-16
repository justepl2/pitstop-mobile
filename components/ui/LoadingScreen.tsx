import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import ScreenContainer from './ScreenContainer';

type LoadingScreenProps = {
  message?: string;
};

export default function LoadingScreen({ 
  message = 'Chargement…' 
}: LoadingScreenProps) {
  const { colors, spacing } = useTheme();
  
  return (
    <ScreenContainer>
      <View style={{ 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ 
          marginTop: spacing(1), 
          color: colors.muted 
        }}>
          {message}
        </Text>
      </View>
    </ScreenContainer>
  );
}
