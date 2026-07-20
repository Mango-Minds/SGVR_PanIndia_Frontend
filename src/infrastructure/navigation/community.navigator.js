import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CommunitySearchScreen from "../../features/community/communitySearch.screen";
import CommunityRegisterScreen from "../../features/community/communityRegister.screen";
import CommunityHomeScreen from "../../features/community/communityHome.screen";
import CommunityMyProfileScreen from "../../features/community/communityMyProfile.screen";
import CommunityProfileScreen from "../../features/community/communityProfile.screen";
import RequestSent from "../../components/matrimony/RequestSent";
import CommunityMemberScreen from "../../features/community/CommunityMember.screen";
import Reportscreen from "../../features/reportissue.screen";
import CommunityMemberProfileScreen from "../../features/community/communityMemberProfile";
import EventsStackNavigator from "./events.navigator";
import CommunityNotifications from "../../features/community/CommunityNotifications";
import CommunitySearchScreenNew from "../../features/communityNew/communitySearchNew.screen";
import CommunityProfileScreenNew from "../../features/communityNew/communityProfileNew.screen";
import DashboardScreen from "../../features/dashboard.screen";
const Stack = createStackNavigator();

export const CommunityStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainNew" component={CommunitySearchScreenNew}/>
    <Stack.Screen name="Main" component={CommunitySearchScreen} />
    <Stack.Screen name="CommunityProfileNew" component={CommunityProfileScreenNew} />
    <Stack.Screen name="CommunityProfile" component={CommunityProfileScreen} />
    <Stack.Screen name="Event" component={EventsStackNavigator} />
    <Stack.Screen name="Register" component={CommunityRegisterScreen} />
    <Stack.Screen
      name="CommunityMemberProfileScreen"
      component={CommunityMemberProfileScreen}
    />
    <Stack.Screen name="MainHome" component={DashboardScreen} />
    {/* <Stack.Screen name="Homepage" component={CommunityHomeScreen} /> */}
    <Stack.Screen name="MyProfile" component={CommunityMyProfileScreen} />
    <Stack.Screen name="ReportScreen" component={Reportscreen} />
    <Stack.Screen name="RequestSent" component={RequestSent} />
    <Stack.Screen name="CommunityMembers" component={CommunityMemberScreen} />
    <Stack.Screen
      name="CommunityNotifications"
      component={CommunityNotifications}
    />
  </Stack.Navigator>
);
