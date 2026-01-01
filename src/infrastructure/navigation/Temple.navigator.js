import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector } from "react-redux";
import TempleHome from "../../features/Temple/Temple.home";
import OnboardModuleForm from "../../features/OnBoardModuleForm";
import TempleDetails from "../../features/Temple/Temple.Details";
import MyTempleProfile from "../../features/Temple/TempleProfile";
import TempleEditAdminRegisterScreen from "../../features/Temple/EditProfile";
import BottomNavigation from "../../features/Temple/BottomNavigation";
import TempleEditRoleRegisterScreen from "../../features/Temple/EditRoleProfile";
import MyProfile from "../../features/Temple/MyProfile";
import AllProductsScreen from "../../features/Temple/AllProducts";
import EachProduct from "../../features/Temple/EachProduct";
import AddShopProduct from "../../features/Temple/AddProducts";
import EditShopProduct from "../../features/Temple/EditProduct";
import AddEvents from "../../features/Temple/AddEvents";
import AddMembers from "../../features/Temple/AddMembers";
import EachMember from "../../features/Temple/EachMember";
import EachPandit from "../../features/Temple/EachPandit";
import EditMember from "../../features/Temple/EditMember";
import AddShops from "../../features/Temple/AddShops";
import AddTemple from "../../features/Temple/AddTemple";
import TempleEventsCreate from "../../features/Temple/TempleEventsCreate";
import TempleEventEdit from "../../features/Temple/TempleEventEdit";
import TempleEvents from "../../features/Temple/TempleEvents";
import EditTemple from "../../features/Temple/EditTemple";
import FilterMenu from "../../components/Jewellery/FilterMenu";
import EachShopProfile from "../../features/Temple/EachShopProfile";
import TempleNotifications from "../../features/Temple/TempleNotifications";
import DetailsScreen from "../../features/Temple/GodsDetails";
import PanditSpecificTempleList from "../../features/Temple/PanditSpecificTempleList";
import TempleSuperAdminHome from "../../features/Temple/TempleSuperAdminHome"; // Assuming this is your superadmin home component
import EditShop from "../../features/Temple/EditShop";
import ChatScreenNew from "../../features/chat/chat.screen.new";
import ChatHome from "../../features/chat/chat.home";
import AddGod from "../../features/Temple/AddGod";
import EditGod from "../../features/Temple/EditGod";
import TemplePanditDetails from "../../features/Temple/PanditDetails";
import AddPandits from "../../features/Temple/AddPandits";
import PanditNotifications from "../../features/Temple/PanditNotifications";
import ShopNotifications from "../../features/Temple/ShopNotifications";
const Stack = createStackNavigator();

export const TempleStackNavigator = () => {
  const user = useSelector((state) => state.user.user);
  const userType = useSelector((state) => state.user.user?.userType || []);
  console.log("Temple Navigator - logged in user data", user);
  console.log("Temple Navigator - isTempleOnboarded:", user?.isTempleOnboarded);
  
  // Determine initial route based on onboarding status
  let initialRouteName = "OnboardModuleForm";
  
  if (user?.isTempleOnboarded === true) {
    if (Array.isArray(userType) && userType.includes("superadmin")) {
      initialRouteName = "TempleSuperAdminHome";
    } else if (userType === "superadmin") {
      initialRouteName = "TempleSuperAdminHome";
    } else {
      initialRouteName = "TempleHome";
    }
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="TempleSuperAdminHome" component={TempleSuperAdminHome} />
      <Stack.Screen name="AddGod" component={AddGod} />
      <Stack.Screen name="EditGod" component={EditGod} />
      <Stack.Screen name="TemplePanditDetails" component={TemplePanditDetails} />
      <Stack.Screen name="AddPandits" component={AddPandits} />
      <Stack.Screen name="PanditNotifications" component={PanditNotifications} />
      <Stack.Screen name="ShopNotifications" component={ShopNotifications} />
      <Stack.Screen name="TempleHome" component={TempleHome} />
      <Stack.Screen name="OnboardModuleForm">
        {(props) => (
          <OnboardModuleForm 
            {...props} 
            route={{
              params: {
                userId: user?._id,
                redirectTo: "Temple"
              }
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="TempleDetails" component={TempleDetails} />
      <Stack.Screen name="MyTempleProfile" component={MyTempleProfile} />
      <Stack.Screen name="EditProfile" component={TempleEditAdminRegisterScreen} />
      <Stack.Screen name="BottomNavigation" component={BottomNavigation} />
      <Stack.Screen name="EditRoleProfile" component={TempleEditRoleRegisterScreen} />
      <Stack.Screen name="MyProfile" component={MyProfile} />
      <Stack.Screen name="AllProducts" component={AllProductsScreen} />
      
      <Stack.Screen name="EachProduct" component={EachProduct}/>
      <Stack.Screen name="AddShopProduct" component={AddShopProduct}/>
      <Stack.Screen name="EditShopProduct" component={EditShopProduct}/>
      <Stack.Screen name="AddEvents" component={AddEvents}/>
      <Stack.Screen name="AddMembers" component={AddMembers}/>
      <Stack.Screen name="EachMember" component={EachMember}/>
      <Stack.Screen name="EachPandit" component={EachPandit}/>

      <Stack.Screen name="EachShopProfile" component={EachShopProfile}/>
      <Stack.Screen name="EditMember" component={EditMember}/>
      <Stack.Screen name="AddShops" component={AddShops}/>
      <Stack.Screen name="AddTemple" component={AddTemple}/>
      <Stack.Screen name="TempleEvents" component={TempleEvents}/>
      <Stack.Screen name="EditTemple" component={EditTemple}/>
      <Stack.Screen name="EditShop" component={EditShop}/>
      <Stack.Screen name="FilterMenu" component={FilterMenu} />
      <Stack.Screen name="TempleEventsCreate" component={TempleEventsCreate} />
      <Stack.Screen name="TempleEventEdit" component={TempleEventEdit} />
      <Stack.Screen name="TempleNotifications" component={TempleNotifications} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="PanditSpecificTempleList" component={PanditSpecificTempleList} />
      <Stack.Screen name="ChatHome" component={ChatHome} />
    <Stack.Screen name="ChatScreenNew" component={ChatScreenNew} />
    </Stack.Navigator>
  );
};
