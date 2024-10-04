import React , {useState} from 'react';
import { View, Button, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../config'; // Import Firestore from config
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'; // For Firestore database
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../styles';

const SignUp = () => {
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(true);
  const [name, setName] = useState('');
  const [role, setRole] = useState(''); // Role state for Landlord or Tenant
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

  const handleSignUp = async () => {
    if (email && password && name && role) {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        // Use the imported `auth` from config.js
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Save user data to Firestore with role information
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: name,
          email: user.email.toLowerCase(), // Store email in lowercase
          role: role, // Either Landlord or Tenant
        });

        // Redirect based on role
        if (role === 'Landlord') {
          navigation.navigate('HomePage');
        } else if (role === 'Tenant') {
          // Check if tenant profile exists
          const profileExists = await checkTenantProfileExists();
          if (profileExists) {
            navigation.navigate('TenantHomePage');
          } else {
            navigation.navigate('NoProfileScreen'); // Create this screen to inform tenant
          }
        }
      } catch (error) {
        // Check for Firebase error codes and show custom messages
        switch (error.code) {
          case 'auth/email-already-in-use':
            Alert.alert('Error', 'This email address is already in use.');
            break;
          case 'auth/invalid-email':
            Alert.alert('Error', 'The email address is not valid.');
            break;
          case 'auth/weak-password':
            Alert.alert('Error', 'The password is too weak. Please use a stronger password.');
            break;
          default:
            Alert.alert('Error', 'An unknown error occurred. Please try again later.');
            break;
        }
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Error', 'Please fill in all fields.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
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

      {/* Role Selection */}
      <Text style={styles.subtitle}>Select Your Role:</Text>
      <View style={styles.roleButtonsContainer}>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => setRole('Landlord')}
        >
          <Text style={styles.buttonText}>Landlord</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => setRole('Tenant')}
        >
          <Text style={styles.buttonText}>Tenant</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
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

export default SignUp;