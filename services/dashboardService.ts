// services/dashboardService.ts
import { supabase } from '../lib/supabase';

export type DashboardStats = {
  vehicles: number;
  maintenances: number;
  totalCost: number;
  reminderCount: number;
};

export async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    console.log('📊 Récupération des stats dashboard via RPC Supabase...');
    
    // Utiliser la fonction RPC globale pour récupérer toutes les stats en une fois
    const { data, error } = await supabase.rpc('get_dashboard_stats', {
      user_id_param: userId
    });

    if (error) {
      console.error('🚨 Erreur RPC get_dashboard_stats:', error);
      throw new Error(`Erreur lors du calcul des statistiques: ${error.message}`);
    }

    if (!data) {
      throw new Error('Aucune donnée retournée par la fonction RPC');
    }

    console.log('✅ Stats dashboard récupérées:', data);

    return {
      vehicles: data.vehicles || 0,
      maintenances: data.maintenances || 0,
      totalCost: parseFloat(data.totalCost) || 0,
      reminderCount: data.reminderCount || 0,
    };
  } catch (error: any) {
    console.error('🚨 Erreur dans fetchDashboardStats:', error);
    
    // Fallback : retourner des valeurs par défaut en cas d'erreur
    console.warn('⚠️ Utilisation des valeurs par défaut du dashboard');
    return {
      vehicles: 0,
      maintenances: 0,
      totalCost: 0,
      reminderCount: 0,
    };
  }
}

// Fonction temporairement désactivée - sera réimplémentée plus tard
// export async function fetchRecentMaintenances(userId: string, limit = 5): Promise<MaintenanceItem[]> {
//   // À réimplémenter quand la structure des maintenances sera définie
//   return [];
// }
