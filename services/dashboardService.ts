// services/dashboardService.ts
import { supabase } from '../lib/supabase';
import { fetchMaintenancesByVehicle } from './maintenanceService';
import { getLastMaintenanceHistoryForType } from './maintenanceHistoryService';
import { calculateMaintenanceProgress } from '../utils/maintenanceProgress';

export type DashboardStats = {
  vehicles: number;
  maintenances: number;
  totalCost: number;
  reminderCount: number;
};

export async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  // Compter les véhicules
  const { count: vehiclesCount } = await supabase
    .from('vehicles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Récupérer les véhicules de l'utilisateur pour filtrer les maintenances
  const { data: userVehicles } = await supabase
    .from('vehicles')
    .select('id')
    .eq('user_id', userId);

  const vehicleIds = userVehicles?.map(v => v.id) || [];

  // Compter les maintenances effectuées pour les véhicules de l'utilisateur
  let maintenancesCount = 0;
  let totalCost = 0;
  let reminderCount = 0;

  if (vehicleIds.length > 0) {
    const { count } = await supabase
      .from('maintenance_histrory')
      .select('id', { count: 'exact', head: true })
      .filter('vehicle_id', 'in', `(${vehicleIds.join(',')})`);

    maintenancesCount = count ?? 0;

    // Calculer le coût total des maintenances
    const { data: maintenancesCosts } = await supabase
      .from('maintenance_histrory')
      .select('cost')
      .filter('vehicle_id', 'in', `(${vehicleIds.join(',')})`)
      .not('cost', 'is', null);

    totalCost = maintenancesCosts?.reduce((sum, item) => {
      const cost = typeof item.cost === 'number' ? item.cost : parseFloat(item.cost) || 0;
      return sum + cost;
    }, 0) || 0;

    // Calculer le nombre de maintenances à prévoir (>= 80% de progression)
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id, kilometers')
      .eq('user_id', userId);

    if (vehicles) {
      for (const vehicle of vehicles) {
        try {
          const maintenances = await fetchMaintenancesByVehicle(vehicle.id, userId);
          const currentDate = new Date();
          
          for (const maintenance of maintenances) {
            const lastHistory = await getLastMaintenanceHistoryForType(vehicle.id, maintenance.id);
            const progress = calculateMaintenanceProgress({
              maintenance,
              lastHistory,
              currentKm: vehicle.kilometers || 0,
              currentDate
            });
            
            // Considérer comme "à prévoir" si >= 80%
            if (progress >= 80) {
              reminderCount++;
            }
          }
        } catch (error) {
          console.warn('Erreur lors du calcul des rappels pour le véhicule', vehicle.id, error);
        }
      }
    }
  }

  return {
    vehicles: vehiclesCount ?? 0,
    maintenances: maintenancesCount,
    totalCost: Math.round(totalCost * 100) / 100, // Arrondir à 2 décimales
    reminderCount,
  };
}

// Fonction temporairement désactivée - sera réimplémentée plus tard
// export async function fetchRecentMaintenances(userId: string, limit = 5): Promise<MaintenanceItem[]> {
//   // À réimplémenter quand la structure des maintenances sera définie
//   return [];
// }
