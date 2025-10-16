import { supabase } from '../lib/supabase';

export type MotorcycleItem = {
  id: number;
  createdAt: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  category: string | null;
  displacement: number | null;
  power: number | null;
  torque: number | null;
  engineType: string | null;
  engineStroke: string | null;
  gearbox: string | null;
  fuelCapacity: number | null;
  fuelSystem: string | null;
  coolingSystem: string | null;
  weight: number | null;
  seatHeight: number | null;
  frontTire: string | null;
  rearTire: string | null;
};

export async function fetchMotorcycleById(motorcycleId: number): Promise<MotorcycleItem | null> {
  const { data, error } = await supabase
    .from('motorcycles')
    .select(`
      id,
      created_at,
      brand,
      model,
      year,
      category,
      displacement,
      power,
      torque,
      engine_type,
      engine_stroke,
      gearbox,
      fuel_capacity,
      fuel_system,
      cooling_system,
      weight,
      seat_height,
      front_tire,
      rear_tire
    `)
    .eq('id', motorcycleId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Pas de résultat trouvé
      return null;
    }
    throw new Error('Erreur lors de la récupération de la moto : ' + error.message);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    createdAt: data.created_at,
    brand: data.brand,
    model: data.model,
    year: data.year,
    category: data.category,
    displacement: data.displacement,
    power: data.power,
    torque: data.torque,
    engineType: data.engine_type,
    engineStroke: data.engine_stroke,
    gearbox: data.gearbox,
    fuelCapacity: data.fuel_capacity,
    fuelSystem: data.fuel_system,
    coolingSystem: data.cooling_system,
    weight: data.weight,
    seatHeight: data.seat_height,
    frontTire: data.front_tire,
    rearTire: data.rear_tire,
  };
}

export async function fetchMotorcycles(): Promise<MotorcycleItem[]> {
  const { data, error } = await supabase
    .from('motorcycles')
    .select(`
      id,
      created_at,
      brand,
      model,
      year,
      category,
      displacement,
      power,
      torque,
      engine_type,
      engine_stroke,
      gearbox,
      fuel_capacity,
      fuel_system,
      cooling_system,
      weight,
      seat_height,
      front_tire,
      rear_tire
    `)
    .order('brand', { ascending: true })
    .order('model', { ascending: true });

  if (error) {
    throw new Error('Erreur lors de la récupération des motos : ' + error.message);
  }

  return (data ?? []).map((motorcycle: any) => ({
    id: motorcycle.id,
    createdAt: motorcycle.created_at,
    brand: motorcycle.brand,
    model: motorcycle.model,
    year: motorcycle.year,
    category: motorcycle.category,
    displacement: motorcycle.displacement,
    power: motorcycle.power,
    torque: motorcycle.torque,
    engineType: motorcycle.engine_type,
    engineStroke: motorcycle.engine_stroke,
    gearbox: motorcycle.gearbox,
    fuelCapacity: motorcycle.fuel_capacity,
    fuelSystem: motorcycle.fuel_system,
    coolingSystem: motorcycle.cooling_system,
    weight: motorcycle.weight,
    seatHeight: motorcycle.seat_height,
    frontTire: motorcycle.front_tire,
    rearTire: motorcycle.rear_tire,
  }));
}

export async function searchMotorcycles(query: string): Promise<MotorcycleItem[]> {
  if (!query.trim()) {
    return [];
  }

  const { data, error } = await supabase
    .from('motorcycles')
    .select(`
      id,
      created_at,
      brand,
      model,
      year,
      category,
      displacement,
      power,
      torque,
      engine_type,
      engine_stroke,
      gearbox,
      fuel_capacity,
      fuel_system,
      cooling_system,
      weight,
      seat_height,
      front_tire,
      rear_tire
    `)
    .or(`brand.ilike.%${query}%,model.ilike.%${query}%,category.ilike.%${query}%`)
    .order('brand', { ascending: true })
    .order('model', { ascending: true })
    .limit(20);

  if (error) {
    throw new Error('Erreur lors de la recherche de motos : ' + error.message);
  }

  return (data ?? []).map((motorcycle: any) => ({
    id: motorcycle.id,
    createdAt: motorcycle.created_at,
    brand: motorcycle.brand,
    model: motorcycle.model,
    year: motorcycle.year,
    category: motorcycle.category,
    displacement: motorcycle.displacement,
    power: motorcycle.power,
    torque: motorcycle.torque,
    engineType: motorcycle.engine_type,
    engineStroke: motorcycle.engine_stroke,
    gearbox: motorcycle.gearbox,
    fuelCapacity: motorcycle.fuel_capacity,
    fuelSystem: motorcycle.fuel_system,
    coolingSystem: motorcycle.cooling_system,
    weight: motorcycle.weight,
    seatHeight: motorcycle.seat_height,
    frontTire: motorcycle.front_tire,
    rearTire: motorcycle.rear_tire,
  }));
}
