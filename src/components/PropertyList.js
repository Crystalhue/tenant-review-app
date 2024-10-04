// PropertyList.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDocs, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../styles';

const PropertyList = () => {
  const navigation = useNavigation();
  //Tenants
  const [selectedPropertyForTenant, setSelectedPropertyForTenant] = useState(null);
  const [tenantModalVisible, setTenantModalVisible] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [newTenant, setNewTenant] = useState({
    email: '',
    roomRented: '',
  });
  const [tenantEmail, setTenantEmail] = useState('');
  const [addTenantModalVisible, setAddTenantModalVisible] = useState(false);
  const [tenantDetailsModalVisible, setTenantDetailsModalVisible] = useState(false);
  const [selectedTenantDetails, setSelectedTenantDetails] = useState(null);
  const [tenantReviews, setTenantReviews] = useState([]);
  const [ownReview, setOwnReview] = useState(null);

  //Property
  const [properties, setProperties] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    description: '',
  });
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Fetch properties owned by the logged-in landlord
  useEffect(() => {
    const landlordId = auth.currentUser.uid;
    const propertiesRef = collection(db, 'properties');
    const q = query(propertiesRef, where('landlordId', '==', landlordId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const propertyList = [];
      snapshot.forEach((doc) => {
        propertyList.push({ id: doc.id, ...doc.data() });
      });
      setProperties(propertyList);
    });

    return () => unsubscribe();
  }, []);
  

  const addProperty = async () => {
    if (newProperty.name && newProperty.address && newProperty.description) {
      try {
        await addDoc(collection(db, 'properties'), {
          ...newProperty,
          landlordId: auth.currentUser.uid,
        });
        setModalVisible(false);
        setNewProperty({ name: '', address: '', description: '' });
      } catch (error) {
        Alert.alert('Error', 'Failed to add property.');
        console.error('Error adding property:', error);
      }
    } else {
      Alert.alert('Error', 'Please fill in all fields.');
    }
  };
  
  const addTenant = async () => {
    if (newTenant.email && newTenant.roomRented && selectedPropertyForTenant) {
      try {
        const usersRef = collection(db, 'users');
        const userQuery = query(
          usersRef,
          where('email', '==', newTenant.email.toLowerCase()),
          where('role', '==', 'Tenant')
        );
        const userSnapshot = await getDocs(userQuery);
  
        if (!userSnapshot.empty) {
          const tenantUser = userSnapshot.docs[0].data();
          
          // Check if the tenant is already added to the selected property
          const tenantsRef = collection(db, 'tenants');
          const existingTenantQuery = query(
            tenantsRef,
            where('tenantEmail', '==', newTenant.email.toLowerCase()),
            where('propertyId', '==', selectedPropertyForTenant.id)
          );
          const existingTenantSnapshot = await getDocs(existingTenantQuery);
  
          if (!existingTenantSnapshot.empty) {
            Alert.alert('Error', 'This tenant is already added to this property.');
            return; // Exit if tenant already exists for this property
          }
  
          // Add new tenant if not a duplicate
          await addDoc(collection(db, 'tenants'), {
            tenantEmail: newTenant.email.toLowerCase(),
            tenantName: tenantUser.name,
            roomRented: newTenant.roomRented,
            propertyId: selectedPropertyForTenant.id,
            landlordId: selectedPropertyForTenant.landlordId,
          });
          
          setNewTenant({ email: '', roomRented: '' });
          setAddTenantModalVisible(false);
        } else {
          Alert.alert('Error', 'No tenant found with that email.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to add tenant.');
        console.error('Error adding tenant:', error);
      }
    } else {
      Alert.alert('Error', 'Please fill in all fields.');
    }
  };
  
  
  

  const closeTenantModal = () => {
    if (tenantListenerRef.current) {
      tenantListenerRef.current();
    }
    setTenantModalVisible(false);
    setSelectedPropertyForTenant(null);
    setTenants([]);
    setTenantEmail('');
  };
  
  
  
  
  const updateProperty = async () => {
    if (newProperty.name && newProperty.address && newProperty.description) {
      try {
        const propertyDocRef = doc(db, 'properties', selectedProperty.id);
        await updateDoc(propertyDocRef, {
          ...newProperty,
        });
        setModalVisible(false);
        setSelectedProperty(null);
        setNewProperty({ name: '', address: '', description: '' });
      } catch (error) {
        Alert.alert('Error', 'Failed to update property.');
        console.error('Error updating property:', error);
      }
    } else {
      Alert.alert('Error', 'Please fill in all fields.');
    }
  };
  
  
  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setNewProperty({
      name: property.name,
      address: property.address,
      description: property.description,
    });
    setModalVisible(true);
  };

  const tenantListenerRef = useRef(null);

  const fetchTenants = (propertyId) => {
    const tenantsRef = collection(db, 'tenants');
    const q = query(tenantsRef, where('propertyId', '==', propertyId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tenantList = [];
      snapshot.forEach((doc) => {
        tenantList.push({ id: doc.id, ...doc.data() });
      });
      setTenants(tenantList);
    });

    tenantListenerRef.current = unsubscribe;
  };

  

  const handleDeleteProperty = (propertyId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this property?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'properties', propertyId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete property.');
              console.error('Error deleting property:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteTenantFromProperty = (tenant) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to remove ${tenant.tenantName} from this property?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete the tenant document from the 'tenants' collection
              await deleteDoc(doc(db, 'tenants', tenant.id));
              Alert.alert('Success', 'Tenant removed from the property.');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove tenant.');
              console.error('Error deleting tenant:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  
  const handlePropertyPress = (property) => {
    setSelectedPropertyForTenant(property);
    fetchTenants(property.id);
    setTenantModalVisible(true);
  };
  
  const showTenantDetails = (tenant) => {
    setSelectedTenantDetails(tenant);
    fetchTenantReviews(tenant.tenantEmail.toLowerCase());
    setTenantDetailsModalVisible(true);
  };
  
  const fetchTenantReviews = async (tenantEmail) => {
    if (!tenantEmail) {
      console.error('Tenant email is undefined or empty.');
      setOwnReview(null);
      setTenantReviews([]);
      return;
    }
  
    const currentLandlordId = auth.currentUser.uid;
  
    const tenantReviewsQuery = query(
      collection(db, 'reviews'),
      where('tenantEmail', '==', tenantEmail)
    );
  
    const unsubscribe = onSnapshot(
      tenantReviewsQuery,
      (snapshot) => {
        const reviews = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        const landlordReview = reviews.find(
          (review) => review.landlordId === currentLandlordId
        );
        setOwnReview(landlordReview ? landlordReview : null);
  
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
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Properties</Text>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePropertyPress(item)}
          >
            <View style={styles.propertyItem}>
              <Text style={styles.propertyName}>{item.name}</Text>
              <Text style={styles.propertyAddress}>{item.address}</Text>
              <Text style={styles.propertyDescription}>{item.description}</Text>
              <View style={styles.propertyActions}>
                <TouchableOpacity
                  style={{marginRight: 16, padding: 8, borderRadius: 4, backgroundColor: '#007bff'}}
                  onPress={() => handleEditProperty(item)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{padding: 8, borderRadius: 4, backgroundColor: '#dc3545'}}
                  onPress={() => handleDeleteProperty(item.id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectedProperty(null);
          setNewProperty({ name: '', address: '', description: '' });
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>Add Property</Text>
      </TouchableOpacity>
      

      {/* Modal for adding/editing properties */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedProperty ? 'Edit Property' : 'Add Property'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Property Name"
              value={newProperty.name}
              onChangeText={(text) =>
                setNewProperty({ ...newProperty, name: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={newProperty.address}
              onChangeText={(text) =>
                setNewProperty({ ...newProperty, address: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newProperty.description}
              onChangeText={(text) =>
                setNewProperty({ ...newProperty, description: text })
              }
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={selectedProperty ? updateProperty : addProperty}
            >
              <Text style={styles.buttonText}>
                {selectedProperty ? 'Update Property' : 'Add Property'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: 'gray' }]}
              onPress={() => {
                setModalVisible(false);
                setSelectedProperty(null);
                setNewProperty({ name: '', address: '', description: '' });
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Property tenant Modal */}
      <Modal visible={tenantModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedPropertyForTenant && (
              <>
                <Text style={styles.modalTitle}>{selectedPropertyForTenant.name}</Text>
                <Text style={styles.propertyAddress}>Address:   
                  <Text style={{fontWeight: 'normal'}}>{selectedPropertyForTenant.address}</Text>
                </Text>
                <Text style={styles.propertyDescription}>Description:
                  <Text style={{fontWeight: 'normal'}}>{selectedPropertyForTenant.description}</Text>
                </Text>
                

                <Text style={{fontSize: 25, fontWeight: 'bold', marginTop: 10,}}>Tenants:</Text>
                <FlatList
                  data={tenants}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.tenantPropertyCard}>
                      <TouchableOpacity
                        style={styles.tenantPropertyInfoContainer}
                        onPress={() => showTenantDetails(item)}
                      >
                        <Text style={styles.tenantPropertyRoom}>Room: {item.roomRented}</Text>
                        <Text style={styles.tenantPropertyName}>{item.tenantName}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{justifyContent: 'center', alignItems: 'center', marginLeft: 10}}
                        onPress={() => handleDeleteTenantFromProperty(item)}
                      >
                        <Icon name="trash-can-outline" size={32} color="#dc3545" />
                      </TouchableOpacity>
                    </View>

                  )}
                  ListEmptyComponent={<Text>No tenants added yet.</Text>}
                />


                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setAddTenantModalVisible(true)}
                >
                  <Text style={styles.buttonText}>Add Tenant</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: 'gray' }]}
                  onPress={closeTenantModal}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Tenant Modal */}
      <Modal
        visible={addTenantModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Tenant</Text>

            <TextInput
              style={styles.input}
              placeholder="Tenant's Email"
              value={newTenant.email}
              onChangeText={(text) =>
                setNewTenant({ ...newTenant, email: text })
              }
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Room Rented"
              value={newTenant.roomRented}
              onChangeText={(text) =>
                setNewTenant({ ...newTenant, roomRented: text })
              }
            />

            <TouchableOpacity style={styles.modalButton} onPress={addTenant}>
              <Text style={styles.buttonText}>Add Tenant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: 'gray' }]}
              onPress={() => {
                setAddTenantModalVisible(false);
                setNewTenant({ email: '', roomRented: '' });
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tenant Details Modal */}
      <Modal
        visible={tenantDetailsModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tenant Details</Text>

            {/* Name */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{selectedTenantDetails?.tenantName}</Text>
            </View>

            {/* Email */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{selectedTenantDetails?.tenantEmail}</Text>
            </View>

            {/* Room Rented */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Room Rented:</Text>
              <Text style={styles.detailValue}>{selectedTenantDetails?.roomRented}</Text>
            </View>

            {/* Your Review */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Your Review:</Text>
              <Text style={styles.detailValue}>{ownReview ? ownReview.review : 'No review added by you.'}</Text>
            </View>

            {/* Other Reviews */}
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>Other Reviews</Text>
            <ScrollView style={{ maxHeight: 200 }}>
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

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: 'gray' }]}
              onPress={() => setTenantDetailsModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>




    </View>
  );
  
  
};

export default PropertyList;
