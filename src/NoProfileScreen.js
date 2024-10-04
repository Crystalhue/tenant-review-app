// NoProfileScreen.js
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { auth, db } from '../config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles';

const NoProfileScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = listenForProfileCreation();
    return () => unsubscribe();
  }, []);

  const listenForProfileCreation = () => {
    const user = auth.currentUser;
    if (user) {
      const tenantEmail = user.email.toLowerCase();
      const tenantQuery = query(
        collection(db, 'tenants'),
        where('tenantEmail', '==', tenantEmail)
      );

      const unsubscribe = onSnapshot(tenantQuery, (snapshot) => {
        if (!snapshot.empty) {
          // Profile has been created
          navigation.navigate('TenantHomePage'); // Navigate to tenant homepage
        }
      });

      return unsubscribe;
    }
    return () => {};
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigation.navigate('LandingPage'); // Navigate back to your landing page
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Not Found</Text>
      <Text style={styles.subtitle}>
        Your tenant profile has not been created by a landlord yet.
      </Text>
      <Text style={styles.subtitle}>Please contact your landlord for assistance.</Text>
      <TouchableOpacity onPress={handleLogout} style={styles.button}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NoProfileScreen;
