// services/fuelService.ts
import { supabase } from '../lib/supabase';

export type Fuel = {
  id: number;
  name: string;
  created_at?: string;
};

export type NewFuelInput = {
  name: string;
};

export type UpdateFuelInput = {
  name?: string;
};

/**
 * Récupère tous les types de carburants
 */
export async function fetchFuels(): Promise<Fuel[]> {
  const { data, error } = await supabase
    .from('fuel')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Erreur lors de la récupération des types de carburants:', error);
    throw error;
  }

  return data ?? [];
}

/**
 * Récupère un type de carburant par son ID
 */
export async function fetchFuelById(id: number): Promise<Fuel | null> {
  const { data, error } = await supabase
    .from('fuel')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Pas trouvé
      return null;
    }
    console.error('Erreur lors de la récupération du type de carburant:', error);
    throw error;
  }

  return data;
}

/**
 * Recherche des types de carburants par nom
 */
export async function searchFuels(query: string, limit = 20): Promise<Fuel[]> {
  const { data, error } = await supabase
    .from('fuel')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Erreur lors de la recherche de types de carburants:', error);
    throw error;
  }

  return data ?? [];
}
