import React from 'react';
import ChatRoomScreen from '../screens/ChatRoom';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function ChatPage() {
  const { roomId } = useLocalSearchParams();
  
  if (!roomId) {
    return <Text>Invalid chat room</Text>;
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Chat',
          headerShown: true,
        }} 
      />
      <ChatRoomScreen roomId={roomId as string} />
    </>
  );
} 