import { Stack } from 'expo-router';
import ProfilePage from '@/screens/Profile';

export default function Profile() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Profile',
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
        }} 
      />
      <ProfilePage />
    </>
  );
} 