import { Stack } from "expo-router";
import { Linking } from 'react-native';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    Linking.addEventListener('url', handleDeepLink);
    return () => {
      // Clean up
      Linking.removeAllListeners('url');
    };
  }, []);

  const handleDeepLink = ({ url }: { url: string }) => {
    // Handle confirmation URLs
    if (url.includes('confirmation')) {
      // Extract token and handle confirmation
      const token = url.split('confirmation_token=')[1];
      if (token) {
        handleEmailConfirmation(token);
      }
    }
  };

  const handleEmailConfirmation = async (token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });
      if (error) throw error;
      // Navigate to home or show success message
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(screens)" options={{ headerShown: false }} />
      <Stack.Screen
        name="working"
        options={{
          title: 'How It Works',
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="notification"
        options={{
          title: 'Notifications',
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="chat-support"
        options={{
          title: 'Chat Support',
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack>
  );
}
