import { supabase } from '../lib/supabase';

export type MaintenanceItem = {
  id: number;
  name: string | null;
  userId: string | null;
  vehicleId: string;
  intervalKm: number | null;
  intervalMonth: number | null;
  intervalHours: number | null;
  color?: string | null; // Couleur personnalisée pour l'affichage
};

export type NewMaintenanceInput = {
  name: string;
  vehicleId: string;
  intervalKm?: number | null;
  intervalMonth?: number | null;
  intervalHours?: number | null;
  color?: string | null; // Couleur personnalisée pour l'affichage
};

export type UpdateMaintenanceInput = {
  name?: string;
  intervalKm?: number | null;
  intervalMonth?: number | null;
  intervalHours?: number | null;
  color?: string | null; // Couleur personnalisée pour l'affichage
};

// CREATE - Créer une nouvelle maintenance
export async function createMaintenance(userId: string, input: NewMaintenanceInput): Promise<MaintenanceItem> {
  const payload = {
    name: input.name,
    user_id: userId,
    vehicle_id: input.vehicleId,
    interval_km: input.intervalKm ?? null,
    interval_month: input.intervalMonth ?? null,
    interval_hours: input.intervalHours ?? null,
    color: input.color ?? null,
  };

  const { data, error } = await supabase
    .from('maintenances')
    .insert(payload)
    .select(`
      id,
      name,
      user_id,
      vehicle_id,
      interval_km,
      interval_month,
      interval_hours,
      color
    `)
    .single();

  if (error) {
    throw new Error('Erreur lors de la création de la maintenance : ' + error.message);
  }

  return {
    id: data.id,
    name: data.name,
    userId: data.user_id,
    vehicleId: data.vehicle_id,
    intervalKm: data.interval_km,
    intervalMonth: data.interval_month,
    intervalHours: data.interval_hours,
    color: data.color,
  };
}

// READ - Récupérer une maintenance par ID
export async function fetchMaintenanceById(maintenanceId: number, userId: string): Promise<MaintenanceItem> {
  const { data, error } = await supabase
    .from('maintenances')
    .select(`
      id,
      name,
      user_id,
      vehicle_id,
      interval_km,
      interval_month,
      interval_hours,
      color
    `)
    .eq('id', maintenanceId)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error('Erreur lors de la récupération de la maintenance : ' + error.message);
  }

  if (!data) {
    throw new Error('Maintenance non trouvée');
  }

  return {
    id: data.id,
    name: data.name,
    userId: data.user_id,
    vehicleId: data.vehicle_id,
    intervalKm: data.interval_km,
    intervalMonth: data.interval_month,
    intervalHours: data.interval_hours,
    color: data.color,
  };
}

// READ - Récupérer toutes les maintenances d'un utilisateur
export async function fetchMaintenances(userId: string): Promise<MaintenanceItem[]> {
  const { data, error } = await supabase
    .from('maintenances')
    .select(`
      id,
      name,
      user_id,
      vehicle_id,
      interval_km,
      interval_month,
      interval_hours,
      color
    `)
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    throw new Error('Erreur lors de la récupération des maintenances : ' + error.message);
  }

  return (data ?? []).map((maintenance: any) => ({
    id: maintenance.id,
    name: maintenance.name,
    userId: maintenance.user_id,
    vehicleId: maintenance.vehicle_id,
    intervalKm: maintenance.interval_km,
    intervalMonth: maintenance.interval_month,
    intervalHours: maintenance.interval_hours,
    color: maintenance.color,
  }));
}

// READ - Récupérer les maintenances d'un véhicule spécifique
export async function fetchMaintenancesByVehicle(vehicleId: string, userId: string): Promise<MaintenanceItem[]> {
  const { data, error } = await supabase
    .from('maintenances')
    .select(`
      id,
      name,
      user_id,
      vehicle_id,
      interval_km,
      interval_month,
      interval_hours,
      color
    `)
    .eq('vehicle_id', vehicleId)
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    throw new Error('Erreur lors de la récupération des maintenances du véhicule : ' + error.message);
  }

  return (data ?? []).map((maintenance: any) => ({
    id: maintenance.id,
    name: maintenance.name,
    userId: maintenance.user_id,
    vehicleId: maintenance.vehicle_id,
    intervalKm: maintenance.interval_km,
    intervalMonth: maintenance.interval_month,
    intervalHours: maintenance.interval_hours,
    color: maintenance.color,
  }));
}

// UPDATE - Mettre à jour une maintenance
export async function updateMaintenance(
  maintenanceId: number, 
  userId: string, 
  input: UpdateMaintenanceInput
): Promise<MaintenanceItem> {
  const payload: any = {};
  
  if (input.name !== undefined) payload.name = input.name;
  if (input.intervalKm !== undefined) payload.interval_km = input.intervalKm;
  if (input.intervalMonth !== undefined) payload.interval_month = input.intervalMonth;
  if (input.intervalHours !== undefined) payload.interval_hours = input.intervalHours;
  if (input.color !== undefined) payload.color = input.color;

  const { data, error } = await supabase
    .from('maintenances')
    .update(payload)
    .eq('id', maintenanceId)
    .eq('user_id', userId)
    .select(`
      id,
      name,
      user_id,
      vehicle_id,
      interval_km,
      interval_month,
      interval_hours,
      color
    `)
    .single();

  if (error) {
    throw new Error('Erreur lors de la mise à jour de la maintenance : ' + error.message);
  }

  if (!data) {
    throw new Error('Maintenance non trouvée pour la mise à jour');
  }

  return {
    id: data.id,
    name: data.name,
    userId: data.user_id,
    vehicleId: data.vehicle_id,
    intervalKm: data.interval_km,
    intervalMonth: data.interval_month,
    intervalHours: data.interval_hours,
    color: data.color,
  };
}

// DELETE - Supprimer une maintenance
export async function deleteMaintenance(maintenanceId: number, userId: string): Promise<void> {
  const { error } = await supabase
    .from('maintenances')
    .delete()
    .eq('id', maintenanceId)
    .eq('user_id', userId);

  if (error) {
    throw new Error('Erreur lors de la suppression de la maintenance : ' + error.message);
  }
}

// SEARCH - Rechercher des maintenances par nom
export async function searchMaintenances(query: string, userId: string): Promise<MaintenanceItem[]> {
  if (!query.trim()) {
    return [];
  }

  const { data, error } = await supabase
    .from('maintenances')
    .select(`
      id,
      name,
      user_id,
      vehicle_id,
      interval_km,
      interval_month,
      interval_hours,
      color
    `)
    .eq('user_id', userId)
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true })
    .limit(20);

  if (error) {
    throw new Error('Erreur lors de la recherche de maintenances : ' + error.message);
  }

  return (data ?? []).map((maintenance: any) => ({
    id: maintenance.id,
    name: maintenance.name,
    userId: maintenance.user_id,
    vehicleId: maintenance.vehicle_id,
    intervalKm: maintenance.interval_km,
    intervalMonth: maintenance.interval_month,
    intervalHours: maintenance.interval_hours,
    color: maintenance.color,
  }));
}
