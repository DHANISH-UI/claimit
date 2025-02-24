import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="lost"
        options={{
          title: 'Report Lost Item',
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="found"
        options={{
          title: 'Report Found Item',
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
        }}
      />
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
    </Stack>
  );
} 