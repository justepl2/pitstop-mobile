import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import SuggestionField from '../../components/ui/SuggestionField';
import { insertVehicle, NewVehicleInput, searchMotorcycleBrands, searchModelsByBrandAndDisplacement, searchYearsByBrandModelDisplacement, fetchMotorcycle } from '../../services/vehiclesService';
import { fetchVehicleTypes, searchVehicleTypes, VehicleType } from '../../services/vehicleTypeService';
import { fetchFuels, searchFuels, Fuel } from '../../services/fuelService';
import { useSearch } from '../../hooks/useSearch';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { useAuth } from '../../hooks/useAuth';


export default function AddVehicleScreen() {
  const { spacing } = useTheme();
  const navigation = useNavigation();
  const { getCurrentUserId } = useAuth();

  // État du formulaire
  const [form, setForm] = useState<NewVehicleInput>({
    brand: '',
    model: '',
    year: null,
    kilometers: 0,
    registrationNumber: '',
    engineSize: null,
    vehicleTypeId: null,
    fuelId: null,
    numberOfCylinders: null,
    sell: false,
  });

  const updateForm = useCallback((patch: Partial<NewVehicleInput>) => {
    setForm(prev => ({ ...prev, ...patch }));
  }, []);

  // États pour les sélections
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | null>(null);
  const [selectedFuel, setSelectedFuel] = useState<Fuel | null>(null);

  // Hooks de recherche avec configurations spécifiques
  const vehicleTypeSearch = useSearch({
    searchFn: (query: string) => searchVehicleTypes(query, 20)
  });

  const brandSearch = useSearch({
    searchFn: (query: string) => searchMotorcycleBrands(query, 20)
  });

  const modelSearch = useSearch({
    searchFn: (query: string) => {
      if (!selectedBrand || !form.engineSize) return Promise.resolve([]);
      return searchModelsByBrandAndDisplacement(
        selectedBrand,
        form.engineSize.toString(),
        query,
        20
      );
    },
    dependencies: [selectedBrand, form.engineSize]
  });

  const yearSearch = useSearch({
    searchFn: () => {
      if (!selectedBrand || !form.model || !form.engineSize) return Promise.resolve([]);
      return searchYearsByBrandModelDisplacement(
        selectedBrand,
        form.model,
        form.engineSize.toString()
      );
    },
    dependencies: [selectedBrand, form.model, form.engineSize]
  });

  const fuelSearch = useSearch({
    searchFn: (query: string) => searchFuels(query, 20)
  });

  // Chargement initial des données populaires
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [initialVehicleTypes, initialFuels] = await Promise.all([
          fetchVehicleTypes(),
          fetchFuels()
        ]);

        // Pré-charger les types de véhicules populaires
        if (initialVehicleTypes.length > 0) {
          vehicleTypeSearch.setQuery('');
          // Mettre manuellement les résultats pour l'affichage initial
          vehicleTypeSearch.results = initialVehicleTypes.slice(0, 10);
        }

        // Pré-charger les carburants populaires
        if (initialFuels.length > 0) {
          fuelSearch.setQuery('');
          fuelSearch.results = initialFuels.slice(0, 10);
        }
      } catch (e) {
        console.error('Erreur lors du chargement initial:', e);
      }
    };

    loadInitialData();
  }, []);

  // Gestion de la fermeture automatique des suggestions
  useEffect(() => {
    if (selectedBrand && brandSearch.query === selectedBrand) {
      const timeout = setTimeout(brandSearch.hideSuggestions, 300);
      return () => clearTimeout(timeout);
    }
  }, [brandSearch.query, selectedBrand]);

  useEffect(() => {
    if (selectedVehicleType && vehicleTypeSearch.query === selectedVehicleType.name) {
      const timeout = setTimeout(vehicleTypeSearch.hideSuggestions, 300);
      return () => clearTimeout(timeout);
    }
  }, [vehicleTypeSearch.query, selectedVehicleType]);

  useEffect(() => {
    if (selectedFuel && fuelSearch.query === selectedFuel.name) {
      const timeout = setTimeout(fuelSearch.hideSuggestions, 300);
      return () => clearTimeout(timeout);
    }
  }, [fuelSearch.query, selectedFuel]);

  // Fonctions de gestion des sélections
  const handleVehicleTypeSelection = useCallback((vehicleType: VehicleType) => {
    setSelectedVehicleType(vehicleType);
    vehicleTypeSearch.setQuery(vehicleType.name);
    updateForm({ vehicleTypeId: vehicleType.id });
    vehicleTypeSearch.hideSuggestions();
  }, [vehicleTypeSearch, updateForm]);

  const handleBrandSelection = useCallback((brand: string) => {
    setSelectedBrand(brand);
    brandSearch.setQuery(brand);
    updateForm({ brand });
    brandSearch.hideSuggestions();
  }, [brandSearch, updateForm]);

  const handleModelSelection = useCallback((model: string) => {
    modelSearch.setQuery(model);
    updateForm({ model });
    modelSearch.hideSuggestions();
  }, [modelSearch, updateForm]);

  const handleYearSelection = useCallback((year: string) => {
    yearSearch.setQuery(year);
    updateForm({ year: Number(year) });
    yearSearch.hideSuggestions();
  }, [yearSearch, updateForm]);

  const handleFuelSelection = useCallback((fuel: Fuel) => {
    setSelectedFuel(fuel);
    fuelSearch.setQuery(fuel.name);
    updateForm({ fuelId: fuel.id });
    fuelSearch.hideSuggestions();
  }, [fuelSearch, updateForm]);

  const validate = useCallback((): string | null => {
    if (!form.brand?.trim()) return 'La marque est requise.';
    if (!form.model?.trim()) return 'Le modèle est requis.';
    if (!form.year || form.year < 1900 || form.year > 2100) return 'Année invalide.';
    if (form.kilometers != null && form.kilometers < 0) return 'Le kilométrage doit être positif.';
    return null;
  }, [form]);

  const submitOperation = useAsyncOperation({
    successMessage: 'Véhicule ajouté avec succès.',
    errorTitle: 'Erreur lors de l\'ajout',
    onSuccess: () => navigation.goBack()
  });

  const handleSubmit = useCallback(() => {
    const validationError = validate();
    if (validationError) {
      throw new Error(validationError);
    }

    return submitOperation.execute(async () => {
      const userId = await getCurrentUserId();

      // Vérification de l'existence dans motorcycles
      let motorcycleId: number | null = null;
      if (form.engineSize) {
        try {
          const motorcycle = await fetchMotorcycle(
            form.brand,
            form.model,
            form.year!,
            form.engineSize.toString()
          );
          motorcycleId = motorcycle?.id ?? null;
        } catch (e) {
          console.error('Erreur lors de la vérification du véhicule:', e);
        }
      }

      const vehicleData: NewVehicleInput = {
        ...form,
        motorcycleId,
      };

      await insertVehicle(userId, vehicleData);
    });
  }, [form, validate, submitOperation, navigation, getCurrentUserId]);

  return (
    <ScreenContainer padding={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={{ padding: spacing(2) }}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeader
            title="Ajouter un véhicule"
            subtitle="Sélectionnez le type, la marque et la cylindrée via recherche, puis complétez les informations."
          />

          <SuggestionField
            label="Type de véhicule"
            placeholder="Ex: Moto, Scooter..."
            value={vehicleTypeSearch.query}
            suggestions={vehicleTypeSearch.results}
            showSuggestions={vehicleTypeSearch.showSuggestions}
            onChangeText={(text) => {
              vehicleTypeSearch.setQuery(text);
              setSelectedVehicleType(null);
            }}
            onSelectSuggestion={handleVehicleTypeSelection}
            onFocus={vehicleTypeSearch.showSuggestionsAction}
          />

          <SuggestionField
            label="Marque"
            placeholder="Ex: Yamaha"
            value={brandSearch.query}
            suggestions={brandSearch.results}
            showSuggestions={brandSearch.showSuggestions}
            onChangeText={(text) => {
              brandSearch.setQuery(text);
              setSelectedBrand(null);
            }}
            onSelectSuggestion={handleBrandSelection}
            required
          />

          <TextInput
            label="Cylindrée (cc)"
            placeholder="Ex: 700"
            value={form.engineSize?.toString() ?? ''}
            onChangeText={(text) => updateForm({ engineSize: text ? Number(text) : null })}
            keyboardType="numeric"
          />

          <SuggestionField
            label="Modèle"
            placeholder="Ex: Ténéré 700"
            value={modelSearch.query}
            suggestions={modelSearch.results}
            showSuggestions={modelSearch.showSuggestions}
            onChangeText={(text) => {
              modelSearch.setQuery(text);
              updateForm({ model: text });
            }}
            onSelectSuggestion={handleModelSelection}
            required
          />

          <SuggestionField
            label="Année"
            placeholder="Ex: 2022"
            value={yearSearch.query}
            suggestions={yearSearch.results}
            showSuggestions={yearSearch.showSuggestions}
            onChangeText={(text) => {
              yearSearch.setQuery(text);
              updateForm({ year: text ? Number(text) : null });
            }}
            onSelectSuggestion={handleYearSelection}
            onFocus={yearSearch.showSuggestionsAction}
            keyboardType="numeric"
            required
          />

          <SuggestionField
            label="Carburant"
            placeholder="Ex: Essence, Diesel, Électrique..."
            value={fuelSearch.query}
            suggestions={fuelSearch.results}
            showSuggestions={fuelSearch.showSuggestions}
            onChangeText={(text) => {
              fuelSearch.setQuery(text);
              setSelectedFuel(null);
            }}
            onSelectSuggestion={handleFuelSelection}
            onFocus={fuelSearch.showSuggestionsAction}
          />

          <TextInput
            label="Kilométrage"
            placeholder="Ex: 20000"
            value={(form.kilometers ?? 0).toString()}
            onChangeText={(text) => updateForm({ kilometers: text ? Number(text) : 0 })}
            keyboardType="numeric"
          />

          <TextInput
            label="Immatriculation"
            placeholder="Ex: AA-123-BB"
            value={form.registrationNumber ?? ''}
            onChangeText={(text) => updateForm({ registrationNumber: text })}
            autoCapitalize="characters"
          />

          <View style={{ marginTop: spacing(4) }}>
            <Button
              title="Ajouter le véhicule"
              onPress={handleSubmit}
              loading={submitOperation.loading}
              disabled={submitOperation.loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
