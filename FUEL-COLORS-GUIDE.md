# 🎨 Guide des Couleurs de Carburants

## 🎯 Système de couleurs

J'ai créé un système de couleurs **dans le code** pour les différents types de carburants. Voici pourquoi et comment l'utiliser.

## 🏗️ Architecture

### **📁 Fichier principal**
- `utils/fuelColors.ts` - Système complet de gestion des couleurs

### **🎨 Couleurs européennes standards**

| Carburant DB | Affichage | Couleur | Code Hex | Standard |
|--------------|-----------|---------|----------|----------|
| **"Gasoline"** | Essence | 🟢 Vert clair | `#22c55e` | 🇪🇺 SP95 |
| **"SP98"** | SP98 | 🟢 Vert foncé | `#16a34a` | 🇪🇺 SP98 Premium |  
| **"Diesel"** | Diesel | 🟡 Jaune/Orange | `#f59e0b` | 🇪🇺 Diesel |
| **"LPG"** | GPL | 🔵 Bleu ciel | `#0ea5e9` | 🇪🇺 GPL |
| **"Electric"** | Électrique | 🟢 Vert foncé | `#059669` | ⚡ Électrique |
| **"hybrid"** | Hybride | 🔵 Bleu cyan | `#0891b2` | 🔋 Hybride |
| **"Ethanol"** | Éthanol | 🟠 Orange | `#ea580c` | 🌱 Bio |
| **"Hydrogen"** | Hydrogène | 🟣 Violet | `#a855f7` | 💨 H2 |
| **"Two‑stroke mix"** | 2-Temps | 🔴 Rouge | `#dc2626` | 🏍️ Moto |
| **Autre** | Autre | ⭕ Gris neutre | `#6b7280` | Défaut |

## 🛠️ Utilisation

### **🔍 Fonctions disponibles**

```typescript
import { getFuelColors, getFuelBackgroundColor, getFuelDisplayName } from '../utils/fuelColors';

// Récupère toutes les infos (couleur fond, texte, nom formaté)
const fuelColors = getFuelColors('essence');
// → { background: '#dc2626', text: '#ffffff', name: 'Essence' }

// Récupère juste la couleur de fond
const bgColor = getFuelBackgroundColor('diesel'); 
// → '#1f2937'

// Récupère le nom formaté
const displayName = getFuelDisplayName('e85');
// → 'E85'
```

### **🎯 Reconnaissance intelligente**

Le système reconnaît automatiquement :
- **Variations** : "essence", "Essence", "ESSENCE"
- **Espaces** : "Essence Sans Plomb 95" → détecte "essence"
- **Abréviations** : "SP95", "E85", "GPL"
- **Synonymes** : "gasoil" = "diesel", "electric" = "électrique"

### **📱 Dans les composants**

```typescript
// Dans VehicleCard.tsx
const fuelColors = getFuelColors(vehicle.fuel?.name);

<View style={{ backgroundColor: fuelColors.background }}>
  <Text style={{ color: fuelColors.text }}>
    {fuelColors.name.toLowerCase()}
  </Text>
</View>
```

## ✅ **Avantages de cette approche**

### **🚀 Performance**
- Aucune requête DB supplémentaire
- Calcul instantané côté client
- Cache automatique en mémoire

### **🎨 Cohérence design**
- Couleurs intégrées au design system
- Cohérence visuelle garantie
- Facile à maintenir avec le thème

### **🔧 Flexibilité**
- Reconnaissance intelligente des variantes
- Extensible facilement
- Fallback automatique

### **📦 Simplicité**
- Une seule source de vérité
- Code simple et lisible
- Pas de configuration DB nécessaire

## 🔄 **Extension**

Pour ajouter un nouveau carburant :

```typescript
// Dans utils/fuelColors.ts
export const FUEL_COLORS: Record<string, FuelColorScheme> = {
  // ... carburants existants ...
  
  // Nouveau carburant
  'hydrogene': {
    background: '#3b82f6', // Bleu
    text: '#ffffff',
    name: 'Hydrogène'
  },
};
```

## 🎯 **Résultat - Standards européens**

Maintenant chaque véhicule aura un badge coloré selon les **standards européens** :
- 🚗 **Peugeot 308 SP95** → Badge vert clair (comme aux stations)
- 🏎️ **Porsche SP98** → Badge vert foncé (premium)
- 🚙 **BMW X3 Diesel** → Badge jaune/orange (standard EU)
- 🚐 **Fiat GPL** → Badge bleu ciel (standard EU)
- ⚡ **Tesla Électrique** → Badge vert foncé
- 🔋 **Toyota Hybride** → Badge bleu cyan

**Couleurs familières pour tous les automobilistes européens !** 🇪🇺🎨✨
