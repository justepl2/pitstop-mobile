import { useCallback, useEffect, useMemo, useState } from 'react';

// Types pour une meilleure organisation
type SearchState = {
  query: string;
  results: any[];
  showSuggestions: boolean;
};

type SearchConfig = {
  searchFn: (query: string) => Promise<any[]>;
  dependencies?: any[];
  delay?: number;
};

// Hook personnalisé pour la recherche avec debounce
export function useSearch({ searchFn, dependencies = [], delay = 200 }: SearchConfig) {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    showSuggestions: false
  });

  const debouncedQuery = useMemo(() => state.query.trim(), [state.query]);

  useEffect(() => {
    const search = async () => {
      if (debouncedQuery.length === 0) {
        setState(prev => ({ ...prev, results: [] }));
        return;
      }

      try {
        const results = await searchFn(debouncedQuery);
        setState(prev => ({ ...prev, results }));
      } catch (e) {
        console.error('Erreur de recherche:', e);
        setState(prev => ({ ...prev, results: [] }));
      }
    };

    const timeout = setTimeout(search, delay);
    return () => clearTimeout(timeout);
  }, [debouncedQuery, ...dependencies]);

  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query, showSuggestions: true }));
  }, []);

  const hideSuggestions = useCallback(() => {
    setState(prev => ({ ...prev, showSuggestions: false }));
  }, []);

  const showSuggestionsAction = useCallback(() => {
    setState(prev => ({ ...prev, showSuggestions: true }));
  }, []);

  const clearResults = useCallback(() => {
    setState({ query: '', results: [], showSuggestions: false });
  }, []);

  return {
    ...state,
    setQuery,
    hideSuggestions,
    showSuggestionsAction,
    clearResults
  };
}
