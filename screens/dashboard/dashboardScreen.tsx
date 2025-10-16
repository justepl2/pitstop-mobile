import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { useTheme } from '../../theme/themeProvider';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import LoadingScreen from '../../components/ui/LoadingScreen';
import StatsCard from '../../components/ui/statsCard';
import { fetchDashboardStats, DashboardStats } from '../../services/dashboardService';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardScreen() {
  const { spacing } = useTheme();
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
    <ScreenContainer>
      <ScreenHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de vos véhicules enregistrés."
      />

      {/* Carte de statistiques */}
      <View style={{ marginTop: spacing(2) }}>
        <StatsCard 
          title="Véhicules" 
          value={`${stats.vehicles}`} 
          onPress={() => {
            // @ts-ignore
            navigation.navigate('Vehicles');
          }}
        />
      </View>
    </ScreenContainer>
  );
}
