import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { createStackNavigator } from "@react-navigation/stack";
import OnboardModuleForm from "../../features/OnBoardModuleForm";
import JewelleryUserRegisterScreen from "../../features/jewellery/UserRegistration";
import MyProfile from "../../features/jewellery/MyProfile";
import Store from "../../features/jewellery/Store";
import Retailer from "../../features/jewellery/Retailer";
import Worker from "../../features/jewellery/Worker";
import GemsStone from "../../features/jewellery/Gemstone";
import Bullion from "../../features/jewellery/Bullions";
import Tools from "../../features/jewellery/Tools";
import JewelleryMainScreen from "../../features/jewellery/JewelleryMainScreen";
import EachShopScreen from "../../features/jewellery/EachShopScreen";
import EachShopAllProductsScreen from "../../features/jewellery/EachShopAllProductsScreen";
import EachProduct from "../../features/jewellery/EachProduct";
import EventPage from "../../features/jewellery/EventPage";
import EachWorker from "../../features/jewellery/EachWorker";
import MyStoreProfile from "../../features/jewellery/MyStoreProfile";
import RetailerProfile from "../../features/jewellery/RetailerProfile";
import GemsProfile from "../../features/jewellery/GemsProfile";
import BullionProfile from "../../features/jewellery/BullionProfile";
import ToolsProfile from "../../features/jewellery/ToolsProfile";
import MyAllRetailProduct from "../../features/jewellery/Retailer/MyAllRetailProduct";
import MyAllStoreProduct from "../../features/jewellery/Store/MyAllStoreProduct";
import MyAllGemsProduct from "../../features/jewellery/GemsStone/MyAllGemston";
import MyAllBullionProduct from "../../features/jewellery/Bullion/MyAllBullionProduct";
import MyAllToolsProduct from "../../features/jewellery/Tools/AllmyTool";
import AddRetailProduct from "../../features/jewellery/Retailer/AddProduct";
import EditRetailProduct from "../../features/jewellery/Retailer/EditProduct";
import RetailProduct from "../../features/jewellery/Retailer/RetailProduct";
import AddGemsStone from "../../features/jewellery/GemsStone/AddGemstone";
import EditGemsStone from "../../features/jewellery/GemsStone/EditGemstone";
import GemstoneProduct from "../../features/jewellery/GemsStone/GemstoneProduct";
import AddBullion from "../../features/jewellery/Bullion/AddBullion";
import EditBullion from "../../features/jewellery/Bullion/EditBullion";
import BullionProduct from "../../features/jewellery/Bullion/BullionProduct";
import AddTools from "../../features/jewellery/Tools/AddTools";
import EditTools from "../../features/jewellery/Tools/EditTools";
import ToolsProduct from "../../features/jewellery/Tools/ToolsProduct";
import RetailProductDetails from "../../features/jewellery/Retailer.product";
import GemstoneProductDetails from "../../features/jewellery/Gemstone.product";
import BullionProductDetails from "../../features/jewellery/Bullion.product";
import ToolsProductDetails from "../../features/jewellery/Tools.product";
import VendorProfile from "../../features/jewellery/OtherVendor.profile";
import OtherVendorAllStoreProduct from "../../features/jewellery/OtherVendorAllProduct";
import WorkerRegisterScreen from "../../features/WorkerRegistration";
import EditWorkerRegisterScreen from "../../features/EditWorkerRegistration";
import JewelleryEditUserRegisterScreen from "../../features/jewellery/EditUserRegistration";
import MyAllStoreStockProduct from "../../features/jewellery/Store/MyAllStoreStock";
import VendorHome from "../../features/jewellery/VendorHome";
import WorkerHome from "../../features/jewellery/WorkerHome";

import VendorsAllProductsScreen from "../../features/jewellery/VendorsAllProduct";
import EachShopProfile from "../../features/jewellery/EachShopProfile";
import EachVendor from "../../features/jewellery/EachVendor";
import JewelleryChatScreen from "../../features/jewellery/ChatScreen";
import ChatScreen from "../../features/chat/chat.screen";
import FilterMenu from "../../components/Jewellery/FilterMenu";
import SuperAdminHome from "../../features/jewellery/SuperAdminHome";
import JewelleryNotifications from "../../features/jewellery/Notifications";
import AssignForm from "../../features/jewellery/AssignForm";
import SellForm from "../../features/jewellery/SellForm";
import MyJewelleryProfile from "../../components/Jewellery/MyProfile";
import JewelleryEditRoleRegisterScreen from "../../features/jewellery/EditJewelleryRoleScreen";
import BottomNavigation from "../../components/Jewellery/BottomNavigation";

import EachGemologist from "../../features/jewellery/EachGemologist";
import EachDesigner from "../../features/jewellery/EachDesigner";
import DesignerHome from "../../features/jewellery/DesignerHome";
import GemologistHome from "../../features/jewellery/GemologistHome";
import MyAllToolProduct from "../../features/jewellery/Tools/AllmyTool";

// New UI Screens
import HomeScreen from "../../features/jewellery/HomeScreen";
import BrowseScreen from "../../features/jewellery/BrowseScreen";
import ShopsScreen from "../../features/jewellery/ShopsScreen";
import ShopDetailScreen from "../../features/jewellery/ShopDetailScreen";
import ProductDetailScreen from "../../features/jewellery/ProductDetailScreen";
import PremiumAccessScreen from "../../features/jewellery/PremiumAccessScreen";
import ProfileScreen from "../../features/jewellery/ProfileScreen";
import FollowersFollowingScreen from "../../features/jewellery/FollowersFollowingScreen";
import LiveRatesScreen from "../../features/jewellery/LiveRatesScreen";
import AddProductScreen from "../../features/jewellery/AddProductScreen";
import EditProductScreen from "../../features/jewellery/EditProductScreen";
import EditShopScreen from "../../features/jewellery/EditShopScreen";
import StockDetailsScreen from "../../features/jewellery/StockDetailsScreen";
import AddStockItemScreen from "../../features/jewellery/AddStockItemScreen";
import EditStockItemScreen from "../../features/jewellery/EditStockItemScreen";
import StockItemDetailScreen from "../../features/jewellery/StockItemDetailScreen";
import ShopEventCreate from "../../features/jewellery/ShopEventCreate";
import ShopEvents from "../../features/jewellery/ShopEvents";
import DirectoryScreen from "../../features/jewellery/DirectoryScreen";

const Stack = createStackNavigator();

const EMPTY_USER_TYPES = [];

export const JewelleryStackNavigator = () => {
  const userType = useSelector((state) => state.user.user?.userType ?? EMPTY_USER_TYPES);
  const user = useSelector((state) => state.user.user);
  const isGuest = useSelector((state) => state.user.isGuest);
  console.log("Jewellery Navigator - logged in user data", user);
  console.log("Jewellery Navigator - isJewelryOnboarded:", user?.isJewelryOnboarded);
  
  let initialRouteName = "OnboardModuleForm";

  if (isGuest) {
    initialRouteName = "HomeScreen";
  } else if (user?.isJewelryOnboarded === true) {
    // Use new HomeScreen as default
    initialRouteName = "HomeScreen";

    // Set route based on userType if onboarded
    if (Array.isArray(userType)) {
      if (userType.includes("worker")) {
        initialRouteName = "WorkerHome";
      } else if (userType.includes("vendor")) {
        initialRouteName = "VendorHome";
      } else if (userType.includes("shop")) {
        initialRouteName = "HomeScreen"; // Changed from JewelleryHome to HomeScreen
      } else if (userType.includes("superadmin")) {
        initialRouteName = "SuperAdminHome";
      } else if (userType.includes("jewelryDesigner")) {
        initialRouteName = "DesignerHome";
      } else if (userType.includes("gemologist")) {
        initialRouteName = "GemologistHome";
      }
    } else {
      // Handle non-array userType (backward compatibility)
      if (userType === "worker") {
        initialRouteName = "WorkerHome";
      } else if (userType === "vendor") {
        initialRouteName = "VendorHome";
      } else if (userType === "shop") {
        initialRouteName = "HomeScreen"; // Changed from JewelleryHome to HomeScreen
      } else if (userType === "superadmin") {
        initialRouteName = "SuperAdminHome";
      } else if (userType === "jewelryDesigner") {
        initialRouteName = "DesignerHome";
      } else if (userType === "gemologist") {
        initialRouteName = "GemologistHome";
      }
    }
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="VendorHome" component={VendorHome} />
      <Stack.Screen name="WorkerHome" component={WorkerHome} />
      <Stack.Screen name="DesignerHome" component={DesignerHome} />
      <Stack.Screen name="GemologistHome" component={GemologistHome} />
      <Stack.Screen
        name="JewelleryNotifications"
        component={JewelleryNotifications}
      />

      <Stack.Screen name="AssignForm" component={AssignForm} />
      <Stack.Screen name="SellForm" component={SellForm} />
      <Stack.Screen
        name="EditJewelleryRoleRegister"
        component={JewelleryEditRoleRegisterScreen}
      />
      <Stack.Screen name="MyJewelleryProfile" component={MyJewelleryProfile} />
      <Stack.Screen name="FilterMenu" component={FilterMenu} />
      <Stack.Screen name="Bottomnavigation" component={BottomNavigation} />
      <Stack.Screen name="ChatScreen" component={JewelleryChatScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="EventPage" component={EventPage} />

      <Stack.Screen name="EachShopProfile" component={EachShopProfile} />
      <Stack.Screen name="EachVendor" component={EachVendor} />
      <Stack.Screen name="SuperAdminHome" component={SuperAdminHome} />

      <Stack.Screen
        name="VendorsAllProductsScreen"
        component={VendorsAllProductsScreen}
      />
      <Stack.Screen name="Store" component={Store} />
      <Stack.Screen name="MyProfile" component={MyProfile} />
      <Stack.Screen name="Retailer" component={Retailer} />
      <Stack.Screen name="Worker" component={Worker} />
      <Stack.Screen name="GemsStone" component={GemsStone} />
      <Stack.Screen name="Bullion" component={Bullion} />
      <Stack.Screen name="Tools" component={Tools} />
      <Stack.Screen
        name="JewelleryMainScreen"
        component={JewelleryMainScreen}
      />
      <Stack.Screen
        name="MyAllStoreStockProduct"
        component={MyAllStoreStockProduct}
      />
      <Stack.Screen name="EachShop" component={EachShopScreen} />
      <Stack.Screen
        name="EachShopAllProducts"
        component={EachShopAllProductsScreen}
      />
      <Stack.Screen
        name="EditWorkerRegisterScreen"
        component={EditWorkerRegisterScreen}
      />
      <Stack.Screen
        name="EditJewelleryUserRegisterScreen"
        component={JewelleryEditUserRegisterScreen}
      />
      <Stack.Screen name="EachProduct" component={EachProduct} />
      <Stack.Screen name="EachWorker" component={EachWorker} />
      <Stack.Screen name="MyStoreProfile" component={MyStoreProfile} />
      <Stack.Screen name="RetailerProfile" component={RetailerProfile} />
      <Stack.Screen name="GemsProfile" component={GemsProfile} />
      <Stack.Screen name="BullionProfile" component={BullionProfile} />
      <Stack.Screen name="ToolsProfile" component={ToolsProfile} />
      <Stack.Screen name="MyAllRetailProduct" component={MyAllRetailProduct} />
      <Stack.Screen name="MyAllStoreProduct" component={MyAllStoreProduct} />
      <Stack.Screen name="MyAllGemsProduct" component={MyAllGemsProduct} />
      <Stack.Screen
        name="MyAllBullionProduct"
        component={MyAllBullionProduct}
      />
      <Stack.Screen name="MyAllToolsProduct" component={MyAllToolsProduct} />
      <Stack.Screen name="AddRetailProduct" component={AddRetailProduct} />
      <Stack.Screen name="EditRetailProduct" component={EditRetailProduct} />
      <Stack.Screen name="RetailProduct" component={RetailProduct} />
      <Stack.Screen name="AddGemsStone" component={AddGemsStone} />
      <Stack.Screen name="EditGemsStone" component={EditGemsStone} />
      <Stack.Screen name="GemstoneProduct" component={GemstoneProduct} />
      <Stack.Screen name="AddBullion" component={AddBullion} />
      <Stack.Screen name="EditBullion" component={EditBullion} />
      <Stack.Screen name="BullionProduct" component={BullionProduct} />
      <Stack.Screen name="AddTools" component={AddTools} />
      <Stack.Screen name="EditTools" component={EditTools} />
      <Stack.Screen name="ToolsProduct" component={ToolsProduct} />
      <Stack.Screen name="MyAllToolProduct" component={MyAllToolProduct} />

      <Stack.Screen
        name="RetailProductDetails"
        component={RetailProductDetails}
      />
      <Stack.Screen
        name="GemstoneProductDetails"
        component={GemstoneProductDetails}
      />
      <Stack.Screen
        name="BullionProductDetails"
        component={BullionProductDetails}
      />
      <Stack.Screen
        name="ToolsProductDetails"
        component={ToolsProductDetails}
      />
      <Stack.Screen name="VendorProfile" component={VendorProfile} />
      <Stack.Screen
        name="OtherVendorAllStoreProduct"
        component={OtherVendorAllStoreProduct}
      />

      <Stack.Screen name="EachGemologist" component={EachGemologist} />

      <Stack.Screen name="EachDesigner" component={EachDesigner} />

      {/* New UI Screens */}
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="BrowseScreen" component={BrowseScreen} />
      <Stack.Screen name="ShopsScreen" component={ShopsScreen} />
      <Stack.Screen name="ShopDetailScreen" component={ShopDetailScreen} />
      <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
      <Stack.Screen name="PremiumAccessScreen" component={PremiumAccessScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="FollowersFollowingScreen" component={FollowersFollowingScreen} />
      <Stack.Screen name="LiveRatesScreen" component={LiveRatesScreen} />
      <Stack.Screen name="AddProductScreen" component={AddProductScreen} />
      <Stack.Screen name="EditProductScreen" component={EditProductScreen} />
      <Stack.Screen name="EditShopScreen" component={EditShopScreen} />
      <Stack.Screen name="StockDetailsScreen" component={StockDetailsScreen} />
      <Stack.Screen name="AddStockItemScreen" component={AddStockItemScreen} />
      <Stack.Screen name="StockItemDetailScreen" component={StockItemDetailScreen} />
      <Stack.Screen name="EditStockItemScreen" component={EditStockItemScreen} />
      <Stack.Screen name="ShopEventCreate" component={ShopEventCreate} />
      <Stack.Screen name="ShopEvents" component={ShopEvents} />
      <Stack.Screen name="VendorsScreen" component={DirectoryScreen} />
      <Stack.Screen name="WorkersScreen" component={DirectoryScreen} />
      <Stack.Screen name="DesignersScreen" component={DirectoryScreen} />
      <Stack.Screen name="GemologistScreen" component={DirectoryScreen} />

      {/* Onboarding Screen */}
      <Stack.Screen name="OnboardModuleForm">
        {(props) => (
          <OnboardModuleForm 
            {...props} 
            route={{
              params: {
                userId: user?._id,
                redirectTo: "Jewellery"
              }
            }}
          />
        )}
      </Stack.Screen>

      {/* <Stack.Screen name="CommunityProfile" component={CommunityProfileScreen} /> */}
    </Stack.Navigator>
  );
};
