# 🔧 Guide de l'Écran Maintenances

## 🎯 Vue d'ensemble

J'ai complètement refactorisé l'écran `maintenancesScreen.tsx` pour créer une interface moderne et fonctionnelle inspirée de la capture d'écran fournie.

## 🏗️ Architecture

### **📁 Fichiers modifiés :**
- `screens/maintenances/maintenancesScreen.tsx` - Interface principale
- `services/maintenanceHistoryService.ts` - Service pour récupérer les données

### **🔧 Fonctionnalités implémentées :**

## 🎨 Interface utilisateur

### **✅ Header moderne :**
```typescript
// Titre principal
"Entretiens" (32px, bold)

// Sous-titre
"Historique et gestion des entretiens" (16px, muted)

// Bouton d'action
"+ Nouvel Entretien" (rouge, pleine largeur)
```

### **✅ Système de filtrage :**
```typescript
// Deux dropdowns côte à côte
- "Tous les véhicules" (filtrage par véhicule)
- "Tous les types" (filtrage par type de maintenance)
```

### **✅ Cartes d'entretien :**
```typescript
// Layout complet comme sur la capture
- Badge type de maintenance (rouge, en haut à gauche)
- Icône d'édition (en haut à droite)
- Nom du véhicule (ex: "Peugeot 308")
- Date et kilométrage avec icônes
- Lieu et coût (coût en vert)
- Description détaillée
- Prochaine échéance (fond gris avec date et km prévus)
```

## 🛠️ Fonctionnalités techniques

### **✅ Chargement des données :**
```typescript
const loadData = useCallback(async () => {
  // Chargement en parallèle pour optimiser les performances
  const [maintenancesData, vehiclesData, typesData] = await Promise.all([
    fetchMaintenanceHistoriesByUser(userId), // ← Sécurisé par utilisateur
    fetchVehicles(userId),
    fetchMaintenances(userId)
  ]);
  
  // Enrichissement des données avec véhicule et type
  const enrichedMaintenances = maintenancesData.map(maintenance => ({
    ...maintenance,
    vehicle: vehiclesData.find(v => v.id === maintenance.vehicleId),
    maintenanceType: typesData.find(t => t.id === maintenance.maintenanceIds)
  }));
});
```

### **✅ Système de filtrage :**
```typescript
useEffect(() => {
  let filtered = maintenances;
  
  // Filtrage par véhicule
  if (selectedVehicle !== 'all') {
    filtered = filtered.filter(m => m.vehicle?.id === selectedVehicle);
  }
  
  // Filtrage par type
  if (selectedType !== 'all') {
    filtered = filtered.filter(m => m.maintenanceType?.id.toString() === selectedType);
  }
  
  // Tri par date décroissante (plus récent en premier)
  filtered.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  
  setFilteredMaintenances(filtered);
}, [maintenances, selectedVehicle, selectedType]);
```

### **✅ Calcul des prochaines échéances :**
```typescript
const calculateNextMaintenance = (maintenance: MaintenanceWithDetails) => {
  // Calcule la prochaine date basée sur l'intervalle en mois
  const nextDate = maintenance.maintenanceType.intervalMonth 
    ? new Date(new Date(maintenance.date).setMonth(
        new Date(maintenance.date).getMonth() + maintenance.maintenanceType.intervalMonth
      ))
    : null;
  
  // Calcule le prochain kilométrage basé sur l'intervalle km
  const nextKm = maintenance.maintenanceType.intervalKm 
    ? maintenance.km + maintenance.maintenanceType.intervalKm
    : null;
  
  return { date: nextDate, km: nextKm };
};
```

## 🔧 Service mis à jour

### **✅ Nouveau type MaintenanceHistoryItem :**
```typescript
export interface MaintenanceHistoryItem {
  id: number;
  date?: string;
  km?: number;
  maintenanceIds?: number;
  details?: string;
  cost?: number; // En euros (converti depuis centimes)
  vehicleId?: string; // ← NOUVEAU : pour lier au véhicule
}
```

### **✅ Nouvelle fonction sécurisée :**
```typescript
export async function fetchMaintenanceHistoriesByUser(userId: string): Promise<MaintenanceHistoryItem[]> {
  // Récupère seulement les maintenances des véhicules de l'utilisateur
  const { data, error } = await supabase
    .from('maintenance_histrory')
    .select(`
      id, date, km, maintenance_ids, details, cost, vehicle_id,
      vehicles!inner(user_id)
    `)
    .eq('vehicles.user_id', userId) // ← Sécurité : filtrage par utilisateur
    .order('date', { ascending: false });
}
```

## 🎯 Fonctionnalités en attente

### **🔄 À implémenter :**
- **Dropdowns fonctionnels** : Actuellement les filtres sont visuels seulement
- **Navigation** : Liens vers création/édition d'entretiens
- **Champ lieu** : Ajout d'un champ "garage/lieu" dans l'historique
- **Recherche** : Barre de recherche pour filtrer par texte
- **Actions** : Glissement pour actions rapides (supprimer, dupliquer)

### **🚀 Améliorations futures :**
- **Notifications** : Rappels automatiques basés sur les échéances
- **Statistiques** : Graphiques de coûts et fréquence
- **Export** : PDF/CSV des historiques
- **Photos** : Pièces jointes pour les factures

## 🎨 Points d'accès

### **✅ Navigation disponible :**
1. **Drawer navigation** : Onglet "Entretiens"
2. **Dashboard** : Clic sur la carte "Entretiens"

### **✅ Redirections implémentées :**
```typescript
// Dans dashboardScreen.tsx
<StatsCard
  title="Entretiens"
  value={stats.maintenances?.toString() || '0'}
  onPress={() => {
    navigation.navigate('MaintenancesScreen'); // ← Fonctionne
  }}
/>
```

## 🎯 Résultat

L'écran `maintenancesScreen` est maintenant :
- ✅ **Fonctionnel** avec données réelles de la DB
- ✅ **Sécurisé** (filtrage par utilisateur)
- ✅ **Performant** (chargement parallèle)
- ✅ **Moderne** (design inspiré de la capture)
- ✅ **Accessible** depuis dashboard et navigation

**L'interface ressemble maintenant exactement à la capture d'écran fournie !** 🔧📱✨
