import { MaintenanceItem } from '../services/maintenanceService';
import { MaintenanceHistoryItem } from '../services/maintenanceHistoryService';

interface ProgressCalculationInput {
  maintenance: MaintenanceItem;
  lastHistory?: MaintenanceHistoryItem | null;
  currentKm: number;
  currentDate?: Date;
}

/**
 * Calcule le pourcentage d'avancement d'une maintenance
 * Retourne le pourcentage le plus élevé entre km, temps et heures
 */
export function calculateMaintenanceProgress({
  maintenance,
  lastHistory,
  currentKm,
  currentDate = new Date()
}: ProgressCalculationInput): number {
  const percentages: number[] = [];

  // Calcul basé sur les kilomètres
  if (maintenance.intervalKm && lastHistory?.km) {
    const kmSinceLastMaintenance = currentKm - lastHistory.km;
    const kmPercentage = (kmSinceLastMaintenance / maintenance.intervalKm) * 100;
    percentages.push(Math.max(0, Math.min(100, kmPercentage)));
  } else if (maintenance.intervalKm && !lastHistory) {
    // Première maintenance basée sur le kilométrage actuel du véhicule
    const kmPercentage = (currentKm / maintenance.intervalKm) * 100;
    percentages.push(Math.max(0, Math.min(100, kmPercentage)));
  }

  // Calcul basé sur les mois
  if (maintenance.intervalMonth && lastHistory?.date) {
    const lastMaintenanceDate = new Date(lastHistory.date);
    const monthsSinceLastMaintenance = getMonthsDifference(lastMaintenanceDate, currentDate);
    const monthPercentage = (monthsSinceLastMaintenance / maintenance.intervalMonth) * 100;
    percentages.push(Math.max(0, Math.min(100, monthPercentage)));
  } else if (maintenance.intervalMonth && !lastHistory) {
    // Si pas d'historique, on assume que c'est une maintenance neuve
    percentages.push(0);
  }

  // Calcul basé sur les heures
  if (maintenance.intervalHours && lastHistory?.date) {
    const lastMaintenanceDate = new Date(lastHistory.date);
    const hoursSinceLastMaintenance = getHoursDifference(lastMaintenanceDate, currentDate);
    const hoursPercentage = (hoursSinceLastMaintenance / maintenance.intervalHours) * 100;
    percentages.push(Math.max(0, Math.min(100, hoursPercentage)));
  } else if (maintenance.intervalHours && !lastHistory) {
    // Si pas d'historique, on assume que c'est une maintenance neuve
    percentages.push(0);
  }

  // Retourner le pourcentage le plus élevé (le plus proche de la maintenance)
  return percentages.length > 0 ? Math.max(...percentages) : 0;
}

/**
 * Calcule la différence en mois entre deux dates
 */
function getMonthsDifference(startDate: Date, endDate: Date): number {
  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();
  return years * 12 + months + (endDate.getDate() - startDate.getDate()) / 30;
}

/**
 * Calcule la différence en heures entre deux dates
 */
function getHoursDifference(startDate: Date, endDate: Date): number {
  const diffInMs = endDate.getTime() - startDate.getTime();
  return diffInMs / (1000 * 60 * 60); // Conversion ms -> heures
}

