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
// import * as ImagePicker from 'expo-image-picker'; // For photo upload
// import MapView, { Marker } from 'react-native-maps'; // For location integration

const LostItemPage = () => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Request camera roll permissions on component mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        // const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission denied',
            'Sorry, we need camera roll permissions to upload photos.'
          );
        }
      }
    })();
  }, []);

  // Handle photo upload
  // const handlePhotoUpload = async () => {
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //   });

  //   if (!result.canceled) {
  //     setPhotos([...photos, result.assets[0].uri]);
  //   }
  // };

  // Handle form submission
  const handleSubmit = () => {
    if (
      !itemName ||
      !category ||
      !description ||
      !date ||
      !contactDetails ||
      photos.length === 0
    ) {
      Alert.alert('Error', 'Please fill all fields and upload at least one photo.');
      return;
    }
    Alert.alert('Success', 'Lost item posted successfully!');
    // Reset form
    setItemName('');
    setCategory('');
    setDescription('');
    setDate('');
    setContactDetails('');
    setPhotos([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Report a Lost Item</Text>

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

      {/* Date */}
      <TextInput
        style={styles.input}
        placeholder="Date Lost (e.g., 2023-10-15)"
        value={date}
        onChangeText={setDate}
      />

      {/* Contact Details */}
      <TextInput
        style={styles.input}
        placeholder="Contact Details"
        value={contactDetails}
        onChangeText={setContactDetails}
      />

      {/* Photo Upload
      <TouchableOpacity style={styles.uploadButton} onPress={handlePhotoUpload}>
        <Text style={styles.uploadButtonText}>Upload Photos</Text>
      </TouchableOpacity>
      <View style={styles.photosContainer}>
        {photos.map((photo, index) => (
          <Image key={index} source={{ uri: photo }} style={styles.photo} />
        ))}
      </View> */}

      {/* Location */}
      {/* <Text style={styles.sectionTitle}>Location Lost</Text>
      <MapView
        style={styles.map}
        initialRegion={location}
        onPress={(e) => setLocation(e.nativeEvent.coordinate)}
      >
        <Marker coordinate={location} />
      </MapView> */}

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
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
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

export default LostItemPage;