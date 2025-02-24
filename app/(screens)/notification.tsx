import { Stack } from 'expo-router';
import NotificationPage from '@/screens/Notification';

export default function Notification() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Notifications',
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
        }} 
      />
      <NotificationPage />
    </>
  );
} 