import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
//import 'react-native-gesture-handler';

//Screens
import LandingPage from '../src/LandingPage';
import HomeScreen from '../src/HomeScreen';
import Login from '../src/Login';
import SignUp from '../src/SignUp';
import LandlordProfScreen from '@/src/components/LandlordProf';
import TenantListScreen from '@/src/components/TenantList';
import PropertyList from '@/src/components/PropertyList';

import TenantHomeScreen from '../src/TenantHomeScreen';
import TenantProfScreen from '@/src/components/TenantProf';

import NoProfileScreen from '../src/NoProfileScreen';

const Stack = createStackNavigator();

function Index(){
  return (
      <Stack.Navigator initialRouteName="LandingPage">
        <Stack.Screen name="LandingPage" component={LandingPage} options={{ headerShown: false }}/>
        <Stack.Screen name="LoginPage" component={Login} options={{ headerShown: false }}/>
        <Stack.Screen name="SignUpPage" component={SignUp} options={{ headerShown: false }}/>
        
        {/*Landlord*/}
        <Stack.Screen name="HomePage" component={HomeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="LandlordProfScreen" component={LandlordProfScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TenantListScreen" component={TenantListScreen} />
        <Stack.Screen name="PropertyList" component={PropertyList} />
        {/*Tenant*/}
        <Stack.Screen name="TenantHomePage" component={TenantHomeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="TenantProfScreen" component={TenantProfScreen} />
        {/*No profile created by landlord*/}
        <Stack.Screen name="NoProfileScreen" component={NoProfileScreen} options={{ headerShown: false }} />

        
      </Stack.Navigator>
  );
};

export default () => {
  return (
    <NavigationContainer independent={true}>
      <Index/>
    </NavigationContainer>
  );
};