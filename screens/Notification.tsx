import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const NotificationPage = () => {
  const router = useRouter();
  const notifications = [
    {
      id: 1,
      type: 'match',
      title: 'Potential Match Found',
      message: 'We found a match for your lost laptop. Check it out!',
      time: '2 hours ago',
      icon: 'search',
      color: '#4ecdc4',
      unread: true,
    },
    {
      id: 2,
      type: 'update',
      title: 'Status Update',
      message: 'Someone responded to your lost item report.',
      time: '5 hours ago',
      icon: 'notifications-active',
      color: '#ff6b6b',
      unread: true,
    },
    {
      id: 3,
      type: 'info',
      title: 'Tips & Tricks',
      message: 'Learn how to increase your chances of finding lost items.',
      time: '1 day ago',
      icon: 'lightbulb',
      color: '#ffd93d',
      unread: false,
    },
    {
      id: 4,
      type: 'success',
      title: 'Item Returned',
      message: 'Congratulations! Your lost wallet has been found.',
      time: '2 days ago',
      icon: 'check-circle',
      color: '#6c5ce7',
      unread: false,
    },
  ];

  const renderNotification = (notification: any) => (
    <TouchableOpacity 
      key={notification.id}
      style={[
        styles.notificationCard,
        notification.unread && styles.unreadCard
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: notification.color }]}>
        <MaterialIcons name={notification.icon} size={24} color="#fff" />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationTime}>{notification.time}</Text>
        </View>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
      </View>
      {notification.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={['#0f172a', '#1e293b']}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Activity Feed</Text>
            <Text style={styles.headerSubtitle}>
              Stay updated with your lost and found items
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {notifications.map(renderNotification)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    flex: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 4,
    borderLeftColor: '#4ecdc4',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ecdc4',
    marginLeft: 10,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
});

export default NotificationPage; 