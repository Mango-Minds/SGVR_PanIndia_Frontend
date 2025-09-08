import { React, useState, useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Profile from "../../assets/images/B2b/profile.png";
import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import {
 
  BASEAPIURL,
  RENDERMEDIAURL,
} from "../../infrastructure/constants";

import {
  HallDetailsContainer,
  HallImageContainer,
  Heading,
  JobLocation,
  Row,
  TopHeader,
  ViewDetails,
} from "../../styles/dashboard.styles";
import CompactProfileCard from "../../components/matrimony/CompactProfileCard";
import VendorCompactCard from "../../components/matrimony/VendorCompactCard";
import UserImg from "../../assets/images/general/user.png";
import FilterMenu from "./FilterMenu";
import Theme from "../../styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";
import {
  fetchMatrimonyData,
  fetchVendorData,
  fetchDecoratorData,
  fetchCatererData,
  fetchPlannerData,
  fetchVenueData,
  fetchConnectionRequests,
  checkConnectionStatus,
  acceptConnectionRequest,
  rejectConnectionRequest,
} from "./matrimonyAPIs";
import PremiumSubscriptionModal from "../../components/modals/PremiumSubscriptionModal";
import { useSubscription } from "../../hooks/useSubscription";

const NewMatrimony = ({ navigation }) => {
  //user data
  const { t } = useTranslation();
  const user = useSelector((state) => state.user.user);
  
  // Subscription state
  const {
    subscriptionStatus,
    subscriptionPlans,
    loading: subscriptionLoading,
    subscribeToPlan,
    fetchSubscriptionStatus,
  } = useSubscription();

  console.log("User in matrimony: ", user);
  const userType = user?.userType?.[0];
  const userTypes = user?.userType || [];
  console.log("UserType: ", userType);
  console.log("User.userType: ", user?.userType);
  console.log("UserTypes array: ", userTypes);
 

  const isFocused = useIsFocused();
  const [selectedFiltersArray, setSelectedFiltersArray] = useState([]);
  const token = useSelector((state) => state.user.token);
  const scrollViewRef = useRef();
  //for tab
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  // const [selectedTab, setSelectedTab] = useState(
  //   user.userType[0] === "matrimonyMan"
  //     ? "Brides"
  //     : user.userType[0] === "matrimonyWoman"
  //     ? "Grooms"
  //     : "Vendors"
  // );
  const [selectedTab, setSelectedTab] = useState(
  userTypes.includes("matrimonyMan")
    ? "brides"
    : userTypes.includes("matrimonyWoman")
    ? "grooms"
    : "vendors"
);

  const screenWidth = Dimensions.get("window").width;
  const tabWidth = screenWidth / 3.2;

  const handleTabPress = (tab, index) => {
    setSelectedTab(tab);

    // Scroll to the specific tab when clicked
    scrollViewRef.current.scrollTo({
      x: tabWidth * index, // Scroll based on tab index and tab width
      animated: true,
    });
  };

  // const debouncedFetchMatrimonyData = useCallback(
  //   debounce((searchTerm, selectedFiltersArray) => {
  //     console.log("Search triggered: ", searchTerm);
  //     fetchMatrimonyData(searchTerm, selectedFiltersArray);
  //   }, 1200),
  //   []
  // );
  //searchbar
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (e) => {
    setSearchTerm(e);
    console.log("Search term: ", e);
  };
  const toggleSearch = () => setIsSearchVisible(!isSearchVisible);

  const handleButtonPress = (buttonName) => {
    console.log("inside buttonpress");
    setActiveButton(buttonName);
    if (buttonName === "clear") {
      setSelectedOptions([]);
      setSelectedFiltersArray([]);
    }
  };

  // Function to render profile card using compact view
  const renderProfileCard = (profile, index, isBride = false) => {
    const onPress = () => {
      if (isBride) {
        navigation.navigate("MatrimonyProfileNew", {
          matrimonyData: bridesData[index],
          groomsData: groomsData,
        });
      } else {
        navigation.navigate("MatrimonyProfileNew", {
          matrimonyData: groomsData[index],
          groomsData: groomsData,
        });
      }
    };

    // Get subscription info for this profile's owner
    const profileOwnerId = profile.owner?._id || profile.owner;
    const currentUserId = user?._id;
    
    // Don't show premium status in profile cards anymore
    const profileSubscriptionInfo = null;

    return (
      <CompactProfileCard
        key={index}
        profile={profile}
        onPress={onPress}
        subscriptionInfo={profileSubscriptionInfo}
      />
    );
  };

  // Function to get limited profiles based on subscription status
  const getLimitedProfiles = (profiles, isBride = false) => {
    if (subscriptionStatus.isPremium) {
      return profiles; // Show all profiles for premium users
    }
    return profiles.slice(0, 4); // Show only 4 profiles for non-premium users
  };

  // Function to render premium upgrade section
  const renderPremiumUpgradeSection = (totalProfiles, currentProfiles, isBride = false) => {
    if (subscriptionStatus.isPremium || totalProfiles <= 4) {
      return null;
    }

    const profileType = isBride ? 'bride' : 'groom';
    const profileTypePlural = isBride ? 'brides' : 'grooms';

    return (
      <View style={styles.premiumUpgradeSection}>
        <View style={styles.premiumUpgradeContent}>
          <Text style={styles.premiumUpgradeTitle}>
            Want to see more profiles?
          </Text>
          <Text style={styles.premiumUpgradeDescription}>
            Currently showing {currentProfiles} {profileTypePlural}. Upgrade to Premium to view all {totalProfiles} {profileTypePlural}!
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => setPremiumModalVisible(true)}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Function to render vendor card using compact view
  const renderVendorCard = (vendor, index, vendorType) => {
    const onPress = () => {
      navigation.navigate("MatrimonyProfileWithConnection", vendor);
    };

    return (
      <VendorCompactCard
        key={index}
        vendor={vendor}
        onPress={onPress}
      />
    );
  };

  // Connection requests functions
  const userId = user?.roleData?.MatrimonyUser?._id || user?.roleData?.MatrimonyVendor?._id || user?.roleData?.pandit?._id;

  const fetchRequest = async () => {
    if (!userId) return;
    
    try {
      setRequestsLoading(true);
      const data = await fetchConnectionRequests(userId);
      console.log("Req data: ", data);

      setReceivedRequests(data.receivedRequests || []);
      setSentRequests(data.sentRequests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      console.log("req id: ", requestId);
      const response = await acceptConnectionRequest(requestId);

      if (response.status === 200) {
        Alert.alert("Request Accepted Successfully.");
        removeAcceptedRequest(requestId, setReceivedRequests);
        // Refresh the requests to update the status
        fetchRequest();
      } else {
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      Alert.alert("Error", "Failed to accept request. Please try again.");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      const response = await rejectConnectionRequest(requestId);

      if (response.status === 200) {
        Alert.alert("Request Deleted Successfully.");
        fetchRequest();
      } else {
        throw new Error("Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      Alert.alert("Error", "Failed to delete request. Please try again.");
    }
  };

  const handleWithdrawRequest = async (requestId) => {
    try {
      const response = await rejectConnectionRequest(requestId);

      if (response.status === 200) {
        Alert.alert("Request Withdrawn Successfully.");
        fetchRequest();
      } else {
        throw new Error("Failed to withdraw request");
      }
    } catch (error) {
      console.error("Error withdrawing request:", error);
      Alert.alert("Error", "Failed to withdraw request. Please try again.");
    }
  };

  const removeAcceptedRequest = (requestId, setStateFunc) => {
    setStateFunc((prevRequests) =>
      prevRequests.filter((request) => request._id !== requestId)
    );
  };

  // useEffect(() => {
  //   console.log("inside useeffect");
  //   setMenuVisible(false);
  //   debouncedFetchMatrimonyData(searchTerm, selectedFiltersArray);
  // }, [searchTerm, selectedFiltersArray]);

  const [activeFilter, setActiveFilter] = useState("Marital Status");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [activeButton, setActiveButton] = useState(null);
  const filters = [
    {
      name: "Marital Status",
      options: ["Single", "Divorced", "Widower"],
    },
    {
      name: "Age",
      options: ["18-25", "26-35", "36-45", "46-60", "60+"],
    },
  ];

  const [selectedAgeRange, setSelectedAgeRange] = useState(null);

  const handleFilterClick = (filterName) => {
    setActiveFilter(filterName);
  };

  // const handleOptionClick = (option) => {
  //   if (activeFilter === "Marital Status") {
  //     // For the "Marital Status" filter, toggle the selection
  //     setSelectedOptions((prevSelectedOptions) => {
  //       const isSelected = prevSelectedOptions.includes(option);

  //       // Remove the selected option or add it
  //       return isSelected
  //         ? prevSelectedOptions.filter((item) => item !== option)
  //         : [...prevSelectedOptions, option];
  //     });
  //   }else if (activeFilter === "Age") {
  //     // Update the selected age range
  //     setSelectedAgeRange(option);
  //   }
  //    else {
  //     // For other filters, toggle options as usual
  //     setSelectedOptions((prevSelectedOptions) => {
  //       const updatedOptions = prevSelectedOptions.includes(option)
  //         ? prevSelectedOptions.filter((item) => item !== option)
  //         : [...prevSelectedOptions, option];

  //       return updatedOptions;
  //     });
  //   }
  // };

  const handleOptionClick = (option) => {
    if (activeFilter === "Marital Status" || activeFilter === "Age") {
      setSelectedOptions((prevSelectedOptions) => {
        const isSelected = prevSelectedOptions.includes(option);
        return isSelected
          ? prevSelectedOptions.filter((item) => item !== option)
          : [...prevSelectedOptions, option];
      });
    }
  };
  
  const matrimonyMenu = [
  { key: "brides", condition: () => userTypes.includes("matrimonyMan") },
  { key: "grooms", condition: () => userTypes.includes("matrimonyWoman") },
  { key: "vendors" },
  { key: "decorators" },
  { key: "caterers" },
  { key: "planners" },
  { key: "venues" },
];

// Debug: Log the condition results
console.log("Brides condition result: ", userTypes.includes("matrimonyMan"));
console.log("Grooms condition result: ", userTypes.includes("matrimonyWoman"));
const displayMenu = matrimonyMenu
  .filter(item => !item.condition || item.condition())
  .map(item => item.key);

console.log("DisplayMenu: ", displayMenu);
console.log("MatrimonyMenu: ", matrimonyMenu);

// const matrimonyMenu = [
//     "Brides",
//     "Grooms",
//     "Vendors",
//     "Decorators",
//     "Caterers",
//     "Planners",
//     "Venues",
//   ];

//   const displayMenu = matrimonyMenu.filter((menuItem) => {
//     if (menuItem === "Brides") {
//       return user.userType[0] === "matrimonyMan";
//     }
//     if (menuItem === "Grooms") {
//       return user.userType[0] === "matrimonyWoman";
//     }
//     return true; // Include all other menu items for all users
//   });

  
  //filter menu?
  const [menuVisible, setMenuVisible] = useState(false);
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  //to fetch matrimony data
  const [matrimonyData, setMatrimonyData] = useState([]);
  const [bridesData, setBridesData] = useState([]);
  const [groomsData, setGroomsData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [decoratorData, setDecoratorData] = useState([]);
  const [catererData, setCatererData] = useState([]);
  const [venueData, setVenueData] = useState([]);
  const [plannerData, setPlannerData] = useState([]);

  // Connection requests state
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsModalVisible, setRequestsModalVisible] = useState(false);

  // Premium subscription modal state
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);

  
  // const handleFetchMatrimonyData = async (queryString, selectedFiltersArray) => {
  //   try {
  //     setLoadingAnimation(true);
  //     const data = await fetchMatrimonyData(queryString, selectedFiltersArray);
  //     setMatrimonyData(data);
  //     setBridesData(data.filter((matrimony) => matrimony.gender === "female"));
  //     setGroomsData(data.filter((matrimony) => matrimony.gender === "male"));
  //   } catch (error) {
  //     console.error("Error fetching matrimony data:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };


//correct 
  // const handleFetchVendorData = async (queryString) => {
  //   try {
  //     setLoadingAnimation(true);
  //     const data = await fetchVendorData(queryString);
  //     setVendorData(data);
     
      
  //   } catch (error) {
  //     console.error("Error fetching vendor data:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };

  // const handleFetchVenueData = async (queryString) => {
  //   try {
  //     setLoadingAnimation(true);
  //     const data = await fetchVenueData(queryString);
  //     setVenueData(data);
  //   } catch (error) {
  //     console.error("Error fetching vendor data:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };
  // const handleFetchCatererData = async (queryString) => {
  //   try {
  //     setLoadingAnimation(true);
  //     const data = await fetchCatererData(queryString);
  //     setCatererData(data);
  //   } catch (error) {
  //     console.error("Error fetching vendor data:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };
  // const handleFetchDecoratorData = async (queryString) => {
  //   try {
  //     setLoadingAnimation(true);
  //     const data = await fetchDecoratorData(queryString);
  //     setDecoratorData(data);
  //   } catch (error) {
  //     console.error("Error fetching vendor data:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };
  // const handleFetchPlannerData = async (queryString) => {
  //   try {
  //     setLoadingAnimation(true);
  //     const data = await fetchPlannerData(queryString);
  //     setPlannerData(data);
  //   } catch (error) {
  //     console.error("Error fetching vendor data:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };

  const handleFetchVendorData = async (queryString) => {
  try {
    setLoadingAnimation(true);

    const selectedLanguage = await AsyncStorage.getItem("user-language") || "en";

    const data = await fetchVendorData(queryString);
    let translatedData = data;

    if (selectedLanguage !== "en") {
      const translateResponse = await apiClient.post("/translate", {
        data: data,
        targetLang: selectedLanguage,
      });
      translatedData = translateResponse.data.translatedData;
    }

    setVendorData(translatedData);

  } catch (error) {
    console.error("Error fetching or translating vendor data:", error);
  } finally {
    setLoadingAnimation(false);
  }
};

  const handleFetchMatrimonyData = async (queryString, selectedFiltersArray) => {
  try {
    setLoadingAnimation(true);

    
    const selectedLanguage = await AsyncStorage.getItem("user-language") || "en";

    
    const data = await fetchMatrimonyData(queryString, selectedFiltersArray);

    let translatedData = data;

   
    if (selectedLanguage !== "en") {
      const translateResponse = await apiClient.post("/translate", {
        data: data,
         targetLang: selectedLanguage,
      });
      translatedData = translateResponse.data.translatedData;
    }

    
    setMatrimonyData(translatedData);
    setBridesData(translatedData.filter((matrimony) => matrimony.gender === "female"));
    setGroomsData(translatedData.filter((matrimony) => matrimony.gender === "male"));

  } catch (error) {
    console.error("Error fetching or translating matrimony data:", error);
  } finally {
    setLoadingAnimation(false);
  }
};

const handleFetchVenueData = async (queryString) => {
  try {
    setLoadingAnimation(true);

    const selectedLanguage = await AsyncStorage.getItem("user-language") || "en";

    const data = await fetchVenueData(queryString);
    let translatedData = data;

    if (selectedLanguage !== "en") {
      const translateResponse = await apiClient.post("/translate", {
        data: data,
        targetLang: selectedLanguage,
      });
      translatedData = translateResponse.data.translatedData;
    }

    setVenueData(translatedData);

  } catch (error) {
    console.error("Error fetching or translating venue data:", error);
  } finally {
    setLoadingAnimation(false);
  }
};

const handleFetchCatererData = async (queryString) => {
  try {
    setLoadingAnimation(true);

    const selectedLanguage = await AsyncStorage.getItem("user-language") || "en";

    const data = await fetchCatererData(queryString);
    let translatedData = data;

    if (selectedLanguage !== "en") {
      const translateResponse = await apiClient.post("/translate", {
        data: data,
        targetLang: selectedLanguage,
      });
      translatedData = translateResponse.data.translatedData;
    }

    setCatererData(translatedData);

  } catch (error) {
    console.error("Error fetching or translating caterer data:", error);
  } finally {
    setLoadingAnimation(false);
  }
};

const handleFetchDecoratorData = async (queryString) => {
  try {
    setLoadingAnimation(true);

    const selectedLanguage = await AsyncStorage.getItem("user-language") || "en";

    const data = await fetchDecoratorData(queryString);
    let translatedData = data;

    if (selectedLanguage !== "en") {
      const translateResponse = await apiClient.post("/translate", {
        data: data,
        targetLang: selectedLanguage,
      });
      translatedData = translateResponse.data.translatedData;
    }

    setDecoratorData(translatedData);

  } catch (error) {
    console.error("Error fetching or translating decorator data:", error);
  } finally {
    setLoadingAnimation(false);
  }
};

const handleFetchPlannerData = async (queryString) => {
  try {
    setLoadingAnimation(true);

    const selectedLanguage = await AsyncStorage.getItem("user-language") || "en";

    const data = await fetchPlannerData(queryString);
    let translatedData = data;

    if (selectedLanguage !== "en") {
      const translateResponse = await apiClient.post("/translate", {
        data: data,
        targetLang: selectedLanguage,
      });
      translatedData = translateResponse.data.translatedData;
    }

    setPlannerData(translatedData);

  } catch (error) {
    console.error("Error fetching or translating planner data:", error);
  } finally {
    setLoadingAnimation(false);
  }
};

  









  
  
 
  // const tabToFetchFunction = {
  //   Brides: handleFetchMatrimonyData,
  //   Grooms: handleFetchMatrimonyData,
  //   Vendors: handleFetchVendorData,
  //   Decorators: handleFetchDecoratorData,
  //   Caterers: handleFetchCatererData,
  //   Planners: handleFetchPlannerData,
  //   Venues: handleFetchVenueData,
  // };
  const tabToFetchFunction = {
  brides: handleFetchMatrimonyData,
  grooms: handleFetchMatrimonyData,
  vendors: handleFetchVendorData,
  decorators: handleFetchDecoratorData,
  caterers: handleFetchCatererData,
  planners: handleFetchPlannerData,
  venues: handleFetchVenueData,
};


console.log("grooms: ", groomsData);

  

  // Debounced fetch function to avoid unnecessary API calls
  const debouncedFetchData = useCallback(
    debounce((searchTerm, selectedTab, selectedFiltersArray) => {
      console.log(
        "Fetching data for tab:",
        selectedTab,
        "with searchTerm:",
        searchTerm
      );
      setMenuVisible(false);
      const queryParams = new URLSearchParams();
      if (searchTerm.trim()) {
        queryParams.append("search", searchTerm);
      }

      const queryString = queryParams.toString();

      // Dynamically call the API function based on the active tab
      const fetchFunction = tabToFetchFunction[selectedTab];
      if (fetchFunction) {
        fetchFunction(queryString, selectedFiltersArray);
      }
    }, 1200), // Adjust debounce delay as needed
    []
  );

  // Effect to trigger fetch whenever searchTerm or selectedTab changes
  useEffect(() => {
    debouncedFetchData(searchTerm, selectedTab, selectedFiltersArray);
  }, [searchTerm, selectedTab, selectedFiltersArray]);


 

  return (
    <Container style={{ backgroundColor: "white", paddingBottom: 0 }}>
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Dashboard");
            }
          }} />
          <TopText
            style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}
          >{t("matrimonyHeading")}</TopText>
          {subscriptionStatus?.isPremium && (
            <View style={styles.premiumBadge}>
              <Icon name="star" size={12} color="#FFD700" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name="search"
            size={24}
            style={{ marginRight: 15, color: "grey" }}
            onPress={toggleSearch}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate("MyMatrimonyProfile")}
          >
            <Image
              source={Profile}
              style={{ width: 35, height: 35, marginRight: 10 }}
            />
          </TouchableOpacity>

          <IconButton
            icon="bell-outline"
            style={{ marginLeft: "auto" }}
            onPress={() => {
              setRequestsModalVisible(true);
              fetchRequest();
            }}
          ></IconButton>
        </View>
      </RowBetween>
      {isSearchVisible && (
        <View
          style={{
            alignItems: "center",
            marginLeft: 16,
            marginRight: 16,
            marginBottom: 10,
          }}
        >
          <SearchField placeholder={t("search")} onChangeText={handleSearch} />
        </View>
      )}

      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          ref={scrollViewRef}
          showsHorizontalScrollIndicator={false}
          snapToInterval={tabWidth} 
          decelerationRate="fast" 
          
        >
          {displayMenu.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabPress(tab, index)} 
             
              style={[
                styles.tab,
                { width: tabWidth - 8 }, 
                selectedTab === tab ? styles.selectedTab : {},
                
              ]}
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
        </ScrollView>
      </View>

      {selectedTab === "brides" && (
        <View style={{ flex: 1 }}>
          {loadingAnimation === true ? (
            <ActivityIndicator
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              size={"large"}
              color={Theme.themeColor}
            />
          ) : (
            <View style={{ flex: 1 }}>
              {bridesData.length === 0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 18, color: "grey" }}>
                     {t("no_data_found")}
                  </Text>
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  <ScrollView
                    vertical={true}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 8 }}
                  >
                    {getLimitedProfiles(bridesData, true).map((product, index) => 
                      renderProfileCard(product, index, true)
                    )}
                  </ScrollView>
                  {renderPremiumUpgradeSection(bridesData.length, getLimitedProfiles(bridesData, true).length, true)}
                </View>
              )}
            </View>
          )}
        </View>
      )}
      {selectedTab === "grooms" && (
        <View style={{ flex: 1 }}>
          {loadingAnimation === true ? (
            <ActivityIndicator
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              size={"large"}
              color={Theme.themeColor}
            />
          ) : (
            <View style={{ flex: 1 }}>
              {groomsData.length === 0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 18, color: "grey" }}>
                    {t("no_data_found")}
                  </Text>
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  <ScrollView
                    vertical={true}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 8 }}
                  >
                    {getLimitedProfiles(groomsData, false).map((product, index) => 
                      renderProfileCard(product, index, false)
                    )}
                  </ScrollView>
                  {renderPremiumUpgradeSection(groomsData.length, getLimitedProfiles(groomsData, false).length, false)}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {selectedTab === "vendors" && (
        <View style={{ flex: 1 }}>
         {loadingAnimation === true ? (
          <ActivityIndicator
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            size={"large"}
            color={Theme.themeColor}
          />
        ) : (
        <View style={{ flex: 1 }}>
          {vendorData.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18, color: "grey" }}>
                {t("no_data_found")}
              </Text>
            </View>
          ) : (
            <ScrollView
              vertical={true}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
            >
              {vendorData.map((vendor, index) => 
                renderVendorCard(vendor, index, 'vendor')
              )}
            </ScrollView>
          )}
        </View>
      )}
      </View>
      )}

      {selectedTab === "decorators" && (
        <View style={{ flex: 1 }}>
        {loadingAnimation === true ? (
         <ActivityIndicator
           style={{
             flex: 1,
             justifyContent: "center",
             alignItems: "center",
           }}
           size={"large"}
           color={Theme.themeColor}
         />
       ) : (
        <View style={{ flex: 1 }}>
          {decoratorData.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18, color: "grey" }}>
                {t("no_data_found")}
              </Text>
            </View>
          ) : (
            <ScrollView
              vertical={true}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
            >
              {decoratorData.map((decorator, index) => 
                renderVendorCard(decorator, index, 'decorator')
              )}
            </ScrollView>
          )}
        </View>
      )}
      </View>
      )}

      {selectedTab === "caterers" && (
        <View style={{ flex: 1 }}>
        {loadingAnimation === true ? (
         <ActivityIndicator
           style={{
             flex: 1,
             justifyContent: "center",
             alignItems: "center",
           }}
           size={"large"}
           color={Theme.themeColor}
         />
       ) : (
        <View style={{ flex: 1 }}>
          {catererData.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18, color: "grey" }}>
                {t("no_data_found")}
              </Text>
            </View>
          ) : (
            <ScrollView
              vertical={true}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
            >
              {catererData.map((caterer, index) => 
                renderVendorCard(caterer, index, 'caterer')
              )}
            </ScrollView>
          )}
        </View>
      )}
      </View>
      )}

      {selectedTab === "planners" && (
        <View style={{ flex: 1 }}>
        {loadingAnimation === true ? (
         <ActivityIndicator
           style={{
             flex: 1,
             justifyContent: "center",
             alignItems: "center",
           }}
           size={"large"}
           color={Theme.themeColor}
         />
       ) : (
        <View style={{ flex: 1 }}>
          {plannerData.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18, color: "grey" }}>
                {t("no_data_found")}
              </Text>
            </View>
          ) : (
            <ScrollView
              vertical={true}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
            >
              {plannerData.map((planner, index) => 
                renderVendorCard(planner, index, 'planner')
              )}
            </ScrollView>
          )}
        </View>
      )}
       </View>
      )}

      {selectedTab === "venues" && (
        <View style={{ flex: 1 }}>
        {loadingAnimation === true ? (
         <ActivityIndicator
           style={{
             flex: 1,
             justifyContent: "center",
             alignItems: "center",
           }}
           size={"large"}
           color={Theme.themeColor}
         />
       ) : (
        <View style={{ flex: 1 }}>
          {venueData.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18, color: "grey" }}>
                {t("no_data_found")}
              </Text>
            </View>
          ) : (
            <ScrollView
              vertical={true}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
            >
              {venueData.map((venue, index) => 
                renderVendorCard(venue, index, 'venue')
              )}
            </ScrollView>
          )}
        </View>
      )}
       </View>
      )}
      {(selectedTab === "grooms" || selectedTab === "brides") && (
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 40,
            right: 20,
            backgroundColor: "#1B1212",
            borderRadius: 30,
            width: 55,
            height: 55,
            justifyContent: "center",
            alignItems: "center",
            elevation: 10,
          }}
          onPress={toggleMenu}
        >
          <Ionicons name="square" size={24} color="grey" />
          <View style={{ position: "absolute", top: 10, left: 10 }}>
            <Ionicons name="funnel" size={20} color="white" />
          </View>
        </TouchableOpacity>
      )}
      <FilterMenu
        menuVisible={menuVisible}
        toggleMenu={toggleMenu}
        filters={filters}
        activeFilter={activeFilter}
        selectedOptions={selectedOptions}
        handleFilterClick={handleFilterClick}
        handleOptionClick={handleOptionClick}
        handleButtonPress={handleButtonPress}
        selectedFiltersArray={selectedFiltersArray}
        setSelectedFiltersArray={setSelectedFiltersArray}
      />

      {/* Requests Modal */}
      <Modal
        visible={requestsModalVisible}
        animationType="slide"
        onRequestClose={() => setRequestsModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <RowBetween style={{ paddingTop: 50, paddingHorizontal: 10 }}>
            <View style={{ alignItems: "center", flexDirection: "row" }}>
              <IconButton 
                icon="arrow-left" 
                onPress={() => setRequestsModalVisible(false)} 
              />
              <TopText
                style={{
                  color: Theme.themeColor,
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                {t("matrimonyHeading")} {t("requests")}
              </TopText>
            </View>
          </RowBetween>

          {requestsLoading ? (
            <ActivityIndicator
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              size="large"
              color={Theme.themeColor}
            />
          ) : (
            <ScrollView style={{ flex: 1 }}>
              <View
                style={{
                  padding: "2%",
                  margin: "2%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Received Requests Section */}
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 15,
                    color: Theme.themeColor,
                  }}
                >
                  {t("received_requests")}
                </Text>
                {receivedRequests.length === 0 ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 200,
                    }}
                  >
                    <Text style={{ fontSize: 16, color: "grey" }}>
                      {t("no_data_found")}
                    </Text>
                  </View>
                ) : (
                  <>
                    {receivedRequests.map((receivedRequest, index) => (
                      <TouchableOpacity key={index}>
                        <View
                          style={{
                            marginVertical: "4%",
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#f8f9fa",
                            padding: 15,
                            borderRadius: 10,
                          }}
                        >
                          <Image
                            style={{
                              width: 60,
                              height: 65,
                              borderRadius: 8,
                              marginRight: "6%",
                            }}
                            source={
                              receivedRequest.sender.images && receivedRequest.sender.images.length > 0
                                ? {
                                    uri: `${receivedRequest.sender.images[0]}`,
                                  }
                                : UserImg
                            }
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontWeight: "bold",
                                opacity: 0.7,
                                fontSize: 17,
                              }}
                            >
                              {receivedRequest.sender.name}
                            </Text>

                          </View>

                          <View
                            style={{
                              flexDirection: "row",
                              marginLeft: "5%",
                              marginTop: "2%",
                            }}
                          >
                            <TouchableOpacity
                              style={{
                                width: 75,
                                height: 35,
                                backgroundColor: "#E9ECEF",
                                borderRadius: 8,
                                paddingHorizontal: 4,
                                margin: 0,
                                marginBottom: 0,
                                justifyContent: "center",
                                alignItems: "center",
                                marginRight: 5,
                              }}
                              onPress={() => {
                                Alert.alert(
                                  "Accept Request",
                                  "Are you sure you want to accept this connection request?",
                                  [
                                    {
                                      text: "Cancel",
                                      style: "cancel"
                                    },
                                    {
                                      text: "Accept",
                                      onPress: () => {
                                        const requestId = receivedRequest._id;
                                        console.log("OnReq: ", requestId);
                                        handleAcceptRequest(requestId);
                                      }
                                    }
                                  ]
                                );
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <Icon
                                  name="checkmark-circle"
                                  size={15}
                                  color="#7AB163"
                                  style={{ marginRight: 5 }}
                                />
                                <Text>{t("accept")}</Text>
                              </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{
                                width: 75,
                                height: 35,
                                backgroundColor: "#E9ECEF",
                                borderRadius: 8,
                                paddingHorizontal: 4,
                                margin: 0,
                                marginBottom: 0,
                                justifyContent: "center",
                                alignItems: "center",
                                marginRight: 0,
                              }}
                              onPress={() => {
                                Alert.alert(
                                  "Delete Request",
                                  "Are you sure you want to delete this connection request?",
                                  [
                                    {
                                      text: "Cancel",
                                      style: "cancel"
                                    },
                                    {
                                      text: "Delete",
                                      style: "destructive",
                                      onPress: () => {
                                        const requestId = receivedRequest._id;
                                        console.log("OnReq: ", requestId);
                                        handleDeleteRequest(requestId);
                                      }
                                    }
                                  ]
                                );
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  paddingVertical: 8,
                                  paddingHorizontal: 12,
                                  borderRadius: 5,
                                }}
                              >
                                <Icon
                                  name="close-circle"
                                  size={15}
                                  color="#ff0000"
                                  style={{ marginRight: 5 }}
                                />
                                <Text>{t("delete")}</Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* Sent Requests Section */}
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 15,
                    marginTop: 30,
                    color: Theme.themeColor,
                  }}
                >
                  {t("sent_requests")}
                </Text>
                {sentRequests.length === 0 ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 200,
                    }}
                  >
                    <Text style={{ fontSize: 16, color: "grey" }}>
                      {t("no_data_found")}
                    </Text>
                  </View>
                ) : (
                  <>
                    {sentRequests.map((sentRequest, index) => (
                      <TouchableOpacity key={index}>
                        <View
                          style={{
                            marginVertical: "4%",
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#f8f9fa",
                            padding: 15,
                            borderRadius: 10,
                          }}
                        >
                          <Image
                            style={{
                              width: 60,
                              height: 65,
                              borderRadius: 8,
                              marginRight: "6%",
                            }}
                            source={
                              sentRequest.receiver.images && sentRequest.receiver.images.length > 0
                                ? {
                                    uri: `${sentRequest.receiver.images[0]}`,
                                  }
                                : UserImg
                            }
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontWeight: "bold",
                                opacity: 0.7,
                                fontSize: 17,
                              }}
                            >
                              {sentRequest.receiver.name}
                            </Text>

                            
                            <Text
                              style={{
                                fontWeight: "500",
                                opacity: 0.6,
                                marginTop: "1%",
                                fontSize: 14,
                              }}
                            >
                              Status: {sentRequest.status}
                            </Text>
                          </View>

                          <View
                            style={{
                              flexDirection: "row",
                              marginLeft: "5%",
                              marginTop: "2%",
                            }}
                          >
                            <View
                              style={{
                                width: 75,
                                height: 35,
                                backgroundColor: sentRequest.status === "pending" ? "#FFF3CD" : "#D4EDDA",
                                borderRadius: 8,
                                paddingHorizontal: 4,
                                margin: 0,
                                marginBottom: 0,
                                justifyContent: "center",
                                alignItems: "center",
                                marginRight: 5,
                              }}
                            >
                              <Text style={{ 
                                color: sentRequest.status === "pending" ? "#856404" : "#155724",
                                fontSize: 12,
                                fontWeight: "600"
                              }}>
                                {sentRequest.status === "pending" ? "Pending" : "Accepted"}
                              </Text>
                            </View>
                            
                            {sentRequest.status === "pending" && (
                              <TouchableOpacity
                                style={{
                                  width: 75,
                                  height: 35,
                                  backgroundColor: "#F8D7DA",
                                  borderRadius: 8,
                                  paddingHorizontal: 4,
                                  margin: 0,
                                  marginBottom: 0,
                                  justifyContent: "center",
                                  alignItems: "center",
                                  marginRight: 0,
                                }}
                                onPress={() => {
                                  Alert.alert(
                                    "Withdraw Request",
                                    "Are you sure you want to withdraw this connection request?",
                                    [
                                      {
                                        text: "Cancel",
                                        style: "cancel"
                                      },
                                      {
                                        text: "Withdraw",
                                        style: "destructive",
                                        onPress: () => handleWithdrawRequest(sentRequest._id)
                                      }
                                    ]
                                  );
                                }}
                              >
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <Icon
                                    name="close-circle"
                                    size={15}
                                    color="#721C24"
                                    style={{ marginRight: 5 }}
                                  />
                                  <Text style={{ 
                                    color: "#721C24",
                                    fontSize: 12,
                                    fontWeight: "600"
                                  }}>
                                    Withdraw
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Premium Subscription Modal */}
      <PremiumSubscriptionModal
        visible={premiumModalVisible}
        onClose={() => setPremiumModalVisible(false)}
        onSubscribe={async (subscriptionData) => {
          try {
            await fetchSubscriptionStatus();
            Alert.alert(
              'Success!',
              'Your premium subscription has been activated. You can now view all profiles!',
              [{ text: 'OK' }]
            );
          } catch (error) {
            console.error('Error refreshing subscription status:', error);
          }
        }}
        subscriptionPlans={subscriptionPlans}
        loading={subscriptionLoading}
      />
     
    </Container>
  );
};

export default NewMatrimony;

const styles = StyleSheet.create({
  premiumUpgradeSection: {
    backgroundColor: '#FFF3CD',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  premiumUpgradeContent: {
    alignItems: 'center',
  },
  premiumUpgradeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
    textAlign: 'center',
  },
  premiumUpgradeDescription: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: Theme.themeColor,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  premiumText: {
    fontSize: 10,
    color: '#856404',
    fontWeight: '600',
    marginLeft: 2,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  headerText: {
    color: Theme.themeColor,
    fontSize: 20,
    fontWeight: "bold",
  },
  profileImage: {
    width: 35,
    height: 35,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 15,
    color: "grey",
  },
  searchContainer: {
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  searchField: {
    // Define styles for search field
  },
  // tabsContainer: {
  //   flexDirection: "row",
  //   justifyContent: "space-around",
  //   alignItems: "center",
  //   marginTop: 8,
  // },
  // tab: {
  //   paddingVertical: 8,
  //   paddingHorizontal: 14,
  //   borderRadius: 20,
  // },
  // selectedTab: {
  //   backgroundColor: "#D4AF37",
  // },
  // tabText: {
  //   color: "black",
  // },
  // selectedTabText: {
  //   color: "white",
  // },
  // scrollView: {
  //   padding: "2%",
  //   margin: "2%",
  //   display: "flex",
  //   flexDirection: "row",
  //   flex: 1,
  // },
  tabsContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 5,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
  cardContainer: {
    padding: 16,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  cardImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  cardHeader: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  cardText: {
    marginBottom: 8,
    fontSize: 14,
  },
  viewDetails: {
    color: Theme.themeColor,
    fontWeight: "bold",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    paddingVertical: 10,
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
  },
  iconText: {
    marginTop: 4,
  },
});









// import { React, useState, useEffect, useCallback, useRef } from "react";
// import { debounce } from "lodash";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Dimensions,
//   ActivityIndicator,
// } from "react-native";
// import { IconButton } from "react-native-paper";
// import Icon from "react-native-vector-icons/Ionicons";
// import { Container, RowBetween, SearchField } from "../../styles/common.styles";
// import { TopText } from "../../styles/social.styles";
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import Profile from "../../assets/images/B2b/profile.png";
// import { useSelector } from "react-redux";
// import { useIsFocused } from "@react-navigation/native";


// import {
//   HallDetailsContainer,
//   HallImageContainer,
//   Heading,
//   JobLocation,
//   Row,
//   TopHeader,
//   ViewDetails,
// } from "../../styles/dashboard.styles";
// import UserImg from "../../assets/images/general/user.png";
// import FilterMenu from "./FilterMenu";
// import Theme from "../../styles/theme";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import apiClient from "../../store/apiClient";
// import {
//   fetchMatrimonyData,
//   fetchVendorData,
//   fetchDecoratorData,
//   fetchCatererData,
//   fetchPlannerData,
//   fetchVenueData
// } from "./matrimonyAPIs";
// const NewMatrimony = ({ navigation }) => {
//   //user data
//   const { user } = useSelector((state) => state.user);
//   const userType = useSelector((state) => state.user.user.userType);
//   const user_gender = user.roleData.gender;

//   const isFocused = useIsFocused();
//   const [selectedFiltersArray, setSelectedFiltersArray] = useState([]);
//   const token = useSelector((state) => state.user.token);
//   const scrollViewRef = useRef();
//   //for tab
//   const [loadingAnimation, setLoadingAnimation] = useState(true);
//   const [selectedTab, setSelectedTab] = useState(
//     user.userType === "matrimonyMan"
//       ? "Brides"
//       : user.userType === "matrimonyWoman"
//       ? "Grooms"
//       : "Vendors"
//   );
//   const screenWidth = Dimensions.get("window").width;
//   const tabWidth = screenWidth / 3.2;

//   const handleTabPress = (tab, index) => {
//     setSelectedTab(tab);

//     // Scroll to the specific tab when clicked
//     scrollViewRef.current.scrollTo({
//       x: tabWidth * index, // Scroll based on tab index and tab width
//       animated: true,
//     });
//   };

//   // const debouncedFetchMatrimonyData = useCallback(
//   //   debounce((searchTerm, selectedFiltersArray) => {
//   //     console.log("Search triggered: ", searchTerm);
//   //     fetchMatrimonyData(searchTerm, selectedFiltersArray);
//   //   }, 1200),
//   //   []
//   // );
//   //searchbar
//   const [isSearchVisible, setIsSearchVisible] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const handleSearch = (e) => {
//     setSearchTerm(e);
//     console.log("Search term: ", e);
//   };
//   const toggleSearch = () => setIsSearchVisible(!isSearchVisible);

//   const handleButtonPress = (buttonName) => {
//     console.log("inside buttonpress");
//     setActiveButton(buttonName);
//     if (buttonName === "clear") {
//       setSelectedOptions([]);
//       setSelectedFiltersArray([]);
//     }
//   };

//   // useEffect(() => {
//   //   console.log("inside useeffect");
//   //   setMenuVisible(false);
//   //   debouncedFetchMatrimonyData(searchTerm, selectedFiltersArray);
//   // }, [searchTerm, selectedFiltersArray]);

//   const [activeFilter, setActiveFilter] = useState("Marital Status");
//   const [selectedOptions, setSelectedOptions] = useState([]);
//   const [activeButton, setActiveButton] = useState(null);
//   const filters = [
//     {
//       name: "Marital Status",
//       options: ["Single", "Divorced", "Widower"],
//     },
//     {
//       name: "Age",
//       options: ["18-25", "26-35", "36-45", "46-60", "60+"],
//     },
//   ];

//   const [selectedAgeRange, setSelectedAgeRange] = useState(null);

//   const handleFilterClick = (filterName) => {
//     setActiveFilter(filterName);
//   };

//   // const handleOptionClick = (option) => {
//   //   if (activeFilter === "Marital Status") {
//   //     // For the "Marital Status" filter, toggle the selection
//   //     setSelectedOptions((prevSelectedOptions) => {
//   //       const isSelected = prevSelectedOptions.includes(option);

//   //       // Remove the selected option or add it
//   //       return isSelected
//   //         ? prevSelectedOptions.filter((item) => item !== option)
//   //         : [...prevSelectedOptions, option];
//   //     });
//   //   }else if (activeFilter === "Age") {
//   //     // Update the selected age range
//   //     setSelectedAgeRange(option);
//   //   }
//   //    else {
//   //     // For other filters, toggle options as usual
//   //     setSelectedOptions((prevSelectedOptions) => {
//   //       const updatedOptions = prevSelectedOptions.includes(option)
//   //         ? prevSelectedOptions.filter((item) => item !== option)
//   //         : [...prevSelectedOptions, option];

//   //       return updatedOptions;
//   //     });
//   //   }
//   // };

//   const handleOptionClick = (option) => {
//     if (activeFilter === "Marital Status" || activeFilter === "Age") {
//       setSelectedOptions((prevSelectedOptions) => {
//         const isSelected = prevSelectedOptions.includes(option);
//         return isSelected
//           ? prevSelectedOptions.filter((item) => item !== option)
//           : [...prevSelectedOptions, option];
//       });
//     }
//   };
//   const matrimonyMenu = [
//     "Brides",
//     "Grooms",
//     "Vendors",
//     "Decorators",
//     "Caterers",
//     "Planners",
//     "Venues",
//   ];

//   const displayMenu = matrimonyMenu.filter((menuItem) => {
//     if (menuItem === "Brides") {
//       return user.userType === "matrimonyMan";
//     }
//     if (menuItem === "Grooms") {
//       return user.userType === "matrimonyWoman";
//     }
//     return true; // Include all other menu items for all users
//   });

//   //filter menu?
//   const [menuVisible, setMenuVisible] = useState(false);
//   const toggleMenu = () => {
//     setMenuVisible(!menuVisible);
//   };

//   //to fetch matrimony data
//   const [matrimonyData, setMatrimonyData] = useState([]);
//   const [bridesData, setBridesData] = useState([]);
//   const [groomsData, setGroomsData] = useState([]);
//   const [vendorData, setVendorData] = useState([]);
//   const [decoratorData, setDecoratorData] = useState([]);
//   const [catererData, setCatererData] = useState([]);
//   const [venueData, setVenueData] = useState([]);
//   const [plannerData, setPlannerData] = useState([]);

//   // const fetchMatrimonyData = async (queryString, selectedFiltersArray) => {
//   //   selectedFiltersArray.forEach((filter) => {
//   //     if (filter["Filter name"] === "Marital Status") {
//   //       filter.Options.forEach((option) =>
//   //         queryParams.append("maritalStatus", option)
//   //       );
//   //     } else if (filter["Filter name"] === "Age") {
//   //       const ageRanges = {
//   //         "18-25": { ageFrom: 18, ageTo: 25 },
//   //         "26-35": { ageFrom: 26, ageTo: 35 },
//   //         "36-45": { ageFrom: 36, ageTo: 45 },
//   //         "46-60": { ageFrom: 46, ageTo: 60 },
//   //         "60+": { ageFrom: 60, ageTo: 100 },
//   //       };

//   //       // Make sure you get the correct selected option
//   //       const selectedOption = filter.Options[0]; // Assuming one option can be selected at a time
//   //       const selectedRange = ageRanges[selectedOption];

//   //       if (selectedRange) {
//   //         queryParams.append("ageFrom", selectedRange.ageFrom);
//   //         queryParams.append("ageTo", selectedRange.ageTo);
//   //       }
//   //     }
//   //   });

//   //   const url = `${BASEAPIURL}/matrimony/matrimonyUsers?${queryString}`;

//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await fetch(url, {
//   //       method: "GET",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });

//   //     if (response.ok) {
//   //       const data = await response.json();
//   //       setMatrimonyData(data.data);
//   //       console.log("fetched data", data.data);
//   //       setBridesData(
//   //         data.data.filter((matrimony) => matrimony.gender === "female")
//   //       );
//   //       setGroomsData(
//   //         data.data.filter((matrimony) => matrimony.gender === "male")
//   //       );
//   //     } else {
//   //       throw new Error("Failed to fetch matrimony data");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching matrimony data:", error);
//   //   } finally {
//   //     setLoadingAnimation(false);
//   //   }
//   // };
//   // // to fetch vendor data
//   // const fetchVendorData = async (queryString, selectedFiltersArray) => {
//   //   const vendorUrl = `${BASEAPIURL}/matrimony/matrimonyVendor/matrimonyVendors?${queryString}`;
//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await fetch(vendorUrl, {
//   //       method: "GET",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });

//   //     if (response.ok) {
//   //       const data = await response.json();
//   //       console.log("Fetched vendor data:", data);
//   //       setVendorData(data.data);
//   //     } else {
//   //       throw new Error("Failed to fetch vendor data");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching vendor data:", error);
//   //   } finally {
//   //     setLoadingAnimation(false);
//   //   }
//   // };
//   // // to fetch decorator data
//   // const fetchDecoratorData = async (queryString, selectedFiltersArray) => {
//   //   const decoratorUrl = `${BASEAPIURL}/matrimony/decorator/decorators?${queryString}`;
//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await fetch(decoratorUrl, {
//   //       method: "GET",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });

//   //     if (response.ok) {
//   //       const data = await response.json();
//   //       console.log("Fetched decorator data:", data);
//   //       setDecoratorData(data.data);
//   //     } else {
//   //       throw new Error("Failed to fetch decorator data");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching decorator data:", error);
//   //   } finally {
//   //     setLoadingAnimation(false);
//   //   }
//   // };
//   // // to fetch caterers data
//   // const fetchCatererData = async (queryString, selectedFiltersArray) => {
//   //   const catererUrl = `${BASEAPIURL}/matrimony/caterer/caterers?${queryString}`;
//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await fetch(catererUrl, {
//   //       method: "GET",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });

//   //     if (response.ok) {
//   //       const data = await response.json();
//   //       console.log("Fetched caterer data:", data);
//   //       setCatererData(data.data);
//   //     } else {
//   //       throw new Error("Failed to fetch caterer data");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching caterer data:", error);
//   //   } finally {
//   //     setLoadingAnimation(false);
//   //   }
//   // };
//   // // to fetch planners data
//   // const fetchPlannerData = async (queryString, selectedFiltersArray) => {
//   //   const plannerUrl = `${BASEAPIURL}/matrimony/planner/planners?${queryString}`;
//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await fetch(plannerUrl, {
//   //       method: "GET",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });

//   //     if (response.ok) {
//   //       const data = await response.json();
//   //       console.log("Fetched planner data:", data);
//   //       setPlannerData(data.data);
//   //     } else {
//   //       throw new Error("Failed to fetch planner data");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching planner data:", error);
//   //   } finally {
//   //     setLoadingAnimation(false);
//   //   }
//   // };
//   // // to fetch venues data
//   // const fetchVenueData = async (queryString, selectedFiltersArray) => {
//   //   const venueUrl = `${BASEAPIURL}/matrimony/venue/venues?${queryString}`;
//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await fetch(venueUrl, {
//   //       method: "GET",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });

//   //     if (response.ok) {
//   //       const data = await response.json();
//   //       console.log("Fetched venue data:", data);
//   //       setVenueData(data.data);
//   //     } else {
//   //       throw new Error("Failed to fetch venue data");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching venue data:", error);
//   //   } finally {
//   //     setLoadingAnimation(false);
//   //   }
//   // };



//   //correct one
//   // const fetchMatrimonyData = async (queryString, selectedFiltersArray) => {
//   //   const queryParams = new URLSearchParams();
  
//   //   selectedFiltersArray.forEach((filter) => {
//   //     if (filter["Filter name"] === "Marital Status") {
//   //       filter.Options.forEach((option) =>
//   //         queryParams.append("maritalStatus", option)
//   //       );
//   //     } else if (filter["Filter name"] === "Age") {
//   //       const ageRanges = {
//   //         "18-25": { ageFrom: 18, ageTo: 25 },
//   //         "26-35": { ageFrom: 26, ageTo: 35 },
//   //         "36-45": { ageFrom: 36, ageTo: 45 },
//   //         "46-60": { ageFrom: 46, ageTo: 60 },
//   //         "60+": { ageFrom: 60, ageTo: 100 },
//   //       };
  
//   //       const selectedOption = filter.Options[0];
//   //       const selectedRange = ageRanges[selectedOption];
  
//   //       if (selectedRange) {
//   //         queryParams.append("ageFrom", selectedRange.ageFrom);
//   //         queryParams.append("ageTo", selectedRange.ageTo);
//   //       }
//   //     }
//   //   });
  
//   //   const token = await AsyncStorage.getItem("token");
//   //   const url = `${BASEAPIURL}/matrimony/matrimonyUsers?${queryString}&${queryParams.toString()}`;
  
//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await apiClient.get(url, {
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });
  
//   //     const data = response.data;
//   //     setMatrimonyData(data.data);
//   //     console.log("fetched data", data.data);
//   //     setBridesData(data.data.filter((matrimony) => matrimony.gender === "female"));
//   //     setGroomsData(data.data.filter((matrimony) => matrimony.gender === "male"));
//   //   } catch (error) {
//   //     console.error("Error fetching matrimony data:", error);
//   //   } finally {
//   //     setLoadingAnimation(false);
//   //   }
//   // };
  
//   // const fetchVendorData = async (queryString, selectedFiltersArray) => {
//   //   const token = await AsyncStorage.getItem("token");
//   //   const vendorUrl = `${BASEAPIURL}/matrimony/matrimonyVendor/matrimonyVendors?${queryString}`;
  
//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await apiClient.get(vendorUrl, {
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });
  
//   //     const data = response.data;
//   //     console.log("Fetched vendor data:", data);
//   //     setVendorData(data.data);
//   //   } catch (error) {
//   //     console.error("Error fetching vendor data:", error);
//   //   } finally {
//   //     setLoadingAnimation(false);
//   //   }
//   // };
  
//   // const fetchDecoratorData = async (queryString, selectedFiltersArray) => {
//   //   const token = await AsyncStorage.getItem("token");
//   //   const decoratorUrl = `${BASEAPIURL}/matrimony/decorator/decorators?${queryString}`;
  
//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await apiClient.get(decoratorUrl, {
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });
  
//   //     const data = response.data;
//   //     console.log("Fetched decorator data:", data);
//   //     setDecoratorData(data.data);
//   //   } catch (error) {
//   //     console.error("Error fetching decorator data:", error);
//   //   } finally {
//   //     setLoadingAnimation(false);
//   //   }
//   // };
  
//   // const fetchCatererData = async (queryString, selectedFiltersArray) => {
//   //   const token = await AsyncStorage.getItem("token");
//   //   const catererUrl = `${BASEAPIURL}/matrimony/caterer/caterers?${queryString}`;
  
//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await apiClient.get(catererUrl, {
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });
  
//   //     const data = response.data;
//   //     console.log("Fetched caterer data:", data);
//   //     setCatererData(data.data);
//   //   } catch (error) {
//   //     console.error("Error fetching caterer data:", error);
//   //   } finally {
//   //     setLoadingAnimation(false);
//   //   }
//   // };
  
//   // const fetchPlannerData = async (queryString, selectedFiltersArray) => {
//   //   const token = await AsyncStorage.getItem("token");
//   //   const plannerUrl = `${BASEAPIURL}/matrimony/planner/planners?${queryString}`;
  
//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await apiClient.get(plannerUrl, {
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });
  
//   //     const data = response.data;
//   //     console.log("Fetched planner data:", data);
//   //     setPlannerData(data.data);
//   //   } catch (error) {
//   //     console.error("Error fetching planner data:", error);
//   //   } finally {
//   //     setLoadingAnimation(false);
//   //   }
//   // };
  
//   // const fetchVenueData = async (queryString, selectedFiltersArray) => {
//   //   const token = await AsyncStorage.getItem("token");
//   //   const venueUrl = `${BASEAPIURL}/matrimony/venue/venues?${queryString}`;
  
//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await apiClient.get(venueUrl, {
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });
  
//   //     const data = response.data;
//   //     console.log("Fetched venue data:", data);
//   //     setVenueData(data.data);
//   //   } catch (error) {
//   //     console.error("Error fetching venue data:", error);
//   //   } finally {
//   //     setLoadingAnimation(false);
//   //   }
//   // };
  
//   const handleFetchMatrimonyData = async (queryString, selectedFiltersArray) => {
//     try {
//       setLoadingAnimation(true);
//       const data = await fetchMatrimonyData(queryString, selectedFiltersArray);
//       setMatrimonyData(data);
//       setBridesData(data.filter((matrimony) => matrimony.gender === "female"));
//       setGroomsData(data.filter((matrimony) => matrimony.gender === "male"));
//     } catch (error) {
//       console.error("Error fetching matrimony data:", error);
//     } finally {
//       setLoadingAnimation(false);
//     }
//   };
//   const handleFetchVendorData = async (queryString) => {
//     try {
//       setLoadingAnimation(true);
//       const data = await fetchVendorData(queryString);
//       setVendorData(data);
//     } catch (error) {
//       console.error("Error fetching vendor data:", error);
//     } finally {
//       setLoadingAnimation(false);
//     }
//   };
//   const handleFetchVenueData = async (queryString) => {
//     try {
//       setLoadingAnimation(true);
//       const data = await fetchVenueData(queryString);
//       setVenueData(data);
//     } catch (error) {
//       console.error("Error fetching vendor data:", error);
//     } finally {
//       setLoadingAnimation(false);
//     }
//   };
//   const handleFetchCatererData = async (queryString) => {
//     try {
//       setLoadingAnimation(true);
//       const data = await fetchCatererData(queryString);
//       setCatererData(data);
//     } catch (error) {
//       console.error("Error fetching vendor data:", error);
//     } finally {
//       setLoadingAnimation(false);
//     }
//   };
//   const handleFetchDecoratorData = async (queryString) => {
//     try {
//       setLoadingAnimation(true);
//       const data = await fetchDecoratorData(queryString);
//       setDecoratorData(data);
//     } catch (error) {
//       console.error("Error fetching vendor data:", error);
//     } finally {
//       setLoadingAnimation(false);
//     }
//   };
//   const handleFetchPlannerData = async (queryString) => {
//     try {
//       setLoadingAnimation(true);
//       const data = await fetchPlannerData(queryString);
//       setPlannerData(data);
//     } catch (error) {
//       console.error("Error fetching vendor data:", error);
//     } finally {
//       setLoadingAnimation(false);
//     }
//   };
  
  
//   // const tabToFetchFunction = {
//   //   Brides: fetchMatrimonyData,
//   //   Grooms: fetchMatrimonyData,
//   //   Vendors: fetchVendorData,
//   //   Decorators: fetchDecoratorData,
//   //   Caterers: fetchCatererData,
//   //   Planners: fetchPlannerData,
//   //   Venues: fetchVenueData,
//   // };

//   const tabToFetchFunction = {
//     Brides: handleFetchMatrimonyData,
//     Grooms: handleFetchMatrimonyData,
//     Vendors: handleFetchVendorData,
//     Decorators: handleFetchDecoratorData,
//     Caterers: handleFetchCatererData,
//     Planners: handleFetchPlannerData,
//     Venues: handleFetchVenueData,
//   };

  

//   // Debounced fetch function to avoid unnecessary API calls
//   const debouncedFetchData = useCallback(
//     debounce((searchTerm, selectedTab, selectedFiltersArray) => {
//       console.log(
//         "Fetching data for tab:",
//         selectedTab,
//         "with searchTerm:",
//         searchTerm
//       );
//       setMenuVisible(false);
//       const queryParams = new URLSearchParams();
//       if (searchTerm.trim()) {
//         queryParams.append("search", searchTerm);
//       }

//       const queryString = queryParams.toString();

//       // Dynamically call the API function based on the active tab
//       const fetchFunction = tabToFetchFunction[selectedTab];
//       if (fetchFunction) {
//         fetchFunction(queryString, selectedFiltersArray);
//       }
//     }, 1200), // Adjust debounce delay as needed
//     []
//   );

//   // Effect to trigger fetch whenever searchTerm or selectedTab changes
//   useEffect(() => {
//     debouncedFetchData(searchTerm, selectedTab, selectedFiltersArray);
//   }, [searchTerm, selectedTab, selectedFiltersArray]);

//   // useEffect(() => {
//   //   fetchMatrimonyData();
//   //   fetchVendorData();
//   //   fetchCatererData();
//   //   fetchDecoratorData();
//   //   fetchPlannerData();
//   //   fetchVenueData()
//   // }, []);

//   return (
//     <Container style={{ backgroundColor: "white", paddingBottom: 0 }}>
//       <RowBetween style={{ paddingTop: 24 }}>
//         <View style={{ alignItems: "center", flexDirection: "row" }}>
//           <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
//           <TopText
//             style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}
//           >
//             Matrimony
//           </TopText>
//         </View>
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <Icon
//             name="search"
//             size={24}
//             style={{ marginRight: 15, color: "grey" }}
//             onPress={toggleSearch}
//           />
//           <TouchableOpacity
//             onPress={() => navigation.navigate("MyMatrimonyProfile")}
//           >
//             <Image
//               source={Profile}
//               style={{ width: 35, height: 35, marginRight: 10 }}
//             />
//           </TouchableOpacity>

//           <IconButton
//             icon="bell-outline"
//             style={{ marginLeft: "auto" }}
//             onPress={() =>
//               navigation.navigate("MatrimonyNotifications", {
//                 user: user,
//               })
//             }
//           ></IconButton>
//         </View>
//       </RowBetween>
//       {isSearchVisible && (
//         <View
//           style={{
//             alignItems: "center",
//             marginLeft: 16,
//             marginRight: 16,
//             marginBottom: 10,
//           }}
//         >
//           <SearchField placeholder="Search" onChangeText={handleSearch} />
//         </View>
//       )}

//       <View style={styles.tabsContainer}>
//         <ScrollView
//           horizontal
//           ref={scrollViewRef}
//           showsHorizontalScrollIndicator={false}
//           snapToInterval={tabWidth} // Snaps to each tab width
//           decelerationRate="fast" // Fast snapping effect
//           // contentContainerStyle={{ paddingHorizontal: 5 }}
//         >
//           {displayMenu.map((tab, index) => (
//             <TouchableOpacity
//               key={tab}
//               onPress={() => handleTabPress(tab, index)} // Pass both 'tab' and 'index' to handleTabPress
//               style={[
//                 styles.tab,
//                 { width: tabWidth - 8 }, // Expose part of the next tab
//                 selectedTab === tab ? styles.selectedTab : {},
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.tabText,
//                   selectedTab === tab ? styles.selectedTabText : {},
//                 ]}
//               >
//                 {tab}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>

//       {selectedTab === "Brides" && (
//         <View style={{ flex: 1 }}>
//           {loadingAnimation === true ? (
//             <ActivityIndicator
//               style={{
//                 flex: 1,
//                 justifyContent: "center",
//                 alignItems: "center",
//               }}
//               size={"large"}
//               color={Theme.themeColor}
//             />
//           ) : (
//             <View
//               style={[
//                 // styles.shadowProp,
//                 {
//                   // backgroundColor: "#e6f9ff",
//                   padding: "2%",
//                   margin: "2%",
//                   display: "flex",
//                   flexDirection: "row",
//                   flex: 1,
//                 },
//               ]}
//             >
//               {bridesData.length === 0 ? (
//                 <View
//                   style={{
//                     flex: 1,
//                     justifyContent: "center",
//                     alignItems: "center",
//                   }}
//                 >
//                   <Text style={{ fontSize: 18, color: "grey" }}>
//                     No data found
//                   </Text>
//                 </View>
//               ) : (
//                 <ScrollView
//                   vertical={true}
//                   showsVerticalScrollIndicator={false}
//                 >
//                   {bridesData.map((product, index) => (
//                     <TouchableOpacity
//                       key={index}
//                       style={{
//                         padding: 16,
//                         flexDirection: "row",
//                         borderBottomWidth: 1,
//                         borderBottomColor: "#ccc",
//                         backgroundColor: "#fff",
//                       }}
//                     >
//                       <HallImageContainer>
//                         
//                         <Image
//                           source={
//                             product.images
//                               ? {
//                                   uri: `${product.images[0]}`,
//                                 }
//                               : UserImg
//                           }
//                           style={{ width: 120, height: 120, borderRadius: 8 }}
//                         />
//                       </HallImageContainer>

//                       <HallDetailsContainer
//                         style={{
//                           flex: 1,
//                           marginLeft: 12,
//                           justifyContent: "space-between",
//                         }}
//                       >
//                         <TopHeader style={{ marginBottom: 8 }}>
//                           <Heading>{product.name}</Heading>
//                         </TopHeader>
//                         <Row style={{ marginBottom: 8 }}>
//                           <JobLocation>{product.occupation}</JobLocation>
//                         </Row>
//                         <Row style={{ marginBottom: 8 }}>
//                           <JobLocation>{product.homeTown}</JobLocation>
//                         </Row>
//                         <TouchableOpacity
//                           onPress={() =>
//                             navigation.navigate("MatrimonyProfileNew", {
//                               matrimonyData: bridesData[index],
//                               groomsData: groomsData,
//                             })
//                           }
//                         >
//                           <ViewDetails>View Details</ViewDetails>
//                         </TouchableOpacity>
//                       </HallDetailsContainer>
//                     </TouchableOpacity>
//                   ))}
//                 </ScrollView>
//               )}
//             </View>
//           )}
//         </View>
//       )}
//       {selectedTab === "Grooms" && (
//         <View style={{ flex: 1 }}>
//           {loadingAnimation === true ? (
//             <ActivityIndicator
//               style={{
//                 flex: 1,
//                 justifyContent: "center",
//                 alignItems: "center",
//               }}
//               size={"large"}
//               color={Theme.themeColor}
//             />
//           ) : (
//             <View
//               style={[
//                 // styles.shadowProp,
//                 {
//                   // backgroundColor: "#e6f9ff",
//                   padding: "2%",
//                   margin: "2%",
//                   display: "flex",
//                   flexDirection: "row",
//                   flex: 1,
//                 },
//               ]}
//             >
//               {groomsData.length === 0 ? (
//                 <View
//                   style={{
//                     flex: 1,
//                     justifyContent: "center",
//                     alignItems: "center",
//                   }}
//                 >
//                   <Text style={{ fontSize: 18, color: "grey" }}>
//                     No data found
//                   </Text>
//                 </View>
//               ) : (
//                 <ScrollView
//                   vertical={true}
//                   showsVerticalScrollIndicator={false}
//                 >
//                   {groomsData.map((product, index) => (
//                     <TouchableOpacity
//                       key={index}
//                       style={{
//                         padding: 16,
//                         flexDirection: "row",
//                         borderBottomWidth: 1,
//                         borderBottomColor: "#ccc",
//                         backgroundColor: "#fff",
//                       }}
//                     >
//                       <HallImageContainer>
//                         <Image
//                           source={
//                             product.images
//                               ? {
//                                   uri: `${product.images[0]}`,
//                                 }
//                               : UserImg
//                           }
//                           style={{ width: 120, height: 120, borderRadius: 8 }}
//                         />
//                       </HallImageContainer>
//                       <HallDetailsContainer
//                         style={{
//                           flex: 1,
//                           marginLeft: 12,
//                           justifyContent: "space-between",
//                         }}
//                       >
//                         <TopHeader style={{ marginBottom: 8 }}>
//                           <Heading>{product.name}</Heading>
//                         </TopHeader>
//                         <Row style={{ marginBottom: 4 }}>
//                           <JobLocation>{product.occupation}</JobLocation>
//                         </Row>
//                         <Row style={{ marginBottom: 4 }}>
//                           <JobLocation>{product.homeTown}</JobLocation>
//                         </Row>
//                         <TouchableOpacity
//                           onPress={() =>
//                             navigation.navigate("MatrimonyProfileNew", {
//                               matrimonyData: groomsData[index],
//                             })
//                           }
//                         >
//                           <ViewDetails>View Details</ViewDetails>
//                         </TouchableOpacity>
//                       </HallDetailsContainer>
//                     </TouchableOpacity>
//                   ))}
//                 </ScrollView>
//               )}
//             </View>
//           )}
//         </View>
//       )}

//       {selectedTab === "Vendors" && (
//         <View style={{ flex: 1 }}>
//          {loadingAnimation === true ? (
//           <ActivityIndicator
//             style={{
//               flex: 1,
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//             size={"large"}
//             color={Theme.themeColor}
//           />
//         ) : (
//         <View
//           style={{
//             padding: "2%",
//             margin: "2%",
//             display: "flex",
//             flexDirection: "row",
//             flex: 1,
//           }}
//         >
//           {vendorData.length === 0 ? (
//                 <View
//                   style={{
//                     flex: 1,
//                     justifyContent: "center",
//                     alignItems: "center",
//                   }}
//                 >
//                   <Text style={{ fontSize: 18, color: "grey" }}>
//                     No data found
//                   </Text>
//                 </View>
//               ) : (
//           <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
//             {vendorData.map((product, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={{
//                   padding: 16,
//                   flexDirection: "row",
//                   borderBottomWidth: 1,
//                   borderBottomColor: "#ccc",
//                   backgroundColor: "#fff",
//                   width: "100%", // Ensuring each item takes the full width of the, ScrollView,
//                 }}
//               >
//                 <HallImageContainer>
//                   <Image
//                    source={{ uri: `${product.images[0]}` }}
//                     style={{ width: 120, height: 120, borderRadius: 8 }}
//                   />
//                 </HallImageContainer>
//                 <HallDetailsContainer
//                   style={{
//                     flex: 1,
//                     marginLeft: 12,
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <TopHeader style={{ marginBottom: 8 }}>
//                     <Heading>{product.businessName}</Heading>
//                   </TopHeader>
//                   <Row style={{ marginBottom: 4 }}>
//                     <JobLocation>{product.address}</JobLocation>
//                   </Row>
//                   <Row style={{ marginBottom: 4 }}>
//                     {/* <JobLocation>
//                       {product.city}, {product.state}
//                     </JobLocation> */}
//                   </Row>

//                   <TouchableOpacity
//                     onPress={() =>
//                       navigation.navigate(
//                         "MatrimonyProfileWithConnection",
//                         vendorData[index]
//                       )
//                     }
//                   >
//                     <ViewDetails>View Details</ViewDetails>
//                   </TouchableOpacity>
//                 </HallDetailsContainer>
//               </TouchableOpacity>
//             ))}
//             {/* <TouchableOpacity
//               style={{
//                 position: "absolute",
//                 bottom: 50,
//                 right: 50,
//                 backgroundColor: "#000000",
//                 borderRadius: 30,
//                 width: 55,
//                 height: 55,
//                 justifyContent: "center",
//                 alignItems: "center",
//                 elevation: 10,
//               }}
//             >
//               <Ionicons name="square" size={24} color="grey" />
//               <View style={{ position: "absolute", top: 10, left: 10 }}>
//                 <Ionicons name="funnel" size={20} color="white" />
//               </View>
//             </TouchableOpacity> */}
//           </ScrollView>
//           )}
           
//         </View>
//       )}
//       </View>
//       )}

//       {selectedTab === "Decorators" && (
//         <View style={{ flex: 1 }}>
//         {loadingAnimation === true ? (
//          <ActivityIndicator
//            style={{
//              flex: 1,
//              justifyContent: "center",
//              alignItems: "center",
//            }}
//            size={"large"}
//            color={Theme.themeColor}
//          />
//        ) : (
//         <View
//           style={{
//             padding: "2%",
//             margin: "2%",
//             display: "flex",
//             flexDirection: "row",
//             flex: 1,
//           }}
//         >
//           {decoratorData.length === 0 ? (
//                 <View
//                   style={{
//                     flex: 1,
//                     justifyContent: "center",
//                     alignItems: "center",
//                   }}
//                 >
//                   <Text style={{ fontSize: 18, color: "grey" }}>
//                     No data found
//                   </Text>
//                 </View>
//               ) : (
//           <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
//             {decoratorData.map((product, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={{
//                   padding: 16,
//                   flexDirection: "row",
//                   borderBottomWidth: 1,
//                   borderBottomColor: "#ccc",
//                   backgroundColor: "#fff",
//                   width: "100%", // Ensuring each item takes the full width of the, ScrollView,
//                 }}
//               >
//                 <HallImageContainer>
//                   <Image
//                     source={{ uri: `${product.images[0]}` }}
//                     style={{ width: 120, height: 120, borderRadius: 8 }}
//                   />
//                 </HallImageContainer>
//                 <HallDetailsContainer
//                   style={{
//                     flex: 1,
//                     marginLeft: 12,
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <TopHeader style={{ marginBottom: 8 }}>
//                     <Heading>{product.businessName}</Heading>
//                   </TopHeader>
//                   <Row style={{ marginBottom: 4 }}>
//                     <JobLocation>{product.address}</JobLocation>
//                   </Row>
//                   {/* <Row style={{ marginBottom: 4 }}>
//                     <JobLocation>{product.city}</JobLocation>
//                   </Row> */}

//                   <TouchableOpacity
//                     onPress={() =>
//                       navigation.navigate(
//                         "MatrimonyProfileWithConnection",
//                         decoratorData[index]
//                       )
//                     }
//                   >
//                     <ViewDetails>View Details</ViewDetails>
//                   </TouchableOpacity>
//                 </HallDetailsContainer>
//               </TouchableOpacity>
//             ))}
//             {/* <TouchableOpacity
//               style={{
//                 position: "absolute",
//                 bottom: 50,
//                 right: 50,
//                 backgroundColor: "#000000",
//                 borderRadius: 30,
//                 width: 55,
//                 height: 55,
//                 justifyContent: "center",
//                 alignItems: "center",
//                 elevation: 10,
//               }}
//             >
//               <Ionicons name="square" size={24} color="grey" />
//               <View style={{ position: "absolute", top: 10, left: 10 }}>
//                 <Ionicons name="funnel" size={20} color="white" />
//               </View>
//             </TouchableOpacity> */}
//           </ScrollView>
//               )}
//         </View>
//       )}
//       </View>
//       )}

//       {selectedTab === "Caterers" && (
//         <View style={{ flex: 1 }}>
//         {loadingAnimation === true ? (
//          <ActivityIndicator
//            style={{
//              flex: 1,
//              justifyContent: "center",
//              alignItems: "center",
//            }}
//            size={"large"}
//            color={Theme.themeColor}
//          />
//        ) : (
//         <View
//           style={{
//             padding: "2%",
//             margin: "2%",
//             display: "flex",
//             flexDirection: "row",
//             flex: 1,
//           }}
//         >
//            {catererData.length === 0 ? (
//                 <View
//                   style={{
//                     flex: 1,
//                     justifyContent: "center",
//                     alignItems: "center",
//                   }}
//                 >
//                   <Text style={{ fontSize: 18, color: "grey" }}>
//                     No data found
//                   </Text>
//                 </View>
//               ) : (
//           <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
//             {catererData.map((product, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={{
//                   padding: 16,
//                   flexDirection: "row",
//                   borderBottomWidth: 1,
//                   borderBottomColor: "#ccc",
//                   backgroundColor: "#fff",
//                   width: "100%", // Ensuring each item takes the full width of the, ScrollView,
//                 }}
//               >
//                 <HallImageContainer>
//                   <Image
//                     source={{ uri: `${product.images[0]}` }}
//                     style={{ width: 120, height: 120, borderRadius: 8 }}
//                   />
//                 </HallImageContainer>
//                 <HallDetailsContainer
//                   style={{
//                     flex: 1,
//                     marginLeft: 12,
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <TopHeader style={{ marginBottom: 8 }}>
//                     <Heading>{product.businessName}</Heading>
//                   </TopHeader>
//                   <Row style={{ marginBottom: 4 }}>
//                     <JobLocation>{product.address}</JobLocation>
//                   </Row>
//                   {/* <Row style={{ marginBottom: 4 }}>
//                     <JobLocation>{product.city}</JobLocation>
//                   </Row> */}

//                   <TouchableOpacity
//                     onPress={() =>
//                       navigation.navigate(
//                         "MatrimonyProfileWithConnection",
//                         catererData[index]
//                       )
//                     }
//                   >
//                     <ViewDetails>View Details</ViewDetails>
//                   </TouchableOpacity>
//                 </HallDetailsContainer>
//               </TouchableOpacity>
//             ))}
//             {/* <TouchableOpacity
//               style={{
//                 position: "absolute",
//                 bottom: 50,
//                 right: 50,
//                 backgroundColor: "#000000",
//                 borderRadius: 30,
//                 width: 55,
//                 height: 55,
//                 justifyContent: "center",
//                 alignItems: "center",
//                 elevation: 10,
//               }}
//             >
//               <Ionicons name="square" size={24} color="grey" />
//               <View style={{ position: "absolute", top: 10, left: 10 }}>
//                 <Ionicons name="funnel" size={20} color="white" />
//               </View>
//             </TouchableOpacity> */}
//           </ScrollView>
//               )}
//         </View>
//       )}
//       </View>
//       )}

//       {selectedTab === "Planners" && (
//         <View style={{ flex: 1 }}>
//         {loadingAnimation === true ? (
//          <ActivityIndicator
//            style={{
//              flex: 1,
//              justifyContent: "center",
//              alignItems: "center",
//            }}
//            size={"large"}
//            color={Theme.themeColor}
//          />
//        ) : (
//         <View
//           style={{
//             padding: "2%",
//             margin: "2%",
//             display: "flex",
//             flexDirection: "row",
//             flex: 1,
//           }}
//         > 
//         {plannerData.length === 0 ? (
//           <View
//             style={{
//               flex: 1,
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <Text style={{ fontSize: 18, color: "grey" }}>
//               No data found
//             </Text>
//           </View>
//         ) : (
//           <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
//             {plannerData.map((product, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={{
//                   padding: 16,
//                   flexDirection: "row",
//                   borderBottomWidth: 1,
//                   borderBottomColor: "#ccc",
//                   backgroundColor: "#fff",
//                   width: "100%", // Ensuring each item takes the full width of the, ScrollView,
//                 }}
//               >
//                 <HallImageContainer>
//                   <Image
//                       source={{ uri: `${product.images[0]}` }}
//                     style={{ width: 120, height: 120, borderRadius: 8 }}
//                   />
//                 </HallImageContainer>
//                 <HallDetailsContainer
//                   style={{
//                     flex: 1,
//                     marginLeft: 12,
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <TopHeader style={{ marginBottom: 8 }}>
//                     <Heading>{product.businessName}</Heading>
//                   </TopHeader>
//                   <Row style={{ marginBottom: 4 }}>
//                     <JobLocation>{product.address}</JobLocation>
//                   </Row>

//                   <TouchableOpacity
//                     onPress={() =>
//                       navigation.navigate(
//                         "MatrimonyProfileWithConnection",
//                         plannerData[index]
//                       )
//                     }
//                   >
//                     <ViewDetails>View Details</ViewDetails>
//                   </TouchableOpacity>
//                 </HallDetailsContainer>
//               </TouchableOpacity>
//             ))}
//             {/* <TouchableOpacity
//               style={{
//                 position: "absolute",
//                 bottom: 50,
//                 right: 50,
//                 backgroundColor: "#000000",
//                 borderRadius: 30,
//                 width: 55,
//                 height: 55,
//                 justifyContent: "center",
//                 alignItems: "center",
//                 elevation: 10,
//               }}
//             >
//               <Ionicons name="square" size={24} color="grey" />
//               <View style={{ position: "absolute", top: 10, left: 10 }}>
//                 <Ionicons name="funnel" size={20} color="white" />
//               </View>
//             </TouchableOpacity> */}
//           </ScrollView>
//         )}
//         </View>
//       )}
//        </View>
//       )}

//       {selectedTab === "Venues" && (
//         <View style={{ flex: 1 }}>
//         {loadingAnimation === true ? (
//          <ActivityIndicator
//            style={{
//              flex: 1,
//              justifyContent: "center",
//              alignItems: "center",
//            }}
//            size={"large"}
//            color={Theme.themeColor}
//          />
//        ) : (
//         <View
//           style={{
//             padding: "2%",
//             margin: "2%",
//             display: "flex",
//             flexDirection: "row",
//             flex: 1,
//           }}
//         >
//            {venueData.length === 0 ? (
//                 <View
//                   style={{
//                     flex: 1,
//                     justifyContent: "center",
//                     alignItems: "center",
//                   }}
//                 >
//                   <Text style={{ fontSize: 18, color: "grey" }}>
//                     No data found
//                   </Text>
//                 </View>
//               ) : (
//           <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
//             {venueData.map((product, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={{
//                   padding: 16,
//                   flexDirection: "row",
//                   borderBottomWidth: 1,
//                   borderBottomColor: "#ccc",
//                   backgroundColor: "#fff",
//                   width: "100%", // Ensuring each item takes the full width of the, ScrollView,
//                 }}
//               >
//                 <HallImageContainer>
//                   <Image
//                    source={{ uri: `${product.images[0]}` }}
//                     style={{ width: 120, height: 120, borderRadius: 8 }}
//                   />
//                 </HallImageContainer>
//                 <HallDetailsContainer
//                   style={{
//                     flex: 1,
//                     marginLeft: 12,
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <TopHeader style={{ marginBottom: 8 }}>
//                     <Heading>{product.businessName}</Heading>
//                   </TopHeader>
//                   <Row style={{ marginBottom: 4 }}>
//                     <JobLocation>{product.address}</JobLocation>
//                   </Row>
//                   <Row style={{ marginBottom: 4 }}>
//                     <JobLocation>{product.city}</JobLocation>
//                   </Row>

//                   <TouchableOpacity
//                     onPress={() =>
//                       navigation.navigate(
//                         "MatrimonyProfileWithConnection",
//                         venueData[index]
//                       )
//                     }
//                   >
//                     <ViewDetails>View Details</ViewDetails>
//                   </TouchableOpacity>
//                 </HallDetailsContainer>
//               </TouchableOpacity>
//             ))}
//             {/* <TouchableOpacity
//               style={{
//                 position: "absolute",
//                 bottom: 50,
//                 right: 50,
//                 backgroundColor: "#000000",
//                 borderRadius: 30,
//                 width: 55,
//                 height: 55,
//                 justifyContent: "center",
//                 alignItems: "center",
//                 elevation: 10,
//               }}
//             >
//               <Ionicons name="square" size={24} color="grey" />
//               <View style={{ position: "absolute", top: 10, left: 10 }}>
//                 <Ionicons name="funnel" size={20} color="white" />
//               </View>
//             </TouchableOpacity> */}
//           </ScrollView>
//               )}
//         </View>
//       )}
//        </View>
//       )}
//       {(selectedTab === "Grooms" || selectedTab === "Brides") && (
//         <TouchableOpacity
//           style={{
//             position: "absolute",
//             bottom: 40,
//             right: 20,
//             backgroundColor: "#1B1212",
//             borderRadius: 30,
//             width: 55,
//             height: 55,
//             justifyContent: "center",
//             alignItems: "center",
//             elevation: 10,
//           }}
//           onPress={toggleMenu}
//         >
//           <Ionicons name="square" size={24} color="grey" />
//           <View style={{ position: "absolute", top: 10, left: 10 }}>
//             <Ionicons name="funnel" size={20} color="white" />
//           </View>
//         </TouchableOpacity>
//       )}
//       <FilterMenu
//         menuVisible={menuVisible}
//         toggleMenu={toggleMenu}
//         filters={filters}
//         activeFilter={activeFilter}
//         selectedOptions={selectedOptions}
//         handleFilterClick={handleFilterClick}
//         handleOptionClick={handleOptionClick}
//         handleButtonPress={handleButtonPress}
//         selectedFiltersArray={selectedFiltersArray}
//         setSelectedFiltersArray={setSelectedFiltersArray}
//       />

//       {/* <View style={styles.bottomBarContainer}>
//         <View style={styles.bottomBar}>
//           <TouchableOpacity
//             style={styles.iconContainer}
//             onPress={() => navigation.navigate("MainHome")}
//           >
//             <Ionicons name="home-outline" size={24} color="#b98c13" />
//             <Text style={[styles.iconText, { color: "#b98c13" }]}>Home</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.iconContainer}>
//             <Ionicons name="list-outline" size={24} color="gray" />
//             <Text style={[styles.iconText, { color: "gray" }]}>Details</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.iconContainer}>
//             <Ionicons name="settings-outline" size={24} color="gray" />
//             <Text style={[styles.iconText, { color: "gray" }]}>Settings</Text>
//           </TouchableOpacity>
//         </View>
//       </View> */}
//     </Container>
//   );
// };

// export default NewMatrimony;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//     paddingBottom: 0,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: 24,
//     paddingHorizontal: 16,
//   },
//   headerText: {
//     color: Theme.themeColor,
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   profileImage: {
//     width: 35,
//     height: 35,
//     marginRight: 10,
//   },
//   searchIcon: {
//     marginRight: 15,
//     color: "grey",
//   },
//   searchContainer: {
//     alignItems: "center",
//     marginHorizontal: 16,
//     marginBottom: 10,
//   },
//   searchField: {
//     // Define styles for search field
//   },
//   // tabsContainer: {
//   //   flexDirection: "row",
//   //   justifyContent: "space-around",
//   //   alignItems: "center",
//   //   marginTop: 8,
//   // },
//   // tab: {
//   //   paddingVertical: 8,
//   //   paddingHorizontal: 14,
//   //   borderRadius: 20,
//   // },
//   // selectedTab: {
//   //   backgroundColor: "#D4AF37",
//   // },
//   // tabText: {
//   //   color: "black",
//   // },
//   // selectedTabText: {
//   //   color: "white",
//   // },
//   // scrollView: {
//   //   padding: "2%",
//   //   margin: "2%",
//   //   display: "flex",
//   //   flexDirection: "row",
//   //   flex: 1,
//   // },
//   tabsContainer: {
//     flexDirection: "row",
//     marginTop: 8,
//   },
//   tab: {
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     marginHorizontal: 5,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   selectedTab: {
//     backgroundColor: Theme.themeColor,
//   },
//   tabText: {
//     color: "black",
//   },
//   selectedTabText: {
//     color: "white",
//   },
//   cardContainer: {
//     padding: 16,
//     flexDirection: "row",
//     borderBottomWidth: 1,
//     borderBottomColor: "#ccc",
//     backgroundColor: "#fff",
//   },
//   cardImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 8,
//   },
//   cardDetails: {
//     flex: 1,
//     marginLeft: 12,
//     justifyContent: "space-between",
//   },
//   cardHeader: {
//     marginBottom: 8,
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   cardText: {
//     marginBottom: 8,
//     fontSize: 14,
//   },
//   viewDetails: {
//     color: Theme.themeColor,
//     fontWeight: "bold",
//   },
//   bottomBar: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     backgroundColor: "#ffffff",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 8,
//     paddingVertical: 10,
//   },
//   iconContainer: {
//     flex: 1,
//     alignItems: "center",
//   },
//   iconText: {
//     marginTop: 4,
//   },
// });
