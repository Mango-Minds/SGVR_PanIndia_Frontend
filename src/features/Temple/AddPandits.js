import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeArea } from "../../components/utility/safe-area.component";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import { IconButton } from "react-native-paper";
import Theme from "../../styles/theme";
import { ScrollView } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import apiClient from "../../store/apiClient";
import UserImg from "../../assets/images/general/user.png";
import Icon from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AddPandits = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { templeinfo, onPanditAdded } = route.params;
  const [availablePandits, setAvailablePandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sendingRequests, setSendingRequests] = useState({});

  const { user } = useSelector((state) => state.user);

  const fetchAvailablePandits = async () => {
    try {
      setLoading(true);
      const selectedLanguage = 
        (await AsyncStorage.getItem("user-language")) || "en";

      const response = await apiClient.get(`/availablePandits/${templeinfo._id}`);

      if (response.status === 200) {
        let panditsData = response.data.pandits || [];

        // Translate if not English
        if (selectedLanguage !== "en" && Array.isArray(panditsData)) {
          try {
            const translationResponse = await apiClient.post("/translate", {
              data: panditsData,
              targetLang: selectedLanguage,
            });

            if (translationResponse?.data?.translatedData?.length) {
              panditsData = translationResponse.data.translatedData;
            }
          } catch (translationError) {
            console.log("Translation failed, using original data:", translationError);
          }
        }

        setAvailablePandits(panditsData);
      }
    } catch (error) {
      console.error("Error fetching available pandits:", error);
      Alert.alert(t("error"), t("failedToFetchPandits"));
    } finally {
      setLoading(false);
    }
  };

  const sendPanditRequest = async (panditId) => {
    try {
      setSendingRequests(prev => ({ ...prev, [panditId]: true }));

      const response = await apiClient.post("/panditToTempleRequest", {
        requestToTempleId: templeinfo._id,
        requestByPanditId: panditId,
        initiatedBy: "temple"
      });

      if (response.status === 201) {
        Alert.alert(t("success"), t("requestSentSuccessfully"));
        
        // Remove the pandit from available list since request is sent
        setAvailablePandits(prev => 
          prev.filter(pandit => pandit._id !== panditId)
        );
        
        // Call the callback to refresh the temple details
        if (onPanditAdded) {
          onPanditAdded();
        }
      }
    } catch (error) {
      console.error("Error sending pandit request:", error);
      if (error.response?.status === 409) {
        Alert.alert(t("info"), t("requestAlreadySent"));
        
        // Remove the pandit from available list since a request already exists
        setAvailablePandits(prev => 
          prev.filter(pandit => pandit._id !== panditId)
        );
        
        // Call the callback to refresh the temple details
        if (onPanditAdded) {
          onPanditAdded();
        }
      } else {
        Alert.alert(t("error"), t("failedToSendRequest"));
      }
    } finally {
      setSendingRequests(prev => ({ ...prev, [panditId]: false }));
    }
  };

  useEffect(() => {
    fetchAvailablePandits();
  }, []);

  // Refresh when screen gains focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAvailablePandits();
    });

    return unsubscribe;
  }, [navigation]);

  const filteredPandits = availablePandits.filter(pandit =>
    pandit.panditName?.toLowerCase().includes(searchText.toLowerCase()) ||
    pandit.owner?.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
    pandit.owner?.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
    pandit.owner?.city?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeArea style={styles.container}>
      <RowBetween style={styles.header}>
        <View style={styles.headerLeft}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText style={styles.headerTitle}>
            {t("addPandits")}
          </TopText>
        </View>
      </RowBetween>

      <View style={styles.searchContainer}>
        <SearchField
          placeholder={t("searchPandits")}
          value={searchText}
          onChangeText={setSearchText}
        />
        <Icon name="search" size={24} style={styles.searchIcon} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.themeColor} />
          <Text style={styles.loadingText}>{t("loading")}</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollContainer}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.panditsContainer}>
            {filteredPandits.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchText ? t("noPanditsFoundForSearch") : t("noAvailablePandits")}
                </Text>
              </View>
            ) : (
              filteredPandits.map((pandit, index) => (
                <View key={pandit._id} style={styles.panditCard}>
                  <Image
                    style={styles.panditImage}
                    source={
                      pandit.image
                        ? { uri: pandit.image }
                        : UserImg
                    }
                  />
                  
                  <View style={styles.panditInfo}>
                    <Text style={styles.panditName}>
                      {pandit.panditName}
                    </Text>
                    <Text style={styles.panditDetails}>
                      {pandit.owner?.firstName} {pandit.owner?.lastName}
                    </Text>
                    <Text style={styles.panditLocation}>
                      {pandit.owner?.city}, {pandit.owner?.state}
                    </Text>
                    <Text style={styles.panditContact}>
                      {pandit.owner?.phone}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      sendingRequests[pandit._id] && styles.sendButtonDisabled
                    ]}
                    onPress={() => sendPanditRequest(pandit._id)}
                    disabled={sendingRequests[pandit._id]}
                  >
                    {sendingRequests[pandit._id] ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Icon name="send" size={16} color="white" style={styles.sendIcon} />
                        <Text style={styles.sendButtonText}>
                          {t("sendRequest")}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingTop: 10,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    marginTop: 10,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    right: 20,
    color: "gray",
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
  scrollContainer: {
    flex: 1,
    marginTop: 10,
  },
  panditsContainer: {
    padding: 16,
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
  panditCard: {
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
  panditImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  panditInfo: {
    flex: 1,
  },
  panditName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  panditDetails: {
    fontWeight: "600",
    opacity: 0.7,
    marginTop: 2,
    color: "#666",
  },
  panditLocation: {
    fontWeight: "500",
    opacity: 0.6,
    marginTop: 2,
    color: "#666",
    fontSize: 12,
  },
  panditContact: {
    fontWeight: "500",
    opacity: 0.6,
    marginTop: 2,
    color: "#666",
    fontSize: 12,
  },
  sendButton: {
    backgroundColor: Theme.themeColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 100,
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  sendIcon: {
    marginRight: 5,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
});

export default AddPandits;
