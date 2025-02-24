import { Stack } from 'expo-router';
import WorkingPage from '@/screens/Working';

export default function Working() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'How It Works',
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
        }} 
      />
      <WorkingPage />
    </>
  );
}

export default WorkingPage; 