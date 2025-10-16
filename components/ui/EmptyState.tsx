import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import Button from './Button';

type EmptyStateProps = {
  title?: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
};

export default function EmptyState({
  title,
  message,
  actionTitle,
  onAction
}: EmptyStateProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ 
      paddingVertical: spacing(4),
      paddingHorizontal: spacing(2),
      alignItems: 'center'
    }}>
      {title && (
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '700', 
          color: colors.text,
          textAlign: 'center',
          marginBottom: spacing(1)
        }}>
          {title}
        </Text>
      )}
      <Text style={{ 
        color: colors.muted,
        textAlign: 'center',
        lineHeight: 20
      }}>
        {message}
      </Text>
      {actionTitle && onAction && (
        <View style={{ marginTop: spacing(2) }}>
          <Button
            title={actionTitle}
            onPress={onAction}
            variant="primary"
          />
        </View>
      )}
    </View>
  );
}
