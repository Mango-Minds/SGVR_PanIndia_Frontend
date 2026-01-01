import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import RegisterScreen from "../../features/matrimony/register.screen";
import Icon from "react-native-vector-icons/SimpleLineIcons";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector } from "react-redux";
import MatrimonyScreen from "../../features/matrimony/matrimony.screen";
import MatrimonyMessageScreen from "../../features/matrimony/matrimonyMessage.screen";
import IconAnt from "react-native-vector-icons/MaterialCommunityIcons";
import MatrimonyChatScreen from "../../features/matrimony/matrimonyChat.screen";
import MatrimonyProfileScreen from "../../features/matrimony/matrimonyProfile.screen";
import MatrimonyActivity from "../../features/matrimony/matrimoyActivity.screen";
import MatrimonySearchScreen from "../../features/matrimony/matrimonySearch.screen";
import MatrimonyViewUser from "../../features/matrimony/matrimonyViewUser.screen";
import RequestSent from "../../components/matrimony/RequestSent";
import MatrimonyEachVendor from "../../features/matrimony/MatrimonyEachVendor";
import Reportscreen from "../../features/reportissue.screen";
import Editmyprofile from "../../features/matrimony/editmyprofile";
import MatrimonyMatch from "../../features/matrimony/matrimony.match";
import MatrimonyVendorsScreen from "../../features/matrimony/matrimonyVendors";
import MatrimonyScreenNew from "../../features/matrimonyNew/matrimonyNew.screen";
import MatrimonyProfileScreenNew from "../../features/matrimonyNew/matrimonyProfileNew.screen";
import MatrimonyProfileVendorNew from "../../features/matrimonyNew/matrimonyProfileVendorNew";
import ForVendor from "../../features/matrimony/ForVendor.screen";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ActivityIndicator } from "react-native";
import DashboardScreen from "../../features/dashboard.screen";
import MyMatrimonyProfile from "../../features/matrimonyNew/matrimonyProfile";
import TempleEditAdminRegisterScreen from "../../features/Temple/EditProfile";
import MatrimonyProfileEdit from "../../features/matrimonyNew/matrimonyProfileEdit";
import OnboardModuleForm from "../../features/OnBoardModuleForm";

import MatrimonyShopProfileEdit from "../../features/matrimonyNew/matrimonyShopProfileEdit";
import MatrimonyProfileWithConnection from "../../features/matrimonyNew/matrimonyShopProfileWithConnection";
import ChatScreenNew from "../../features/chat/chat.screen.new";
import ChatScreen from "../../features/chat/chat.screen";
import EachProfile from "../../features/SocialMediaNew/EachUserProfile.js";
import MatrimonyShopProfile from "../../features/matrimonyNew/matrimonyShopProfile";
import ProfileHeader from "../../features/matrimonyNew/ProfileHeader";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export const MatrimonyStackNavigator = () => {
  const user = useSelector((state) => state.user.user);
  console.log("Matrimony Navigator - logged in user data", user);
  console.log("Matrimony Navigator - isMatrimonyOnboarded:", user?.isMatrimonyOnboarded);
  
  // Determine initial route based on onboarding status
  let initialRouteName = "OnboardModuleForm";
  
  if (user?.isMatrimonyOnboarded === true) {
    initialRouteName = "Main";
  }

  return (
    <Stack.Navigator 
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      {/* Onboarding Screen */}
      <Stack.Screen name="OnboardModuleForm">
        {(props) => (
          <OnboardModuleForm 
            {...props} 
            route={{
              params: {
                userId: user?._id,
                redirectTo: "Matrimony"
              }
            }}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen name="Main" component={MatrimonyScreenNew} />
       {/* <Stack.Screen name="Main" component={MatrimonyNavigator} />  */}
      <Stack.Screen name = "MainHome" component={DashboardScreen}/>
      {/* <Stack.Screen name="MatrimonyChatScreen" component={MatrimonyChatScreen} /> */}
      <Stack.Screen name="MatrimonyProfile" component={MatrimonyProfileScreen} />
      <Stack.Screen name="MatrimonyProfileNew" component={MatrimonyProfileScreenNew} />
      <Stack.Screen name="MatrimonyProfileVendorNew" component={MatrimonyProfileVendorNew} />
      <Stack.Screen name="ForVendor" component={ForVendor} />
      <Stack.Screen name="MyMatrimonyProfile" component={MyMatrimonyProfile} />
      <Stack.Screen name="EditProfile" component={TempleEditAdminRegisterScreen} />
      <Stack.Screen name="MyMatrimonyProfileEdit" component={MatrimonyProfileEdit}/>
      <Stack.Screen name="ReportScreen" component={Reportscreen} />
      <Stack.Screen name="MatrimonyViewUser" component={MatrimonyViewUser} />
      <Stack.Screen name="MatrimonySearchScreen" component={MatrimonySearchScreen} />
      <Stack.Screen name="MatrimonyVendorsScreen" component={MatrimonyVendorsScreen} />
      <Stack.Screen name="ReqSentScreen" component={RequestSent} />
      <Stack.Screen name="MatrimonyMatch" component={MatrimonyMatch} />
      <Stack.Screen name="Vendor" component={MatrimonyEachVendor} />
      <Stack.Screen name="ProfileHeader" component={ProfileHeader} />
      <Stack.Screen name="MatrimonyShopProfile" component={MatrimonyShopProfile} />


      <Stack.Screen name="MatrimonyProfileWithConnection" component={MatrimonyProfileWithConnection}/>
      <Stack.Screen name="ChatScreenNew" component={ChatScreenNew} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="EachProfile" component={EachProfile} />
      <Stack.Screen name="MyMatrimonyShopProfileEdit" component={MatrimonyShopProfileEdit}/>
      
    </Stack.Navigator>
  );
};

// export const MatrimonyNavigator = () => {
//   return (
//     <>
//       <Tab.Navigator
//         screenOptions={{
//           headerShown: false,
//           tabBarActiveTintColor: "#B98C13",
//           tabBarShowLabel: false,
//           tabBarHideOnKeyboard: true,
//         }}
//       >
//         <Tab.Screen
//           name="Home"
//           component={MatrimonyScreenNew}
//           options={{
//             tabBarLabel: "Home",
//             tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
//           }}
//         />

//         <Tab.Screen
//           name="Activity"
//           component={MatrimonyActivity}
//           options={{
//             tabBarLabel: "Activity",
//             tabBarIcon: ({ color, size }) => <Icon name="heart" color={color} size={size} />,
//           }}
//         />

//         <Tab.Screen
//           name="Chat"
//           component={MatrimonyMessageScreen}
//           options={{
//             tabBarLabel: "Chat",
//             tabBarIcon: ({ color, size }) => <IconAnt name="message-outline" color={color} size={size} />,
//           }}
//         />

//         <Tab.Screen
//           name="MyProfile"
//           component={MatrimonyProfileScreen}
//           options={{
//             tabBarLabel: "MyProfile",
//             tabBarIcon: ({ color, size }) => <FontAwesome name="user-o" color={color} size={size} />,
//           }}
//         />
//       </Tab.Navigator>
//     </>
//   );
// };
