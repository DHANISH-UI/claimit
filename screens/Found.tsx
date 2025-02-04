import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // For icons
import { launchImageLibrary } from 'react-native-image-picker'; // For photo upload

const FoundItemForm = () => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [locationFound, setLocationFound] = useState('');
  const [dateFound, setDateFound] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [photo, setPhoto] = useState(null);

  // Handle photo upload
  const handlePhotoUpload = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (
      !itemName ||
      !category ||
      !description ||
      !locationFound ||
      !dateFound ||
      !contactDetails ||
      !photo
    ) {
      Alert.alert('Error', 'Please fill all fields and upload a photo.');
      return;
    }
    Alert.alert('Success', 'Found item reported successfully!');
    // Reset form
    setItemName('');
    setCategory('');
    setDescription('');
    setLocationFound('');
    setDateFound('');
    setContactDetails('');
    setPhoto(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Report a Found Item</Text>

      {/* Item Name */}
      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={itemName}
        onChangeText={setItemName}
      />

      {/* Category */}
      <TextInput
        style={styles.input}
        placeholder="Category (e.g., Wallet, Phone)"
        value={category}
        onChangeText={setCategory}
      />

      {/* Description */}
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Location Found */}
      <TextInput
        style={styles.input}
        placeholder="Location Found"
        value={locationFound}
        onChangeText={setLocationFound}
      />

      {/* Date Found */}
      <TextInput
        style={styles.input}
        placeholder="Date Found (e.g., 2023-10-15)"
        value={dateFound}
        onChangeText={setDateFound}
      />

      {/* Contact Details */}
      <TextInput
        style={styles.input}
        placeholder="Contact Details"
        value={contactDetails}
        onChangeText={setContactDetails}
      />

      {/* Photo Upload */}
      <TouchableOpacity style={styles.uploadButton} onPress={handlePhotoUpload}>
        <Text style={styles.uploadButtonText}>Upload Photo</Text>
      </TouchableOpacity>
      {photo && <Image source={{ uri: photo }} style={styles.photo} />}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: '#4ecdc4',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FoundItemForm;