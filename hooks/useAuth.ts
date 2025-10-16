import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Informations manquantes', 'Veuillez saisir votre email et votre mot de passe.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert('Échec de la connexion', error.message);
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const signUp = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Informations manquantes', 'Veuillez saisir votre email et votre mot de passe.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert('Échec de l\'inscription', error.message);
      } else {
        Alert.alert('Inscription réussie', 'Votre compte a été créé. Vous pouvez vous connecter.');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  // Fonction stable qui ne change jamais
  const getCurrentUserId = useCallback(async (): Promise<string> => {
    const { data: sessionRes } = await supabase.auth.getSession();
    const userId = sessionRes.session?.user.id;
    if (!userId) {
      throw new Error('Session manquante.');
    }
    return userId;
  }, []); // Pas de dépendances = fonction stable

  return {
    email,
    setEmail,
    password,
    setPassword,
    signIn,
    signUp,
    getCurrentUserId,
    loading,
  };
}
