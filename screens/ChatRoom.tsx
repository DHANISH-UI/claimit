import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useLocalSearchParams } from 'expo-router';

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

// Update the props type
type ChatRoomProps = {
  roomId: string;  // This will now be "lost_item_id_found_item_id"
};

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Split the composite ID
  const [lostItemId, foundItemId] = roomId.split('_');

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });

    // Add console logs for debugging
    console.log('Chat room ID:', roomId);
    
    fetchMessages();
    const cleanup = subscribeToMessages();
    return () => {
      cleanup();
    };
  }, [roomId]);

  const fetchMessages = async () => {
    try {
      // Get the actual chat room first
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('lost_item_id', lostItemId)
        .eq('found_item_id', foundItemId)
        .single();

      if (!room) throw new Error('Chat room not found');

      // Then get messages using the room's ID
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_room_id', room.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return;

    try {
      // Get room ID first
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('lost_item_id', lostItemId)
        .eq('found_item_id', foundItemId)
        .single();

      if (!room) throw new Error('Chat room not found');

      // Then send message
      const { error } = await supabase.from('messages').insert({
        chat_room_id: room.id,
        content: newMessage.trim(),
        sender_id: currentUserId
      });

      if (error) throw error;
      setNewMessage('');
      inputRef.current?.clear();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const subscribeToMessages = () => {
    console.log('Setting up real-time subscription for room:', roomId);
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('New message received:', payload.new);
          // Ensure we don't duplicate messages
          setMessages((current) => {
            const exists = current.some(msg => msg.id === payload.new.id);
            if (!exists) {
              return [...current, payload.new as Message];
            }
            return current;
          });
          flatListRef.current?.scrollToEnd();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const isOwnMessage = (senderId: string) => currentUserId === senderId;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            isOwnMessage(item.sender_id) ? styles.ownMessage : styles.otherMessage
          ]}>
            <Text style={[
              styles.messageText,
              isOwnMessage(item.sender_id) ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {item.content}
            </Text>
            <Text style={styles.messageTime}>
              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        contentContainerStyle={styles.messagesList}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputWrapper}
      >
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <MaterialIcons name="send" size={24} color={newMessage.trim() ? "#fff" : "#A0AEC0"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  messagesList: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    maxWidth: '80%',
    borderRadius: 15,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4ecdc4',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 5,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#2c3e50',
  },
  messageTime: {
    fontSize: 12,
    color: '#94a3b8',
    alignSelf: 'flex-end',
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4ecdc4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E2E8F0',
  }
});

export default ChatRoom; 