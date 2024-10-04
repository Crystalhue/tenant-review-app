import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ActivityIndicator, ScrollView, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { doc, getDoc , addDoc, updateDoc, deleteDoc, getDocs, collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth , db } from '../../config'; // Import Firestore configuration
import styles from '../../styles';

const LandlordProfScreen = () => {
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Floating button toggle
  const [isEditLandlordModalVisible, setIsEditLandlordModalVisible] = useState(false);

  //Landlord
  const [landlordData, setLandlordData] = useState(null);
  const [editedLandlordData, setEditedLandlordData] = useState({ name: '', email: '' }); 
  //Tenants
  const [tenants, setTenants] = useState([]); 
  // Tenants reviewed by the landlord
  const [reviewedTenants, setReviewedTenants] = useState([]); 
  //create tenant
  const [newTenant, setNewTenant] = useState({ name: '', property: '', roomRented: '', review: '' , tenantEmail: '' });
  // Edit Tenant modal
  const [isEditTenantModalVisible, setIsEditTenantModalVisible] = useState(false); 
  const [editTenant, setEditTenant] = useState({ id: '', name: '', property: '', roomRented: '', comment: '' });
  const [editTenantReviews, setEditTenantReviews] = useState([]); // For reviews in editTenant modal
  //Delete
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false); // Confirmation modal state
  const [tenantToDelete, setTenantToDelete] = useState(null);  // Store the tenant to delete
  //Tenant details
  const [tenantDetailsModalVisible, setTenantDetailsModalVisible] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  //Review
  const [tenantReviews, setTenantReviews] = useState([]);

  useEffect(() => {
    const fetchLandlordData = async () => {
      try {
        const user = auth.currentUser;  // Get the currently logged-in user

        if (user) {
          // Fetch landlord data from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setLandlordData(userDoc.data());  // Store landlord data
            setEditedLandlordData(userDoc.data());  // Pre-fill the edit modal with existing data
          } else {
            console.error('No such user found in Firestore.');
          }
        } else {
          console.error('No user is logged in.');
        }
      } catch (error) {
        console.error('Error fetching landlord data:', error);
      }
    };

    // Fetch tenants that the landlord has reviewed
    const fetchReviewedTenants = async () => {
      try {
        const user = auth.currentUser;
        const landlordId = user.uid;

        // Query to get all reviews made by the logged-in landlord
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('landlordId', '==', landlordId)
        );

        onSnapshot(reviewsQuery, async (snapshot) => {
          const reviewedTenantIds = [];
          snapshot.forEach((doc) => {
            reviewedTenantIds.push(doc.data().tenantId); // Get tenantId from each review
          });

          if (reviewedTenantIds.length > 0) {
            // Fetch tenant data for the tenants reviewed by the landlord
            const tenantQuery = query(
              collection(db, 'tenants'),
              where('__name__', 'in', reviewedTenantIds) // Firestore uses __name__ for document ID
            );

            const unsubscribe = onSnapshot(tenantQuery, (snapshot) => {
              const tenantList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setReviewedTenants(tenantList);
            });
            
            return () => unsubscribe();
          } else {
            setReviewedTenants([]); // No tenants reviewed by this landlord
          }
        });
      } catch (error) {
        console.error('Error fetching tenants reviewed by landlord:', error);
      }
    };

    fetchLandlordData();
    fetchReviewedTenants();
    setLoading(false); // Stop loading spinner once data is fetched
  }, []);

  // Fetch tenant reviews for the logged-in landlord
  const fetchTenantReviews = async (tenantEmail) => {
    if (!tenantEmail) {
      console.error('Tenant email is undefined or empty.');
      setTenantReviews([]);
      return; // Exit the function early
    }
  
    const landlordId = auth.currentUser.uid;
    const q = query(
      collection(db, 'reviews'),
      where('tenantEmail', '==', tenantEmail.toLowerCase()),
      where('landlordId', '==', landlordId)
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTenantReviews(reviews);
    });
  
    return () => unsubscribe();
  };
  
  

  // Reflect reviews in editTenant modal
  const fetchEditTenantReviews = async (tenantId) => {
    const landlordId = auth.currentUser.uid;
    const q = query(
      collection(db, 'reviews'),
      where('tenantId', '==', tenantId),
      where('landlordId', '==', landlordId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEditTenantReviews(reviews);
    });
    return () => unsubscribe();
  };

  // Function to handle showing tenant details in a modal
  const showTenantDetails = (tenant) => {
    setSelectedTenant(tenant);
    fetchTenantReviews(tenant.tenantEmail.toLowerCase()); // Fetch the reviews for this tenant
    setTenantDetailsModalVisible(true);
  };

  // Function to handle creating a tenant (without checking for duplicates)
  const createTenant = async () => {
    if (
      newTenant.name &&
      newTenant.property &&
      newTenant.roomRented &&
      newTenant.tenantEmail // Ensure tenantEmail is provided
    ) {
      try {
        // Check if the landlord has already added a tenant with this email
        const landlordId = auth.currentUser.uid;
        const reviewQuery = query(
          collection(db, 'reviews'),
          where('tenantEmail', '==', newTenant.tenantEmail.toLowerCase()),
          where('landlordId', '==', landlordId)
        );
  
        const querySnapshot = await getDocs(reviewQuery);
  
        if (!querySnapshot.empty) {
          // A review exists, meaning the landlord has already added this tenant
          alert('You have already added a profile for this tenant.');
          // Optionally, you can reset the form
          setNewTenant({
            name: '',
            property: '',
            roomRented: '',
            review: '',
            tenantEmail: '',
          });
          setIsModalVisible(false);
          return; // Exit the function early
        }
  
        // If no existing tenant, proceed to create a new tenant profile
        // Create the tenant profile
        const tenantDocRef = await addDoc(collection(db, 'tenants'), {
          name: newTenant.name,
          property: newTenant.property,
          roomRented: newTenant.roomRented,
          tenantEmail: newTenant.tenantEmail.toLowerCase(), // Store email in lowercase
        });
  
        // Add the review if provided
        if (newTenant.review && newTenant.review.trim() !== '') {
          await addDoc(collection(db, 'reviews'), {
            review: newTenant.review,
            tenantId: tenantDocRef.id,
            tenantEmail: newTenant.tenantEmail.toLowerCase(),
            tenantName: newTenant.name,
            landlordId: landlordId,
            landlordName: landlordData.name,
            createdAt: new Date(),
          });
        }
  
        // Reset the form and close the modal
        setNewTenant({
          name: '',
          property: '',
          roomRented: '',
          review: '',
          tenantEmail: '',
        });
        setIsModalVisible(false);
      } catch (error) {
        console.error('Error adding tenant:', error);
        alert('Error adding tenant');
      }
    } else {
      alert('Please fill in all fields.');
    }
  };
  

  // Update landlord profile
  const updateLandlordData = async () => {
    try {
      const user = auth.currentUser; // Get the currently logged-in user
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        // Update the landlord data in Firestore
        await updateDoc(userDocRef, {
          name: editedLandlordData.name,
          email: editedLandlordData.email,
          properties: editedLandlordData.properties,
          contactNumber: editedLandlordData.contactNumber,
        });
        setLandlordData(editedLandlordData); // Update local state with the new data
        setIsEditLandlordModalVisible(false); // Close the edit modal
      }
    } catch (error) {
      console.error('Error updating landlord data:', error);
      alert('Error updating landlord information');
    }
  };

  // Edit tenant
  const openEditTenantModal = async (tenant) => {
    // Set initial tenant data
    setEditTenant({ ...tenant, review: '', reviewId: null });
  
    // Fetch the landlord's own review for this tenant
    const landlordId = auth.currentUser.uid;
    const reviewQuery = query(
      collection(db, 'reviews'),
      where('tenantEmail', '==', tenant.tenantEmail.toLowerCase()),
      where('landlordId', '==', landlordId)
    );
  
    try {
      const querySnapshot = await getDocs(reviewQuery);
      if (!querySnapshot.empty) {
        const reviewDoc = querySnapshot.docs[0];
        const reviewData = reviewDoc.data();
        setEditTenant((prev) => ({
          ...prev,
          reviewId: reviewDoc.id,
          review: reviewData.review,
        }));
      } else {
        setEditTenant((prev) => ({
          ...prev,
          reviewId: null,
          review: '',
        }));
      }
    } catch (error) {
      console.error('Error fetching landlord review:', error);
    }
  
    setIsEditTenantModalVisible(true);
  };
  

  const updateTenant = async () => {
    if (
      editTenant.name &&
      editTenant.property &&
      editTenant.roomRented &&
      editTenant.tenantEmail
    ) {
      try {
        const tenantDocRef = doc(db, 'tenants', editTenant.id);
        await updateDoc(tenantDocRef, {
          name: editTenant.name,
          property: editTenant.property,
          roomRented: editTenant.roomRented,
          tenantEmail: editTenant.tenantEmail.toLowerCase(),
        });
  
        // Update or create the landlord's own review in the 'reviews' collection
        const landlordId = auth.currentUser.uid;
        if (editTenant.reviewId) {
          // Update existing review
          const reviewDocRef = doc(db, 'reviews', editTenant.reviewId);
          await updateDoc(reviewDocRef, {
            review: editTenant.review,
            createdAt: new Date(),
          });
        } else if (editTenant.review && editTenant.review.trim() !== '') {
          // Create new review
          await addDoc(collection(db, 'reviews'), {
            review: editTenant.review,
            tenantId: editTenant.id,
            tenantEmail: editTenant.tenantEmail.toLowerCase(),
            tenantName: editTenant.name,
            landlordId: landlordId,
            landlordName: landlordData.name,
            createdAt: new Date(),
          });
        }
        setIsEditTenantModalVisible(false);
      } catch (error) {
        console.error('Error updating tenant:', error);
        alert('Error updating tenant');
      }
    } else {
      alert('Please fill in all fields');
    }
  };
  
  

  //Confirm delete (open modal)
  const confirmDelete = (tenant) => {
    setTenantToDelete(tenant);  // Set the tenant to delete
    setConfirmDeleteVisible(true);  // Show the confirmation modal
  };
  // Function to handle deleting a tenant
  const deleteTenant = async () => {
    if (tenantToDelete) {
      try {
        // Query the tenant document by tenantEmail
        const tenantQuery = query(
          collection(db, 'tenants'),
          where('tenantEmail', '==', tenantToDelete.tenantEmail.toLowerCase())
        );
        const querySnapshot = await getDocs(tenantQuery);
        if (!querySnapshot.empty) {
          const tenantDoc = querySnapshot.docs[0];
          await deleteDoc(tenantDoc.ref);
  
          // Update the local state by filtering out the deleted tenant
          setReviewedTenants(
            reviewedTenants.filter(
              (tenant) =>
                tenant.tenantEmail.toLowerCase() !==
                tenantToDelete.tenantEmail.toLowerCase()
            )
          );
  
          // Reset the tenant to delete and close the modal
          setTenantToDelete(null);
          setConfirmDeleteVisible(false);
        } else {
          alert('Tenant not found.');
        }
      } catch (error) {
        console.error('Error deleting tenant:', error);
        alert('Error deleting tenant');
      }
    }
  };
  


  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, alignSelf: 'flex-start' }}>
        LandlordProfile
      </Text>
      
      
      <View style={{
        width: '100%',
        height: 600,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 20,
        justifyContent: 'flex-start',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowRadius: 4,
        elevation: 5,
      }}>
        {/* Landlord Icon and Edit Button */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          
          {/* Column for Image and Edit Button */}
          <View style={{ alignItems: 'center', marginRight: 20 }}>
            <Image source={require('../../assets/images/favicon.png')} style={styles.imagePlaceholder} />
            
            <TouchableOpacity
              style={{
                marginTop: 10,
                backgroundColor: '#3498db',
                padding: 10,
                borderRadius: 5,
                shadowColor: '#000',
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}
              onPress={() => setIsEditLandlordModalVisible(true)} // Open landlord profile edit modal
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Landlord Details */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', marginBottom: 10 }}>
              Name: <Text style={{ fontWeight: 'normal' }}>{landlordData?.name}</Text>
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', marginBottom: 10 }}>
              Email: <Text style={{ fontWeight: 'normal' }}>{landlordData?.email}</Text>
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', marginBottom: 10 }}>
              Properties: <Text style={{ fontWeight: 'normal' }}>{landlordData?.properties}</Text>
            </Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', marginBottom: 10 }}>
              Contact Number: <Text style={{ fontWeight: 'normal' }}>{landlordData?.contactNumber}</Text>
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Tenants</Text>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {reviewedTenants.length > 0 ? (
            reviewedTenants.map((tenant) => (
              <TouchableOpacity key={tenant.id} onPress={() => showTenantDetails(tenant)}>
                <View style={styles.tenantCard}>
                  <Text style={styles.tenantName}>{tenant.name}</Text>
                  <View style={styles.tenantRow}>
                    <Icon name="account" size={30} color="green" style={{ marginTop: 2, marginLeft: 10 }} />
                    <Text style={styles.tenantProperty} numberOfLines={1} ellipsizeMode='tail'>{tenant.property}</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => openEditTenantModal(tenant)}>
                      <Icon name="pencil" size={30} color="blue" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(tenant)}>
                      <Icon name="delete" size={30} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No tenants found.</Text>
          )}
        </ScrollView>

        {/* Floating button */}
        {isExpanded && (
          <View style={styles.crudButtonContainer}>
            <TouchableOpacity
              style={styles.crudButton}
              onPress={() => setIsModalVisible(true)} // Open tenant creation modal
            >
              <Icon name="plus" size={20} color="white" />
              <Text style={styles.crudButtonText}>Add Tenant Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.crudButton}
              onPress={() => setIsEditLandlordModalVisible(true)} // Open landlord profile edit modal
            >
              <Icon name="pencil" size={20} color="white" />
              <Text style={styles.crudButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.floatingButton} onPress={toggleExpand}>
          <Icon name={isExpanded ? 'close' : 'plus'} size={30} color="white" />
        </TouchableOpacity>
      </View>
      
      
      {/* Tenant Details Modal */}
      <Modal visible={tenantDetailsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tenant Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{selectedTenant?.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Property:</Text>
              <Text style={styles.detailValue}>{selectedTenant?.property}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Room rented:</Text>
              <Text style={styles.detailValue}>{selectedTenant?.roomRented}</Text>
            </View>

            {/* Reviews by landlord */}
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>Your Reviews</Text>
            <ScrollView>
              {tenantReviews.length > 0 ? (
                tenantReviews.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <Text style={styles.reviewText}>
                      <Text > {review.review} </Text> 
                    </Text>
                    <Text style={styles.reviewDate}>{new Date(review.createdAt.toDate()).toLocaleDateString()}</Text>
                  </View>
                ))
              ) : (
                <Text>No reviews found for this tenant by you.</Text>
              )}
            </ScrollView>

            <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'gray' }]} onPress={() => setTenantDetailsModalVisible(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      

      {/* Add Tenant Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <TextInput
              style={styles.input}
              placeholder="Tenant Name"
              value={newTenant.name}
              onChangeText={(text) => setNewTenant({ ...newTenant, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Tenant Email"
              value={newTenant.tenantEmail}
              onChangeText={(text) => setNewTenant({ ...newTenant, tenantEmail: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Tenant Property"
              value={newTenant.property}
              onChangeText={(text) => setNewTenant({ ...newTenant, property: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Room Rented"
              value={newTenant.roomRented}
              onChangeText={(text) => setNewTenant({ ...newTenant, roomRented: text })}
            />
            <TextInput
              style={[styles.input, styles.commentInput]}
              placeholder="Review"
              value={newTenant.review}
              onChangeText={(text) => setNewTenant({ ...newTenant, review: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.modalButton} onPress={createTenant}>
              <Text style={styles.modalButtonText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'red' }]} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Tenant Modal */}
      <Modal visible={isEditTenantModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Tenant</Text>
            <TextInput style={styles.input} placeholder="Tenant Name" value={editTenant.name} onChangeText={(text) => setEditTenant({ ...editTenant, name: text })} />
            <TextInput
              style={styles.input}
              placeholder="Tenant Email"
              value={editTenant.tenantEmail}
              onChangeText={(text) => setEditTenant({ ...editTenant, tenantEmail: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput style={styles.input} placeholder="Tenant Property" value={editTenant.property} onChangeText={(text) => setEditTenant({ ...editTenant, property: text })} />
            <TextInput style={styles.input} placeholder="Room Rented" value={editTenant.roomRented} onChangeText={(text) => setEditTenant({ ...editTenant, roomRented: text })} />
            <TextInput
              style={[styles.input, styles.commentInput]}
              placeholder="Review"
              value={editTenant.review}
              onChangeText={(text) => setEditTenant({ ...editTenant, review: text })}
              multiline
              numberOfLines={4}
              textAlignVertical='top'
            />
            <TouchableOpacity style={styles.modalButton} onPress={updateTenant}>
              <Text style={styles.modalButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'red' }]} onPress={() => setIsEditTenantModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal for deleting a tenant */}
      <Modal
            visible={confirmDeleteVisible}
            animationType="fade"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Confirm Delete</Text>
                <Text style = {styles.subtitle}>Are you sure you want to delete {tenantToDelete?.name}?</Text>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'red' }, { marginTop: 10}]} onPress={deleteTenant}>
                  <Text style={styles.modalButtonText}>Yes, Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'gray' }]} onPress={() => setConfirmDeleteVisible(false)}>
                  <Text style={styles.modalButtonText}>No, Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

      
      {/* Edit Landlord Profile Modal */}
      <Modal visible={isEditLandlordModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Landlord Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editedLandlordData.name}
              onChangeText={(text) => setEditedLandlordData({ ...editedLandlordData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editedLandlordData.email}
              onChangeText={(text) => setEditedLandlordData({ ...editedLandlordData, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Properties"
              value={editedLandlordData.properties}
              onChangeText={(text) => setEditedLandlordData({ ...editedLandlordData, properties: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              value={editedLandlordData.contactNumber}
              onChangeText={(text) => setEditedLandlordData({ ...editedLandlordData, contactNumber: text })}
            />
            <TouchableOpacity style={styles.modalButton} onPress={updateLandlordData}>
              <Text style={styles.modalButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'red' }]} onPress={() => setIsEditLandlordModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LandlordProfScreen;
