import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/themeProvider';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export default function ScreenHeader({ 
  title, 
  subtitle, 
  action 
}: ScreenHeaderProps) {
  const { colors, spacing } = useTheme();
  
  return (
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'flex-start', 
      justifyContent: 'space-between',
      marginBottom: spacing(2)
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ 
          fontSize: 22, 
          fontWeight: '700', 
          color: colors.text 
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ 
            marginTop: spacing(1), 
            color: colors.muted 
          }}>
            {subtitle}
          </Text>
        )}
      </View>
      {action && (
        <View style={{ marginLeft: spacing(2) }}>
          {action}
        </View>
      )}
    </View>
  );
}
