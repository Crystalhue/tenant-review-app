import React from 'react';
import { View, Text, Image, TouchableOpacity , StyleSheet} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import { auth } from '../../config'; // Import auth from your config.js
//import styles from '../../styles';

const SettingsScreen = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    // Log out the current user using Firebase Auth
    const currentAuth = getAuth();
    signOut(currentAuth)
      .then(() => {
        console.log('User signed out!');
        // After successful logout, navigate back to the landing or login page
        navigation.replace('LandingPage'); // Ensure it navigates back to the landing page
      })
      .catch((error) => {
        console.error('Logout error:', error.message);
        alert('Failed to log out. Please try again.');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FF5C5C',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});