// services/dashboardService.ts
import { supabase } from '../lib/supabase';

export type DashboardStats = {
  vehicles: number;
};

export async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  const { count: vehiclesCount } = await supabase
    .from('vehicles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    vehicles: vehiclesCount ?? 0,
  };
}

// Fonction temporairement désactivée - sera réimplémentée plus tard
// export async function fetchRecentMaintenances(userId: string, limit = 5): Promise<MaintenanceItem[]> {
//   // À réimplémenter quand la structure des maintenances sera définie
//   return [];
// }
