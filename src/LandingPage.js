import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation } from 'expo-router';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore'; // Firestore functions
import styles from '../styles';

import { auth, db } from '../config'; // Import auth and db from your updated config.js

const LandingPage = () => {
  const [showRoleButtons, setShowRoleButtons] = useState(false);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const [showHomeScreen, setShowHomeScreen] = useState(false); // State to toggle HomeScreen
  const [user, setUser] = useState(null); // This user
  const [users, setUsers] = useState([]); // Other Users based on role

  // Function to show the role buttons when "Get Started" is clicked
  const handleGetStarted = () => {
    setShowRoleButtons(true);
  };

  // Function to go back to "Get Started"
  const handleBack = () => {
    setShowRoleButtons(false);
  };

  // Function to log out
  const handleLogout = () => {
    auth.signOut().then(() => {
      setShowHomeScreen(false);
      setUser(null); // Clear user data on logout
      setShowRoleButtons(false); // Go back to the initial state
    });
  };

  // Fetch the current user details
  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      getDoc(userDocRef).then(userDoc => {
        if (userDoc.exists()) {
          setUser(userDoc.data());
        }
      }).catch(error => {
        console.error('Error fetching user:', error);
      });
    }
  }, []);

  // Fetch the list of users based on role
  useEffect(() => {
    if (user) {
      const usersCollectionRef = collection(db, 'users');
      const usersQuery = query(usersCollectionRef, where('role', '==', (user.role === 'Tenant' ? 'Landlord' : 'Tenant')));

      const unsubscribe = onSnapshot(usersQuery, snapshot => {
        const USERS = [];
        snapshot.forEach(doc => {
          USERS.push(doc.data());
        });
        setUsers(USERS);
      });

      return () => unsubscribe(); // Clean up the listener on component unmount
    }
  }, [user]);

  // Home Screen with users list based on role
  const renderHomeScreen = () => (
    <View style={styles.container}>
      <View style={{ padding: 10, backgroundColor: "#b1b1b1", paddingTop: 55 }}>
        <Text style={{ fontSize: 24, fontWeight: "800" }}>Welcome {user?.name}</Text>
      </View>
      <View style={styles.view}>
        <Text style={{
          fontSize: 20,
          fontWeight: "600",
          marginBottom: 20
        }}>
          List of {user?.role === 'Tenant' ? 'Landlords' : 'Tenants'}
        </Text>
        <FlatList
          data={users}
          renderItem={({ item }) => (
            <View style={{ borderBottomWidth: 1, borderBottomColor: "#b1b1b1", marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "400", marginBottom: 8 }}>{item.name}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <TouchableOpacity onPress={handleLogout} style={styles.button}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/Tenant-review.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to Tenant Review!</Text>
      <Text style={styles.subtitle}>An app to help landlords and tenants.</Text>

      {!showRoleButtons ? (
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.roleButtonsContainer}>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => navigation.navigate('LoginPage')}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => navigation.navigate('SignUpPage')}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleBack}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default LandingPage;
