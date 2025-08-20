import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardScreen from "../../features/dashboard.screen";
import { JewelleryStackNavigator } from "./jewellery.navigator";
import { TempleStackNavigator } from "./Temple.navigator";
import { SocialMediaStackNavigator } from "./socialMedia.navigator";
import { B2BStackNavigator } from "./B2B.navigator";
import { MatrimonyStackNavigator } from "./matrimony.navigator";
import DashboardSettingsScreen from "../../features/dashboardSettings.screen";
import { CommunityStackNavigator } from "./community.navigator";
import { B2bStackNavigator } from "./B2B.navigator";
import { CareerStackNavigator } from "./Career.navigator";
import ViewProfileScreen from "../../features/viewProfile.screen";
import DashboardNotificationScreen from "../../features/dashboardNotifications.screen";
import CommunityProfileScreen from "../../features/community/communityProfile.screen";
import CommunityRegisterScreen from "../../features/community/communityRegister.screen";
import RequestSent from "../../components/matrimony/RequestSent";
import CommunityMemberScreen from "../../features/community/CommunityMember.screen";
// import Subscription from "../../features/subscription.screen";
import EditProfileDetails from "../../features/EditmyProfile";
import ChangeLanguage from "../../features/ChangeLanguage";
import PrivacyPolicyScreen from "../../features/privacypolicy.screen";
import TermsAndConditions from "../../features/terms&conditions";
import Contactus from "../../features/contactus.screen";
import EventsStackNavigator from "./events.navigator";
import Reportscreen from "../../features/reportissue.screen";
import ChangePassword from "../../features/changePassword";
import MatrimonyVendorsScreen from "../../features/matrimony/MatrimonyEachVendor";
import CommunityMemberProfileScreen from "../../features/community/communityMemberProfile";
import ViewUserScreen from "../../features/viewuser.screen";
import SinglePostScreen from "../../features/Singlepostscreen";
import CommentScreen from "../../components/social/CommentScreen";
import LikeScreen from "../../components/social/LikeScreen";
import MatrimonyViewUser from "../../features/matrimony/matrimonyViewUser.screen";
import ChatHome from "../../features/chat/chat.home";
import ChatScreenNew from "../../features/chat/chat.screen.new";
import { B2CStackNavigator } from "./B2C.navigator";

import OnboardModuleForm from "../../features/OnBoardModuleForm";
import DeleteAccountScreen from "../../features/deleteAccount.screen";

const Stack = createStackNavigator();

export const DashboardNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={DashboardScreen} />
    <Stack.Screen name="Dashboard" component={DashboardScreen} />

    
    <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
    
    <Stack.Screen
      name="DashboardNotification"
      component={DashboardNotificationScreen}
    />
    <Stack.Screen
      name="CommunityMemberProfileScreen"
      component={CommunityMemberProfileScreen}
    />

    <Stack.Screen name="ChatHome" component={ChatHome} />
    <Stack.Screen name="ChatScreenNew" component={ChatScreenNew} />

    <Stack.Screen name="Vendor" component={MatrimonyVendorsScreen} />

    <Stack.Screen name="Event" component={EventsStackNavigator} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
    <Stack.Screen name="ReportScreen" component={Reportscreen} />
    <Stack.Screen name="EditProfileDetails" component={EditProfileDetails} />
    <Stack.Screen name="Contactus" component={Contactus} />
    <Stack.Screen name="Temple" component={TempleStackNavigator} />
    <Stack.Screen name="ChangePassword" component={ChangePassword} />
    <Stack.Screen name="SocialMedia" component={SocialMediaStackNavigator} />
    <Stack.Screen name="Jewellery" component={JewelleryStackNavigator} />
 <Stack.Screen name="OnboardModuleForm" component={OnboardModuleForm} />
    <Stack.Screen name="B2B" component={B2BStackNavigator} />
    <Stack.Screen name="B2C" component={B2CStackNavigator} />
    <Stack.Screen name="Matrimony" component={MatrimonyStackNavigator} />

    <Stack.Screen name="SettingsScreen" component={DashboardSettingsScreen} />

    <Stack.Screen name="RequestSent" component={RequestSent} />
    <Stack.Screen name="CommunityMembers" component={CommunityMemberScreen} />
    <Stack.Screen name="Community" component={CommunityStackNavigator} />

    {/* Notiification destination */}
    <Stack.Screen
      name="ViewUserScreenForNotification"
      component={ViewUserScreen}
    />
    <Stack.Screen name="MatrimonyViewUser" component={MatrimonyViewUser} />
     <Stack.Screen name="ChangeLanguage" component={ChangeLanguage} />

            <Stack.Screen name="ViewSinglePost" component={SinglePostScreen} />
        <Stack.Screen name="CommentScreen" component={CommentScreen} />
        <Stack.Screen name="LikesScreen" component={LikeScreen} />
        <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      </Stack.Navigator>
);
