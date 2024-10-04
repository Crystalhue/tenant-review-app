import React, {useState} from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'; // Fetch user role from Firestore
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { db, auth } from '../config';
import styles from '../styles';

const Login = () => {
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Function to check if tenant profile exists
  const checkTenantProfileExists = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const tenantEmail = user.email.toLowerCase();
        const tenantQuery = query(
          collection(db, 'tenants'),
          where('tenantEmail', '==', tenantEmail)
        );
        const querySnapshot = await getDocs(tenantQuery);
        return !querySnapshot.empty;
      }
      return false;
    } catch (error) {
      console.error('Error checking tenant profile existence:', error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
  
    setLoading(true);
    try {
      // Attempt to sign in using Firebase authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
  
      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
  
      if (userData.role === 'Landlord') {
        navigation.navigate('HomePage'); // Navigate to Landlord dashboard
      } else if (userData.role === 'Tenant') {
        // Check if tenant profile exists
        const profileExists = await checkTenantProfileExists();
        if (profileExists) {
          navigation.navigate('TenantHomePage');
        } else {
          navigation.navigate('NoProfileScreen'); // Inform tenant
        }
      }
    } catch (error) {

      // Log the error code to debug
      console.error('Firebase Login Error Code:', error.code);
      // Custom error messages based on Firebase error codes
      //invalid credentials email changed to no acc found with email 
      switch (error.code) {
        case 'auth/invalid-credential':
          Alert.alert('Error', 'No account found with this email. Please sign up first.');
          break;
        case 'auth/user-not-found':
          Alert.alert('Error', 'No account found with this email. Please sign up first.');
          break;
        case 'auth/wrong-password':
          Alert.alert('Error', 'Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          Alert.alert('Error', 'Invalid email format.');
          break;
        case 'auth/network-request-failed':
          Alert.alert('Error', 'Network error. Please check your connection.');
          break;
        default:
          Alert.alert('Error', `An unknown error occurred: ${error.message}`);
          break;
      }
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={passwordVisible}
        />
        <TouchableOpacity
          onPress={() => setPasswordVisible(!passwordVisible)}
        >
          <MaterialCommunityIcons
            name={passwordVisible ? 'eye-off' : 'eye'}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={confirmPasswordVisible}
        />
        <TouchableOpacity
          onPress={() =>
            setConfirmPasswordVisible(!confirmPasswordVisible)
          }
        >
          <MaterialCommunityIcons
            name={confirmPasswordVisible ? 'eye-off' : 'eye'}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={{ color: 'white' }}>Log in</Text>
        )}
      </TouchableOpacity>
      
       {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('LandingPage', { showRoleButtons: true })}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
    </View>
  );
};

export default Login;