import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput} from 'react-native';
import { auth, db } from '../../config';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot, } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../styles';

const TenantProfScreen = () => {
  // State variables
  const [tenantData, setTenantData] = useState(null);
  const [tenantProfile, setTenantProfile] = useState(null);
  const [tenantReviews, setTenantReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  ///////
  const [isEditTenantModalVisible, setIsEditTenantModalVisible] = useState(false);
    const [editedTenantData, setEditedTenantData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    // Add any other fields you want tenants to be able to edit
    });

  // Fetch tenant's own data on mount
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const user = auth.currentUser; // Get current user
        if (user) {
          // Fetch tenant's user data
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setTenantData(userData);

            // Now fetch tenant profile created by landlords using email
            fetchTenantProfile(userData.email.toLowerCase());
          } else {
            console.error('No such user found in Firestore.');
          }
        } else {
          console.error('No user is logged in.');
        }
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, []);

  // Function to fetch tenant profile created by landlords
  const fetchTenantProfile = async (tenantEmail) => {
    try {
      // Query the 'tenants' collection where 'tenantEmail' matches the tenant's email
      const tenantQuery = query(
        collection(db, 'tenants'),
        where('tenantEmail', '==', tenantEmail)
      );

      const querySnapshot = await getDocs(tenantQuery);
      if (!querySnapshot.empty) {
        // Assuming the first match is the correct profile
        const tenantDoc = querySnapshot.docs[0];
        setTenantProfile({ id: tenantDoc.id, ...tenantDoc.data() });

        // Fetch reviews for this tenant profile
        fetchTenantReviews(tenantEmail);
      } else {
        console.error('No tenant profile found for this tenant.');
      }
    } catch (error) {
      console.error('Error fetching tenant profile:', error);
    }
  };

  // Function to fetch reviews for the tenant
  const fetchTenantReviews = (tenantEmail) => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('tenantEmail', '==', tenantEmail)
      );

      const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
        const reviews = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTenantReviews(reviews);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching tenant reviews:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const updateTenantData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          name: editedTenantData.name,
          email: editedTenantData.email,
          // Add other fields as needed
        });
        setTenantData(editedTenantData);
        setIsEditTenantModalVisible(false);
      }
    } catch (error) {
      console.error('Error updating tenant data:', error);
      alert('Error updating your information.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tenant Profile</Text>
      <View style={styles.profileContainer}>
        {/* Profile Picture and Edit Button */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Image Placeholder */}
          <View style={{ alignItems: 'center', marginRight: 20 }}>
            <Image
              source={require('../../assets/images/favicon.png')}
              style={styles.imagePlaceholder}
            />
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => {
                setEditedTenantData(tenantData); // Pre-fill edit form
                setIsEditTenantModalVisible(true);
              }}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
          {/* Tenant Details */}
          <View style={{ flex: 1 }}>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: 'black', marginBottom: 10 }}>
              Name: <Text style={{ fontWeight: 'normal' }}>{tenantData?.name}</Text>
            </Text>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: 'black', marginBottom: 10 }}>
              Email: <Text style={{ fontWeight: 'normal' }}>{tenantData?.email}</Text>
            </Text>
            {/* Add other fields as needed */}
          </View>
        </View>
  
        {/* Property Details */}
        {tenantProfile ? (
          <View style={styles.propertyContainer}>
            <Text style={styles.subtitle}>Property Details</Text>
            <Text style={styles.profileText}>
              Property: <Text style={styles.profileValue}>{tenantProfile.property}</Text>
            </Text>
            <Text style={styles.profileText}>
              Room Rented: <Text style={styles.profileValue}>{tenantProfile.roomRented}</Text>
            </Text>
          </View>
        ) : (
          <Text>No tenant profile found.</Text>
        )}
  
        {/* Reviews by Landlords */}
        <Text style={styles.subtitle}>Reviews by Landlords</Text>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {tenantReviews.length > 0 ? (
            tenantReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <Text style={styles.reviewText}>
                  <Text style={{ fontWeight: 'bold' }}>{review.landlordName}:</Text>{' '}
                  {review.review}
                </Text>
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt.toDate()).toLocaleDateString()}
                </Text>
              </View>
            ))
          ) : (
            <Text>No reviews found.</Text>
          )}
        </ScrollView>
      </View>
  
      {/* Edit Tenant Profile Modal */}
      <Modal
        visible={isEditTenantModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editedTenantData.name}
              onChangeText={(text) =>
                setEditedTenantData({ ...editedTenantData, name: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editedTenantData.email}
              onChangeText={(text) =>
                setEditedTenantData({ ...editedTenantData, email: text })
              }
            />
            {/* Add other fields as needed */}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={updateTenantData}
            >
              <Text style={styles.modalButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: 'red' }]}
              onPress={() => setIsEditTenantModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};  

export default TenantProfScreen;
