import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, Platform, Modal, Keyboard, KeyboardAvoidingView, ActionSheetIOS
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

type RootStackParamList = {
  Home: undefined;
  Found: undefined;
  Lost: undefined;
  SignInSignUp: undefined;
};

type FoundScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Found'
>;

type LocationModalProps = {
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearch: () => void;
  onCurrentLocation: () => void;
};

type Location = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

type ImageInfo = {
  uri: string;
  assets?: Array<{ uri: string }>;
  canceled?: boolean;
};

type PhotoSource = 'camera' | 'library';

const LocationModal: React.FC<LocationModalProps> = ({ 
  visible, 
  onClose, 
  searchQuery, 
  onSearchChange, 
  onSearch, 
  onCurrentLocation 
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.modalContainer}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => Keyboard.dismiss()}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Location Method</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search location"
              value={searchQuery}
              onChangeText={onSearchChange}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={true}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={onSearch}
            >
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.modalButton} 
            onPress={onCurrentLocation}
          >
            <Text style={styles.modalButtonText}>Use Current Location</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modalButton, styles.cancelButton]} 
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  </Modal>
);

const FoundItemPage: React.FC = () => {
  const navigation = useNavigation<FoundScreenNavigationProp>();
  const router = useRouter();
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Coordinate | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<MapView | null>(null);

  const categories = ['Electronics', 'Gadgets', 'Clothing', 'Documents', 'Wallet', 'Keys', 'Other'];

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

        if (mediaStatus !== 'granted' || cameraStatus !== 'granted' || locationStatus !== 'granted') {
          Alert.alert('Permission Required', 'Enable camera, gallery, and location permissions.');
          return;
        }
      }
    })();
  }, []);

  const uploadImage = async (uri: string): Promise<string> => {
    try {
      console.log('Starting image upload process...');
      console.log('Image URI:', uri);

      // Get current session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication required for upload');
      }

      // Read the file as base64
      console.log('Converting image to base64...');
      const response = await fetch(uri);
      const blob = await response.blob();
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Failed to convert to base64'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });

      // Get file extension from blob type
      const fileExt = blob.type.split('/')[1] || 'jpg';
      console.log('File extension:', fileExt);

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileName = `found/${session.user.id}/${timestamp}_${randomString}.${fileExt}`;
      console.log('Generated filename:', fileName);

      // Convert base64 to Uint8Array
      console.log('Converting base64 to Uint8Array...');
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Upload to Supabase storage
      console.log('Starting Supabase upload...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('items-photos')
        .upload(fileName, bytes, {
          contentType: blob.type,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('items-photos')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);
      return publicUrl;

    } catch (error: any) {
      console.error('Detailed upload error:', error);
      throw new Error(error?.message || 'Failed to upload image. Please try again.');
    }
  };

  const handlePhotoUpload = async () => {
    try {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Take Photo', 'Choose from Library'],
            cancelButtonIndex: 0,
          },
          async (buttonIndex) => {
            if (buttonIndex === 1) {
              await takePhoto();
            } else if (buttonIndex === 2) {
              await pickFromLibrary();
            }
          }
        );
      } else {
        Alert.alert(
          'Add Photo',
          'Choose a photo source',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Take Photo', onPress: takePhoto },
            { text: 'Choose from Library', onPress: pickFromLibrary },
          ]
        );
      }
    } catch (error) {
      console.error('Photo selection error:', error);
      Alert.alert('Error', 'Failed to handle photo selection. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        console.log('Camera photo taken:', {
          uri: selectedAsset.uri,
          width: selectedAsset.width,
          height: selectedAsset.height,
        });
        
        setPhotos([...photos, selectedAsset.uri]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        console.log('Library photo selected:', {
          uri: selectedAsset.uri,
          width: selectedAsset.width,
          height: selectedAsset.height,
        });
        
        setPhotos([...photos, selectedAsset.uri]);
      }
    } catch (error) {
      console.error('Photo library error:', error);
      Alert.alert('Error', 'Failed to select photo from library. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleMapPress = (event: any) => {
    const coordinate = event.nativeEvent.coordinate as Coordinate;
    setSelectedLocation(coordinate);
    setLocation({
      ...coordinate,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleLocationPress = () => {
    setLocationModalVisible(true);
  };

  const handleSearchLocation = async () => {
    try {
      Keyboard.dismiss();
      
      if (!searchQuery.trim()) {
        Alert.alert('Error', 'Please enter a location to search');
        return;
      }

      const searchResults = await Location.geocodeAsync(searchQuery.trim());

      if (searchResults.length > 0) {
        const { latitude, longitude } = searchResults[0];
        const newLocation = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setLocation(newLocation);
        setSelectedLocation(newLocation);
        setLocationModalVisible(false);
        setSearchQuery('');

        if (mapRef.current) {
          mapRef.current.animateToRegion(newLocation, 1000);
        }
      } else {
        Alert.alert('Error', 'Location not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search location. Please try again.');
    }
  };

  const handleCurrentLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setLocation(newLocation);
      setSelectedLocation(newLocation);
      setLocationModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location. Please check your location settings.');
    }
  };

  const handleSubmit = async () => {
    if (!itemName || !category || !description || !date || !contactDetails || photos.length === 0 || !selectedLocation) {
      Alert.alert('Error', 'Please fill all fields, upload a photo, and select a location.');
      return;
    }

    try {
      setLoading(true);

      // Upload photos and get their URLs
      const photoUrls = [];
      for (const photo of photos) {
        try {
          const url = await uploadImage(photo);
          photoUrls.push(url);
        } catch (error) {
          console.error('Error uploading photo:', error);
          Alert.alert('Upload Error', 'Failed to upload one or more photos. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Prepare location data
      const locationData = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };

      // Format date to ISO string
      const formattedDate = new Date(date).toISOString().split('T')[0];

      // Insert into Supabase
      const { data, error } = await supabase
        .from('found')
        .insert([
          {
            item_name: itemName,
            category,
            description,
            date_found: formattedDate,
            contact_details: contactDetails,
            photos: photoUrls,
            location: locationData,
          }
        ])
        .select();

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to save item details. Please try again.');
      }

      Alert.alert(
        'Success', 
        'Found item posted successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );

      // Reset form
      setItemName('');
      setCategory('');
      setDescription('');
      setDate('');
      setContactDetails('');
      setPhotos([]);
      setSelectedLocation(null);
      setLocation(null);

    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to submit found item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleCloseModal = useCallback(() => {
    setLocationModalVisible(false);
    setSearchQuery('');
    Keyboard.dismiss();
  }, []);

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Report a Found Item</Text>
        <Text style={styles.subtitle}>Help others find their lost belongings</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Item Details</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
              <Picker.Item label="Select a Category" value="" />
              {categories.map((cat, index) => <Picker.Item key={index} label={cat} value={cat} />)}
            </Picker>
          </View>

          <TextInput 
            style={[styles.input, styles.elevatedInput]} 
            placeholder="Item Name" 
            value={itemName} 
            onChangeText={setItemName}
            placeholderTextColor="#666" 
          />

          <TextInput 
            style={[styles.input, styles.multilineInput, styles.elevatedInput]} 
            placeholder="Description" 
            value={description} 
            onChangeText={setDescription} 
            multiline 
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Date & Contact</Text>
          <TextInput 
            style={[styles.input, styles.elevatedInput]} 
            placeholder="Date Found (YYYY-MM-DD)" 
            value={date} 
            onChangeText={setDate}
            placeholderTextColor="#666" 
          />

          <TextInput 
            style={[styles.input, styles.elevatedInput]} 
            placeholder="Contact Details" 
            value={contactDetails} 
            onChangeText={setContactDetails}
            placeholderTextColor="#666" 
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handlePhotoUpload}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload Photos</Text>
          </TouchableOpacity>

          <View style={styles.photosContainer}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoWrapper}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity style={styles.removeIcon} onPress={() => removePhoto(index)}>
                  <Ionicons name="close-circle" size={24} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity style={styles.locationButton} onPress={handleLocationPress}>
            <Ionicons name="location" size={24} color="#fff" />
            <Text style={styles.locationButtonText}>Select Location</Text>
          </TouchableOpacity>

          {location && (
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                region={location}
                onPress={handleMapPress}
              >
                {selectedLocation && <Marker coordinate={selectedLocation} title="Selected Location" />}
              </MapView>
            </View>
          )}
        </View>

        {/* Police Report Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Report to Authorities</Text>
          <Text style={styles.reportDescription}>
            Found a high-value item? Report it to local authorities for proper handling.
          </Text>
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={() => Alert.alert(
              'Contact Authorities',
              'Would you like to contact local law enforcement about this item?',
              [
                {
                  text: 'Call Police',
                  onPress: () => {
                    // This would typically use Linking to make a phone call
                    Alert.alert('Connecting', 'Redirecting to emergency services...');
                  },
                  style: 'default'
                },
                {
                  text: 'Cancel',
                  style: 'cancel'
                }
              ]
            )}
          >
            <LinearGradient
              colors={['#1e40af', '#1e3a8a']}
              style={styles.reportButtonGradient}
            >
              <View style={styles.reportButtonContent}>
                <MaterialIcons name="local-police" size={24} color="#fff" />
                <Text style={styles.reportButtonText}>Contact Law Enforcement</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <LocationModal 
          visible={locationModalVisible}
          onClose={handleCloseModal}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearch={handleSearchLocation}
          onCurrentLocation={handleCurrentLocation}
        />

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f6fa',
  },
  headerContainer: {
    backgroundColor: '#2c3e50',
    padding: 30,
    paddingTop: 30,
   
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#bdc3c7',
    textAlign: 'center',
    marginTop: 5,
  },
  formContainer: {
    padding: 16,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  pickerContainer: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  elevatedInput: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#2c3e50',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  uploadButton: {
    backgroundColor: '#4ecdc4',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  mapContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  map: {
    width: '100%',
    height: 200,
  },
  locationButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2c3e50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '30%',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'absolute',
    top: '30%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#4ecdc4',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: '#4ecdc4',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  reportDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 15,
    lineHeight: 20,
  },
  reportButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  reportButtonGradient: {
    padding: 16,
  },
  reportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FoundItemPage;