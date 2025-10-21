import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../theme/themeProvider';
import { MaintenanceHistoryItem } from '../../services/maintenanceHistoryService';

interface KilometerChartProps {
  data: MaintenanceHistoryItem[];
}

export default function KilometerChart({ data }: KilometerChartProps) {
  const { colors, spacing } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  // Fonction pour formater les kilomètres (65000 -> 65k)
  const formatKm = (km: number): string => {
    if (km >= 1000) {
      return `${Math.round(km / 1000)}k`;
    }
    return km.toString();
  };

  // Préparer les données pour le graphique
  const prepareChartData = () => {
    if (!data || data.length === 0) {
      return null;
    }

    // Filtrer et trier les données valides
    const validData = data
      .filter(item => item.date && item.km !== undefined && item.km !== null)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

    if (validData.length === 0) {
      return null;
    }

    // Créer les labels au format mm/aa
    const labels = validData.map(item => {
      const date = new Date(item.date!);
      return date.toLocaleDateString('fr-FR', { month: '2-digit', year: '2-digit' });
    });

    const kilometers = validData.map(item => item.km!);

    return {
      labels,
      datasets: [{
        data: kilometers,
        strokeWidth: 3,
      }]
    };
  };

  const chartData = prepareChartData();

  if (!chartData) {
    return (
      <View style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing(2),
        marginBottom: spacing(3),
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
      }}>
        <Text style={{ 
          color: colors.muted, 
          fontSize: 16,
          textAlign: 'center'
        }}>
          📊 Suivi kilométrique
        </Text>
        <Text style={{ 
          color: colors.muted, 
          fontSize: 14,
          textAlign: 'center',
          marginTop: spacing(1)
        }}>
          Aucune donnée disponible
        </Text>
        <Text style={{ 
          color: colors.muted, 
          fontSize: 12,
          textAlign: 'center',
          marginTop: spacing(0.5)
        }}>
          Ajoutez des historiques avec km et date
        </Text>
      </View>
    );
  }

  // Configuration du graphique
  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => colors.text + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
      fill: colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border,
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
    },
    formatYLabel: (yLabel: string) => formatKm(parseFloat(yLabel)),
  };

  // Calcul des statistiques
  const realData = chartData.datasets[0].data;
  const minKm = Math.min(...realData);
  const maxKm = Math.max(...realData);
  const totalPoints = realData.length;

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing(2),
      marginBottom: spacing(3),
      borderWidth: 1,
      borderColor: colors.border,
    }}>
      <Text style={{ 
        fontSize: 18, 
        fontWeight: '700', 
        color: colors.text, 
        marginBottom: spacing(1)
      }}>
        📊 Suivi kilométrique
      </Text>

      {/* Statistiques rapides */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: spacing(2),
        paddingHorizontal: spacing(1)
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Min</Text>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
            {formatKm(minKm)} km
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Max</Text>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
            {formatKm(maxKm)} km
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Points</Text>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
            {totalPoints}
          </Text>
        </View>
      </View>

      {/* Graphique */}
      <LineChart
        data={chartData}
        width={screenWidth - spacing(4) * 2}
        height={200}
        chartConfig={chartConfig}
        bezier={true}
        style={{
          marginVertical: spacing(1),
          borderRadius: 8,
        }}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        withDots={true}
        withShadow={false}
        withScrollableDot={false}
        withInnerLines={true}
        withOuterLines={false}
        segments={4}
      />

      <Text style={{ 
        color: colors.muted, 
        fontSize: 12, 
        textAlign: 'center',
        marginTop: spacing(1)
      }}>
        Évolution kilométrique • Format mm/aa
      </Text>
    </View>
  );
}