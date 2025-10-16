import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';

type DataLoaderState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
};

type DataLoaderOptions = {
  autoLoad?: boolean;
  errorTitle?: string;
  onError?: (error: any) => void;
};

export function useDataLoader<T>(
  loadFn: () => Promise<T>,
  options: DataLoaderOptions = {}
) {
  const [state, setState] = useState<DataLoaderState<T>>({
    data: null,
    loading: false,
    error: null,
    refreshing: false,
  });

  const load = useCallback(async (isRefresh = false) => {
    try {
      setState(prev => ({ 
        ...prev, 
        loading: !isRefresh, 
        refreshing: isRefresh,
        error: null 
      }));
      
      const data = await loadFn();
      setState(prev => ({ 
        ...prev, 
        data, 
        loading: false, 
        refreshing: false 
      }));
    } catch (error: any) {
      const errorMessage = error.message || 'Une erreur est survenue';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false, 
        refreshing: false 
      }));

      if (!isRefresh) {
        Alert.alert(
          options.errorTitle || 'Erreur',
          errorMessage
        );
      }

      if (options.onError) {
        options.onError(error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadFn]);  // On garde loadFn mais on gère la stabilité depuis le composant

  const refresh = useCallback(() => {
    return load(true);
  }, [load]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    if (options.autoLoad !== false) {
      load();
    }
  }, [load, options.autoLoad]);  // Ajout des bonnes dépendances

  return {
    ...state,
    load,
    refresh,
    clearError,
  };
}
