import { supabase } from '../lib/supabase';
import { logSupabaseError, logCatchError, logInfo, logSuccess, logWarning } from '../utils/supabaseLogger';

// Types
export interface MaintenanceHistoryItem {
  id: number;
  date?: string;
  km?: number;
  maintenanceIds?: number;
  details?: string;
}

export interface NewMaintenanceHistoryInput {
  date?: string;
  km?: number;
  maintenanceIds: number;
  details?: string;
}

export interface UpdateMaintenanceHistoryInput {
  date?: string;
  km?: number;
  details?: string;
}

/**
 * Récupère un historique de maintenance par son ID
 */
export async function fetchMaintenanceHistoryById(historyId: number): Promise<MaintenanceHistoryItem> {
  try {
    const { data, error } = await supabase
      .from('maintenance_histrory')
      .select(`
        id,
        date,
        km,
        maintenance_ids,
        details
      `)
      .eq('id', historyId)
      .single();

    if (error) {
      console.error('🚨 Erreur Supabase - fetchMaintenanceHistoryById:', {
        error: error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        historyId: historyId
      });
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Historique de maintenance non trouvé');
    }

    return {
      id: data.id,
      date: data.date || undefined,
      km: data.km || undefined,
      maintenanceIds: data.maintenance_ids || undefined,
      details: data.details || undefined,
    };
  } catch (error: any) {
    console.error('Erreur dans fetchMaintenanceHistoryById:', error);
    throw new Error(error.message || 'Erreur lors de la récupération de l\'historique de maintenance');
  }
}

/**
 * Récupère tous les historiques de maintenance
 */
export async function fetchMaintenanceHistories(): Promise<MaintenanceHistoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('maintenance_histrory')
      .select(`
        id,
        date,
        km,
        maintenance_ids,
        details
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erreur Supabase dans fetchMaintenanceHistories:', error);
      throw new Error(error.message);
    }

    return (data || []).map(item => ({
      id: item.id,
      date: item.date || undefined,
      km: item.km || undefined,
      maintenanceIds: item.maintenance_ids || undefined,
      details: item.details || undefined,
    }));
  } catch (error: any) {
    console.error('Erreur dans fetchMaintenanceHistories:', error);
    throw new Error(error.message || 'Erreur lors de la récupération des historiques de maintenance');
  }
}

/**
 * Récupère tous les historiques de maintenance pour un véhicule donné
 */
export async function fetchMaintenanceHistoriesByVehicle(vehicleId: string): Promise<MaintenanceHistoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('maintenance_histrory')
      .select(`
        id,
        date,
        km,
        maintenance_ids,
        details,
        maintenances!inner(vehicle_id)
      `)
      .eq('maintenances.vehicle_id', vehicleId)
      .not('km', 'is', null) // Filtrer uniquement les entrées avec des kilomètres
      .not('date', 'is', null) // Filtrer uniquement les entrées avec une date
      .order('date', { ascending: true }); // Tri croissant pour le graphique

    if (error) {
      console.error('Erreur Supabase dans fetchMaintenanceHistoriesByVehicle:', error);
      throw new Error(error.message);
    }

    return (data || []).map(item => ({
      id: item.id,
      date: item.date || undefined,
      km: item.km || undefined,
      maintenanceIds: item.maintenance_ids || undefined,
      details: item.details || undefined,
    }));
  } catch (error: any) {
    console.error('Erreur dans fetchMaintenanceHistoriesByVehicle:', error);
    throw new Error(error.message || 'Erreur lors de la récupération des historiques du véhicule');
  }
}

/**
 * Récupère les données kilométriques groupées par date pour le graphique
 * Un seul point par date avec la valeur km la plus récente de la journée
 */
export async function fetchKilometerDataForChart(vehicleId: string): Promise<MaintenanceHistoryItem[]> {
  try {
    // Utiliser la fonction RPC Supabase optimisée avec GROUP BY
    const { data, error } = await supabase.rpc('get_vehicle_kilometer_chart_data', {
      vehicle_id_param: vehicleId
    });

    if (error) {
      console.warn('Erreur RPC get_vehicle_kilometer_chart_data, utilisation du fallback:', error.message);
      // Fallback : utiliser l'ancienne méthode et grouper côté client
      return await fetchMaintenanceHistoriesByVehicleGrouped(vehicleId);
    }
    
    return (data || []).map((item: any) => ({
      id: 0, // Pas d'ID spécifique pour les données groupées
      date: item.date || undefined,
      km: item.km || undefined,
      maintenanceIds: undefined,
      details: `${item.maintenance_count} maintenance${item.maintenance_count > 1 ? 's' : ''}` || undefined,
    }));
  } catch (error: any) {
    console.warn('Erreur dans fetchKilometerDataForChart, utilisation du fallback:', error.message);
    // Fallback vers l'ancienne méthode
    return await fetchMaintenanceHistoriesByVehicleGrouped(vehicleId);
  }
}

/**
 * Fallback : groupe les données côté client si la fonction RPC n'existe pas
 */
async function fetchMaintenanceHistoriesByVehicleGrouped(vehicleId: string): Promise<MaintenanceHistoryItem[]> {
  console.log('📊 Fallback: groupement côté client');
  
  const allHistories = await fetchMaintenanceHistoriesByVehicle(vehicleId);
  
  // Grouper par date
  const groupedByDate = new Map<string, MaintenanceHistoryItem[]>();
  
  allHistories.forEach(history => {
    if (history.date && history.km) {
      const dateKey = history.date;
      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, []);
      }
      groupedByDate.get(dateKey)!.push(history);
    }
  });
  
  // Prendre la valeur km la plus élevée pour chaque date (dernière maintenance de la journée)
  const chartData: MaintenanceHistoryItem[] = [];
  
  groupedByDate.forEach((histories, date) => {
    const maxKm = Math.max(...histories.map(h => h.km || 0));
    const maintenanceCount = histories.length;
    
    chartData.push({
      id: 0,
      date,
      km: maxKm,
      maintenanceIds: undefined,
      details: `${maintenanceCount} maintenance${maintenanceCount > 1 ? 's' : ''}`,
    });
  });
  
  // Trier par date
  chartData.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
  
  console.log('✅ Données groupées côté client:', chartData.length, 'points');
  return chartData;
}

/**
 * Récupère les historiques d'une maintenance spécifique
 */
export async function fetchMaintenanceHistoriesByMaintenance(maintenanceId: number): Promise<MaintenanceHistoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('maintenance_histrory')
      .select(`
        id,
        date,
        km,
        maintenance_ids,
        details
      `)
      .eq('maintenance_ids', maintenanceId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erreur Supabase dans fetchMaintenanceHistoriesByMaintenance:', error);
      throw new Error(error.message);
    }

    return (data || []).map(item => ({
      id: item.id,
      date: item.date || undefined,
      km: item.km || undefined,
      maintenanceIds: item.maintenance_ids || undefined,
      details: item.details || undefined,
    }));
  } catch (error: any) {
    console.error('Erreur dans fetchMaintenanceHistoriesByMaintenance:', error);
    throw new Error(error.message || 'Erreur lors de la récupération des historiques de la maintenance');
  }
}

/**
 * Crée un nouvel historique de maintenance
 */
export async function createMaintenanceHistory(input: NewMaintenanceHistoryInput): Promise<MaintenanceHistoryItem> {
  try {
    const { data, error } = await supabase
      .from('maintenance_histrory')
      .insert({
        date: input.date || null,
        km: input.km || null,
        maintenance_ids: input.maintenanceIds,
        details: input.details || null,
      })
      .select(`
        id,
        date,
        km,
        maintenance_ids,
        details
      `)
      .single();

    if (error) {
      console.error('Erreur Supabase dans createMaintenanceHistory:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Erreur lors de la création de l\'historique de maintenance');
    }

    return {
      id: data.id,
      date: data.date || undefined,
      km: data.km || undefined,
      maintenanceIds: data.maintenance_ids || undefined,
      details: data.details || undefined,
    };
  } catch (error: any) {
    console.error('Erreur dans createMaintenanceHistory:', error);
    throw new Error(error.message || 'Erreur lors de la création de l\'historique de maintenance');
  }
}

/**
 * Met à jour un historique de maintenance
 */
export async function updateMaintenanceHistory(historyId: number, input: UpdateMaintenanceHistoryInput): Promise<MaintenanceHistoryItem> {
  try {
    const { data, error } = await supabase
      .from('maintenance_histrory')
      .update({
        date: input.date !== undefined ? input.date : undefined,
        km: input.km !== undefined ? input.km : undefined,
        details: input.details !== undefined ? input.details : undefined,
      })
      .eq('id', historyId)
      .select(`
        id,
        date,
        km,
        maintenance_ids,
        details
      `)
      .single();

    if (error) {
      console.error('Erreur Supabase dans updateMaintenanceHistory:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Historique de maintenance non trouvé pour la mise à jour');
    }

    return {
      id: data.id,
      date: data.date || undefined,
      km: data.km || undefined,
      maintenanceIds: data.maintenance_ids || undefined,
      details: data.details || undefined,
    };
  } catch (error: any) {
    console.error('Erreur dans updateMaintenanceHistory:', error);
    throw new Error(error.message || 'Erreur lors de la mise à jour de l\'historique de maintenance');
  }
}

/**
 * Supprime un historique de maintenance
 */
export async function deleteMaintenanceHistory(historyId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('maintenance_histrory')
      .delete()
      .eq('id', historyId);

    if (error) {
      console.error('Erreur Supabase dans deleteMaintenanceHistory:', error);
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.error('Erreur dans deleteMaintenanceHistory:', error);
    throw new Error(error.message || 'Erreur lors de la suppression de l\'historique de maintenance');
  }
}

/**
 * Recherche dans les historiques de maintenance par détails
 */
export async function searchMaintenanceHistories(query: string, limit = 20): Promise<MaintenanceHistoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('maintenance_histrory')
      .select(`
        id,
        date,
        km,
        maintenance_ids,
        details
      `)
      .ilike('details', `%${query}%`)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erreur Supabase dans searchMaintenanceHistories:', error);
      throw new Error(error.message);
    }

    return (data || []).map(item => ({
      id: item.id,
      date: item.date || undefined,
      km: item.km || undefined,
      maintenanceIds: item.maintenance_ids || undefined,
      details: item.details || undefined,
    }));
  } catch (error: any) {
    console.error('Erreur dans searchMaintenanceHistories:', error);
    throw new Error(error.message || 'Erreur lors de la recherche dans les historiques de maintenance');
  }
}

/**
 * Récupère la dernière maintenance history pour un type de maintenance donné sur un véhicule
 */
export async function getLastMaintenanceHistoryForType(vehicleId: string, maintenanceId: number): Promise<MaintenanceHistoryItem | null> {
  try {
    console.log('🔍 Récupération dernière maintenance history pour:', { vehicleId, maintenanceId });
    
    const { data, error } = await supabase
      .from('maintenance_histrory')
      .select('*')
      .eq('maintenance_ids', maintenanceId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      logSupabaseError('getLastMaintenanceHistoryForType', error, {
        vehicleId: vehicleId,
        maintenanceId: maintenanceId
      });
      
      if (error.code === 'PGRST116') {
        // Aucun résultat trouvé - c'est normal
        logInfo('Aucune maintenance history trouvée pour ce type');
        return null;
      }
      throw error;
    }

    logSuccess('Dernière maintenance history trouvée:', data);
    return {
      id: data.id,
      date: data.date || undefined,
      km: data.km || undefined,
      maintenanceIds: data.maintenance_ids || undefined,
      details: data.details || undefined,
    };
  } catch (error: any) {
    logCatchError('getLastMaintenanceHistoryForType', error, {
      vehicleId: vehicleId,
      maintenanceId: maintenanceId
    });
    // Ne pas throw d'erreur car c'est normal de ne pas avoir d'historique
    return null;
  }
}
