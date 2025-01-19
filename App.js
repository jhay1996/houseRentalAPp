import React, { useState, useEffect } from 'react';
import { View, Text,Button, TouchableOpacity, ActivityIndicator, ScrollView, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system'; 

import {

  TextInput,

} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';  // Stack Navigator
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// First Page Screen
function FirstPageScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Welcome to the first page!</Text>
    </View>
  );
}

// Login Screen
const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://gabaydentanlclinic.online/backend/tenantlogin.php', {
        username: username,
        password: password,
      });
  
      if (response.data.success) {
        const tenantName = response.data.full_name; // Full name returned from the API
        const user_id = response.data.user_id;
  
        if (tenantName) {
          await AsyncStorage.setItem('user_id', user_id.toString());
          await AsyncStorage.setItem('tenantName', tenantName); // Store full_name in AsyncStorage
        }
  
        // Navigate to the RequestScreen and pass the tenantName and user_id
        navigation.replace('MiguelRental', { tenantName, user_id });
      } else {
        setErrorMessage('Incorrect username or password');
      }
    } catch (error) {
      console.error('Login failed', error);
      setErrorMessage('Something went wrong. Please try again later.');
    }
  };
  
  

  return (
    <View style={styles.screen}>
      <View style={styles.imageContainer}>
        <Image source={require('./assets/login.jpg')} style={styles.image} />
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.heading}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Home Screen
const HomeScreen = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');

  const fetchHouses = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('https://gabaydentanlclinic.online/backend/get_houses.php', {
        params: { searchQuery, category },
      });

      console.log(response.data);  // Log the response to inspect image_url

      if (Array.isArray(response.data)) {
        setHouses(response.data);
      } else {
        setError('Failed to load houses: Invalid data format');
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch houses when either searchQuery or category changes
  useEffect(() => {
    fetchHouses();
  }, [searchQuery, category]);

  return (
    <View style={styles.screen}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by keyword"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}  // Update search query on text change
        />
        <TouchableOpacity onPress={fetchHouses}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      
      {/* Display Error */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Display Houses */}
      <ScrollView style={styles.scrollView}>
        {houses.length === 0 && !loading ? (
          <Text style={styles.noDataText}>No houses available</Text>
        ) : (
          houses.map((house) => {
            console.log(house); // Debugging to check the house data
            return (
              <View key={house.id} style={styles.houseCard}>
                {/* Check if the image_url is valid and display it */}
                {house.image_url ? (
                  <Image
                    source={{ uri: house.image_url }}  // Using the correct URL
                    style={styles.houseImage}
                  />
                ) : (
                  <Text>No image available</Text>
                )}

                <Text style={styles.categoryText}>Category: {house.category}</Text>
                <Text style={styles.houseTitle}>House No: {house.house_no}</Text>
                <Text style={styles.housePrice}>Price: ₱{house.price}</Text>
                <Text style={styles.houseDescription}>{house.description}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

// Home Screen

// About Screen
function AboutScreen() {
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    // Retrieve the full name from AsyncStorage
    const fetchFullName = async () => {
      try {
        const name = await AsyncStorage.getItem('tenantName');
        if (name) {
          setFullName(name);
        }
      } catch (error) {
        console.error('Failed to fetch full name:', error);
      }
    };

    fetchFullName();
  }, []);

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.imageContainer}>
        <Image
          source={require('./assets/login.jpg')}
          style={styles.image}
        />
      </View>

      <View style={styles.descriptionContainer}>
        {/* Use a <Text> component for all text */}
        <Text style={styles.title}>Welcome,</Text>
        <Text style={styles.title}>{fullName}!</Text> 
        <Text style={styles.title}>Our Mission</Text>
        <Text style={styles.description}>
          We are dedicated to providing top-notch services and innovative solutions.
        </Text>
      </View>

      <View style={styles.contactContainer}>
        <Text style={styles.contactTitle}>Contact Us</Text>
        <Text style={styles.contactText}>Email: MiguelRental@gmail.com</Text>
        <Text style={styles.contactText}>Phone: 09123 456 789</Text>
      </View>
    </ScrollView>
  );
}

// Settings Screen
const PaymentScreen = ({ route }) => {
  const { tenantName, user_id } = route.params || {};  // Fallback if route.params is undefined
  const [name, setName] = useState(tenantName || '');  // Set tenantName if available
  const [room, setRoom] = useState('');
  const [gcashImage, setGcashImage] = useState(null);
  const [amount, setAmount] = useState('');
  const [referenceNum, setReferenceNum] = useState('');
  const [message, setMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null); // State to hold payment details

  useEffect(() => {
    if (!tenantName) {
      const fetchFullName = async () => {
        try {
          const nameFromStorage = await AsyncStorage.getItem('tenantName');
          if (nameFromStorage) {
            setName(nameFromStorage);
          }
        } catch (error) {
          console.error('Failed to fetch full name:', error);
        }
      };
      fetchFullName();
    }
  }, [tenantName]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setGcashImage(result.assets[0].uri);
      }
    } catch (error) {
      setMessage('Error selecting image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !room.trim() || !gcashImage || !amount.trim() || !referenceNum.trim()) {
      setMessage('Please fill out all fields and upload an image.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('room', room);
    formData.append('amount', amount);
    formData.append('referencenum', referenceNum);  // Ensure the field name matches with PHP
    formData.append('gcash_image', {
      uri: gcashImage,
      type: 'image/jpeg',
      name: 'gcash_image.jpg',
    });

    try {
      const response = await axios.post('https://gabaydentanlclinic.online/backend/payment.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Response:', response.data);  // Log the full response for debugging

      setMessage(response.data.success || response.data.error || 'Unknown response from server.');

      if (response.data.success) {
        setPaymentDetails({
          name,
          room,
          amount,
          referenceNum,
          gcashImage: response.data.gcash_image || gcashImage,
        });

        // Show success alert
        Alert.alert(
          'Payment Submitted Successfully',
          'Your payment details have been submitted successfully.',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('Submission error:', error);
      setMessage('An error occurred while submitting. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Add Payment</Text>

      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 18, marginBottom: 5 }}>Tenant Name:</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{name}</Text>
      </View>

      <TextInput
        style={{ height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 }}
        placeholder="Room Number"
        value={room}
        onChangeText={setRoom}
      />

      <TextInput
        style={{ height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 }}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <TextInput
        style={{ height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 }}
        placeholder="Reference Number"
        value={referenceNum}
        onChangeText={setReferenceNum}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={{ padding: 10, borderColor: '#ccc', borderWidth: 1, marginBottom: 20 }}
        onPress={pickImage}
      >
        {gcashImage ? (
          <Image source={{ uri: gcashImage }} style={{ width: 100, height: 100 }} />
        ) : (
          <Text>Upload GCASH Image</Text>
        )}
      </TouchableOpacity>

      <Button title="Submit Payment" onPress={handleSubmit} />

      {message ? <Text style={{ marginTop: 20, color: 'red' }}>{message}</Text> : null}

      {paymentDetails && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Payment Details</Text>
          <Text>Name: {paymentDetails.name}</Text>
          <Text>Room: {paymentDetails.room}</Text>
          <Text>Amount: {paymentDetails.amount}</Text>
          <Text>Reference Number: {paymentDetails.referenceNum}</Text>
          {paymentDetails.gcashImage && (
            <Image source={{ uri: paymentDetails.gcashImage }} style={{ width: 100, height: 100, marginTop: 10 }} />
          )}
        </View>
      )}
    </ScrollView>
  );
};



// Profile Screen
const RequestScreen = ({ route }) => {
  const { tenantName, user_id } = route.params || {};  // Fallback if route.params is undefined
  const [roomNumber, setRoomNumber] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [requests, setRequests] = useState([]);
  const [fullName, setFullName] = useState(tenantName || ''); // Set tenantName if available

  useEffect(() => {
    if (!tenantName) {
      // If tenantName is not available in route params, fetch from AsyncStorage
      const fetchFullName = async () => {
        try {
          const name = await AsyncStorage.getItem('tenantName');
          if (name) {
            setFullName(name);
          }
        } catch (error) {
          console.error('Failed to fetch full name:', error);
        }
      };
      fetchFullName();
    }
  }, [tenantName]);

  const handleSubmit = async () => {
    const newRequest = {
      tenantName: fullName,  // Use fullName here
      roomNumber,
      requestDescription,
    };

    try {
      const response = await axios.post('https://gabaydentanlclinic.online/backend/api.php', {
        name: fullName,  // Send fullName in the request
        room: roomNumber,
        request: requestDescription,
      });

      if (response.data.success) {
        setRequests([newRequest, ...requests]);
        setRoomNumber('');
        setRequestDescription('');
        Alert.alert('Request submitted successfully!');
      } else {
        Alert.alert('Failed to submit request. Try again later.');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert('Failed to submit request. Please try again later.');
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Submit a Request</Text>

      {/* Display Tenant Name */}
      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 18, marginBottom: 5 }}>Tenant Name:</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{fullName}</Text>
      </View>

      {/* Room Number Input */}
      <TextInput
        style={{ height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 15, paddingLeft: 10 }}
        placeholder="Enter Room Number"
        value={roomNumber}
        onChangeText={setRoomNumber}
        keyboardType="numeric"
      />

      {/* Request Description Input */}
      <TextInput
        style={{
          height: 80,
          borderColor: '#ccc',
          borderWidth: 1,
          marginBottom: 15,
          paddingLeft: 10,
          textAlignVertical: 'top',
        }}
        placeholder="Describe your request..."
        value={requestDescription}
        onChangeText={setRequestDescription}
        multiline
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={{ backgroundColor: '#007bff', padding: 10, alignItems: 'center', borderRadius: 5 }}
        onPress={handleSubmit}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Submit Request</Text>
      </TouchableOpacity>

      {/* Notifications Section */}
      <View style={{ marginTop: 20 }}>
        {requests.map((request, index) => (
          <View key={index} style={{ marginBottom: 15, padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 5 }}>
            <Text style={{ fontWeight: 'bold' }}>{`Request from ${request.tenantName}`}</Text>
            <Text>{`Room ${request.roomNumber}: "${request.requestDescription}"`}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};




const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);

  // Fetch all notifications when the component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('https://gabaydentanlclinic.online/backend/getPaymentNotifications.php');
        if (response.data.success) {
          setNotifications(response.data.notifications);
        } else {
          Alert.alert('Error', response.data.message || 'No notifications found');
        }
      } catch (error) {
        console.error('Error fetching notifications', error);
        Alert.alert('Error', 'Failed to fetch notifications');
      }
    };

    fetchNotifications();
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>All Notifications</Text>
      <ScrollView style={styles.notificationContainer}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <View key={notification.id} style={styles.notification}>
              <Text style={styles.notificationTitle}>Notification</Text>
              <Text style={styles.notificationBody}>
                {notification.message}
              </Text>
              <Text style={styles.notificationDate}>
                {new Date(notification.notification_date).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text>No notifications available</Text>
        )}
      </ScrollView>
    </View>
  );
};

function LogoutScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.replace('Login') },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}



// Stack Navigator for login and First Page
const Stack = createStackNavigator();

// Tab Navigator for Home and About
const Tab = createBottomTabNavigator();

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Stack for login and First Page */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MiguelRental" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Tab Navigator Component (Home and About)
function TabNavigator() {
  const navigation = useNavigation();
  const handleLogout = () => {
    navigation.replace('Login');
  };
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'About') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'payment') {
           iconName = focused ? 'card' : 'card-outline'
          } else if (route.name === 'request') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          }   else if (route.name === 'Logout') {
            iconName = focused ? 'log-out' : 'log-out-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
       <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
      <Tab.Screen name="request" component={RequestScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
      <Tab.Screen name="payment" component={PaymentScreen} />
      <Tab.Screen name="Logout" component={LogoutScreen} />
    </Tab.Navigator>
  );
}

// Styles
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  heading: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#7e57c2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  categorySection: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  categoryButton: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#bbb',
    borderRadius: 5,
  },
  categoryButtonActive: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#7e57c2',
    borderRadius: 5,
  },
  categoryButtonText: {
    fontSize: 23,
    color: '#333',
  },
  categoryButtonTextActive: {
    fontSize: 16,
    color: '#fff',
  },
  scrollView: {
    marginTop: 10,
  },
  imageSection: {
    marginBottom: 10,
    alignItems: 'center',
  },
  image: {
    width: 400,
    height: 300,
    borderRadius: 10,
  },
  imageTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  descriptionContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  contactContainer: {
    padding: 20,
    backgroundColor: '#eee',
    marginTop: 20,
    borderRadius: 5,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  notificationContainer: {
    marginTop: 10,
  },
  notification: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationBody: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  
  monthContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  monthName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  imagePreview: {
    marginTop: 10,
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  scrollView: {
    marginTop: 20,
  },
  houseSection: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  houseNo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: 'green',
  },
  description: {
    fontSize: 12,
    color: '#555',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#aaa',
  },
  houseImage: {
    width: 10,
    height: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 5,
  },
  houseCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginHorizontal: 10,
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  houseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  housePrice: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  houseDescription: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
  },
  scrollView: {
    paddingBottom: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 20,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#f7f7f7',
  },
  imagePickerText: {
    color: '#888',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  message: {
    marginTop: 15,
    textAlign: 'center',
    color: 'red',
  },
  houseImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 10,
  },
  houseCard: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  houseImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#555',
  },
  houseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  housePrice: {
    fontSize: 16,
    color: '#28a745',
  },
  houseDescription: {
    fontSize: 14,
    color: '#777',
  },
  noDataText: {
    textAlign: 'center',
    color: '#888',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    marginBottom: 20,
  },
});
