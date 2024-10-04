import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
//import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons'; 


//Screens
import TenantProf from '../src/components/TenantProf'
import Settings from '../src/components/Settings';

const Tab = createBottomTabNavigator();

const TenantHomeScreen = () => {
  return (
    <Tab.Navigator initialRouteName="TenantProfScreen" 
      screenOptions={ ({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'TenantProf') {
            iconName = focused ? 'person' : 'person-outline';
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
      <Tab.Screen name="TenantProf" component={TenantProf} options={{ tabBarLabel: 'Profile' }} />
      <Tab.Screen name="Settings" component={Settings} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
};

export default TenantHomeScreen;
