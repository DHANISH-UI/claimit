import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatSupportPage: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Chat Support Page</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatSupportPage; 