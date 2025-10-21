// services/vehicleTypeService.ts
import { supabase } from '../lib/supabase';

export type VehicleType = {
  id: number;
  name: string;
  age_calculation?: string[];
};

export type NewVehicleTypeInput = {
  name: string;
};

export type UpdateVehicleTypeInput = {
  name?: string;
};

/**
 * Récupère tous les types de véhicules
 */
export async function fetchVehicleTypes(): Promise<VehicleType[]> {
  const { data, error } = await supabase
    .from('vehicle_type')
    .select('id, name, age_calculation')
    .order('name', { ascending: true });

  if (error) {
    console.error('Erreur lors de la récupération des types de véhicules:', error);
    throw error;
  }

  return data ?? [];
}

/**
 * Récupère un type de véhicule par son ID
 */
export async function fetchVehicleTypeById(id: number): Promise<VehicleType | null> {
  const { data, error } = await supabase
    .from('vehicle_type')
    .select('id, name, age_calculation')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Pas trouvé
      return null;
    }
    console.error('Erreur lors de la récupération du type de véhicule:', error);
    throw error;
  }

  return data;
}

/**
 * Recherche des types de véhicules par nom
 */
export async function searchVehicleTypes(query: string, limit = 20): Promise<VehicleType[]> {
  const { data, error } = await supabase
    .from('vehicle_type')
    .select('id, name, age_calculation')
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Erreur lors de la recherche de types de véhicules:', error);
    throw error;
  }

  return data ?? [];
}
