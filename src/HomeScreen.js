import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons'; 


//Screens
import LandlordProf from '../src/components/LandlordProf';
import TenantList from '../src/components/TenantList';
import PropertyList from '../src/components/PropertyList';
import Settings from '../src/components/Settings';

const Tab = createBottomTabNavigator();

const HomeScreen = () => {
  return (
    <Tab.Navigator initialRouteName="LandlordProf" 
      screenOptions={ ({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'LandlordProf') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'TenantList') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'PropertyList') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          // You can return any component that you like here!
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
    })}
    >
      <Tab.Screen name="LandlordProf" component={LandlordProf} options={{ tabBarLabel: 'Profile' }} />
      <Tab.Screen name="TenantList" component={TenantList} options={{ tabBarLabel: 'Tenants' }} />
      <Tab.Screen name="PropertyList" component={PropertyList} options={{ tabBarLabel: 'Properties' }} />
      <Tab.Screen name="Settings" component={Settings} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
};

export default HomeScreen;
