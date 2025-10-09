// utils/errorHandler.ts
// Vérifie que ce fichier existe déjà (on l’utilise pour alert + logs)
import { Alert } from 'react-native';
import { appLogger } from './appLogger';

export function reportSupabaseError(title: string, error: unknown) {
  const message = normalizeError(error);
  Alert.alert(title, message);
  appLogger.addLog('error', title, message);
}

function normalizeError(error: unknown): string {
  if (!error) return 'Erreur inconnue.';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  const anyErr = error as any;
  return anyErr?.message ?? JSON.stringify(anyErr);
}
