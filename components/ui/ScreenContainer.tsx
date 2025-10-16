import React, { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/themeProvider';

type ScreenContainerProps = {
  children: ReactNode;
  padding?: boolean;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
};

export default function ScreenContainer({ 
  children, 
  padding = true,
  edges = ['top', 'left', 'right']
}: ScreenContainerProps) {
  const { colors, spacing } = useTheme();
  
  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: colors.background, 
        ...(padding && { padding: spacing(2) })
      }} 
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
}
