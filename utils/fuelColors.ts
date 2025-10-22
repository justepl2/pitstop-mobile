// utils/fuelColors.ts

export type FuelColorScheme = {
  background: string;
  text: string;
  name: string;
};

// Mapping des couleurs par type de carburant (basé sur les données DB exactes)
export const FUEL_COLORS: Record<string, FuelColorScheme> = {
  // Valeurs exactes de la DB - Couleurs européennes standards
  'gasoline': {
    background: '#22c55e', // Vert (SP95 standard européen)
    text: '#ffffff',
    name: 'Essence'
  },
  
  'diesel': {
    background: '#f59e0b', // Jaune/Orange (standard européen)
    text: '#ffffff',
    name: 'Diesel'
  },

  'electric': {
    background: '#059669', // Vert foncé
    text: '#ffffff',
    name: 'Électrique'
  },

  'hybrid': {
    background: '#0891b2', // Bleu cyan pour hybride
    text: '#ffffff',
    name: 'Hybride'
  },

  'lpg': {
    background: '#0ea5e9', // Bleu ciel/cyan (standard européen GPL)
    text: '#ffffff',
    name: 'GPL'
  },

  'ethanol': {
    background: '#ea580c', // Orange pour biocarburant
    text: '#ffffff',
    name: 'Éthanol'
  },

  'hydrogen': {
    background: '#a855f7', // Violet pour hydrogène
    text: '#ffffff',
    name: 'Hydrogène'
  },

  'two‑stroke mix': {
    background: '#dc2626', // Rouge pour 2-temps
    text: '#ffffff',
    name: '2-Temps'
  },

  // Variantes et synonymes courants - Couleurs européennes
  'essence': {
    background: '#22c55e', // Vert SP95
    text: '#ffffff',
    name: 'Essence'
  },
  'sp95': {
    background: '#22c55e', // Vert clair (SP95 européen)
    text: '#ffffff',
    name: 'SP95'
  },
  'sp98': {
    background: '#16a34a', // Vert foncé (SP98 européen)
    text: '#ffffff',
    name: 'SP98'
  },
  'electrique': {
    background: '#059669', // Vert foncé
    text: '#ffffff',
    name: 'Électrique'
  },
  'hybride': {
    background: '#0891b2', // Bleu cyan
    text: '#ffffff',
    name: 'Hybride'
  },
  'gpl': {
    background: '#0ea5e9', // Bleu ciel (standard européen GPL)
    text: '#ffffff',
    name: 'GPL'
  },
  'e85': {
    background: '#ea580c', // Orange pour biocarburant
    text: '#ffffff',
    name: 'E85'
  },

  // Par défaut
  'default': {
    background: '#6b7280', // Gris neutre
    text: '#ffffff',
    name: 'Autre'
  }
};

/**
 * Récupère les couleurs pour un type de carburant donné
 * @param fuelType - Le type de carburant (normalisé ou pas)
 * @returns Les couleurs correspondantes ou les couleurs par défaut
 */
export function getFuelColors(fuelType?: string): FuelColorScheme {
  if (!fuelType) {
    return FUEL_COLORS.default;
  }

  // D'abord, essayer la correspondance exacte (pour les valeurs DB avec espaces)
  const exactMatch = FUEL_COLORS[fuelType];
  if (exactMatch) {
    return exactMatch;
  }

  // Ensuite, essayer avec la normalisation (minuscules, sans espaces en début/fin)
  const normalizedFuel = fuelType.toLowerCase().trim();
  if (FUEL_COLORS[normalizedFuel]) {
    return FUEL_COLORS[normalizedFuel];
  }

  // Recherche partielle pour des cas comme "Essence Sans Plomb 95" ou "Two-stroke mix"
  const fuelKeys = Object.keys(FUEL_COLORS);
  const matchingKey = fuelKeys.find(key => {
    const normalizedKey = key.toLowerCase().trim();
    const normalizedInput = normalizedFuel.replace(/\s+/g, '').replace(/[‑-]/g, '');
    const normalizedKeyClean = normalizedKey.replace(/\s+/g, '').replace(/[‑-]/g, '');
    
    return normalizedInput.includes(normalizedKeyClean) || 
           normalizedKeyClean.includes(normalizedInput) ||
           normalizedFuel.includes(normalizedKey) ||
           normalizedKey.includes(normalizedFuel);
  });

  if (matchingKey) {
    return FUEL_COLORS[matchingKey];
  }

  // Retourner la couleur par défaut si aucune correspondance
  return FUEL_COLORS.default;
}

/**
 * Récupère juste la couleur de fond pour un carburant
 * @param fuelType - Le type de carburant
 * @returns La couleur de fond hexadécimale
 */
export function getFuelBackgroundColor(fuelType?: string): string {
  return getFuelColors(fuelType).background;
}

/**
 * Récupère le nom formaté pour un carburant
 * @param fuelType - Le type de carburant
 * @returns Le nom formaté à afficher
 */
export function getFuelDisplayName(fuelType?: string): string {
  return getFuelColors(fuelType).name;
}
