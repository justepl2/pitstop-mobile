# Architecture des Composants - PitStop Mobile

## 🏗️ Vue d'ensemble

Cette refactorisation globale a transformé la codebase en une architecture modulaire et réutilisable, basée sur des composants et hooks personnalisés.

## 📁 Structure des Composants

```
components/
├── ui/                     # Composants UI réutilisables
│   ├── Button.tsx         # Bouton avec variants (primary, secondary, danger, ghost)
│   ├── TextInput.tsx      # Input texte avec label, erreur, validation
│   ├── SuggestionField.tsx # Champ avec suggestions autocomplete
│   ├── ScreenContainer.tsx # Container de base pour tous les écrans
│   ├── ScreenHeader.tsx   # En-tête d'écran avec titre/sous-titre/action
│   ├── LoadingScreen.tsx  # Écran de chargement uniforme
│   ├── EmptyState.tsx     # État vide avec message et action optionnelle
│   ├── StatsCard.tsx      # Carte de statistiques (existant)
│   ├── SectionHeader.tsx  # En-tête de section (existant)
│   └── index.ts          # Export centralisé
└── vehicles/              # Composants spécifiques aux véhicules
    └── VehicleCard.tsx    # Carte de véhicule (existant)

hooks/
├── useSearch.ts          # Hook pour recherche avec debounce
├── useAuth.ts           # Hook pour authentification
├── useAsyncOperation.ts # Hook pour opérations async avec loading/error
├── useDataLoader.ts     # Hook pour chargement de données avec cache
└── index.ts            # Export centralisé
```

## 🎯 Composants UI

### 1. **ScreenContainer**
Container de base pour tous les écrans avec SafeAreaView intégré.

```tsx
import { ScreenContainer } from '../components/ui';

<ScreenContainer padding={true} edges={['top', 'left', 'right']}>
  {children}
</ScreenContainer>
```

### 2. **ScreenHeader**
En-tête standardisé pour tous les écrans.

```tsx
import { ScreenHeader, Button } from '../components/ui';

<ScreenHeader
  title="Mon Écran"
  subtitle="Description optionnelle"
  action={<Button title="Action" onPress={() => {}} />}
/>
```

### 3. **Button**
Bouton polyvalent avec plusieurs variants et états.

```tsx
import { Button } from '../components/ui';

<Button
  title="Mon Bouton"
  onPress={() => {}}
  variant="primary" // primary | secondary | danger | ghost
  size="medium"     // small | medium | large
  loading={false}
  disabled={false}
/>
```

### 4. **TextInput**
Input avec label, validation et gestion d'erreurs.

```tsx
import { TextInput } from '../components/ui';

<TextInput
  label="Email"
  placeholder="exemple@email.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  required
  error={emailError}
/>
```

### 5. **SuggestionField**
Champ avec autocomplete et suggestions.

```tsx
import { SuggestionField } from '../components/ui';

<SuggestionField
  label="Marque"
  placeholder="Ex: Yamaha"
  value={brandSearch.query}
  suggestions={brandSearch.results}
  showSuggestions={brandSearch.showSuggestions}
  onChangeText={brandSearch.setQuery}
  onSelectSuggestion={handleBrandSelection}
  required
/>
```

### 6. **LoadingScreen**
Écran de chargement uniforme.

```tsx
import { LoadingScreen } from '../components/ui';

if (loading) {
  return <LoadingScreen message="Chargement des données…" />;
}
```

### 7. **EmptyState**
État vide avec message et action optionnelle.

```tsx
import { EmptyState } from '../components/ui';

<EmptyState
  title="Aucun véhicule"
  message="Vous n'avez pas encore ajouté de véhicule."
  actionTitle="Ajouter un véhicule"
  onAction={() => navigation.navigate('AddVehicle')}
/>
```

## 🎣 Hooks Personnalisés

### 1. **useSearch**
Hook pour recherche avec debounce et gestion des suggestions.

```tsx
import { useSearch } from '../hooks';

const brandSearch = useSearch({
  searchFn: (query: string) => searchMotorcycleBrands(query, 20),
  dependencies: [], // Dépendances optionnelles
  delay: 200       // Délai de debounce
});

// Usage
brandSearch.query        // Query actuelle
brandSearch.results      // Résultats de la recherche
brandSearch.showSuggestions // Afficher les suggestions
brandSearch.setQuery()   // Mettre à jour la query
brandSearch.hideSuggestions() // Masquer les suggestions
```

### 2. **useAuth**
Hook centralisé pour l'authentification.

```tsx
import { useAuth } from '../hooks';

const {
  email,
  setEmail,
  password,
  setPassword,
  signIn,
  signUp,
  getCurrentUserId,
  loading,
  error
} = useAuth();
```

### 3. **useAsyncOperation**
Hook pour opérations asynchrones avec gestion d'état.

```tsx
import { useAsyncOperation } from '../hooks';

const operation = useAsyncOperation({
  successMessage: 'Opération réussie',
  errorTitle: 'Erreur',
  onSuccess: () => navigation.goBack()
});

const handleSubmit = () => {
  operation.execute(async () => {
    // Votre logique async ici
    await saveData();
  });
};

operation.loading // État de chargement
operation.error   // Message d'erreur
```

### 4. **useDataLoader**
Hook pour chargement de données avec cache et refresh.

```tsx
import { useDataLoader } from '../hooks';

const { data, loading, refreshing, load, refresh, error } = useDataLoader<VehicleItem[]>(
  async () => {
    const userId = await getCurrentUserId();
    return await fetchVehicles(userId);
  },
  {
    autoLoad: true,
    errorTitle: 'Erreur de chargement'
  }
);
```

## 🚀 Avantages de la Refactorisation

### **1. Réutilisabilité**
- Composants UI standardisés réutilisables dans toute l'app
- Hooks personnalisés pour la logique commune
- Styles cohérents avec le thème

### **2. Maintenabilité**
- Code organisé en modules logiques
- Séparation claire des responsabilités
- Facile à tester unitairement

### **3. Performance**
- Hooks optimisés avec useCallback/useMemo
- Debounce intégré pour les recherches
- Gestion intelligente du cache

### **4. Expérience Développeur**
- Imports centralisés via index.ts
- Types TypeScript complets
- Documentation intégrée

### **5. Consistance**
- Interface utilisateur uniforme
- Gestion d'erreurs standardisée
- Loading states cohérents

## 📝 Exemples d'Usage

### Écran Simple avec Données
```tsx
import React from 'react';
import { ScreenContainer, ScreenHeader, LoadingScreen } from '../components/ui';
import { useDataLoader, useAuth } from '../hooks';

export default function MyScreen() {
  const { getCurrentUserId } = useAuth();
  
  const { data, loading } = useDataLoader(async () => {
    const userId = await getCurrentUserId();
    return await fetchMyData(userId);
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Mon Écran" />
      {/* Votre contenu ici */}
    </ScreenContainer>
  );
}
```

### Formulaire avec Validation
```tsx
import React, { useState } from 'react';
import { ScreenContainer, ScreenHeader, TextInput, Button } from '../components/ui';
import { useAsyncOperation } from '../hooks';

export default function MyForm() {
  const [form, setForm] = useState({ name: '', email: '' });
  
  const submitOperation = useAsyncOperation({
    successMessage: 'Formulaire envoyé !',
    onSuccess: () => navigation.goBack()
  });

  const handleSubmit = () => {
    submitOperation.execute(async () => {
      await submitForm(form);
    });
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Mon Formulaire" />
      
      <TextInput
        label="Nom"
        value={form.name}
        onChangeText={(name) => setForm(prev => ({ ...prev, name }))}
        required
      />
      
      <TextInput
        label="Email"
        value={form.email}
        onChangeText={(email) => setForm(prev => ({ ...prev, email }))}
        keyboardType="email-address"
        required
      />
      
      <Button
        title="Envoyer"
        onPress={handleSubmit}
        loading={submitOperation.loading}
      />
    </ScreenContainer>
  );
}
```

## 🎨 Personnalisation

### Thème
Tous les composants utilisent le `useTheme()` hook pour une cohérence visuelle. Modifiez `theme/themeProvider.tsx` pour personnaliser les couleurs et espacements.

### Variants
Chaque composant supporte plusieurs variants pour s'adapter aux différents contextes d'usage.

### Extensions
Ajoutez facilement de nouveaux composants en suivant les patterns établis et en les exportant via `components/ui/index.ts`.

---

Cette architecture moderne permet une développement rapide et maintenable tout en garantissant une expérience utilisateur cohérente. 🚀
