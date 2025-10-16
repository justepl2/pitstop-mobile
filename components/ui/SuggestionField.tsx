import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import TextInput from './TextInput';

type SuggestionFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  suggestions: any[];
  showSuggestions: boolean;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (suggestion: any) => void;
  onFocus?: () => void;
  keyboardType?: 'default' | 'numeric';
  required?: boolean;
  renderSuggestion?: (item: any) => string;
  getSuggestionKey?: (item: any, index: number) => string;
  error?: string;
};

export default function SuggestionField({
  label,
  placeholder,
  value,
  suggestions,
  showSuggestions,
  onChangeText,
  onSelectSuggestion,
  onFocus,
  keyboardType = 'default',
  required = false,
  renderSuggestion = (item) => typeof item === 'string' ? item : item.name,
  getSuggestionKey = (item, index) => 
    typeof item === 'string' 
      ? `${item}-${index}` 
      : item.id?.toString() || `${item.name}-${index}`,
  error
}: SuggestionFieldProps) {
  const { colors, spacing } = useTheme();

  return (
    <View>
      <TextInput
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        keyboardType={keyboardType}
        required={required}
        error={error}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
      />
      {showSuggestions && suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={getSuggestionKey}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelectSuggestion(item)}
              style={{ paddingVertical: spacing(1) }}
            >
              <Text style={{ 
                color: colors.text, 
                fontWeight: '700' 
              }}>
                {renderSuggestion(item)}
              </Text>
            </TouchableOpacity>
          )}
          style={{
            marginTop: spacing(1),
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            backgroundColor: colors.surface,
            maxHeight: 240,
          }}
        />
      )}
    </View>
  );
}
