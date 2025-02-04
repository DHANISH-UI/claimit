import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // For icons

const SignInSignUpPage = ({ /* navigation */}) => {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Sign In and Sign Up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignIn = () => {
    // Add your sign-in logic here
    console.log('Sign In:', email, password);
  };

  const handleSignUp = () => {
    // Add your sign-up logic here
    console.log('Sign Up:', email, password, confirmPassword);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo */}
      <Image source={require('../assets/images/logo copy.png')} style={styles.logo} />

      {/* Title */}
      <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={24} color="#4a4a4a" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={24} color="#4a4a4a" />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {/* Confirm Password Input (for Sign Up) */}
      {isSignUp && (
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={24} color="#4a4a4a" />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
      )}

      {/* Forgot Password */}
      {/*!isSignUp && (
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      )*/}

      {/* Sign In/Sign Up Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={isSignUp ? handleSignUp : handleSignIn}
      >
        <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
      </TouchableOpacity>

      {/* Toggle between Sign In and Sign Up */}
      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.toggleText}>
          {isSignUp
            ? 'Already have an account? Sign In'
            : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>

      {/* Social Media Login */}
      <View style={styles.socialLoginContainer}>
        <Text style={styles.socialLoginText}>Or sign in with</Text>
        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require('../assets/images/google.png')} // Add your Google icon
              style={styles.socialIcon1}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require('../assets/images/facebook.png')} // Add your Facebook icon
              style={styles.socialIcon2}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // Light gray background
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logo: {
    width: 100,
    height: 30,
    borderRadius: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  button: {
    width: '100%',
    backgroundColor: '#ff6b6b', // Red color from home screen
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  toggleText: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 20,
  },
  socialLoginContainer: {
    alignItems: 'center',
  },
  socialLoginText: {
    fontSize: 15,
    color: '#4a4a4a',
    marginBottom: 10,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    marginHorizontal: 10,
  },
  socialIcon1: {
    marginTop: 4,
    width: 35,
    height: 35,
  },
  socialIcon2: {

    width: 40,
    height: 40,
  },
});

export default SignInSignUpPage;