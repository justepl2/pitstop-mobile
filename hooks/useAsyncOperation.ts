import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';

type AsyncOperationState = {
  loading: boolean;
  error: string | null;
};

type AsyncOperationOptions = {
  successMessage?: string;
  errorTitle?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
};

export function useAsyncOperation(options: AsyncOperationOptions = {}) {
  const [state, setState] = useState<AsyncOperationState>({
    loading: false,
    error: null,
  });

  // Utiliser une ref pour éviter les dépendances instables
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(async (operation: () => Promise<void>) => {
    try {
      setState({ loading: true, error: null });
      await operation();
      
      if (optionsRef.current.successMessage) {
        Alert.alert('Succès', optionsRef.current.successMessage);
      }
      
      if (optionsRef.current.onSuccess) {
        optionsRef.current.onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Une erreur est survenue';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      Alert.alert(
        optionsRef.current.errorTitle || 'Erreur',
        errorMessage
      );
      
      if (optionsRef.current.onError) {
        optionsRef.current.onError(error);
      }
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []); // Pas de dépendances car on utilise une ref

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    clearError,
  };
}
