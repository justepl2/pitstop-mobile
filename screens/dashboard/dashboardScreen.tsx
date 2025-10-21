import React, { useEffect, useState } from 'react';
import { View, Alert, Text, ScrollView } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import LoadingScreen from '../../components/ui/LoadingScreen';
import StatsCard from '../../components/ui/statsCard';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { fetchDashboardStats, DashboardStats } from '../../services/dashboardService';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardScreen() {
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const navigation = useNavigation();
  const { getCurrentUserId } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = await getCurrentUserId();
        const result = await fetchDashboardStats(userId);
        setStats(result);
      } catch (error: any) {
        Alert.alert('Erreur de chargement', error.message || 'Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading || !stats) {
    return <LoadingScreen message="Chargement du tableau de bord…" />;
  }

  return (
    <ScreenContainer padding={false} edges={['left', 'right']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing(2), // Padding horizontal seulement
          paddingTop: spacing(3), // Tout petit padding en haut (4px)
          paddingBottom: spacing(4), // Padding en bas pour éviter que le contenu touche le bord
        }}
      >
        {/* Header moderne */}
        <View style={{ 
          marginBottom: spacing(2),
          marginTop: -spacing(1), // Margin négatif pour remonter encore plus
        }}>
          <Text style={{
            fontSize: typography.sizes['3xl'],
            fontWeight: typography.weights.bold,
            color: colors.text,
            marginBottom: spacing(1),
            letterSpacing: -0.5,
          }}>
            Tableau de bord
          </Text>
          <Text style={{
            fontSize: typography.sizes.base,
            color: colors.textSecondary,
            fontWeight: typography.weights.medium,
          }}>
            Vue d'overview de vos véhicules et entretiens
          </Text>
        </View>

        {/* Boutons d'action */}
        <View style={{
          flexDirection: 'row',
          gap: spacing(2),
          marginBottom: spacing(3),
        }}>
          <View style={{ flex: 1 }}>
            <Button
              title="Nouveau Véhicule"
              variant="primary"
              size="md"
              icon={{ family: 'MaterialIcons', name: 'add' }}
              fullWidth
              onPress={() => {
                // @ts-ignore
                navigation.navigate('AddVehicleScreen');
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Nouvel Entretien"
              variant="secondary"
              size="md"
              icon={{ family: 'Feather', name: 'tool' }}
              fullWidth
              onPress={() => {
                // @ts-ignore
                navigation.navigate('MaintenancesScreen');
              }}
            />
          </View>
        </View>

        {/* Grille de statistiques */}
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing(1.5), // Réduction de l'espace entre les cartes
        }}>
          {/* Véhicules */}
          <View style={{ width: '100%', marginBottom: spacing(1) }}>
            <StatsCard
              title="Véhicules"
              value={stats.vehicles.toString()}
              subtitle="Véhicules enregistrés"
              layout="left"
              size="lg"
              categoryIcon={{
                family: 'Ionicons',
                name: 'car-outline',
                gradientColors: ['#1f2937', '#000000'] // gray-800 to black
              }}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('VehicleScreen');
              }}
            />
          </View>

          {/* Rappels */}
          <View style={{ width: '100%', marginBottom: spacing(1) }}>
            <StatsCard
              title="Rappel"
              value={stats.reminderCount?.toString() || '0'}
              subtitle="maintenances à prévoir"
              layout="left"
              size="lg"
              categoryIcon={{
                family: 'Ionicons',
                name: 'warning-outline',
                gradientColors: ['#f59e0b', '#ef4444'] // amber-500 to red-500
              }}
            />
          </View>

          {/* Coût Total */}
          <View style={{ width: '100%', marginBottom: spacing(1) }}>
            <StatsCard
              title="Coût Total"
              value={`${stats.totalCost || 0}€`}
              subtitle="Dépenses totales"
              layout="left"
              size="lg"
              categoryIcon={{
                family: 'Feather',
                name: 'trending-up',
                gradientColors: ['#dc2626', '#991b1b'] // red-600 to red-800
              }}
            />
          </View>

           {/* Entretiens */}
           <View style={{ width: '100%', marginBottom: spacing(1) }}>
            <StatsCard
              title="Entretiens"
              value={stats.maintenances?.toString() || '0'}
              subtitle="Entretiens effectués"
              layout="left"
              size="lg"
              categoryIcon={{
                family: 'Feather',
                name: 'tool',
                gradientColors: ['#64748b', '#334155'] // slate-500 to slate-700
              }}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('MaintenancesScreen');
              }}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
