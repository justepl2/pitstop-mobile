/**
 * Utilitaire pour logger les erreurs Supabase de manière standardisée
 */

interface SupabaseError {
  code?: string;
  message: string;
  details?: any;
  hint?: string;
}

/**
 * Log une erreur Supabase avec un contexte détaillé
 */
export function logSupabaseError(
  functionName: string, 
  error: SupabaseError, 
  context: Record<string, any> = {}
) {
  console.error(`🚨 Erreur Supabase - ${functionName}:`, {
    error: error,
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    ...context
  });
}

/**
 * Log une erreur catch générale avec contexte
 */
export function logCatchError(
  functionName: string, 
  error: any, 
  context: Record<string, any> = {}
) {
  console.error(`🚨 Erreur catch - ${functionName}:`, {
    error: error,
    message: error?.message,
    stack: error?.stack,
    ...context
  });
}

/**
 * Log d'information avec emoji pour une meilleure lisibilité
 */
export function logInfo(message: string, data?: any) {
  console.log(`ℹ️ ${message}`, data || '');
}

/**
 * Log de succès avec emoji
 */
export function logSuccess(message: string, data?: any) {
  console.log(`✅ ${message}`, data || '');
}

/**
 * Log de warning avec emoji
 */
export function logWarning(message: string, data?: any) {
  console.warn(`⚠️ ${message}`, data || '');
}

