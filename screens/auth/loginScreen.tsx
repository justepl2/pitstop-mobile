// screens/auth/loginScreen.tsx
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/themeProvider';
import { supabase } from '../../lib/supabase';

export default function loginScreen() {
  const { colors, spacing } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert('Informations manquantes', 'Veuillez saisir votre email et votre mot de passe.');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) Alert.alert('Échec de la connexion', error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    if (!email || !password) {
      Alert.alert('Informations manquantes', 'Veuillez saisir votre email et votre mot de passe.');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert('Échec de l’inscription', error.message);
      } else {
        Alert.alert('Inscription réussie', 'Votre compte a été créé. Vous pouvez vous connecter.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing(2) }} edges={['top', 'left', 'right']}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>Connexion à PitStop</Text>
      <Text style={{ marginTop: spacing(1), color: colors.muted }}>
        Entrez votre email et votre mot de passe pour accéder à votre espace.
      </Text>

      <TextInput
        placeholder="Adresse email"
        placeholderTextColor="#9AA0A6"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          marginTop: spacing(2),
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: colors.surface,
          color: colors.text,
        }}
      />

      <TextInput
        placeholder="Mot de passe"
        placeholderTextColor="#9AA0A6"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          marginTop: spacing(1.5),
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: colors.surface,
          color: colors.text,
        }}
      />

      <TouchableOpacity
        onPress={signIn}
        disabled={loading}
        style={{
          marginTop: spacing(2),
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: 'center',
          backgroundColor: loading ? '#B0B0B0' : colors.primary,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={signUp}
        disabled={loading}
        style={{
          marginTop: spacing(1.5),
          paddingVertical: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>Créer un compte</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
