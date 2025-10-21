import { supabase } from '../lib/supabase';

// Types
export interface MaintenanceTemplateItem {
  id: number;
  name: string;
  description?: string;
  intervalKm?: number;
  intervalMonths?: number;
  intervalHours?: number;
  vehicleType?: number;
}

/**
 * Récupère un template de maintenance par son ID
 */
export async function fetchMaintenanceTemplateById(templateId: number): Promise<MaintenanceTemplateItem> {
  try {
    const { data, error } = await supabase
      .from('maintenance_templates')
      .select(`
        id,
        name,
        description,
        interval_km,
        interval_months,
        interval_hours,
        vehicle_type
      `)
      .eq('id', templateId)
      .single();

    if (error) {
      console.error('Erreur Supabase dans fetchMaintenanceTemplateById:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Template de maintenance non trouvé');
    }

    return {
      id: data.id,
      name: data.name || '',
      description: data.description || undefined,
      intervalKm: data.interval_km || undefined,
      intervalMonths: data.interval_months || undefined,
      intervalHours: data.interval_hours || undefined,
      vehicleType: data.vehicle_type || undefined,
    };
  } catch (error: any) {
    console.error('Erreur dans fetchMaintenanceTemplateById:', error);
    throw new Error(error.message || 'Erreur lors de la récupération du template de maintenance');
  }
}

/**
 * Récupère les templates de maintenance par type de véhicule
 */
export async function fetchMaintenanceTemplatesByVehicleType(vehicleTypeId: number): Promise<MaintenanceTemplateItem[]> {
  try {
    const { data, error } = await supabase
      .from('maintenance_templates')
      .select(`
        id,
        name,
        description,
        interval_km,
        interval_months,
        interval_hours,
        vehicle_type
      `)
      .eq('vehicle_type', vehicleTypeId)
      .order('name');

    if (error) {
      console.error('Erreur Supabase dans fetchMaintenanceTemplatesByVehicleType:', error);
      throw new Error(error.message);
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.name || '',
      description: item.description || undefined,
      intervalKm: item.interval_km || undefined,
      intervalMonths: item.interval_months || undefined,
      intervalHours: item.interval_hours || undefined,
      vehicleType: item.vehicle_type || undefined,
    }));
  } catch (error: any) {
    console.error('Erreur dans fetchMaintenanceTemplatesByVehicleType:', error);
    throw new Error(error.message || 'Erreur lors de la récupération des templates de maintenance');
  }
}

/**
 * Récupère tous les templates de maintenance (bonus)
 */
export async function fetchMaintenanceTemplates(): Promise<MaintenanceTemplateItem[]> {
  try {
    const { data, error } = await supabase
      .from('maintenance_templates')
      .select(`
        id,
        name,
        description,
        interval_km,
        interval_months,
        interval_hours,
        vehicle_type
      `)
      .order('name');

    if (error) {
      console.error('Erreur Supabase dans fetchMaintenanceTemplates:', error);
      throw new Error(error.message);
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.name || '',
      description: item.description || undefined,
      intervalKm: item.interval_km || undefined,
      intervalMonths: item.interval_months || undefined,
      intervalHours: item.interval_hours || undefined,
      vehicleType: item.vehicle_type || undefined,
    }));
  } catch (error: any) {
    console.error('Erreur dans fetchMaintenanceTemplates:', error);
    throw new Error(error.message || 'Erreur lors de la récupération des templates de maintenance');
  }
}
