import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { launchImageLibrary } from 'react-native-image-picker';

const FoundItemForm = () => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [locationFound, setLocationFound] = useState('');
  const [dateFound, setDateFound] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [photos, setPhotos] = useState([]);

  const handlePhotoUpload = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 5 });
    if (result.assets) {
      setPhotos([...photos, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleSubmit = () => {
    if (!itemName || !category || !description || !locationFound || !dateFound || !contactDetails || photos.length === 0) {
      Alert.alert('Error', 'Please fill all fields and upload at least one photo.');
      return;
    }
    Alert.alert('Success', 'Found item reported successfully!');
    setItemName('');
    setCategory('');
    setDescription('');
    setLocationFound('');
    setDateFound('');
    setContactDetails('');
    setPhotos([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Report a Found Item</Text>
      <TextInput style={styles.input} placeholder="Item Name" value={itemName} onChangeText={setItemName} />
      <TextInput style={styles.input} placeholder="Category (e.g., Wallet, Phone)" value={category} onChangeText={setCategory} />
      <TextInput style={[styles.input, styles.multilineInput]} placeholder="Description" value={description} onChangeText={setDescription} multiline />
      <TextInput style={styles.input} placeholder="Location Found" value={locationFound} onChangeText={setLocationFound} />
      <TextInput style={styles.input} placeholder="Date Found (YYYY-MM-DD)" value={dateFound} onChangeText={setDateFound} />
      <TextInput style={styles.input} placeholder="Contact Details" value={contactDetails} onChangeText={setContactDetails} />

      <TouchableOpacity style={styles.uploadButton} onPress={handlePhotoUpload}>
        <Text style={styles.uploadButtonText}>Upload Photo</Text>
      </TouchableOpacity>
      <View style={styles.photoContainer}>
        {photos.map((uri, index) => (
          <View key={index} style={styles.photoWrapper}>
            <Image source={{ uri }} style={styles.photo} />
            <TouchableOpacity style={styles.removeButton} onPress={() => removePhoto(index)}>
              <MaterialIcons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      
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
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FoundItemForm;
