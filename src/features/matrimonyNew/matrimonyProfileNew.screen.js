import React, { useState, useEffect } from "react";
import {
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useSelector } from "react-redux";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";

import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import UserImg from "../../assets/images/general/user.png";
import { Alert } from "react-native";
import { decode } from "base-64";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { sendConnectionRequest, fetchConnectionRequests, checkConnectionStatus, fetchMatrimonyUserProfile } from "./matrimonyAPIs";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
export default function MatrimonyProfileNew({ route, navigation }) {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.user);
  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));


  // Helper function to format date of birth
  const formatDateOfBirth = (dateString) => {
    if (!dateString) return 'Not specified';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Not specified';
    }
  };
  const userTypes = user?.userType || [];
  const userType = userTypes.includes("matrimonyMan") ? "matrimonyMan" : 
                   userTypes.includes("matrimonyWoman") ? "matrimonyWoman" : 
                   userTypes[0];
  console.log("User Type in connections: ", userType);
  console.log("UserTypes array: ", userTypes);
  const { groomsData } = route.params;
  console.log("GroomsData in new Screen: ", groomsData);
  const [modalVisible, setModalVisible] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [requestStatus, setRequestStatus] = useState('none'); // 'none', 'pending', 'accepted', 'rejected'
  const [matrimonyData, setMatrimonyData] = useState(route.params?.matrimonyData || {});
  const [viewerState, setViewerState] = useState({
    showViewer: false,
    currentIndex: 0,
    modelImages: [
      {
        url: matrimonyData?.image || UserImg,
        props: { style: { width: "100%", height: "100%" } },
      },
    ],
  });

  // Check if current user is the owner of this profile
  const isOwner = () => {
    const currentUserId = user?._id || decodedPayload?.id;
    const profileOwnerId = matrimonyData?.owner?._id || matrimonyData?.owner;
    return currentUserId === profileOwnerId;
  };

  // Handle message navigation for connected users
  const handleMessagePress = () => {
    const currentUserId = user?._id || decodedPayload?.id;
    const targetUserId = matrimonyData?.owner?._id || matrimonyData?.owner;
    
    // Get the target user's name - try multiple sources
    let targetUserName = '';
    if (matrimonyData?.name) {
      // Use the profile name if available
      targetUserName = matrimonyData.name;
    } else if (matrimonyData?.owner?.firstName || matrimonyData?.owner?.lastName) {
      // Fall back to owner's first and last name
      targetUserName = `${matrimonyData?.owner?.firstName || ''} ${matrimonyData?.owner?.lastName || ''}`.trim();
    } else {
      // Final fallback
      targetUserName = 'User';
    }
    
    // Generate conversation ID from current user and target user
    const conversationId = [currentUserId, targetUserId].sort().join('_');
    
    // Navigate to chat screen with the target user's information
    navigation.navigate("ChatScreen", {
      toid: targetUserId,
      toName: targetUserName,
      index: 0, // Default index for new chat
      conversationId: conversationId, // Pass the conversation ID
    });
  };

  const dateToText = (manDate) => {
    const date = new Date(manDate);

    // Get month names
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Get day with ordinal suffix (e.g., 1st, 2nd, 3rd, 4th, etc.)
    const day = date.getDate();
    const ordinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th"; // for 11th to 19th
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    const dayWithSuffix = day + ordinalSuffix(day);

    const month = months[date.getMonth()]; // Get month name from the array
    const year = date.getFullYear(); // Get the full year

    return `${month} ${dayWithSuffix}, ${year}`;
  };

  const [clickedButton, setClickedButton] = useState("ABOUT");
  const handleButtonPress = (buttonName) => {
    setClickedButton(buttonName);
  };

  console.log(matrimonyData);
  const renderContent = () => {
    switch (clickedButton) {
      case "ABOUT":
        return (
          <View style={styles.about}>
            <View style={styles.aboutContent1}>
              <Text style={styles.aboutLabel1}>{t('matrimony.bio')}</Text>
              <Text style={styles.aboutText1}>
                {matrimonyData?.aboutMe || ''}
              </Text>
            </View>

            {matrimonyData?.socials?.visible && (
              <View style={styles.aboutContent2}>
                <Text style={styles.aboutLabel2}>{t('matrimony.reachMeAt')}</Text>
                <View style={{ flexDirection: "row" }}>
                  <Link to={`/${matrimonyData?.socials?.instagram || ''}`}>
                    <IconButton icon="instagram" />
                  </Link>
                  <Link to={`/${matrimonyData?.socials?.linkedin || ''}`}>
                    <IconButton icon="linkedin" />
                  </Link>
                  <Link to={`/${matrimonyData?.socials?.whatsapp || ''}`}>
                    <IconButton icon="whatsapp" />
                  </Link>
                </View>
              </View>
            )}

            <View style={styles.aboutContent3}>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.aboutLabel3}>{t('matrimony.website')}</Text>
                <Text style={styles.aboutText3}>
                  {matrimonyData?.email || ''}
                </Text>
              </View>

              <View style={{ flexDirection: "row" }}>
                <Text style={styles.aboutLabel3}>{t('matrimony.contact')}</Text>
                <Text style={styles.aboutText3}>
                  {matrimonyData?.phone || ''}
                </Text>
              </View>
            </View>
          </View>
        );
      case "WORK":
        return (
          <View style={styles.work}>
            <View style={styles.work1}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  paddingHorizontal: 10,
                  paddingTop: 10,
                }}
              >
                {t('matrimony.title')}
              </Text>
              <Text style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                {matrimonyData?.occupation || ''}
              </Text>

              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  paddingHorizontal: 10,
                  paddingTop: 10,
                }}
              >
               {t('matrimony.description')}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  paddingHorizontal: 10,
                  paddingBottom: 10,
                }}
              >
                {matrimonyData?.occupation || 'No occupation provided'}.
              </Text>
            </View>
          </View>
        );
      case "ACTIVITY":
        return (
          <View style={styles.work}>
            <View style={styles.work1}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  paddingHorizontal: 10,
                  paddingTop: 10,
                }}
              >
                {t('matrimony.activity')}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  paddingHorizontal: 10,
                  paddingBottom: 10,
                }}
              >
                {matrimonyData?.hobbies?.join(", ") || 'No hobbies listed'}
              </Text>
            </View>
          </View>
        );
      case "PERSONAL":
        return (
          <View style={styles.personalInfo}>
            <View style={styles.personalInfoContent}>
              <Text style={styles.personalInfoTitle}>Personal Information</Text>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Caste</Text>
                  <Text style={styles.infoValue}>
                    {matrimonyData?.caste?.type || matrimonyData?.subcaste || 'Not specified'}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gothra</Text>
                  <Text style={styles.infoValue}>
                    {matrimonyData?.gothra || 'Not specified'}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Family Type</Text>
                  <Text style={styles.infoValue}>
                    {matrimonyData?.familyType || 'Not specified'}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Family Status</Text>
                  <Text style={styles.infoValue}>
                    {matrimonyData?.familyStatus || 'Not specified'}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Work Location</Text>
                  <Text style={styles.infoValue}>
                    {matrimonyData?.workLocation || 'Not specified'}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Height</Text>
                  <Text style={styles.infoValue}>
                    {matrimonyData?.height ? `${matrimonyData.height} cm` : 'Not specified'}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Marital Status</Text>
                  <Text style={styles.infoValue}>
                    {matrimonyData?.maritalStatus || 'Not specified'}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Home Town</Text>
                  <Text style={styles.infoValue}>
                    {matrimonyData?.homeTown || 'Not specified'}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Highest Education</Text>
                  <Text style={styles.infoValue}>
                    {matrimonyData?.highestEducation || 'Not specified'}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Employed In</Text>
                  <Text style={styles.infoValue}>
                    {matrimonyData?.employedIn || 'Not specified'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.about}>
            <View style={styles.aboutContent1}>
              <Text style={styles.aboutLabel1}>{t('matrimony.bio')}</Text>
              <Text style={styles.aboutText1}>
                {matrimonyData?.aboutMe || ''}
              </Text>
            </View>

            {matrimonyData?.socials?.visible && (
              <View style={styles.aboutContent2}>
                <Text style={styles.aboutLabel2}>{t('matrimony.reachMeAt')}</Text>
                <View style={{ flexDirection: "row" }}>
                  <Link to={`/${matrimonyData?.socials?.instagram || ''}`}>
                    <IconButton icon="instagram" />
                  </Link>
                  <Link to={`/${matrimonyData?.socials?.linkedin || ''}`}>
                    <IconButton icon="linkedin" />
                  </Link>
                  <Link to={`/${matrimonyData?.socials?.whatsapp || ''}`}>
                    <IconButton icon="whatsapp" />
                  </Link>
                </View>
              </View>
            )}

            <View style={styles.aboutContent3}>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.aboutLabel3}>{t('matrimony.website')}</Text>
                <Text style={styles.aboutText3}>
                  {matrimonyData?.email || ''}
                </Text>
              </View>

              <View style={{ flexDirection: "row" }}>
                <Text style={styles.aboutLabel3}>{t('matrimony.contact')}</Text>
                <Text style={styles.aboutText3}>
                  {matrimonyData?.phone || ''}
                </Text>
              </View>
            </View>
          </View>
        );
    }
  };

  const receiverId = matrimonyData._id;
  const senderId = user?.roleData?.MatrimonyUser?._id;

  // Check if a request has already been sent to this user or if they are already connected
  const checkRequestStatus = async () => {
    try {
      // First, check if users are already connected
      const connectionData = await checkConnectionStatus(senderId, receiverId);
      
      if (connectionData.isConnected) {
        setRequestStatus('accepted');
        setIsRequestSent(true);
        return;
      }
      
      // If not connected, check for pending requests
      const data = await fetchConnectionRequests(senderId);
      const sentRequests = data.sentRequests || [];
      
      // Check if there's a pending request to this specific user
      const existingRequest = sentRequests.find(request => {
        const requestReceiverId = request.receiver?._id || request.receiver;
        return requestReceiverId === receiverId;
      });
      
      if (existingRequest) {
        setRequestStatus(existingRequest.status);
        setIsRequestSent(true);
      } else {
        setRequestStatus('none');
        setIsRequestSent(false);
      }
    } catch (error) {
      console.error("Error checking request status:", error);
    }
  };

  // Check request status when component mounts
  useEffect(() => {
    if (senderId && receiverId) {
      checkRequestStatus();
    }
  }, [senderId, receiverId]);

  // Update viewerState when matrimonyData changes
  useEffect(() => {
    setViewerState(prevState => ({
      ...prevState,
      modelImages: [
        {
          url: matrimonyData?.image || UserImg,
          props: { style: { width: "100%", height: "100%" } },
        },
      ],
    }));
  }, [matrimonyData]);

  // Refresh matrimony data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshMatrimonyData = async () => {
        try {
          // Get the user ID from the matrimony data
          const userId = matrimonyData?.owner?._id || matrimonyData?.owner;
          if (userId) {
            const updatedData = await fetchMatrimonyUserProfile(userId);
            const updatedMatrimonyData = updatedData.user.roleData?.MatrimonyUser || updatedData.user.roleData?.MatrimonyVendor;
            if (updatedMatrimonyData) {
              setMatrimonyData(updatedMatrimonyData);
            }
          }
        } catch (error) {
          console.error("Error refreshing matrimony data:", error);
        }
      };

      refreshMatrimonyData();
    }, [matrimonyData?.owner?._id || matrimonyData?.owner])
  );

  const handleConnect = async () => {
    if (isRequestSent) {
      Alert.alert(
        t('matrimony.alreadySent'),
        t('matrimony.alreadySentMsg')
      );
      return;
    }

    try {
     

      console.log("Rec ID:", receiverId);
      console.log("Sender id:", senderId);
      console.log("usertype:", userType);

      const payload = {
        senderId: senderId?.trim(),
        receiverId: receiverId?.trim(),
        createdBy: userType,
      };
      console.log("Sending:", payload);
      
      const response = await sendConnectionRequest(payload);

    //   if (response.status === 200 || response.status === 201) {
    //     setIsRequestSent(true);
    //     Alert.alert("Success", "Connection request sent successfully", [
    //       { text: "OK" },
    //     ]);
    //   } else {
    //     console.error("Failed to send connection request", response);
    //   }
    // }  catch (error) {
    //   if (error.response) {
    //     console.error("Backend response error:", error.response.data);
    //     Alert.alert(
    //       "Error",
    //       error.response.data?.message || "Something went wrong while sending request."
    //     );
    //   } else {
    //     console.error("Error connecting to user:", error);
    //     Alert.alert("Error", "Unable to send connection request.");
    //   }
    // }



    if (response.status === 200 || response.status === 201) {
        setIsRequestSent(true);
        setRequestStatus('pending');
        Alert.alert(t("success_msg"), t("message"), [
          { text: t('ok') },
        ]);
      } else {
        console.error(t("fail_msg"), response);
      }
    }  catch (error) {
      if (error.response) {
        console.error(t('backend_error'), error.response.data);
        Alert.alert(
          t('error'),
          error.response.data?.message || t('wrong_error')
        );
      } else {
        console.error(t('connect_error'), error);
        Alert.alert(t('error'), t('unable_error'));
      }
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.headerImageContainer}>
          <Image
            source={
              matrimonyData?.images && matrimonyData?.images.length > 0
                ? {
                    uri: `${matrimonyData?.images[0]}`,
                  }
                : UserImg
            }
            style={styles.headerImage}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradientOverlay}
          />
          <View style={styles.headerButtonsContainer}>
            <TouchableOpacity style={styles.backButton}>
              <IconButton icon="arrow-left" onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate("MatrimonyNew");
                }
              }} />
            </TouchableOpacity>
            {isOwner() && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  navigation.navigate("MyMatrimonyProfileEdit", {
                    user_details: matrimonyData,
                  });
                }}
              >
                <MaterialIcon name="edit" size={20} color="white" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.eventInfoContainer}>
          <View style={styles.nameAndLocationContainer}>
            <Text style={styles.headerTitle}>
              {matrimonyData?.name || ''}
            </Text>
            <View style={styles.locationContainer}>
              <MaterialIcon name="location-on" size={18} color={Theme.themeColor} />
              <Text style={styles.homeTown}>
                {matrimonyData?.homeTown || ''}
              </Text>
            </View>
          </View>

          <View style={styles.eventDetails}>
            <Text style={styles.detailItem}>
              {dateToText(matrimonyData?.dateOfBirth)} |{" "}
              {matrimonyData?.occupation || ''}
            </Text>
          </View>
        </View>

        <View style={styles.eventInfoContainer}>
          <View style={styles.eventDetails}>
            <Text style={styles.priceText}>{t('matrimony.bio')}</Text>
            <Text style={styles.bioText}>
              {matrimonyData?.aboutMe || 'No bio information provided'}
            </Text>
          </View>
        </View>

        <View style={styles.eventInfoContainer}>
          <View style={styles.eventDetails}>
            <Text style={styles.priceText}>{t('matrimony.personalInfo')}</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('matrimony.caste')}</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.caste?.type || matrimonyData?.subcaste || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('matrimony.gothra')}</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.gothra || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('matrimony.familyType')}</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.familyType || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('matrimony.familyStatus')}</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.familyStatus || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('matrimony.workLocation')}</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.workLocation || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('matrimony.height')}</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.height ? `${matrimonyData.height} cm` : 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('matrimony.maritalStatus')}</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.maritalStatus || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('matrimony.hobbies')}</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.hobbies?.length > 0 ? matrimonyData.hobbies.join(", ") : 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Home Town</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.homeTown || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Highest Education</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.highestEducation || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Employed In</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.employedIn || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dosh</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.dosh || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Family Values</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.familyValues || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Languages</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.languages?.length > 0 ? 
                  matrimonyData.languages.map(lang => 
                    typeof lang === 'string' ? lang : `${lang.language} (${lang.languageProficiency})`
                  ).join(", ") : 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Annual Income</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.Annualincome?.salary ? `₹${matrimonyData.Annualincome.salary} LPA` : 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.age ? `${matrimonyData.age} years` : 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>
                {matrimonyData?.gender ? matrimonyData.gender.charAt(0).toUpperCase() + matrimonyData.gender.slice(1) : 'Not specified'}
              </Text>
            </View>

           
          </View>
        </View>

        <View style={styles.eventInfoContainer}>
          <View style={styles.eventDetails}>
            <Text style={styles.priceText}>Contact Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>
                {user?.email || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>
                {user?.phone || 'Not specified'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>
                {formatDateOfBirth(matrimonyData?.dateOfBirth)}
              </Text>
            </View>
          </View>
        </View>

        {matrimonyData?.socials?.visible && (
          <View style={styles.eventInfoContainer}>
            <View style={styles.eventDetails}>
              <Text style={styles.priceText}>Social Media</Text>
              
              {matrimonyData?.socials?.instagram && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Instagram</Text>
                  <Text style={styles.infoValue}>
                    @{matrimonyData.socials.instagram}
                  </Text>
                </View>
              )}
              {matrimonyData?.socials?.linkedin && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>LinkedIn</Text>
                  <Text style={styles.infoValue}>
                    {matrimonyData.socials.linkedin}
                  </Text>
                </View>
              )}
              {matrimonyData?.socials?.whatsapp && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>WhatsApp</Text>
                  <Text style={styles.infoValue}>
                    {matrimonyData.socials.whatsapp}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

{console.log("Sender id: ", senderId)}
{console.log("Rec id: ", receiverId)}


      {senderId !== receiverId && (
        <View style={styles.bottomBarContainer}>
          <View style={styles.bottomBar}>
            <View style={styles.ticketInfoContainer}>
              <Text style={styles.priceText}>{t('matrimony.interested')}</Text>

              {requestStatus === 'accepted' ? (
                // Show message button for connected users
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={handleMessagePress}
                >
                  <Icon name="chatbubble-outline" size={20} color="#fff" style={styles.messageIcon} />
                  <Text style={styles.messageButtonText}>{t('matrimony.message')}</Text>
                </TouchableOpacity>
              ) : (
                // Show connection button for non-connected users
                <TouchableOpacity
                  style={[
                    styles.bookNowButton,
                    requestStatus === 'pending' && styles.pendingButton,
                    requestStatus === 'rejected' && styles.rejectedButton
                  ]}
                  onPress={() => {
                    if (requestStatus === 'pending') {
                      Alert.alert(
                        t('matrimony.requestPending'),
                        t('matrimony.requestPendingMsg')
                      );
                      return;
                    }
                    if (requestStatus === 'rejected') {
                      Alert.alert(
                        t('matrimony.requestRejected'),
                        t('matrimony.requestRejectedMsg')
                      );
                      return;
                    }
                    handleConnect(senderId, receiverId, userType);
                  }}
                >
                  <Text style={[
                    styles.bookNowButtonText,
                    requestStatus === 'pending' && styles.pendingButtonText,
                    requestStatus === 'rejected' && styles.rejectedButtonText
                  ]}>
                    {requestStatus === 'pending' ? t('matrimony.waitingForApproval') :
                     requestStatus === 'rejected' ? t('matrimony.requestRejected') :
                     t('matrimony.sendRequest')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  headerImageContainer: {
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: 400,
  },
  gradientOverlay: {
    position: "",
    top: "20px",
    left: 0,
    right: 0,
    bottom: "150px",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: Theme.themeColor,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: "white",
    paddingVertical: 5,
    paddingHorizontal: 10,
    bottom: 10,
  },
  headerButtonsContainer: {
    position: "absolute",
    top: 40,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    // Remove absolute positioning since it's now in a flex container
  },
  editButton: {
    backgroundColor: Theme.themeColor,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    color: "white",
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "500",
  },
  headerTitle: {
    bottom: 10,
    left: 0,
    color: Theme.themeColor,
    fontSize: 26,
    fontWeight: "bold",
  },
  contact: {
    fontSize: 13,
    fontWeight: "400",
    color: "#1C1C1C",
    marginLeft: 10,
    lineHeight: 20,
  },
  homeTown: {
    fontSize: 13,
    fontWeight: "400",
    color: Theme.themeColor,
    marginLeft: 5,
    lineHeight: 20,
  },
  nameAndLocationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventInfoContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
    fontFamily: "Courier New",
    padding: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  interestedText: {
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
  },
  interestedButton: {
    borderWidth: 1,
    borderColor: "#f44336",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  interestedButtonText: {
    color: "#f44336",
    fontWeight: "bold",
  },
  eventDetails: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  detailIcon: {
    marginRight: 10,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
  },

  ticketInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "white",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 10,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  phoneDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 5,
  },
  fillingFast: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
  bookNowButton: {
    backgroundColor: Theme.themeColor,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  bookNowButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  pendingButton: {
    backgroundColor: "#D4AF37", // Yellow-gold for pending
  },
  acceptedButton: {
    backgroundColor: "#28A745", // Green for accepted
  },
  rejectedButton: {
    backgroundColor: "#DC3545", // Red for rejected
  },
  pendingButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  acceptedButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  rejectedButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 2,
  },
  hobbiesContainer: {
    marginTop: 10,
  },
  bottomBarContainer: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  hobbiesHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: Theme.themeColor,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    padding: 5,
    margin: 2,
  },
  tagText: {
    color: "#fff",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 16,
    color: "black",
    width: 150,
  },
  infoValue: {
    fontSize: 16,
    color: "grey",
    flex: 1,
  },
  personalInfo: {
    backgroundColor: "white",
    margin: 10,
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  personalInfoContent: {
    padding: 10,
  },
  personalInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  infoGrid: {
    flexDirection: "column",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  messageButton: {
    backgroundColor: Theme.themeColor,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageIcon: {
    marginRight: 8,
  },
  messageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});







// import React, { useState, useEffect } from "react";
// import {
//   Image,
//   Text,
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
//   Modal,
//   Dimensions,
//   ScrollView,
//   SafeAreaView,
// } from "react-native";
// import { useSelector } from "react-redux";
// import Theme from "../../styles/theme";
// import { IconButton } from "react-native-paper";

// import MaterialIcon from "react-native-vector-icons/MaterialIcons";
// import UserImg from "../../assets/images/general/user.png";
// import { Alert } from "react-native";
// import { decode } from "base-64";
// import { LinearGradient } from "expo-linear-gradient";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import apiClient from "../../store/apiClient";
// import { sendConnectionRequest } from "./matrimonyAPIs";
// export default function MatrimonyProfileNew({ route, navigation }) {
//   const { user } = useSelector((state) => state.user);
//   const token = useSelector((state) => state.user.token);
//   const tokenPayload = token.split(".")[1];
//   const decodedPayload = JSON.parse(decode(tokenPayload));
//   const userType = decodedPayload.userType;
//   console.log("User Type: ", userType);
//   const { groomsData } = route.params;
//   console.log("GroomsData in new Screen: ", groomsData);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [isRequestSent, setIsRequestSent] = useState(false);
//   const [viewerState, setViewerState] = useState({
//     showViewer: false,
//     currentIndex: 0,
//     modelImages: [
//       {
//         url: matrimonyData.image,
//         props: { style: { width: "100%", height: "100%" } },
//       },
//     ],
//   });

//   const dateToText = (manDate) => {
//     const date = new Date(manDate);

//     // Get month names
//     const months = [
//       "January",
//       "February",
//       "March",
//       "April",
//       "May",
//       "June",
//       "July",
//       "August",
//       "September",
//       "October",
//       "November",
//       "December",
//     ];

//     // Get day with ordinal suffix (e.g., 1st, 2nd, 3rd, 4th, etc.)
//     const day = date.getDate();
//     const ordinalSuffix = (day) => {
//       if (day > 3 && day < 21) return "th"; // for 11th to 19th
//       switch (day % 10) {
//         case 1:
//           return "st";
//         case 2:
//           return "nd";
//         case 3:
//           return "rd";
//         default:
//           return "th";
//       }
//     };

//     const dayWithSuffix = day + ordinalSuffix(day);

//     const month = months[date.getMonth()]; // Get month name from the array
//     const year = date.getFullYear(); // Get the full year

//     return `${month} ${dayWithSuffix}, ${year}`;
//   };

//   const [clickedButton, setClickedButton] = useState("ABOUT");
//   const handleButtonPress = (buttonName) => {
//     setClickedButton(buttonName);
//   };

//   console.log(matrimonyData);
//   const renderContent = () => {
//     switch (clickedButton) {
//       case "ABOUT":
//         return (
//           <View style={styles.about}>
//             <View style={styles.aboutContent1}>
//               <Text style={styles.aboutLabel1}>BIO</Text>
//               <Text style={styles.aboutText1}>
//                 {matrimonyData?.aboutMe || ''}
//               </Text>
//             </View>

//             {matrimonyData?.socials?.visible && (
//               <View style={styles.aboutContent2}>
//                 <Text style={styles.aboutLabel2}>REACH ME AT</Text>
//                 <View style={{ flexDirection: "row" }}>
//                   <Link to={`/${matrimonyData?.socials?.instagram || ''}`}>
//                     <IconButton icon="instagram" />
//                   </Link>
//                   <Link to={`/${matrimonyData?.socials?.linkedin || ''}`}>
//                     <IconButton icon="linkedin" />
//                   </Link>
//                   <Link to={`/${matrimonyData?.socials?.whatsapp || ''}`}>
//                     <IconButton icon="whatsapp" />
//                   </Link>
//                 </View>
//               </View>
//             )}

//             <View style={styles.aboutContent3}>
//               <View style={{ flexDirection: "row" }}>
//                 <Text style={styles.aboutLabel3}>WEBSITE</Text>
//                 <Text style={styles.aboutText3}>
//                   {matrimonyData?.email || ''}
//                 </Text>
//               </View>

//               <View style={{ flexDirection: "row" }}>
//                 <Text style={styles.aboutLabel3}>CONTACT</Text>
//                 <Text style={styles.aboutText3}>
//                   {matrimonyData?.phone || ''}
//                 </Text>
//               </View>
//             </View>
//           </View>
//         );
//       case "WORK":
//         return (
//           <View style={styles.work}>
//             <View style={styles.work1}>
//               <Text
//                 style={{
//                   fontWeight: "bold",
//                   fontSize: 16,
//                   paddingHorizontal: 10,
//                   paddingTop: 10,
//                 }}
//               >
//                 TITLE
//               </Text>
//               <Text style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
//                 {matrimonyData?.occupation || ''}
//               </Text>

//               <Text
//                 style={{
//                   fontWeight: "bold",
//                   fontSize: 16,
//                   paddingHorizontal: 10,
//                   paddingTop: 10,
//                 }}
//               >
//                 DESCRIPTION
//               </Text>
//               <Text
//                 style={{
//                   fontSize: 14,
//                   paddingHorizontal: 10,
//                   paddingBottom: 10,
//                 }}
//               >
//                 {matrimonyData?.occupation || ''Description}.
//               </Text>
//             </View>
//           </View>
//         );
//       case "ACTIVITY":
//         return (
//           <View style={styles.work}>
//             <View style={styles.work1}>
//               <Text
//                 style={{
//                   fontWeight: "bold",
//                   fontSize: 16,
//                   paddingHorizontal: 10,
//                   paddingTop: 10,
//                 }}
//               >
//                 ACTIVITY
//               </Text>
//               {/* Add more ACTIVITY section content here */}
//               <Text
//                 style={{
//                   fontSize: 14,
//                   paddingHorizontal: 10,
//                   paddingBottom: 10,
//                 }}
//               >
//                 {matrimonyData?.hobbies?.join(", ") || ''}
//               </Text>
//               {/* Hardcoded hobbies text */}
//             </View>
//           </View>
//         );

//       default:
//         return (
//           <View style={styles.about}>
//             <View style={styles.aboutContent1}>
//               <Text style={styles.aboutLabel1}>BIO</Text>
//               <Text style={styles.aboutText1}>
//                 {matrimonyData?.aboutMe || ''}
//               </Text>
//             </View>

//             {matrimonyData?.socials?.visible && (
//               <View style={styles.aboutContent2}>
//                 <Text style={styles.aboutLabel2}>REACH ME AT</Text>
//                 <View style={{ flexDirection: "row" }}>
//                   <Link to={`/${matrimonyData?.socials?.instagram || ''}`}>
//                     <IconButton icon="instagram" />
//                   </Link>
//                   <Link to={`/${matrimonyData?.socials?.linkedin || ''}`}>
//                     <IconButton icon="linkedin" />
//                   </Link>
//                   <Link to={`/${matrimonyData?.socials?.whatsapp || ''}`}>
//                     <IconButton icon="whatsapp" />
//                   </Link>
//                 </View>
//               </View>
//             )}

//             <View style={styles.aboutContent3}>
//               <View style={{ flexDirection: "row" }}>
//                 <Text style={styles.aboutLabel3}>WEBSITE</Text>
//                 <Text style={styles.aboutText3}>
//                   {matrimonyData?.email || ''}
//                 </Text>
//               </View>

//               <View style={{ flexDirection: "row" }}>
//                 <Text style={styles.aboutLabel3}>CONTACT</Text>
//                 <Text style={styles.aboutText3}>
//                   {matrimonyData?.phone || ''}
//                 </Text>
//               </View>
//             </View>
//           </View>
//         );
//     }
//   };

//   const receiverId = matrimonyData._id;
//   const senderId = user?.roleData?._id;
//   console.log("SID: ", senderId);



//   // const handleConnect = async () => {
//   //   if (isRequestSent) {
//   //     Alert.alert(
//   //       "Request Already Sent",
//   //       "You have already sent a connection request."
//   //     );
//   //     return;
//   //   }
  
//   //   try {
//   //     const token = await AsyncStorage.getItem("token");
  
//   //     console.log("Rec ID:", receiverId);
//   //     console.log("Sender id:", senderId);
//   //     console.log("usertype:", userType);
  
//   //     const response = await apiClient.post(
//   //       `${BASEAPIURL}/matrimony/connection/send-request`,
//   //       {
//   //         senderId: senderId,
//   //         receiverId: receiverId,
//   //         createdBy: userType,
//   //       },
//   //       {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       }
//   //     );
  
//   //     if (response.status === 200 || response.status === 201) {
//   //       setIsRequestSent(true);
//   //       Alert.alert("Success", "Connection request sent successfully", [
//   //         { text: "OK" },
//   //       ]);
//   //     } else {
//   //       console.error("Failed to send connection request", response);
//   //     }
//   //   } catch (error) {
//   //     console.error("Error connecting to user:", error);
//   //   }
//   // };
  
//   const handleConnect = async () => {
//     if (isRequestSent) {
//       Alert.alert(
//         "Request Already Sent",
//         "You have already sent a connection request."
//       );
//       return;
//     }

//     try {
     

//       console.log("Rec ID:", receiverId);
//       console.log("Sender id:", senderId);
//       console.log("usertype:", userType);

//       const payload = {
//         senderId: senderId?.trim(),
//         receiverId: receiverId?.trim(),
//         createdBy: userType,
//       };
//       console.log("Sending:", payload);
      
//       const response = await sendConnectionRequest(payload);

//       if (response.status === 200 || response.status === 201) {
//         setIsRequestSent(true);
//         Alert.alert("Success", "Connection request sent successfully", [
//           { text: "OK" },
//         ]);
//       } else {
//         console.error("Failed to send connection request", response);
//       }
//     }  catch (error) {
//       if (error.response) {
//         console.error("Backend response error:", error.response.data);
//         Alert.alert(
//           "Error",
//           error.response.data?.message || "Something went wrong while sending request."
//         );
//       } else {
//         console.error("Error connecting to user:", error);
//         Alert.alert("Error", "Unable to send connection request.");
//       }
//     }
//   };

//   return (
//     <SafeAreaView
//       style={{
//         flex: 1,
//         backgroundColor: "white",
//       }}
//     >
//       <ScrollView style={styles.container}>
//         <View style={styles.headerImageContainer}>
//           <Image
//             source={
//               matrimonyData.images
//                 ? {
//                     uri: `${matrimonyData?.images[0]}`,
//                   }
//                 : UserImg
//             }
//             style={styles.headerImage}
//           />
//           <LinearGradient
//             colors={["transparent", "rgba(0,0,0,0.8)"]}
//             style={styles.gradientOverlay}
//           />
//           <TouchableOpacity style={styles.backButton}>
//             <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.eventInfoContainer}>
//           <View style={styles.nameAndLocationContainer}>
//             <Text style={styles.headerTitle}>
//               {matrimonyData?.name || ''}
//             </Text>
//             <View style={styles.locationContainer}>
//               <MaterialIcon name="location-on" size={18} color={Theme.themeColor} />
//               <Text style={styles.homeTown}>
//                 {matrimonyData?.homeTown || ''}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.eventDetails}>
//             <Text style={styles.detailItem}>
//               {dateToText(matrimonyData?.dateOfBirth)} |{" "}
//               {matrimonyData?.occupation || ''}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.eventInfoContainer}>
//           <View style={styles.eventDetails}>
//             <Text style={styles.priceText}>Personal Info</Text>

//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Caste</Text>
//               <Text style={styles.infoValue}>
//                 {matrimonyData?.subcaste || ''}
//               </Text>
//             </View>
//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Gothra</Text>
//               <Text style={styles.infoValue}>
//                 {matrimonyData?.gothra || ''}
//               </Text>
//             </View>
//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Family Type</Text>
//               <Text style={styles.infoValue}>
//                 {matrimonyData?.familyType || ''}
//               </Text>
//             </View>
//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Family Status</Text>
//               <Text style={styles.infoValue}>
//                 {matrimonyData?.familyStatus || ''}
//               </Text>
//             </View>
//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Work Location</Text>
//               <Text style={styles.infoValue}>
//                 {matrimonyData?.workLocation || ''}
//               </Text>
//             </View>
//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Height</Text>
//               <Text style={styles.infoValue}>
//                 {matrimonyData?.height || ''} cm
//               </Text>
//             </View>
//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Marital Status</Text>
//               <Text style={styles.infoValue}>
//                 {matrimonyData?.maritalStatus || ''}
//               </Text>
//             </View>
//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Hobbies</Text>
//               {/* <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail"> */}
//               <Text style={styles.infoValue}>
//               {matrimonyData?.hobbies?.join(", ") || ''}

//               </Text>
//             </View>

//             {/* <View style={styles.hobbiesContainer}>
//               <Text style={styles.hobbiesHeader}>Hobbies</Text>
//               <View style={styles.tags}>
//                 {matrimonyData.hobbies &&
//                 matrimonyData.hobbies.length > 0 ? (
//                   matrimonyData.hobbies.map((hobby, index) => (
//                     <View key={index} style={styles.tag}>
//                       <Text style={styles.tagText}>{hobby}</Text>
//                     </View>
//                   ))
//                 ) : (
//                   <Text>No hobbies listed</Text>
//                 )}
//               </View>
//             </View> */}
//           </View>
//         </View>

//         <View style={styles.eventInfoContainer}>
//           <View style={styles.eventDetails}>
//             <Text style={styles.priceText}>Bio</Text>
//             <Text style={styles.bioText}>
//               {matrimonyData?.aboutMe || ''}
//             </Text>
//           </View>
//         </View>
//       </ScrollView>

//       {senderId !== receiverId && (
//         <View style={styles.bottomBarContainer}>
//           <View style={styles.bottomBar}>
//             <View style={styles.ticketInfoContainer}>
//               <Text style={styles.priceText}>Interested</Text>

//               <TouchableOpacity
//                 style={styles.bookNowButton}
//                 onPress={() => {
//                   handleConnect(senderId, receiverId, userType);
//                 }}
//               >
//                 <Text style={styles.bookNowButtonText}>Send Request</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f9f9f9",
//   },
//   headerImageContainer: {
//     position: "relative",
//   },
//   headerImage: {
//     width: "100%",
//     height: 400,
//   },
//   gradientOverlay: {
//     position: "",
//     top: "20px",
//     left: 0,
//     right: 0,
//     bottom: "150px",
//   },
//   locationContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderColor: Theme.themeColor,
//     borderWidth: 1,
//     borderRadius: 20,
//     backgroundColor: "white",
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     bottom: 10,
//   },
//   backButton: {
//     position: "absolute",
//     top: 40,
//     left: 15,
//   },
//   headerTitle: {
//     bottom: 10,
//     left: 0,
//     color: Theme.themeColor,
//     fontSize: 26,
//     fontWeight: "bold",
//   },
//   contact: {
//     fontSize: 13,
//     fontWeight: "400",
//     color: "#1C1C1C",
//     marginLeft: 10,
//     lineHeight: 20,
//   },
//   homeTown: {
//     fontSize: 13,
//     fontWeight: "400",
//     color: Theme.themeColor,
//     marginLeft: 5,
//     lineHeight: 20,
//   },
//   nameAndLocationContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   eventInfoContainer: {
//     padding: 20,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     marginHorizontal: 10,
//     marginTop: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//   },
//   bioText: {
//     fontSize: 14,
//     lineHeight: 20,
//     color: "#666",
//     fontFamily: "Courier New",
//     padding: 8,
//     borderRadius: 4,
//     overflow: "hidden",
//   },
//   interestedText: {
//     fontSize: 16,
//     marginBottom: 15,
//     color: "#333",
//   },
//   interestedButton: {
//     borderWidth: 1,
//     borderColor: "#f44336",
//     paddingVertical: 5,
//     paddingHorizontal: 20,
//     borderRadius: 25,
//     alignSelf: "flex-start",
//     marginBottom: 15,
//   },
//   interestedButtonText: {
//     color: "#f44336",
//     fontWeight: "bold",
//   },
//   eventDetails: {
//     marginBottom: 20,
//   },
//   detailItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 8,
//   },
//   detailIcon: {
//     marginRight: 10,
//   },
//   detailText: {
//     fontSize: 16,
//     color: "#333",
//   },

//   ticketInfoContainer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "white",
//     padding: 10,
//     borderTopWidth: 1,
//     borderTopColor: "white",
//     alignItems: "center",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     elevation: 10,
//   },
//   priceText: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   phoneDetails: {
//     flexDirection: "row",
//     justifyContent: "flex-start",
//     alignItems: "center",
//     marginTop: 5,
//   },
//   fillingFast: {
//     color: "orange",
//     fontWeight: "bold",
//   },
//   bookNowButton: {
//     backgroundColor: Theme.themeColor,
//     paddingVertical: 10,
//     paddingHorizontal: 30,
//     borderRadius: 30,
//   },
//   bookNowButtonText: {
//     color: "white",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   infoText: {
//     fontSize: 16,
//     marginVertical: 2,
//   },
//   hobbiesContainer: {
//     marginTop: 10,
//   },
//   bottomBarContainer: {
//     backgroundColor: "#ffffff",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 8,
//   },
//   bottomBar: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 10,
//   },
//   hobbiesHeader: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   tags: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//   },
//   tag: {
//     backgroundColor: Theme.themeColor,
//     borderRadius: 20,
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     padding: 5,
//     margin: 2,
//   },
//   tagText: {
//     color: "#fff",
//   },

//   infoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginVertical: 4,
//   },
//   infoLabel: {
//     fontSize: 16,
//     color: "black",
//     width: 150,
//   },
//   infoValue: {
//     fontSize: 16,
//     color: "grey",
//     flex: 1,
//   },
// });

