import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import BuySellScreen from "../../features/B2C/B2C.homeScreen";
import FurnitureScreen from "../../features/B2C/FurniturePage";
import FoodProductsScreen from "../../features/B2C/FoodProductsPage";

import EachListing from "../../features/B2C/EachListing";
import AddProduct from "../../features/B2C/AddListing";
import EditListing from "../../features/B2C/EditListing";
import MyB2CProfile from "../../features/B2C/MyProfile";
import MyListingScreen from "../../features/B2C/MyListings";
import JewelleryEditUserRegisterScreen from "../../features/jewellery/EditUserRegistration";
import AllListingScreen from "../../features/B2C/AllListings";
import EditUserProfile from "../../features/B2C/EditProfile";
import DashboardScreen from "../../features/dashboard.screen";
import ChatScreenNew from "../../features/chat/chat.screen.new";
import ChatScreen from "../../features/chat/chat.screen";
import EachProfile from "../../features/SocialMediaNew/EachUserProfile";
const Stack = createStackNavigator();

export const B2CStackNavigator = () => (
  <Stack.Navigator  screenOptions={{ headerShown: false }}>
     {/* <Stack.Screen name="PageComingSoon" component={PageComingSoon} /> */}
    <Stack.Screen name="B2CHome" component={BuySellScreen} />
    <Stack.Screen name = "MainHome" component={DashboardScreen}/>
    
    <Stack.Screen name="BuySellScreen" component={BuySellScreen} />
    <Stack.Screen name="FurnitureScreen" component={FurnitureScreen} />
    <Stack.Screen name="FoodProductsScreen" component={FoodProductsScreen} />

    <Stack.Screen name="EachListing" component={EachListing} />
    <Stack.Screen name="AddProduct" component={AddProduct} />
    <Stack.Screen name="EditListing" component={EditListing} />
    <Stack.Screen name="MyB2CProfile" component={MyB2CProfile} />
    <Stack.Screen name="MyListingScreen" component={MyListingScreen} />
    <Stack.Screen
      name="EditJewelleryUserRegisterScreen"
      component={JewelleryEditUserRegisterScreen}
    />
    <Stack.Screen name="AllListingScreen" component={AllListingScreen} />
    <Stack.Screen name="EditProfile" component={EditUserProfile}/>
    <Stack.Screen name="ChatScreenNew" component={ChatScreenNew} />
    <Stack.Screen name="ChatScreen" component={ChatScreen} />
    <Stack.Screen name="EachProfile" component={EachProfile} />
  </Stack.Navigator>
);
