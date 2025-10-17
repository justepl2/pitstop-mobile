import { supabase } from '../lib/supabase';

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
      console.error('Erreur Supabase dans fetchMaintenanceHistoryById:', error);
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
