// services/dashboardService.ts
import { supabase } from '../lib/supabase';

export type DashboardStats = {
  vehicles: number;
  recentMaintenances: number;
};

export type MaintenanceItem = {
  id: string;
  name: string;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    registration?: string | null;
    kilometers: number;
  };
  lastKm?: number | null; // maintenances.last_maintenance_km si utile à afficher
};

export async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  const [{ count: vehiclesCount }, { data: recentMaints }] = await Promise.all([
    supabase
      .from('vehicles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('maintenances')
      .select('id')
      .eq('user_id', userId)
  ]);

  return {
    vehicles: vehiclesCount ?? 0,
    recentMaintenances: (recentMaints ?? []).length,
  };
}

export async function fetchRecentMaintenances(userId: string, limit = 5): Promise<MaintenanceItem[]> {
  // Jointure: maintenances.vehicle_id -> vehicles.id
  const { data, error } = await supabase
    .from('maintenances')
    .select(`
      id,
      name,
      last_maintenance_km,
      vehicle:vehicles (
        id,
        brand,
        model,
        registration_number,
        kilometers
      )
    `)
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((m: any) => ({
    id: m.id,
    name: m.name,
    lastKm: m.last_maintenance_km ?? null,
    vehicle: {
      id: m.vehicle?.id,
      brand: m.vehicle?.brand,
      model: m.vehicle?.model,
      registration: m.vehicle?.registration_number ?? null,
      kilometers: Number(m.vehicle?.kilometers ?? 0),
    },
  }));
}
