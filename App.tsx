// App.tsx
import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './theme/themeProvider';
import { supabase } from './lib/supabase';
import DrawerNavigator from './navigation/drawerNavigator';
import LoginScreen from './screens/auth/loginScreen';

export default function app() {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(Boolean(data.session));
      setChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!checked) {
    return null;
  }
  return (
    <ThemeProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaProvider>
        <NavigationContainer>
          {authed ? <DrawerNavigator /> : <LoginScreen />}
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
