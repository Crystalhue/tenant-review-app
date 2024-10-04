import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 350, 
    height: 150, 
    marginBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  subtitle: {
    alignItems: 'center',
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },

  //INPUT
  input:{
    width: '100%',
    height: 45,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    alignSelf: 'center',
    marginBottom: 3
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  
  inputField: {
    flex: 1,
    height: 40,
  },

  //Each Screens specifics
  screentitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  profileContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowRadius: 4,
    elevation: 5,
  },
  propertyContainer: {
    marginTop: 20,
    flex: 1,
    paddingHorizontal: 8, // Adjust as needed
    backgroundColor: '#fff',
  },
  propertyItem: {
    width: '100%',
    padding: 24, 
    backgroundColor: '#f9f9f9',
    marginBottom: 16, // Increased margin to add more space between items
    borderRadius: 8,
    minHeight: 120, // Added minimum height
    justifyContent: 'center', // Center content vertically
  },
  propertyName: {
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#333',
  },
  propertyAddress: {
    fontSize: 18, 
    fontWeight: '600',
    color: '#555',
    marginTop: 8, // Increased marginTop for better spacing
  },
  propertyDescription: {
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#777',
    marginTop: 8, // Increased marginTop for better spacing
  },
  
  propertyActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: 'gray',
    borderRadius: 30,
    marginRight:20,
  },
  scrollContainer:{
    flexGrow: 1,
    justifyContent: 'flex-start'
  },

  //TENANTLIST
  tenantCard: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,  // Add a border
    borderColor: '#ddd',  // Light gray border color
    marginBottom: 10, // Space between tenant rows
    shadowColor: '#000',  // Optional: adds shadow
    shadowOffset: { width: 0, height: 2 },  // Optional: shadow offset
    shadowOpacity: 0.1,  // Optional: shadow opacity
    shadowRadius: 4,  // Optional: shadow radius
    elevation: 2,  // Elevation for Android shadow
  },
  tenantRow:{
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    //marginBottom: 10,
    justifyContent: 'space-between',
    borderBottomWidth: 8, // Add bottom border to separate tenants
    borderBottomColor: '#eee',  // Light gray line to visually separate tenants
    paddingBottom: 5,  // Padding inside the tenant row
    marginBottom: 5,   // Space between rows
  },
  tenantName: {
    //flex: 1,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBar: {
    //flex: 2,
    height: 20,
    width: '25%',
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    //marginHorizontal: 10,
    marginVertical: 10
    
  },
  progressBarGoodFilled: {
    height: '100%',
    width: '70%', //Bar filling for different total ratings
    backgroundColor: '#007bff',
  },
  progressBarMehFilled: {
    height: '100%',
    width: '50%', //Bar filling for different total ratings
    backgroundColor: '#007bff',
  },
  progressBarBadFilled: {
    height: '100%',
    width: '30%', //Bar filling for different total ratings
    backgroundColor: '#007bff',
  },

  tenantProperty: {
    flex: 1,
    flexShrink: 1,
    flexWrap: 'nowrap',
    fontSize: 18,
    color: '#333',
    //textAlign: 'left',
    marginVertical: 10,
    marginHorizontal: 5,
    
    
  },
  /*
  tenantRating: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    //textAlign: 'right',
    marginVertical: 10
  },
  */

  //PropertyList
  tenantPropertyCard:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tenantPropertyRoom:{
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tenantPropertyName:{
    fontSize: 16,
    color: '#333',
  },

  //TAB
  tabContainer: {
    //flex: 1,
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowRadius: 0,
    elevation: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: -30, // Position it above the inner box
    zIndex: 1,
    
  },
  tabText:{
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold'
  },
  //FLOATING BUTTON ON TENANT
  floatingButton:{
    position: 'absolute',
    bottom: 10, // Position above the bottom navigation
    right: 10, // Position to the right side of the screen
    backgroundColor: '#007bff', // Button color
    borderRadius: 50, // Make it a circle
    width: 60, // Size of the button
    height: 60, // Size of the button
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Elevation for shadow effect
  },
  crudButtonContainer: {
    position: 'absolute',
    bottom: 110,  // Adjust to space out the buttons
    right: 30,
    flexDirection: 'column',
    alignItems: 'center',
  },
  crudButton: {
    width: 120,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
  },
  crudButtonText: {
    marginLeft: 10,
    color: 'white',
    fontWeight: 'bold',
  },

  //REVIEW
  reviewCard: {
    marginVertical: 7, // Adds vertical space between reviews
    padding: 10,        // Adds padding inside the review card
    backgroundColor: '#f9f9f9', // Light gray background for the review card
    borderRadius: 8,    // Rounds the corners of the card
    borderWidth: 1,     // Adds a border around the card
    borderColor: '#ddd',// Light gray border color
    shadowColor: '#000',// Adds shadow to the card (iOS)
    shadowOffset: { width: 0, height: 2 }, // Shadow offset (iOS)
    shadowOpacity: 0.1, // Shadow opacity (iOS)
    shadowRadius: 4,    // Shadow radius (iOS)
    elevation: 3,       // Adds shadow to the card (Android)
  },

  reviewText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },

  reviewDate: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
  },

  
  // MODAL STYLES
  commentInput:{
    height: 100, // Increase the height
    fontSize: 16,  // Increase the font size if necessary
    padding: 20,  // Add padding for a better look
    backgroundColor: '#f5f5f5', // Optional: background color
    borderRadius: 5,  // Optional: round the corners
    borderWidth: 1,  // Add a border to make it more visible
    borderColor: '#ccc',  // Color of the border
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  detailLabel: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 8,
    color: '#333',
  },
  detailValue: {
    flex: 2,
    textAlign: 'left',
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',  // Semi-transparent background
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButton: {
    width: '60%',
    height: 40,
    backgroundColor: '#007bff',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 3
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  //BUTTONS (for now on home page)
  button: {
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 10,
    marginVertical: 5, 
    alignSelf: 'center'
  },
  buttonHover:{
    backgroundColor: 'gray'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 4,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },

  roleButtonsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  roleButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
    width: 200,
    alignItems: 'center',
  },

});

export default styles;
