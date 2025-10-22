/**
 * Utilitaires pour la gestion des couleurs et du contraste
 */

/**
 * Convertit une couleur hexadécimale en RGB
 * @param hex - Couleur hexadécimale (ex: "#FF5733" ou "FF5733")
 * @returns Objet RGB { r, g, b }
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Supprimer le # si présent
  hex = hex.replace('#', '');
  
  // Gérer les formats courts (#RGB)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calcule la luminance relative d'une couleur RGB selon la formule W3C WCAG
 * @param r - Rouge (0-255)
 * @param g - Vert (0-255) 
 * @param b - Bleu (0-255)
 * @returns Luminance relative (0-1)
 */
function getLuminance(r: number, g: number, b: number): number {
  // Convertir les valeurs RGB en valeurs relatives (0-1)
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  // Calculer la luminance selon la formule W3C
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Détermine si un texte doit être blanc ou noir selon la couleur de fond
 * pour assurer un contraste suffisant (ratio >= 4.5:1)
 * @param backgroundColor - Couleur de fond (hex, ex: "#FF5733")
 * @returns "white" ou "black"
 */
export function getContrastTextColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  
  if (!rgb) {
    // Si la couleur n'est pas valide, retourner noir par défaut
    return 'black';
  }
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  
  // Si la luminance est élevée (couleur claire), utiliser du texte noir
  // Si la luminance est faible (couleur sombre), utiliser du texte blanc
  return luminance > 0.5 ? 'black' : 'white';
}

/**
 * Retourne la couleur de fond par défaut pour les maintenances
 * @returns Couleur rouge par défaut
 */
export function getDefaultMaintenanceColor(): string {
  return '#dc2626'; // Rouge (red-600)
}

/**
 * Génère une couleur hexadécimale aléatoire avec contraintes d'accessibilité
 * @returns Couleur hex aléatoire accessible
 */
export function generateRandomAccessibleColor(): string {
  // Générer une couleur HSL avec des contraintes d'accessibilité
  const hue = Math.floor(Math.random() * 360); // Teinte : 0-360°
  const saturation = Math.floor(Math.random() * 30) + 50; // Saturation : 50-80% (évite les couleurs ternes ou trop vives)
  const lightness = Math.floor(Math.random() * 30) + 35;  // Luminosité : 35-65% (évite trop clair ou trop sombre)
  
  return hslToHex(hue, saturation, lightness);
}

/**
 * Convertit une couleur HSL en hexadécimal
 * @param h Teinte (0-360)
 * @param s Saturation (0-100)
 * @param l Luminosité (0-100)
 * @returns Couleur hexadécimale
 */
function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  // Convertir en valeurs RGB (0-255) puis en hex
  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

/**
 * Valide qu'une couleur hexadécimale est valide
 * @param color - Couleur à valider
 * @returns true si la couleur est valide
 */
export function isValidHexColor(color: string): boolean {
  const hex = color.replace('#', '');
  return /^[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(hex);
}

/**
 * Normalise une couleur hexadécimale (ajoute # si manquant, format complet)
 * @param color - Couleur à normaliser
 * @returns Couleur normalisée ou couleur par défaut si invalide
 */
export function normalizeHexColor(color: string | null | undefined): string {
  if (!color) {
    return getDefaultMaintenanceColor();
  }
  
  let normalized = color.trim();
  
  // Ajouter # si manquant
  if (!normalized.startsWith('#')) {
    normalized = '#' + normalized;
  }
  
  // Valider et retourner
  if (isValidHexColor(normalized)) {
    return normalized;
  }
  
  return getDefaultMaintenanceColor();
}
