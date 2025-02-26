import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import SignInSignUpPage from '@/screens/SignInSignUpPage';
import HomePage from '@/screens/HomePage';
import { supabase } from '@/lib/supabase';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking auth:', error);
        throw error;
      }
      setAuthenticated(!!session);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return authenticated ? <HomePage /> : <SignInSignUpPage />;
}