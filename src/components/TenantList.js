import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, Modal, Keyboard, TouchableWithoutFeedback} from 'react-native';
import { db, auth } from '../../config'; 
import { query, where, collection, addDoc, getDoc, getDocs, doc , updateDoc, onSnapshot } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import styles from '../../styles';

// TouchableWithoutFeedback component to dismiss the keyboard when clicking outside input
const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

const TenantListScreen = () => {

  const [isExpanded, setisExpanded] = useState(false);
  // State of tenants from firestore
  const [tenants, setTenants] = useState([]); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  //State of filtered tenant
  const [filteredTenants, setFilteredTenants] = useState([]); // State of filtered tenants
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  //State for new tenant
  const [newTenant, setNewTenant] = useState({ name: '', property: ''});  
  // Tenant details modal state
  const [tenantDetailsModalVisible, setTenantDetailsModalVisible] = useState(false);  
  const [selectedTenant, setSelectedTenant] = useState(null);  
  //Review
  const [ownReview, setOwnReview] = useState(null); // State for the logged-in landlord's review
  const [tenantReviews, setTenantReviews] = useState([]);
  //Landlord Details when clicked
  const [landlordDetailsModalVisible, setLandlordDetailsModalVisible] = useState(false);
  const [selectedLandlord, setSelectedLandlord] = useState(null);

  //Search bar icon
  const searchInputRef = useRef(null);
  

  // Fetch tenants from Firestore on component mount
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tenants'), (snapshot) => {
      const tenantList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unknown Name',  // Default name if missing
          property: data.property || 'Unknown Property',  // Default property if missing
          tenantEmail: data.tenantEmail || 'No Email',  // Default email if missing
          ...data,
        };
      });
  
      // Remove duplicates based on tenant email
      const uniqueTenants = tenantList.filter(
        (tenant, index, self) =>
          index === self.findIndex(t => t.tenantEmail === tenant.tenantEmail)
      );
  
      setTenants(uniqueTenants); // Set state with unique tenants
      setFilteredTenants(uniqueTenants); // Initialize filtered tenants with all tenants
    }, (error) => {
      console.error('Error fetching tenants in real-time', error);
    });
  
    return () => unsubscribe();
  }, []);
  
  
  
  
  
  

  // Function to handle searching tenants based on Firestore query
  const handleSearch = (text) => {
    setSearchQuery(text);
  
    // Filter tenants based on search query
    if (text.trim()) {
      const filtered = tenants.filter(tenant =>
        tenant.name ? tenant.name.toLowerCase().startsWith(text.toLowerCase()) : false
      );
      setFilteredTenants(filtered);  // Update the filtered tenants list
    } else {
      setFilteredTenants(tenants); // Reset to show all tenants
    }
  };
  



  // Fetch reviews and separate the logged-in landlord's review
  const fetchTenantReviews = async (tenantEmail) => {
    if (!tenantEmail) {
      console.error('Tenant email is undefined or empty.');
      setOwnReview(null);
      setTenantReviews([]);
      return; // Exit the function early
    }

    const currentLandlordId = auth.currentUser.uid;
  
    const tenantReviewsQuery = query(
      collection(db, 'reviews'),
      where('tenantEmail', '==', tenantEmail) // Fetch reviews by tenant email
    );
  
    const unsubscribe = onSnapshot(
      tenantReviewsQuery,
      (snapshot) => {
        const reviews = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // Find the logged-in landlord's review
        const landlordReview = reviews.find(
          (review) => review.landlordId === currentLandlordId
        );
        setOwnReview(landlordReview ? landlordReview : null);
  
        // Set all other reviews (excluding the logged-in landlord's review)
        const otherReviews = reviews.filter(
          (review) => review.landlordId !== currentLandlordId
        );
        setTenantReviews(otherReviews);
      },
      (error) => {
        console.error('Error fetching tenant reviews:', error);
      }
    );
  
    return () => unsubscribe();
  };
  

  const showTenantDetails = (tenant) => {
    setSelectedTenant(tenant);
  
    if (tenant.tenantEmail) {
      fetchTenantReviews(tenant.tenantEmail.toLowerCase()); // Use toLowerCase() for email normalization
    } else {
      console.error('Tenant email is undefined for tenant:', tenant);
      alert('No email associated with this tenant.');
      return; // Exit the function early
    }
  
    setTenantDetailsModalVisible(true); // Show the modal
  };
  

  

  //Show landlord details when clicked on other reviews
  const showLandlordDetails = async (landlordId) => {
    try {
      const landlordDocRef = doc(db, 'users', landlordId); // Assuming landlords are stored in 'users' collection
      const landlordDoc = await getDoc(landlordDocRef);
      if (landlordDoc.exists()) {
        setSelectedLandlord({ id: landlordDoc.id, ...landlordDoc.data() });
        setLandlordDetailsModalVisible(true);
      } else {
        console.error('No such landlord!');
        alert('Landlord details not found.');
      }
    } catch (error) {
      console.error('Error fetching landlord details:', error);
      alert('Error fetching landlord details.');
    }
  };
  
  


  return (
    <DismissKeyboard>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5, alignSelf: 'flex-start' }}>
          TenantList
        </Text>

        {/* Search Bar */}
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', shadowColor: 'black', elevation: 2, marginBottom: 15,  borderRadius: 5, paddingHorizontal: 10 }} onPress={() => searchInputRef.current.focus()}>
            <TextInput
              ref ={searchInputRef} //ref to search text input
              style={[styles.input, { backgroundColor: 'white', shadowColor:' black', elevation: 2,  marginTop: 7, marginBottom: 7 }]} // Adjust the style and margin as needed
              placeholder="Search tenants by name..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <Icon name="magnify" size={24} color="gray" style={{ marginLeft: 10 }}/>
        </TouchableOpacity>
        
        

        <View style={{
          width: '100%',
          height: 550,
          backgroundColor: '#ffffff',
          borderRadius: 10,
          padding: 20,
          justifyContent: 'flex-start',
          alignSelf: 'center',
          shadowColor: '#000',
          shadowRadius: 4,
          elevation: 5,
        }}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <TouchableOpacity key={tenant.id} onPress={() => showTenantDetails(tenant)}>
                  <View stylele ={styles.tenantCard}>
                    <Text style={styles.tenantName}>{tenant.name}</Text>
                    <View style={styles.tenantRow}>
                      <Icon name="account" size={30} color="green" style={{ marginTop: 2, marginLeft: 10 }} />
                      <Text style={styles.tenantProperty} numberOfLines={1} ellipsizeMode='tail'>{tenant.property}</Text>
                      
                      
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text>No tenants found</Text>
            )}
          </ScrollView>

          
          {/* Tenant Details Modal */}
          <Modal
            visible={tenantDetailsModalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Tenant Details</Text>
                
                {/*Name*/}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{selectedTenant?.name}</Text>
                </View>

                {/*Property*/}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Property:</Text>
                  <Text style={styles.detailValue}>{selectedTenant?.property}</Text>
                </View>

                {/*Room Rented*/}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Room rented:</Text>
                  <Text style={styles.detailValue}>{selectedTenant?.roomRented}</Text>
                </View>

                {/* Show logged-in landlord's review */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Your Review:</Text>
                  <Text style={styles.detailValue}>{ownReview ? ownReview.review : 'No review added by you.'}</Text>
                </View>

                {/* Displaying All Other Reviews */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>Other Reviews</Text>
                <ScrollView>
                  {tenantReviews.length > 0 ? (
                    tenantReviews.map((review) => (
                      <TouchableOpacity
                        key={review.id}
                        onPress={() => showLandlordDetails(review.landlordId)}
                      >
                        <View style={styles.reviewCard}>
                          <Text style={styles.reviewText}>
                            <Text style={{ fontWeight: 'bold' }}>{review.landlordName}:</Text> {review.review}
                          </Text>
                          <Text style={styles.reviewDate}>
                            {new Date(review.createdAt.toDate()).toLocaleDateString()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text>No reviews found for this tenant.</Text>
                  )}
                </ScrollView>




                <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'gray' }]} onPress={() => setTenantDetailsModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Landlord Details Modal */}
          <Modal
            visible={landlordDetailsModalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Landlord Details</Text>

                {/* Display Landlord Details */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{selectedLandlord?.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedLandlord?.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Contact Number:</Text>
                  <Text style={styles.detailValue}>{selectedLandlord?.contactNumber}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Properties:</Text>
                  <Text style={styles.detailValue}>{selectedLandlord?.properties}</Text>
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: 'gray' }]}
                  onPress={() => setLandlordDetailsModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </View>
      </View>
    </DismissKeyboard>
  );
};

export default TenantListScreen;
