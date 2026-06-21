import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import B2bHome from "../../features/B2b/B2b.Home";
import MyProfile from "../../features/B2b/MyProfile";
import CatagoryInner from "../../features/B2b/CatagoryInner";
import ProductDetails from "../../features/B2b/Product.screen";
import PropertyDetails from "../../features/B2b/Property.screen";
import MyAllProduct from "../../components/B2b/MyAllProduct.screen";
import AddProduct from "../../features/B2b/AddProduct.screen";
import EditProduct from "../../features/B2b/EditProduct.screen";
import MyAllProperty from "../../components/B2b/MyAllProperty.screen";
import AddProperty from "../../features/B2b/AddProperty.screen";
import EditProperty from "../../features/B2b/EditProperty.screen";
import MyPropertyDetails from "../../features/B2b/Myproperty.screen";
import MyProductDetails from "../../features/B2b/Myproduct.screen";
import MyAllLookingfor from "../../components/B2b/MyAllLookingfor";
import MylookingforDetails from "../../features/B2b/Mylookingfor";
import PropertyLookingfor from "../../features/B2b/LookingforHome.screen";
import lookingforDetails from "../../features/B2b/Lookingfor.screen";

const Stack = createStackNavigator();

export const B2BStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="B2bHome" component={B2bHome} />
    <Stack.Screen name="MyProfile" component={MyProfile} />
    <Stack.Screen name="CatagoryInner" component={CatagoryInner} />
    <Stack.Screen name="ProductDetails" component={ProductDetails} />
    <Stack.Screen name="PropertyDetails" component={PropertyDetails} />
    <Stack.Screen name="MyAllProduct" component={MyAllProduct} />
    <Stack.Screen name="AddProduct" component={AddProduct} />
    <Stack.Screen name="EditProduct" component={EditProduct} />
    <Stack.Screen name="MyAllProperty" component={MyAllProperty} />
    <Stack.Screen name="AddProperty" component={AddProperty} />
    <Stack.Screen name="EditProperty" component={EditProperty} />
    <Stack.Screen name="MyPropertyDetails" component={MyPropertyDetails} />
    <Stack.Screen name="MyProductDetails" component={MyProductDetails} />
    <Stack.Screen name="MyAllLookingfor" component={MyAllLookingfor} />
    <Stack.Screen name="MylookingforDetails" component={MylookingforDetails} />
    <Stack.Screen name="PropertyLookingfor" component={PropertyLookingfor} />
    <Stack.Screen name="lookingforDetails" component={lookingforDetails} />
  </Stack.Navigator>
);