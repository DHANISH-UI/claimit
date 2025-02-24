import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, Platform, Modal, Keyboard, KeyboardAvoidingView
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
  Lost: undefined;
  Found: undefined;
  SignInSignUp: undefined;
};

type LostScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Lost'
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

type LostItem = {
  id: string;
  created_at: string;
  user_id: string;
  item_name: string;
  category: string;
  description: string;
  date_lost: string;
  contact_details: string;
  photos: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'active' | 'found' | 'closed';
  updated_at: string;
};

const bucketName = 'items-photos';

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

const LostItemPage: React.FC = () => {
  const navigation = useNavigation<LostScreenNavigationProp>();
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

      // Get file info and type
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileType = blob.type;
      console.log('File type:', fileType);

      // Get file extension
      const fileExt = fileType.split('/')[1] || 'jpg';
      console.log('File extension:', fileExt);

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileName = `lost/${session.user.id}/${timestamp}_${randomString}.${fileExt}`;
      console.log('Generated filename:', fileName);

      // Convert to Uint8Array for upload
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      console.log('Starting upload to Supabase storage...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('lost-items-photos')
        .upload(fileName, uint8Array, {
          contentType: fileType,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lost-items-photos')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);
      return publicUrl;

    } catch (error: any) {
      console.error('Upload error details:', error);
      throw new Error(error?.message || 'Failed to upload image');
    }
  };

  const handlePhotoUpload = async () => {
    try {
      console.log('Starting photo selection process...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      console.log('Image picker result:', {
        cancelled: result.canceled,
        assets: result.assets ? result.assets.length : 0
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        console.log('Selected image details:', {
          uri: selectedAsset.uri,
          type: selectedAsset.type,
          width: selectedAsset.width,
          height: selectedAsset.height,
          fileSize: selectedAsset.fileSize,
        });
        
        setPhotos([...photos, selectedAsset.uri]);
        console.log('Updated photos array length:', photos.length + 1);
      } else {
        console.log('No image selected or picker cancelled');
      }
    } catch (error) {
      console.error('Photo selection error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', 'Failed to select photo. Please try again.');
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

  const handleSearchLocation = useCallback(async () => {
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
        setSelectedLocation({ latitude, longitude });
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
  }, [searchQuery]);

  const handleCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions to use this feature.');
        return;
      }

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
      setSelectedLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });
      setLocationModalVisible(false);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newLocation, 1000);
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get current location. Please check your location settings.');
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

  const handleSubmit = async () => {
    console.log('Starting form submission process...');
    console.log('Validating form fields...');
    
    // Validate all required fields
    if (!itemName || !category || !description || !date || !contactDetails || photos.length === 0 || !selectedLocation) {
      console.log('Form validation failed:', {
        hasItemName: !!itemName,
        hasCategory: !!category,
        hasDescription: !!description,
        hasDate: !!date,
        hasContactDetails: !!contactDetails,
        photoCount: photos.length,
        hasLocation: !!selectedLocation
      });
      Alert.alert('Error', 'Please fill all fields, upload a photo, and select a location.');
      return;
    }

    console.log('Form validation passed');

    try {
      setLoading(true);
      console.log('Checking authentication status...');

      // Check authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication check failed: ' + sessionError.message);
      }
      if (!session) {
        console.error('No active session found');
        throw new Error('Please sign in to report a lost item');
      }

      console.log('Authentication successful');
      console.log('User ID:', session.user.id);
      console.log('User email:', session.user.email);

      // Upload photos and get their URLs
      console.log('Starting photo upload process...');
      const photoUrls = [];
      for (const [index, photo] of photos.entries()) {
        try {
          console.log(`Uploading photo ${index + 1}/${photos.length}...`);
          const url = await uploadImage(photo);
          photoUrls.push(url);
          console.log(`Photo ${index + 1} uploaded successfully:`, url);
        } catch (error) {
          console.error(`Error uploading photo ${index + 1}:`, error);
          throw new Error(`Failed to upload photo ${index + 1}. Please try again.`);
        }
      }
      console.log('All photos uploaded successfully');

      // Prepare location data
      console.log('Preparing location data...');
      const locationData = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };
      console.log('Location data:', locationData);

      // Validate and format date
      console.log('Validating and formatting date...');
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
      }
      const formattedDate = dateObj.toISOString().split('T')[0];
      console.log('Formatted date:', formattedDate);

      // Validate category
      if (!categories.includes(category)) {
        throw new Error('Invalid category selected.');
      }

      // Prepare the item data
      const lostItemData: Omit<LostItem, 'id' | 'created_at' | 'updated_at'> = {
        user_id: session.user.id,
        item_name: itemName.trim(),
        category: category.trim(),
        description: description.trim(),
        date_lost: formattedDate,
        contact_details: contactDetails.trim(),
        photos: photoUrls,
        location: locationData,
        status: 'active'
      };

      console.log('Prepared lost item data:', JSON.stringify(lostItemData, null, 2));

      // Insert into Supabase
      try {
        console.log('Attempting to insert data into Supabase...');
        
        // First, check if the table exists and has the correct structure
        const { error: tableCheckError } = await supabase
          .from('lost')
          .select(`
            id,
            created_at,
            user_id,
            item_name,
            category,
            description,
            date_lost,
            contact_details,
            photos,
            location,
            status,
            updated_at
          `)
          .limit(1);

        if (tableCheckError) {
          console.error('Table check error:', tableCheckError);
          if (tableCheckError.code === '42P01') {
            throw new Error('The lost items table does not exist. Please run the table creation SQL first.');
          } else if (tableCheckError.code === '42703') {
            throw new Error('The lost items table structure is incorrect. Please verify the table schema.');
          }
        }

        // Proceed with insert
        const { data, error } = await supabase
          .from('lost')
          .insert([lostItemData])
          .select();

        console.log('Supabase response:', { data, error });

        if (error) {
          console.error('Supabase error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });

          // Handle specific error cases
          switch (error.code) {
            case '42P01':
              throw new Error('Lost items table not found. Please create the table first.');
            case '23505':
              throw new Error('This item has already been reported.');
            case '23503':
              throw new Error('User account not found. Please sign in again.');
            case '42703':
              throw new Error('Database schema mismatch. Please check the table structure.');
            default:
              throw new Error(error.message || 'Failed to save item details. Please try again.');
          }
        }

        if (!data || data.length === 0) {
          console.error('No data returned from insert operation');
          throw new Error('Failed to save item details: No data returned');
        }

        console.log('Lost item saved successfully:', JSON.stringify(data, null, 2));

        Alert.alert(
          'Success', 
          'Lost item posted successfully!',
          [{ text: 'OK', onPress: () => {
            console.log('Navigating back...');
            router.back();
          }}]
        );

        // Reset form
        console.log('Resetting form...');
        setItemName('');
        setCategory('');
        setDescription('');
        setDate('');
        setContactDetails('');
        setPhotos([]);
        setSelectedLocation(null);
        setLocation(null);
        console.log('Form reset complete');

      } catch (dbError: any) {
        console.error('Database operation error:', dbError);
        console.error('Error stack:', dbError?.stack);
        console.error('Error details:', {
          name: dbError?.name,
          code: dbError?.code,
          message: dbError?.message
        });
        throw new Error(`Database error: ${dbError?.message || 'Unknown database error'}`);
      }

    } catch (error) {
      console.error('Submission error:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit lost item. Please try again.';
      console.error('Final error message:', errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      console.log('Submission process completed');
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Report a Lost Item</Text>
        <Text style={styles.subtitle}>Help us locate your missing belongings</Text>
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
            placeholder="Date Lost (YYYY-MM-DD)" 
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
            Lost a valuable item? File a police report for additional security and documentation.
          </Text>
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={() => Alert.alert(
              'Contact Authorities',
              'Would you like to file a police report for this lost item?',
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
                <Text style={styles.reportButtonText}>File Police Report</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

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

      <LocationModal 
        visible={locationModalVisible}
        onClose={handleCloseModal}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearch={handleSearchLocation}
        onCurrentLocation={handleCurrentLocation}
      />
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
    borderBottomLeftRadius: 30,
    //borderBottomRightRadius: 30,
    borderTopRightRadius: 30,
    //borderTopLeftRadius: 30,
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
  map: { 
    width: '100%', 
    height: 200,
    marginVertical: 10,
    borderRadius: 8 
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
  elevatedInput: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
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

export default LostItemPage;
