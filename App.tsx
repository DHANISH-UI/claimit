import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import SignInSignUpPage from './screens/SignInSignUpPage';
import HomePage from './screens/HomePage';
import LostPage from './screens/Lost';
import FoundPage from './screens/Found';

// Define the type for our stack navigator
type RootStackParamList = {
  SignInSignUp: undefined;
  Home: undefined;
  Lost: undefined;
  Found: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={session ? "Home" : "SignInSignUp"}
        screenOptions={{
          headerShown: false
        }}
      >
        {!session ? (
          <Stack.Screen name="SignInSignUp" component={SignInSignUpPage} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomePage} />
            <Stack.Screen name="Lost" component={LostPage} />
            <Stack.Screen name="Found" component={FoundPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 