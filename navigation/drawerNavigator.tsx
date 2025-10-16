// navigation/drawerNavigator.tsx
import React from 'react';
import { View } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useTheme } from '../theme/themeProvider';
import { supabase } from '../lib/supabase';
import DashboardScreen from '../screens/dashboard/dashboardScreen';
import MaintenancesScreen from '../screens/maintenances/maintenancesScreen';
import VehiclesScreen from '../screens/vehicles/vehiclesScreen';
import AddVehicleScreen from '../screens/vehicles/addVehicleScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function VehiclesStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Ajouter cette ligne pour supprimer tous les en-têtes du stack
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="VehiclesHome" component={VehiclesScreen} options={{ title: 'Véhicules' }} />
      <Stack.Screen name="AddVehicle" component={AddVehicleScreen} options={{ title: 'Ajouter un véhicule' }} />
    </Stack.Navigator>
  );
}

function DrawerContent(props: any) {
  const { colors } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // App.tsx bascule vers LoginScreen via onAuthStateChange
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: colors.background }}>
      <DrawerItemList {...props} />
      <View style={{ flex: 1 }} />
      <DrawerItem
        label="Se déconnecter"
        onPress={handleLogout}
        inactiveTintColor={colors.text}
        labelStyle={{ fontWeight: '700' }}
        style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}
      />
    </DrawerContentScrollView>
  );
}

export default function drawerNavigator() {
  const { colors } = useTheme();
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerType: 'front',
        drawerPosition: 'left',
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: '#666666',
        drawerStyle: { backgroundColor: colors.background, width: 280 },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700' },
      }}
      drawerContent={DrawerContent}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen 
        name="Vehicles" 
        component={VehiclesStack}
      />
      <Drawer.Screen name="Maintenances" component={MaintenancesScreen} />
    </Drawer.Navigator>
  );
}
