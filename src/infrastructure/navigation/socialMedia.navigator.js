import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import SocialScreen from "../../features/social.screen";
import NotificationScreen from "../../components/notification/NotificationScreen";
import SearchScreen from "../../components/social/SearchScreen";
import Icon from "react-native-vector-icons/SimpleLineIcons";
import IconAnt from "react-native-vector-icons/AntDesign";
import CreatePostScreen from "../../features/createpost.screen";
import ProfileScreen from "../../features/profile.screen";
// import EditProfileScreen from "../../features/editprofile.screen";
// import SettingScreen from "../../features/settings.screen";
import CommentScreen from "../../components/social/CommentScreen";
import PhotosScreen from "../../components/photos/PhotosScreen";
import MessageScreen from "../../components/social/MessageScreen";
import SinglePostScreen from "../../features/Singlepostscreen";
import NewMessageScreen from "../../components/social/NewMessageScreen";
import Reportscreen from "../../features/reportissue.screen";
import { createStackNavigator } from "@react-navigation/stack";
import LikeScreen from "../../components/social/LikeScreen";
import ChatScreen from "../../features/chat/chat.screen";
import ViewUserScreen from "../../features/viewuser.screen";
import CreateTimelineScreen from "../../features/createTimeline.screen";
import LocationScreen from "../../components/social/LocationScreen";
import PostCreated from "../../features/SocialMedia/PostCreated.screen";
import MessageScreenNew from "../../features/SocialMediaNew/MessageScreenNew.jsx";

import BottomNavigation from "../../features/SocialMediaNew/new.social.screen.js";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Badge } from "react-native-paper";
import { TempleStackNavigator } from "./Temple.navigator";
import DashboardScreen from "../../features/dashboard.screen.js";
import ProfileNewScreen from "../../features/SocialMediaNew/ProfileScreen.js";

// import EditProfileNewScreen from "../../features/SocialMediaNew/EditProfile.js";

import SocialHomeScreen from "../../features/SocialMediaNew/new.social.screen.js";

import CreateNewPost from "../../features/SocialMediaNew/CreateNewPost.js";
import EachProfile from "../../features/SocialMediaNew/EachUserProfile.js";
import NewSocialCard from "../../features/SocialMediaNew/NewSocialCard.jsx";
import SearchResults from "../../features/SocialMediaNew/SearchResults.js";
import MyNetwork from "../../features/SocialMediaNew/MyNetwork.js";
import NotificationsScreen from "../../features/SocialMediaNew/Notifications.js";
import RepostWithThoughts from "../../features/SocialMediaNew/Repost.js";

import SocialJobs from "../../features/SocialMediaNew/SocialJobs.js";
import ViewJobPost from "../../features/SocialMediaNew/ViewJobPost.js";
import CreateNewJob from "../../features/SocialMediaNew/CreateNewJob.js";
import EditUserProfile from "../../features/SocialMediaNew/EditProfile.js";
import EditPost from "../../features/SocialMediaNew/EditPost.js";
import EditProfileInfo from "../../features/SocialMediaNew/EditProfileInfo.js";
import EditUserEducationInfo from "../../features/SocialMediaNew/EditAboutEducation.js";
import EditJobPost from "../../features/SocialMediaNew/EditJobPost.js";
import JobApplicantForRecruiter from "../../features/SocialMediaNew/JobApplicantForRecruiter.js";
import FollowersFollowing from "../../features/SocialMediaNew/FollowersFollowing.js";
import MomentViewer from "../../features/SocialMediaNew/MomentViewer.js";

const Tab = createBottomTabNavigator();

const Stack = createStackNavigator();

export const SocialMediaStackNavigator = () => (
  <Stack.Navigator   screenOptions={{ headerShown: false, gestureEnabled: true }} >
    {/* <Stack.Screen name="MainNew" component={BottomNavigation} /> */}
         <Stack.Screen name="SocialHomeScreen" component={SocialHomeScreen} options={{gestureEnabled: true}} />
   
    <Stack.Screen name="Main" component={SocialMediaNavigator} />
    <Stack.Screen name="Dashboard" component={DashboardScreen} />

    <Stack.Screen name="SearchResults" component={SearchResults} />

    <Stack.Screen name="MessageScreenNew" component={MessageScreenNew} />
    <Stack.Screen name="CommentScreen" component={CommentScreen} />
    <Stack.Screen name="MessageScreen" component={MessageScreen} />
    <Stack.Screen name="NewMessageScreen" component={NewMessageScreen} />
    <Stack.Screen name="ChatScreen" component={ChatScreen} />
    <Stack.Screen name="EditJob" component={EditJobPost} />
    <Stack.Screen name="PhotoPreviewScreen" component={PhotosScreen} />
    <Stack.Screen name="Temple" component={TempleStackNavigator} />
    <Stack.Screen name="LikesScreen" component={LikeScreen} />
    <Stack.Screen name="ReportScreen" component={Reportscreen} />
    <Stack.Screen
      name="JobApplicantForRecruiter"
      component={JobApplicantForRecruiter}
    />
    <Stack.Screen name="ViewUserScreen" component={ViewUserScreen} />
    <Stack.Screen name="MainHome" component={DashboardScreen} />
    <Stack.Screen
      name="CreateTimelineScreen"
      component={CreateTimelineScreen}
    />
    <Stack.Screen name="AddLocationScreen" component={LocationScreen} />
    <Stack.Screen name="PostCreated" component={PostCreated} />
    <Stack.Screen name="MyNetwork" component={MyNetwork} />
    <Stack.Screen name="ProfileNewScreen" component={ProfileNewScreen} />
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditUserProfile} />
    <Stack.Screen name="EditUserProfile" component={EditUserProfile} />
    <Stack.Screen name="CreateNewPost" component={CreateNewPost} />
    <Stack.Screen name="SocialJobs" component={SocialJobs} />
    <Stack.Screen name="ViewJobPost" component={ViewJobPost} />
    <Stack.Screen name="CreateNewJob" component={CreateNewJob} />
    <Stack.Screen name="EditPost" component={EditPost} />
    <Stack.Screen name="EditProfileInfo" component={EditProfileInfo} />
    <Stack.Screen name="EachProfile" component={EachProfile} />
    <Stack.Screen name="NewSocialCard" component={NewSocialCard} />
    <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
    <Stack.Screen name="RepostWithThoughts" component={RepostWithThoughts} />
    <Stack.Screen
      name="EditUserEducationInfo"
      component={EditUserEducationInfo}
    />
    <Stack.Screen name="FollowersFollowing" component={FollowersFollowing} />
    <Stack.Screen name="MomentViewer" component={MomentViewer} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export const SocialMediaNavigator = () => {
  const { notification } = useSelector((state) => state.user);
  const [socialBellIcon, setSocialBellIcon] = React.useState(0);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    queryClient.invalidateQueries("socialScreenNotification");
  }, []);

  React.useEffect(() => {
    let count = 0;
    for (let i = 0; i < notification.meetup.length; i++) {
      const item = notification.meetup[i];
      if (item.isRead === false) {
        count++;
      } else {
        setSocialBellIcon(count);
        break;
      }
      if (i === notification.meetup.length - 1) {
        setSocialBellIcon(count);
      }
    }
  }, [notification]);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#B98C13",
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tab.Screen
          name="Home"
          component={SocialScreen}
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" color={color} size={size} />
            ),
          }}
          listeners={{
            tabPress: () => {
              console.log("Screen");
            },
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarLabel: "Search",
            tabBarIcon: ({ color, size }) => (
              <IconAnt name="search1" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Create"
          component={CreatePostScreen}
          options={{
            tabBarLabel: "Create",
            tabBarIcon: ({ color, size }) => (
              <Icon name="plus" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Notification"
          component={NotificationScreen}
          options={{
            tabBarLabel: "NotificationScreen",
            tabBarIcon: ({ color, size }) => (
              <>
                <Icon name="bell" color={color} size={size} />
                {socialBellIcon > 0 && (
                  <Badge
                    style={{
                      position: "absolute",
                      // marginLeft: -10,
                      right: 25,
                      top: 5,
                      fontSize: 10,
                      // marginTop: 0,
                      fontWeight: "bold",
                      backgroundColor: "#D80808",
                    }}
                    size={15}
                  >
                    {socialBellIcon}
                  </Badge>
                )}
              </>
            ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: "Profile",
            tabBarIcon: ({ color, size }) => (
              <IconAnt name="user" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};
