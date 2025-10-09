// services/vehiclesService.ts
// AJOUT: fonction d’insertion d’un véhicule
import { supabase } from '../lib/supabase';

export type VehicleItem = {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  kilometers: number;
  registration?: string | null;
  engineSize?: number | null;
  type?: string | null;
  fuelType?: string | null;
  numberOfCylinders?: number | null;
  sell?: boolean | null;
};

export async function fetchVehicles(userId: string): Promise<VehicleItem[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      id,
      brand,
      model,
      year,
      kilometers,
      registration_number,
      engine_size,
      type,
      fuel_type,
      number_of_cylinders,
      sell
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((v: any) => ({
    id: v.id,
    brand: v.brand,
    model: v.model,
    year: v.year ?? null,
    kilometers: Number(v.kilometers ?? 0),
    registration: v.registration_number ?? null,
    engineSize: v.engine_size ?? null,
    type: v.type ?? null,
    fuelType: v.fuel_type ?? null,
    numberOfCylinders: v.number_of_cylinders ?? null,
    sell: v.sell ?? null,
  }));
}

export type NewVehicleInput = {
  brand: string;
  model: string;
  year?: number | null;
  kilometers?: number | null;
  registrationNumber?: string | null;
  engineSize?: string | null;
  type?: string | null;
  fuelType?: string | null;
  numberOfCylinders?: number | null;
  sell?: boolean | null;
  motorcycleId?: number | null;
};

export async function insertVehicle(userId: string, input: NewVehicleInput) {
  const payload: any = {
    user_id: userId,
    brand: input.brand,
    model: input.model,
    year: input.year ?? null,
    kilometers: input.kilometers ?? 0,
    registration_number: input.registrationNumber ?? null,
    engine_size: input.engineSize ?? null,
    type: input.type ?? null,
    fuel_type: input.fuelType ?? null,
    number_of_cylinders: input.numberOfCylinders ?? null,
    sell: input.sell ?? false,
    motorcycle_id: input.motorcycleId ?? null, // Assurez-vous que ce champ est inclus
  };

  const { data, error } = await supabase.from('vehicles').insert(payload).select('id').single();
  if (error) throw error;
  return data;
}

export async function searchMotorcycleBrands(query: string, limit = 20): Promise<string[]> {
  const { data, error } = await supabase
    .rpc('get_brands_by_prefix_from_motorcycles', { prefix: query }) // Appel de la fonction RPC
    .limit(limit); // Limite les résultats (si nécessaire)

  if (error) throw error;

  return (data ?? []).map((b: any) => b.brand);
}

export async function searchDisplacementsForBrand(brandName: string, displacement: string, limit = 50): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_brand_displacements_by_prefix', {
    brand_prefix: brandName,
    displacement_prefix: displacement,
  });

  if (error) {
    console.error('Erreur dans searchDisplacementsForBrand:', error);
    throw error;
  }

  console.log('Résultats de searchDisplacementsForBrand:', data);
  return (data ?? []).map((d: any) => d.displacement);
}

export async function searchModelsByBrandAndDisplacement(
  brand: string,
  displacement: string,
  modelQuery: string,
  limit = 20
): Promise<string[]> {
  console.log('Recherche de modèles pour la marque:'+ brand+ ' et la cylindrée:'+ displacement+ 'avec la requête:'+ modelQuery);
  const { data, error } = await supabase.
  rpc('get_models_by_brand_and_displacement_contains', {
    brand_prefix: brand,
    displacement_prefix: displacement,
    model_contains: modelQuery,
  })
  .limit(limit);

  if (error) {
    console.error('Erreur dans searchModelsByBrandAndDisplacement:', error);
    throw error;
  }

  console.log('Résultats de get_models_by_brand_and_displacement_contains:', data);
  return (data ?? []).map((m: any) => m.model);
}

export async function searchYearsByBrandModelDisplacement(
  brand: string,
  model: string,
  displacementPrefix: string
): Promise<string[]> {
  console.log(
    `Recherche des années pour la marque: ${brand}, modèle: ${model}, cylindrée commençant par: ${displacementPrefix}`
  );

  const { data, error } = await supabase.rpc('get_years_by_brand_model_displacement_prefix_text', {
    in_brand: brand,
    in_model: model,
    in_disp_prefix: displacementPrefix
  });
  

  if (error) {
    console.error('Erreur dans searchYearsByBrandModelDisplacement:', error);
    throw error;
  }

  console.log('Résultats de get_years_by_brand_model_displacement_prefix:', data);
  return (data ?? []).map((y: any) => y.year);
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', vehicleId);

  if (error) {
    console.error('Erreur lors de la suppression du véhicule :', error);
    throw error;
  }
}

export async function fetchMotorcycle(brand: string, model: string, year: number, displacement: string) {
  const { data, error } = await supabase
    .from('motorcycles')
    .select('id')
    .eq('brand', brand)
    .eq('model', model)
    .eq('year', year)
    .eq('displacement', displacement)
    .single(); // On suppose qu'il n'y a qu'un seul résultat attendu

  if (error) {
    console.error('Erreur lors de la récupération de la motorcycle :', error);
    throw error;
  }

  return data;
}
