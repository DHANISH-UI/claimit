import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const FoundItemPage = () => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const categories = ['Electronics', 'Gadgets', 'Clothing', 'Documents', 'Wallet', 'Keys', 'Other'];

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

        if (mediaStatus !== 'granted' || cameraStatus !== 'granted' || locationStatus !== 'granted') {
          Alert.alert('Permission Required', 'Enable camera, gallery, and location permissions.');
        }
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    })();
  }, []);

  const handlePhotoUpload = () => {
    Alert.alert(
      "Upload Photo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: capturePhoto },
        { text: "Choose from Gallery", onPress: pickFromGallery },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const capturePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera access is required.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const pickFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleMapPress = (event) => {
    setSelectedLocation(event.nativeEvent.coordinate);
  };

  const handleSubmit = () => {
    if (!itemName || !category || !description || !date || !contactDetails || photos.length === 0 || !selectedLocation) {
      Alert.alert('Error', 'Please fill all fields, upload a photo, and select a location.');
      return;
    }
    Alert.alert('Success', 'Found item posted successfully!');
    setItemName('');
    setCategory('');
    setDescription('');
    setDate('');
    setContactDetails('');
    setPhotos([]);
    setSelectedLocation(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Report a Found Item</Text>

      {/* Category Dropdown */}
      <View style={styles.pickerContainer}>
        <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
          <Picker.Item label="Select a Category" value="" />
          {categories.map((cat, index) => <Picker.Item key={index} label={cat} value={cat} />)}
        </Picker>
      </View>

      {/* Item Name */}
      <TextInput style={styles.input} placeholder="Item Name" value={itemName} onChangeText={setItemName} />

      {/* Description */}
      <TextInput style={[styles.input, styles.multilineInput]} placeholder="Description" value={description} onChangeText={setDescription} multiline />

      {/* Date */}
      <TextInput style={styles.input} placeholder="Date Found (YYYY-MM-DD)" value={date} onChangeText={setDate} />

      {/* Contact Details */}
      <TextInput style={styles.input} placeholder="Contact Details" value={contactDetails} onChangeText={setContactDetails} />

      {/* Photo Upload */}
      <TouchableOpacity style={styles.uploadButton} onPress={handlePhotoUpload}>
        <Text style={styles.uploadButtonText}>Upload Photos</Text>
      </TouchableOpacity>

      {/* Display Photos */}
      <View style={styles.photosContainer}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoWrapper}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity style={styles.removeIcon} onPress={() => removePhoto(index)}>
              <Ionicons name="close-circle" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Location Selection */}
      <TouchableOpacity style={styles.locationButton} onPress={() => setSelectedLocation(location)}>
        <Text style={styles.locationButtonText}>Use My Current Location</Text>
      </TouchableOpacity>

      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          {selectedLocation && <Marker coordinate={selectedLocation} title="Selected Location" />}
        </MapView>
      )}

      {selectedLocation && (
        <Text style={styles.locationText}>
          Selected Location: {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
        </Text>
      )}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  pickerContainer: { borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 15 },
  picker: { height: 50, width: '100%' },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 15 },
  multilineInput: { height: 100, textAlignVertical: 'top' },

  // Upload Button
  uploadButton: { backgroundColor: '#4ecdc4', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  uploadButtonText: { color: '#fff', fontWeight: 'bold' },

  // Photos Display
  photosContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  photoWrapper: { position: 'relative', margin: 5 },
  photo: { width: 80, height: 80, borderRadius: 8 },
  removeIcon: { position: 'absolute', top: 0, right: 0 },

  // Map View
  map: { width: '100%', height: 300, marginVertical: 10 },
  locationText: { textAlign: 'center', fontSize: 14, marginVertical: 5, fontWeight: 'bold' },

  // "Use My Current Location" Button
  locationButton: { backgroundColor: '#ff6b6b', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  locationButtonText: { color: '#fff', fontWeight: 'bold' },

  // Submit Button
  submitButton: { backgroundColor: '#1e90ff', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});


export default FoundItemPage;
