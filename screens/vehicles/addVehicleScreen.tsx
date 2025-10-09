// screens/vehicles/addVehicleScreen.tsx
// MODIF: champ texte pour cylindrée avec recherche incrémentale dépendante de la marque
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { supabase } from '../../lib/supabase';
import { reportSupabaseError } from '../../utils/errorHandler';
import { useNavigation } from '@react-navigation/native';
import { insertVehicle, NewVehicleInput } from '../../services/vehiclesService';
import { searchMotorcycleBrands, searchDisplacementsForBrand, searchModelsByBrandAndDisplacement, searchYearsByBrandModelDisplacement } from '../../services/vehiclesService';
import { fetchMotorcycle } from '../../services/vehiclesService';

export default function addVehicleScreen() {
  const { colors, spacing } = useTheme();
  const nav = useNavigation();

  const [form, setForm] = useState<NewVehicleInput>({
    brand: '',
    model: '',
    year: null,
    kilometers: 0,
    registrationNumber: '',
    engineSize: null,
    type: '',
    fuelType: '',
    numberOfCylinders: null,
    sell: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (patch: Partial<NewVehicleInput>) => setForm((f) => ({ ...f, ...patch }));

  // Marque: recherche incrémentale
  const [brandQuery, setBrandQuery] = useState('');
  const [brand, setBrand] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);

  const debouncedBrandQuery = useMemo(() => brandQuery.trim(), [brandQuery]);

  useEffect(() => {
    const run = async () => {
      if (debouncedBrandQuery.length === 0) {
        setBrand([]);
        return;
      }
  
      try {
        const results = await searchMotorcycleBrands(debouncedBrandQuery, 20); // Retourne un tableau de strings
        setBrand(results); // Met à jour directement les résultats
      } catch (e: any) {
        console.error('Erreur lors de la recherche des marques :', e);
        reportSupabaseError('Erreur de chargement des marques', e);
      }
    };
  
    const t = setTimeout(run, 200);
    return () => clearTimeout(t);
  }, [debouncedBrandQuery]);

  useEffect(() => {
    if (selectedBrand && brandQuery === selectedBrand) {
      const timeout = setTimeout(() => {
        setShowBrandSuggestions(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [brandQuery, selectedBrand]);

  const onSelectBrand = (brand: string) => {
    setSelectedBrand(brand);
    setBrandQuery(brand);
    update({ brand });
    setShowBrandSuggestions(false);
    // // reset cylindrée
    // setDisplacementQuery('');
    // setDisplacements([]);
    // setSelectedDisplacement(null);
    // update({ engineSize: null });
  };

  // Cylindrée: recherche incrémentale dépendante de la marque
  const [displacementQuery, setDisplacementQuery] = useState('');

  const [modelQuery, setModelQuery] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);

  const [yearQuery, setYearQuery] = useState('');
  const [years, setYears] = useState<string[]>([]);
  const [showYearSuggestions, setShowYearSuggestions] = useState(false);

  useEffect(() => {
    console.log('selectedBrand:', selectedBrand);
    console.log('form.engineSize:', form.engineSize);
    console.log('modelQuery:', modelQuery);

    const fetchModels = async () => {
      if (!selectedBrand || !form.engineSize || modelQuery.trim().length === 0) {
        setModels([]);
        return;
      }

      try {
        const results = await searchModelsByBrandAndDisplacement(
          selectedBrand,
          form.engineSize.toString(),
          modelQuery.trim(),
          20
        );
        setModels(results);
      } catch (e) {
        console.error('Erreur lors de la recherche des modèles :', e);
        setModels([]);
      }
    };

    const timeout = setTimeout(fetchModels, 200);
    return () => clearTimeout(timeout);
  }, [selectedBrand, form.engineSize, modelQuery]);

  useEffect(() => {
    const fetchYears = async () => {
      if (!selectedBrand || !form.model || !form.engineSize) {
        setYears([]);
        return;
      }
  
      try {
        const results = await searchYearsByBrandModelDisplacement(
          selectedBrand,
          form.model,
          form.engineSize.toString()
        );
        setYears(results);
      } catch (e) {
        console.error('Erreur lors de la recherche des années :', e);
        setYears([]);
      }
    };
  
    const timeout = setTimeout(fetchYears, 200); // Ajout d'un délai pour éviter les appels réseau excessifs
    return () => clearTimeout(timeout);
  }, [selectedBrand, form.model, form.engineSize]);

  const validate = (): string | null => {
    if (!form.brand?.trim()) return 'La marque est requise.';
    if (!form.model?.trim()) return 'Le modèle est requis.';
    if (!form.year || form.year < 1900 || form.year > 2100) return 'Année invalide.';
    if (!form.engineSize?.trim()) return 'La cylindrée est requise.';
    if (form.kilometers != null && form.kilometers < 0) return 'Le kilométrage doit être positif.';
    return null;
  };

  const addVehicle = async () => {
    try {
      // Validation des champs du formulaire
      const err = validate();
      if (err) {
        Alert.alert('Formulaire invalide', err);
        return;
      }
  
      // Récupération des données du formulaire
      const { brand, model, year, kilometers, registrationNumber, engineSize } = form;
  
      // Requête pour vérifier si le véhicule existe dans la table `motorcycles`
      let motorcycleId: number | null = null;
      try {
        const motorcycle = await fetchMotorcycle(brand, model, year!, engineSize!);
        motorcycleId = motorcycle?.id ?? null; // Récupère l'ID de la `motorcycle`
      } catch (e) {
        console.error('Erreur lors de la vérification du véhicule dans motorcycles:', e);
        Alert.alert('Erreur', 'Impossible de vérifier le véhicule.');
        return;
      }
  
      // Récupération de l'utilisateur connecté
      const { data: sessionRes } = await supabase.auth.getSession();
      const userId = sessionRes.session?.user.id;
      if (!userId) {
        throw new Error('Utilisateur non connecté.');
      }
  
      // Préparation des données pour l'insertion
      const newVehicle: NewVehicleInput = {
        brand,
        model,
        year,
        kilometers,
        registrationNumber,
        engineSize,
        type: 'motorcycle',
        fuelType: 'essence',
        sell: false,
        motorcycleId, // Ajout de l'ID de la `motorcycle`
      };
  
      // Insertion du véhicule dans la table `vehicles`
      await insertVehicle(userId, newVehicle);
  
      Alert.alert('Succès', 'Véhicule ajouté avec succès.');
      // Redirection ou réinitialisation du formulaire
      nav.goBack();
    } catch (e: any) {
      console.error('Erreur lors de l\'ajout du véhicule :', e);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout du véhicule.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Utilise "padding" pour iOS et "height" pour Android
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Ajustez cet offset si nécessaire
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={{ padding: spacing(2) }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Ajouter un véhicule</Text>
          <Text style={{ marginTop: spacing(1), color: colors.muted }}>
            Sélectionnez la marque et la cylindrée via recherche, puis complétez les informations.
          </Text>

          {/* Marque avec recherche incrémentale */}
          <View style={{ marginTop: spacing(2) }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Marque *</Text>
            <TextInput
              value={brandQuery}
              onChangeText={(t) => {
                setBrandQuery(t);
                setSelectedBrand(null);
                setShowBrandSuggestions(true);
              }}
              placeholder="Ex: Yamaha"
              placeholderTextColor="#9AA0A6"
              autoCapitalize="none"
              autoComplete='off'
              autoCorrect={false}
              style={{
                marginTop: spacing(1),
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: colors.surface,
                color: colors.text,
              }}
            />
            {showBrandSuggestions && brand.length > 0 && (
              <FlatList
                data={brand}
                keyExtractor={(item) => `${item}`}
                keyboardShouldPersistTaps="handled" // Permet de gérer les taps même si le clavier est ouvert
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => onSelectBrand(item)}
                    style={{ paddingVertical: spacing(1) }}
                  >
                    <Text style={{ color: colors.text, fontWeight: '700' }}>{item}</Text>
                  </TouchableOpacity>
                )}
                style={{
                  marginTop: spacing(1),
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  backgroundColor: colors.surface,
                  maxHeight: 240,
                }}
              />
            )}
          </View>

          {/* Cylindrée */}
          <View style={{ marginTop: spacing(2) }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Cylindrée (cc)</Text>
            <TextInput
              value={form.engineSize?.toString() ?? ''}
              onChangeText={(t) => update({ engineSize: t })}
              placeholder="Ex: 700"
              placeholderTextColor="#9AA0A6"
              keyboardType="numeric"
              style={{
                marginTop: spacing(1),
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: colors.surface,
                color: colors.text,
              }}
            />
          </View>

          {/* Model avec recherche incrémentale */}
          <View style={{ marginTop: spacing(2) }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Modèle *</Text>
            <TextInput
              value={modelQuery}
              onChangeText={(t) => {
                setModelQuery(t);
                setShowModelSuggestions(true);
                update({ model: t });
              }}
              placeholder="Ex: Ténéré 700"
              placeholderTextColor="#9AA0A6"
              autoCapitalize="none"
              autoComplete='off'
              autoCorrect={false}
              style={{
                marginTop: spacing(1),
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: colors.surface,
                color: colors.text,
              }}
            />
            {showModelSuggestions && models.length > 0 && (
              <FlatList
                data={models}
                keyExtractor={(item, index) => `${item}-${index}`} // Combinez l'élément et l'index pour garantir l'unicité
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setModelQuery(item); // Met à jour le champ de saisie avec le modèle sélectionné
                      setShowModelSuggestions(false); // Cache les suggestions après la sélection
                      update({ model: item }); // Met à jour le formulaire avec le modèle sélectionné
                    }}
                    style={{ paddingVertical: spacing(1) }}
                  >
                    <Text style={{ color: colors.text, fontWeight: '700' }}>{item}</Text>
                  </TouchableOpacity>
                )}
                style={{
                  marginTop: spacing(1),
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  backgroundColor: colors.surface,
                  maxHeight: 240,
                }}
              />
            )}
          </View>

          {/* Année avec recherche incrémentale */}
          <View style={{ marginTop: spacing(2) }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Année *</Text>
            <TextInput
              value={yearQuery}
              onChangeText={(t) => {
                setYearQuery(t);
                setShowYearSuggestions(true);
                update({ year: t ? Number(t) : null });
              }}
              onFocus={() => {
                setShowYearSuggestions(true); // Affiche les suggestions dès que le champ est sélectionné
              }}
              placeholder="Ex: 2022"
              placeholderTextColor="#9AA0A6"
              keyboardType="numeric"
              style={{
                marginTop: spacing(1),
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: colors.surface,
                color: colors.text,
              }}
            />
            {showYearSuggestions && years.length > 0 && (
              <FlatList
                data={years}
                keyExtractor={(item) => item} // Utilisez directement `item` comme clé
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setYearQuery(item); // Utilisez directement `item` pour mettre à jour l'état
                      setShowYearSuggestions(false);
                      update({ year: Number(item) }); // Convertissez `item` en nombre pour mettre à jour le formulaire
                    }}
                    style={{ paddingVertical: spacing(1) }}
                  >
                    <Text style={{ color: colors.text, fontWeight: '700' }}>{item}</Text> {/* Affichez directement `item` */}
                  </TouchableOpacity>
                )}
                style={{
                  marginTop: spacing(1),
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  backgroundColor: colors.surface,
                  maxHeight: 240,
                }}
              />
            )}
          </View>

          {/* Kilométres */}
          <View style={{ marginTop: spacing(2), flexDirection: 'row', gap: spacing(2) }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>Kilométrage</Text>
              <TextInput
                value={(form.kilometers ?? 0).toString()}
                onChangeText={(t) => update({ kilometers: t ? Number(t) : 0 })}
                keyboardType="numeric"
                placeholder="Ex: 20000"
                placeholderTextColor="#9AA0A6"
                style={{
                  marginTop: spacing(1),
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: colors.surface,
                  color: colors.text,
                }}
              />
            </View>
          </View>

          {/* Immatriculation */}
          <View style={{ marginTop: spacing(2) }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Immatriculation</Text>
            <TextInput
              value={form.registrationNumber ?? ''}
              onChangeText={(t) => update({ registrationNumber: t })}
              placeholder="Ex: AA-123-BB"
              placeholderTextColor="#9AA0A6"
              autoCapitalize="characters"
              style={{
                marginTop: spacing(1),
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: colors.surface,
                color: colors.text,
              }}
            />
          </View>

          <TouchableOpacity
            onPress={addVehicle}
            style={{
              marginTop: spacing(4),
              backgroundColor: colors.primary,
              paddingVertical: spacing(2),
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.surface, fontWeight: '700' }}>Ajouter le véhicule</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
