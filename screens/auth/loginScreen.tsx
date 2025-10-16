import React from 'react';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { View } from 'react-native';
import { useTheme } from '../../theme/themeProvider';

export default function LoginScreen() {
  const { spacing } = useTheme();
  const {
    email,
    setEmail,
    password,
    setPassword,
    signIn,
    signUp,
    loading
  } = useAuth();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Connexion à PitStop"
        subtitle="Entrez votre email et votre mot de passe pour accéder à votre espace."
      />

      <TextInput
        label="Adresse email"
        placeholder="exemple@email.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        required
      />

      <TextInput
        label="Mot de passe"
        placeholder="Votre mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        required
      />

      <View style={{ marginTop: spacing(3) }}>
        <Button
          title={loading ? 'Connexion…' : 'Se connecter'}
          onPress={signIn}
          loading={loading}
          disabled={loading}
        />
      </View>

      <View style={{ marginTop: spacing(2) }}>
        <Button
          title="Créer un compte"
          onPress={signUp}
          variant="secondary"
          disabled={loading}
        />
      </View>
    </ScreenContainer>
  );
}
