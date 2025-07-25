/**
 * Fonction utilitaire pour formater les erreurs de manière type-safe
 * Gère les différents formats d'erreur retournés par les APIs
 */
export function formatError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    // Gestion des erreurs avec propriété 'errors' (format Qonto)
    if ('errors' in error) {
      try {
        return JSON.stringify((error as any).errors);
      } catch {
        return 'Erreur de format dans la réponse API';
      }
    }
    
    // Gestion des erreurs avec propriété 'message'
    if ('message' in error) {
      return (error as any).message;
    }
    
    // Gestion des erreurs avec propriété 'error'
    if ('error' in error) {
      return formatError((error as any).error);
    }
    
    // Fallback : stringify l'objet entier
    try {
      return JSON.stringify(error);
    } catch {
      return 'Erreur de sérialisation';
    }
  }
  
  return 'Erreur inconnue';
}

/**
 * Fonction pour extraire un message d'erreur lisible depuis une réponse d'API
 * Utilisée dans les hooks pour normaliser les erreurs
 */
export function extractErrorMessage(err: any, defaultMessage: string = "Erreur inconnue"): string {
  if (err?.response?.data?.error) {
    return typeof err.response.data.error === 'string' 
      ? err.response.data.error 
      : formatError(err.response.data.error);
  }
  
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }
  
  if (err?.message) {
    return err.message;
  }
  
  return defaultMessage;
}
