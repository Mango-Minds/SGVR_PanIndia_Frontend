import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";
import { RowBetween } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import Icon from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import UserImg from "../../assets/images/general/user.png";
import apiClient from "../../store/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useIsFocused } from "@react-navigation/native";

function PanditNotifications({ navigation }) {
  const [selectedTab, setSelectedTab] = useState("Received");
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [processingRequests, setProcessingRequests] = useState({});

  const { t } = useTranslation();
  const { user } = useSelector((state) => state.user);
  const isFocused = useIsFocused();
  
  const panditId = user?.roleData?.pandit?._id;

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };

  const removeProcessedRequest = (requestId, setStateFunc) => {
    setStateFunc((prevRequests) =>
      prevRequests.filter((request) => request._id !== requestId)
    );
  };

  // Fetch requests sent by this pandit 
  const fetchSentRequests = async () => {
    if (!panditId) return;
    
    try {
      setLoadingAnimation(true);
      const response = await apiClient.get(`/panditRequests/${panditId}`);
      
      if (response.status === 200) {
        let requestsData = response.data.requests || [];
        
        const selectedLanguage =
          (await AsyncStorage.getItem("user-language")) || "en";
        if (selectedLanguage !== "en" && Array.isArray(requestsData)) {
          try {
            const translationResponse = await apiClient.post("/translate", {
              data: requestsData,
              targetLang: selectedLanguage,
            });

            if (translationResponse?.data?.translatedData?.length) {
              requestsData = translationResponse.data.translatedData;
            }
          } catch (translationError) {
            console.log("Translation failed, using original data:", translationError);
          }
        }
        
        setSentRequests(requestsData);
      }
    } catch (error) {
      console.error("Error fetching sent requests:", error);
    } finally {
      setLoadingAnimation(false);
    }
  };

  // Fetch requests received by temples where this pandit might get requests
  // This would show requests sent FROM temple admins TO this pandit
  const fetchReceivedRequests = async () => {
    if (!panditId) return;
    
    try {
      setLoadingAnimation(true);
      const response = await apiClient.get(`/panditIncomingRequests/${panditId}`);
      
      if (response.status === 200) {
        let requestsData = response.data.requests || [];
        
        const selectedLanguage = await AsyncStorage.getItem("selectedLanguage");
        
        if (selectedLanguage && requestsData.length > 0) {
          try {
            const translationResponse = await apiClient.post("/translate", {
              data: requestsData,
              language: selectedLanguage,
            });
            
            if (translationResponse?.data?.translatedData?.length) {
              setReceivedRequests(translationResponse.data.translatedData);
            } else {
              setReceivedRequests(requestsData);
            }
          } catch (translationError) {
            console.error("Translation error for received requests:", translationError);
            setReceivedRequests(requestsData);
          }
        } else {
          setReceivedRequests(requestsData);
        }
      }
    } catch (error) {
      console.error("Error fetching received requests:", error);
      setReceivedRequests([]);
    } finally {
      setLoadingAnimation(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    Alert.alert(
      t("confirmAccept"),
      t("confirmAcceptRequest"),
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("accept"),
          style: "default",
          onPress: async () => {
            try {
              setProcessingRequests(prev => ({ ...prev, [requestId]: true }));
              
              const response = await apiClient.post(
                `/panditToTempleRequest/${requestId}`,
                { action: "accept" }
              );

              if (response.status === 200) {
                Alert.alert(t("success"), t("requestAcceptedSuccessfully"));
                removeProcessedRequest(requestId, setReceivedRequests);
              }
            } catch (error) {
              console.error("Error accepting request:", error);
              Alert.alert(t("error"), t("failedToAcceptRequest"));
            } finally {
              setProcessingRequests(prev => ({ ...prev, [requestId]: false }));
            }
          },
        },
      ]
    );
  };

  const handleRejectRequest = async (requestId) => {
    Alert.alert(
      t("confirmReject"),
      t("confirmRejectRequest"),
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("reject"),
          style: "destructive",
          onPress: async () => {
            try {
              setProcessingRequests(prev => ({ ...prev, [requestId]: true }));
              
              const response = await apiClient.post(
                `/panditToTempleRequest/${requestId}`,
                { action: "reject" }
              );

              if (response.status === 200) {
                Alert.alert(t("success"), t("requestRejectedSuccessfully"));
                removeProcessedRequest(requestId, setReceivedRequests);
              }
            } catch (error) {
              console.error("Error rejecting request:", error);
              Alert.alert(t("error"), t("failedToRejectRequest"));
            } finally {
              setProcessingRequests(prev => ({ ...prev, [requestId]: false }));
            }
          },
        },
      ]
    );
  };

  const handleWithdrawRequest = async (requestId) => {
    Alert.alert(
      t("confirmWithdraw"),
      t("confirmWithdrawRequest"),
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("withdraw"),
          style: "destructive",
          onPress: async () => {
            try {
              setProcessingRequests(prev => ({ ...prev, [requestId]: true }));
              
              const response = await apiClient.delete(
                `/panditToTempleRequest/${requestId}/withdraw`
              );

              if (response.status === 200) {
                Alert.alert(t("success"), t("requestWithdrawnSuccessfully"));
                removeProcessedRequest(requestId, setSentRequests);
              }
            } catch (error) {
              console.error("Error withdrawing request:", error);
              Alert.alert(t("error"), t("failedToWithdrawRequest"));
            } finally {
              setProcessingRequests(prev => ({ ...prev, [requestId]: false }));
            }
          },
        },
      ],
      { cancelable: false }
    );
  };


  useEffect(() => {
    if (isFocused && panditId) {
      fetchSentRequests();
      fetchReceivedRequests();
    }
  }, [isFocused, panditId]);

  if (!panditId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t("panditProfileNotFound")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <RowBetween style={{ paddingTop: 24 }}>
          <View style={styles.headerLeft}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <TopText style={styles.headerTitle}>
              {t("panditNotifications")}
            </TopText>
          </View>
        </RowBetween>
      </View>

      <View style={styles.tabsContainer}>
        {["Received", "Sent"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabPress(tab)}
            style={[styles.tab, selectedTab === tab ? styles.selectedTab : {}]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab ? styles.selectedTabText : {},
              ]}
            >
              {t(tab)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loadingAnimation ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.themeColor} />
          <Text style={styles.loadingText}>{t("loading")}</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.contentContainer}>
            {selectedTab === "Received" && (
              <>
                {receivedRequests.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {t("noReceivedRequests")}
                    </Text>
                  </View>
                ) : (
                  receivedRequests.map((request, index) => (
                    <View key={index} style={styles.requestCard}>
                      <Image
                        style={styles.requestImage}
                        source={
                          request.requestToTempleId?.images?.[0]
                            ? { uri: request.requestToTempleId.images[0] }
                            : UserImg
                        }
                      />
                      
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestTitle}>
                          {request.requestToTempleId?.templeName}
                        </Text>
                        <Text style={styles.requestDetails}>
                          {request.requestToTempleId?.city}, {request.requestToTempleId?.state}
                        </Text>
                        <Text style={styles.requestType}>
                          {t("templeInvitation")}
                        </Text>
                      </View>

                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            styles.acceptButton,
                            processingRequests[request._id] && styles.disabledButton
                          ]}
                          onPress={() => handleAcceptRequest(request._id)}
                          disabled={processingRequests[request._id]}
                        >
                          {processingRequests[request._id] ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <>
                              <Icon name="checkmark-circle" size={15} color="white" />
                              <Text style={styles.buttonText}>{t("accept")}</Text>
                            </>
                          )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            styles.rejectButton,
                            processingRequests[request._id] && styles.disabledButton
                          ]}
                          onPress={() => handleRejectRequest(request._id)}
                          disabled={processingRequests[request._id]}
                        >
                          {processingRequests[request._id] ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <>
                              <Icon name="close-circle" size={15} color="white" />
                              <Text style={styles.buttonText}>{t("reject")}</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}

            {selectedTab === "Sent" && (
              <>
                {sentRequests.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {t("noSentRequests")}
                    </Text>
                  </View>
                ) : (
                  sentRequests.map((request, index) => (
                    <View key={index} style={styles.requestCard}>
                      <Image
                        style={styles.requestImage}
                        source={
                          request.requestToTempleId?.images?.[0]
                            ? { uri: request.requestToTempleId.images[0] }
                            : UserImg
                        }
                      />
                      
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestTitle}>
                          {request.requestToTempleId?.templeName}
                        </Text>
                        <Text style={styles.requestDetails}>
                          {request.requestToTempleId?.city}, {request.requestToTempleId?.state}
                        </Text>
                        <Text style={styles.requestStatus}>
                          {t("status")}: {t(request.status || "pending")}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.withdrawButton,
                          processingRequests[request._id] && styles.disabledButton
                        ]}
                        onPress={() => handleWithdrawRequest(request._id)}
                        disabled={processingRequests[request._id]}
                      >
                        {processingRequests[request._id] ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <>
                            <Icon name="arrow-back-circle" size={15} color="white" />
                            <Text style={styles.buttonText}>{t("withdraw")}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    paddingHorizontal: 10,
  },
  headerLeft: {
    alignItems: "center",
    flexDirection: "row",
  },
  headerTitle: {
    color: Theme.themeColor,
    fontSize: 20,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  selectedTab: {
    backgroundColor: Theme.themeColor,
  },
  tabText: {
    color: "black",
  },
  selectedTabText: {
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "gray",
    fontSize: 16,
  },
  contentContainer: {
    padding: 16,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  emptyText: {
    fontSize: 18,
    color: "grey",
    textAlign: "center",
  },
  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "grey",
    backgroundColor: "#f9f9f9",
    marginBottom: 8,
    borderRadius: 8,
  },
  requestImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  requestDetails: {
    fontWeight: "600",
    opacity: 0.7,
    marginTop: 2,
    color: "#666",
    fontSize: 12,
  },
  requestType: {
    fontWeight: "500",
    opacity: 0.6,
    marginTop: 2,
    color: Theme.themeColor,
    fontSize: 12,
  },
  requestStatus: {
    fontWeight: "500",
    marginTop: 2,
    color: "#666",
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: "column",
    gap: 5,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80,
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: "#7AB163",
  },
  rejectButton: {
    backgroundColor: "#ff4444",
  },
  withdrawButton: {
    backgroundColor: "#ff9800",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80,
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 11,
    marginLeft: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "grey",
    textAlign: "center",
  },
});

export default PanditNotifications;
