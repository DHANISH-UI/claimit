import { Stack } from 'expo-router';
import ChatSupportPage from '@/screens/ChatSupport';

export default function ChatSupport() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Chat Support',
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
        }} 
      />
      <ChatSupportPage />
    </>
  );
} 