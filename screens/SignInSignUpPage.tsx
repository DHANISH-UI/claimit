import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Dimensions,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // For icons
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

const SignInSignUpPage: React.FC = () => {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Sign In and Sign Up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSignIn = async () => {
    console.log('Starting sign in process...');
    console.log('Email:', email);
    console.log('Password length:', password.length);

    if (!email || !password) {
      console.log('Sign in validation failed: Missing fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      console.log('Setting loading state...');
      setLoading(true);

      console.log('Attempting to sign in with Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase response received');
      console.log('Data:', JSON.stringify(data, null, 2));
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data.user) {
        console.log('Sign in successful. User:', data.user.id);
        console.log('Session:', data.session?.access_token ? 'Present' : 'Missing');
        router.replace('/');
      } else {
        console.log('No user data received');
        Alert.alert('Error', 'No user data received');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', error.message || 'An error occurred during sign in');
    } finally {
      console.log('Sign in process completed');
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    console.log('Starting sign up process...');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Confirm password length:', confirmPassword.length);

    if (!email || !password || !confirmPassword) {
      console.log('Sign up validation failed: Missing fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      console.log('Sign up validation failed: Passwords do not match');
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      console.log('Setting loading state...');
      setLoading(true);

      console.log('Attempting to sign up with Supabase...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('Supabase response received');
      console.log('Data:', JSON.stringify(data, null, 2));
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data.user) {
        console.log('Sign up successful. User:', data.user.id);
        console.log('Email confirmation status:', data.user.confirmed_at ? 'Confirmed' : 'Pending');
        Alert.alert(
          'Success', 
          'Registration successful! Please check your email for verification.',
          [{ text: 'OK', onPress: () => setIsSignUp(false) }]
        );
      } else {
        console.log('No user data received');
        Alert.alert('Error', 'No user data received');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', error.message || 'An error occurred during sign up');
    } finally {
      console.log('Sign up process completed');
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerSection, { paddingTop: insets.top }]}
      >
        <Image 
          source={require('../assets/images/logo copy.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </LinearGradient>

      <View style={styles.formSection}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtitleText}>
            {isSignUp 
              ? 'Please fill in the form to continue' 
              : 'Please sign in to continue'}
          </Text>
        </View>

        <View style={styles.inputsContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {isSignUp && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>
          )}
        </View>

        {!isSignUp && (
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={isSignUp ? handleSignUp : handleSignIn}
          disabled={loading}
        >
          <LinearGradient
            colors={['#ff6b6b', '#ff8787']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Text style={styles.submitButtonText}>
              {loading 
                ? 'Loading...' 
                : isSignUp 
                  ? 'Create Account' 
                  : 'Sign In'
              }
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require('../assets/images/google.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require('../assets/images/facebook.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.toggleContainer}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={styles.toggleText}>
            {isSignUp 
              ? 'Already have an account? ' 
              : "Don't have an account? "}
            <Text style={styles.toggleTextBold}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSection: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
    padding: 5,
  },
  formSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  welcomeContainer: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#64748b',
  },
  inputsContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#ff6b6b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(255, 107, 107, 0.2)',
      },
    }),
  },
  gradient: {
    paddingVertical: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#64748b',
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  toggleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  toggleText: {
    fontSize: 14,
    color: '#64748b',
  },
  toggleTextBold: {
    color: '#ff6b6b',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default SignInSignUpPage;