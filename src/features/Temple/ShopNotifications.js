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

function ShopNotifications({ navigation }) {
  const [selectedTab, setSelectedTab] = useState("Received");
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [processingRequests, setProcessingRequests] = useState({});

  const { t } = useTranslation();
  const { user } = useSelector((state) => state.user);
  const isFocused = useIsFocused();
  
  const shopId = user?.roleData?.templeShopOwner?._id;

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };

  const removeProcessedRequest = (requestId, setStateFunc) => {
    setStateFunc((prevRequests) =>
      prevRequests.filter((request) => request._id !== requestId)
    );
  };

  // Fetch requests sent by this shop 
  const fetchSentRequests = async () => {
    if (!shopId) return;
    
    try {
      setLoadingAnimation(true);
      const response = await apiClient.get(`/shopRequests/${shopId}`);
      
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
              setSentRequests(translationResponse.data.translatedData);
            } else {
              setSentRequests(requestsData);
            }
          } catch (translationError) {
            console.error("Translation error for sent requests:", translationError);
            setSentRequests(requestsData);
          }
        } else {
          setSentRequests(requestsData);
        }
      }
    } catch (error) {
      console.error("Error fetching sent requests:", error);
      setSentRequests([]);
    } finally {
      setLoadingAnimation(false);
    }
  };

  // Fetch requests received by this shop from temples
  const fetchReceivedRequests = async () => {
    if (!shopId) return;
    
    try {
      setLoadingAnimation(true);
      const response = await apiClient.get(`/shopIncomingRequests/${shopId}`);
      
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

  const handleWithdrawRequest = async (requestId) => {
    Alert.alert(
      t("confirmWithdraw"),
      t("confirmWithdrawShopRequest"),
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
              
              const response = await apiClient.delete(`/shopToTempleRequest/${requestId}/withdraw`);

              if (response.status === 200) {
                Alert.alert(t("success"), t("shopRequestWithdrawnSuccessfully"));
                removeProcessedRequest(requestId, setSentRequests);
              }
            } catch (error) {
              console.error("Error withdrawing request:", error);
              Alert.alert(t("error"), t("failedToWithdrawShopRequest"));
            } finally {
              setProcessingRequests(prev => ({ ...prev, [requestId]: false }));
            }
          },
        },
      ]
    );
  };

  const handleAcceptRequest = async (requestId) => {
    Alert.alert(
      t("confirmAccept"),
      t("confirmAcceptShopRequest"),
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
                `/shopToTempleRequest/${requestId}`,
                { action: "accept" }
              );

              if (response.status === 200) {
                Alert.alert(t("success"), t("shopRequestAcceptedSuccessfully"));
                removeProcessedRequest(requestId, setReceivedRequests);
              }
            } catch (error) {
              console.error("Error accepting request:", error);
              Alert.alert(t("error"), t("failedToAcceptShopRequest"));
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
      t("confirmRejectShopRequest"),
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
                `/shopToTempleRequest/${requestId}`,
                { action: "reject" }
              );

              if (response.status === 200) {
                Alert.alert(t("success"), t("shopRequestRejectedSuccessfully"));
                removeProcessedRequest(requestId, setReceivedRequests);
              }
            } catch (error) {
              console.error("Error rejecting request:", error);
              Alert.alert(t("error"), t("failedToRejectShopRequest"));
            } finally {
              setProcessingRequests(prev => ({ ...prev, [requestId]: false }));
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (isFocused) {
      fetchSentRequests();
      fetchReceivedRequests();
    }
  }, [isFocused, shopId]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <RowBetween style={{ paddingTop: 10 }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{
              color: Theme.themeColor,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            {t("shopNotifications")}
          </TopText>
        </View>
      </RowBetween>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[t("received"), t("sent")].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabPress(tab === t("received") ? "Received" : "Sent")}
            style={[
              styles.tab,
              selectedTab === (tab === t("received") ? "Received" : "Sent") ? styles.selectedTab : {},
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === (tab === t("received") ? "Received" : "Sent") ? styles.selectedTabText : {},
              ]}
            >
              {tab}
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
        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
            {selectedTab === "Received" && (
              <>
                {receivedRequests.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Icon name="mail-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>{t("noReceivedShopRequests")}</Text>
                    <Text style={styles.emptySubText}>{t("templeInvitation")}</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.sectionTitle}>{t("templeInvitations")}</Text>
                    {receivedRequests.map((request, index) => (
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
                          <Text style={styles.requestSubtitle}>
                            {request.requestToTempleId?.address}
                          </Text>
                          <Text style={styles.requestTime}>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </Text>
                        </View>

                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.acceptButton]}
                            onPress={() => handleAcceptRequest(request._id)}
                            disabled={processingRequests[request._id]}
                          >
                            {processingRequests[request._id] ? (
                              <ActivityIndicator size="small" color="white" />
                            ) : (
                              <>
                                <Icon name="checkmark-circle" size={16} color="white" />
                                <Text style={styles.actionButtonText}>{t("accept")}</Text>
                              </>
                            )}
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => handleRejectRequest(request._id)}
                            disabled={processingRequests[request._id]}
                          >
                            {processingRequests[request._id] ? (
                              <ActivityIndicator size="small" color="white" />
                            ) : (
                              <>
                                <Icon name="close-circle" size={16} color="white" />
                                <Text style={styles.actionButtonText}>{t("reject")}</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}

            {selectedTab === "Sent" && (
              <>
                {sentRequests.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Icon name="send-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>{t("noSentShopRequests")}</Text>
                    <Text style={styles.emptySubText}>{t("sendRequestsToTemples")}</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.sectionTitle}>{t("sentRequests")}</Text>
                    {sentRequests.map((request, index) => (
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
                          <Text style={styles.requestSubtitle}>
                            {request.requestToTempleId?.address}
                          </Text>
                          <Text style={styles.requestTime}>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[styles.actionButton, styles.withdrawButton]}
                          onPress={() => handleWithdrawRequest(request._id)}
                          disabled={processingRequests[request._id]}
                        >
                          {processingRequests[request._id] ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <>
                              <Icon name="arrow-back-circle" size={16} color="white" />
                              <Text style={styles.actionButtonText}>{t("withdraw")}</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    ))}
                  </>
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
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 15,
    marginHorizontal: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  selectedTab: {
    backgroundColor: Theme.themeColor,
  },
  tabText: {
    color: "black",
    fontWeight: "500",
  },
  selectedTabText: {
    color: "white",
    fontWeight: "600",
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
  scrollView: {
    flex: 1,
    marginTop: 10,
  },
  contentContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  requestSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  requestTime: {
    fontSize: 12,
    color: "#999",
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    minWidth: 80,
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#f44336",
  },
  withdrawButton: {
    backgroundColor: "#ff9800",
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default ShopNotifications;
