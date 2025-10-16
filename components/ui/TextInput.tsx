import React from 'react';
import { TextInput as RNTextInput, Text, View, TextInputProps } from 'react-native';
import { useTheme } from '../../theme/themeProvider';

type CustomTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
  required?: boolean;
};

export default function TextInput({
  label,
  error,
  required = false,
  style,
  ...props
}: CustomTextInputProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ marginTop: spacing(2) }}>
      {label && (
        <Text style={{ 
          color: colors.text, 
          fontWeight: '700',
          marginBottom: spacing(1)
        }}>
          {label} {required && '*'}
        </Text>
      )}
      <RNTextInput
        placeholderTextColor="#9AA0A6"
        style={[
          {
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: colors.surface,
            color: colors.text,
          },
          style
        ]}
        {...props}
      />
      {error && (
        <Text style={{ 
          color: colors.danger, 
          fontSize: 12,
          marginTop: spacing(0.5)
        }}>
          {error}
        </Text>
      )}
    </View>
  );
}
