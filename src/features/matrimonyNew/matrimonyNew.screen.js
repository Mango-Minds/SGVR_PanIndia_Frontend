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
  fetchVenueData
} from "./matrimonyAPIs";

const NewMatrimony = ({ navigation }) => {
  //user data
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.user);
  console.log("User in matrimony: ", user);
  const userType = useSelector((state) => state.user.user.userType[0]);
 

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
  user.userType[0] === "matrimonyMan"
    ? "brides"
    : user.userType[0] === "matrimonyWoman"
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
  { key: "brides", condition: () => user.userType[0] === "matrimonyMan" },
  { key: "grooms", condition: () => user.userType[0] === "matrimonyWoman" },
  { key: "vendors" },
  { key: "decorators" },
  { key: "caterers" },
  { key: "planners" },
  { key: "venues" },
];
const displayMenu = matrimonyMenu
  .filter(item => !item.condition || item.condition())
  .map(item => item.key);

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
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}
          >{t("matrimonyHeading")}
         
          </TopText>
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
            onPress={() =>
              navigation.navigate("MatrimonyNotifications", {
                user: user,
              })
            }
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
            <View
              style={[
            
                {
                 
                  padding: "2%",
                  margin: "2%",
                  display: "flex",
                  flexDirection: "row",
                  flex: 1,
                },
              ]}
            >
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
                <ScrollView
                  vertical={true}
                  showsVerticalScrollIndicator={false}
                >
                  {bridesData.map((product, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        padding: 16,
                        flexDirection: "row",
                        borderBottomWidth: 1,
                        borderBottomColor: "#ccc",
                        backgroundColor: "#fff",
                      }}
                    >
                      <HallImageContainer>
                      
                        <Image
                          source={
                            product.images
                              ? {
                                  uri: `${product.images[0]}`,
                                }
                              : UserImg
                          }
                          style={{ width: 120, height: 120, borderRadius: 8 }}
                        />
                      </HallImageContainer>

                      <HallDetailsContainer
                        style={{
                          flex: 1,
                          marginLeft: 12,
                          justifyContent: "space-between",
                        }}
                      >
                        <TopHeader style={{ marginBottom: 8 }}>
                          <Heading>{product.name}</Heading>
                        </TopHeader>
                        <Row style={{ marginBottom: 8 }}>
                          <JobLocation>{product.occupation}</JobLocation>
                        </Row>
                        <Row style={{ marginBottom: 8 }}>
                          <JobLocation>{product.homeTown}</JobLocation>
                        </Row>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("MatrimonyProfileNew", {
                              matrimonyData: bridesData[index],
                              groomsData: groomsData,
                            })
                          }
                        >
                          <ViewDetails>{t("view_details")}</ViewDetails>
                        </TouchableOpacity>
                      </HallDetailsContainer>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
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
            <View
              style={[
                // styles.shadowProp,
                {
                  // backgroundColor: "#e6f9ff",
                  padding: "2%",
                  margin: "2%",
                  display: "flex",
                  flexDirection: "row",
                  flex: 1,
                },
              ]}
            >
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
                <ScrollView
                  vertical={true}
                  showsVerticalScrollIndicator={false}
                >
                  {groomsData.map((product, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        padding: 16,
                        flexDirection: "row",
                        borderBottomWidth: 1,
                        borderBottomColor: "#ccc",
                        backgroundColor: "#fff",
                      }}
                    >
                      <HallImageContainer>
                        <Image
                          source={
                            product.images
                              ? {
                                  uri: `${product.images[0]}`,
                                }
                              : UserImg
                          }
                          style={{ width: 120, height: 120, borderRadius: 8 }}
                        />
                      </HallImageContainer>
                      <HallDetailsContainer
                        style={{
                          flex: 1,
                          marginLeft: 12,
                          justifyContent: "space-between",
                        }}
                      >
                        <TopHeader style={{ marginBottom: 8 }}>
                          <Heading>{product.name}</Heading>
                        </TopHeader>
                        <Row style={{ marginBottom: 4 }}>
                          <JobLocation>{product.occupation}</JobLocation>
                        </Row>
                        <Row style={{ marginBottom: 4 }}>
                          <JobLocation>{product.homeTown}</JobLocation>
                        </Row>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("MatrimonyProfileNew", {
                              matrimonyData: groomsData[index],
                            })
                          }
                        >
                          <ViewDetails>{t("view_details")}</ViewDetails>
                        </TouchableOpacity>
                      </HallDetailsContainer>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
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
        <View
          style={{
            padding: "2%",
            margin: "2%",
            display: "flex",
            flexDirection: "row",
            flex: 1,
          }}
        >
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
          <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
            {vendorData.map((product, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 16,
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: "#ccc",
                  backgroundColor: "#fff",
                  width: "100%", // Ensuring each item takes the full width of the, ScrollView,
                }}
              >
                <HallImageContainer>
                  <Image
                   source={{ uri: `${product.images[0]}` }}
                    style={{ width: 120, height: 120, borderRadius: 8 }}
                  />
                </HallImageContainer>
                <HallDetailsContainer
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    justifyContent: "space-between",
                  }}
                >
                  <TopHeader style={{ marginBottom: 8 }}>
                    <Heading>{product?.businessName}</Heading>
                  </TopHeader>
                  <Row style={{ marginBottom: 4 }}>
                    <JobLocation>{product?.address}</JobLocation>
                  </Row>
                  <Row style={{ marginBottom: 4 }}>
                    {/* <JobLocation>
                      {product.city}, {product.state}
                    </JobLocation> */}
                  </Row>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(
                        "MatrimonyProfileWithConnection",
                        vendorData[index]
                      )
                    }
                  >
                    <ViewDetails>{t("view_details")}</ViewDetails>
                  </TouchableOpacity>
                </HallDetailsContainer>
              </TouchableOpacity>
            ))}
          
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
        <View
          style={{
            padding: "2%",
            margin: "2%",
            display: "flex",
            flexDirection: "row",
            flex: 1,
          }}
        >
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
          <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
            {decoratorData.map((product, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 16,
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: "#ccc",
                  backgroundColor: "#fff",
                  width: "100%", 
                }}
              >
                <HallImageContainer>
                  <Image
                    source={{ uri: `${product.images[0]}` }}
                    style={{ width: 120, height: 120, borderRadius: 8 }}
                  />
                </HallImageContainer>
                <HallDetailsContainer
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    justifyContent: "space-between",
                  }}
                >
                  <TopHeader style={{ marginBottom: 8 }}>
                    <Heading>{product.businessName}</Heading>
                  </TopHeader>
                  <Row style={{ marginBottom: 4 }}>
                    <JobLocation>{product.address}</JobLocation>
                  </Row>
                

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(
                        "MatrimonyProfileWithConnection",
                        decoratorData[index]
                      )
                    }
                  >
                    <ViewDetails>{t("view_details")}</ViewDetails>
                  </TouchableOpacity>
                </HallDetailsContainer>
              </TouchableOpacity>
            ))}
           
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
        <View
          style={{
            padding: "2%",
            margin: "2%",
            display: "flex",
            flexDirection: "row",
            flex: 1,
          }}
        >
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
          <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
            {catererData.map((product, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 16,
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: "#ccc",
                  backgroundColor: "#fff",
                  width: "100%", // Ensuring each item takes the full width of the, ScrollView,
                }}
              >
                <HallImageContainer>
                  <Image
                    source={{ uri: `${product.images[0]}` }}
                    style={{ width: 120, height: 120, borderRadius: 8 }}
                  />
                </HallImageContainer>
                <HallDetailsContainer
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    justifyContent: "space-between",
                  }}
                >
                  <TopHeader style={{ marginBottom: 8 }}>
                    <Heading>{product.businessName}</Heading>
                  </TopHeader>
                  <Row style={{ marginBottom: 4 }}>
                    <JobLocation>{product.address}</JobLocation>
                  </Row>
                  {/* <Row style={{ marginBottom: 4 }}>
                    <JobLocation>{product.city}</JobLocation>
                  </Row> */}

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(
                        "MatrimonyProfileWithConnection",
                        catererData[index]
                      )
                    }
                  >
                    <ViewDetails>{t("view_details")}</ViewDetails>
                  </TouchableOpacity>
                </HallDetailsContainer>
              </TouchableOpacity>
            ))}
           
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
        <View
          style={{
            padding: "2%",
            margin: "2%",
            display: "flex",
            flexDirection: "row",
            flex: 1,
          }}
        > 
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
          <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
            {plannerData.map((product, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 16,
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: "#ccc",
                  backgroundColor: "#fff",
                  width: "100%", // Ensuring each item takes the full width of the, ScrollView,
                }}
              >
                <HallImageContainer>
                  <Image
                      source={{ uri: `${product.images[0]}` }}
                    style={{ width: 120, height: 120, borderRadius: 8 }}
                  />
                </HallImageContainer>
                <HallDetailsContainer
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    justifyContent: "space-between",
                  }}
                >
                  <TopHeader style={{ marginBottom: 8 }}>
                    <Heading>{product.businessName}</Heading>
                  </TopHeader>
                  <Row style={{ marginBottom: 4 }}>
                    <JobLocation>{product.address}</JobLocation>
                  </Row>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(
                        "MatrimonyProfileWithConnection",
                        plannerData[index]
                      )
                    }
                  >
                    <ViewDetails>{t("view_details")}</ViewDetails>
                  </TouchableOpacity>
                </HallDetailsContainer>
              </TouchableOpacity>
            ))}
          
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
        <View
          style={{
            padding: "2%",
            margin: "2%",
            display: "flex",
            flexDirection: "row",
            flex: 1,
          }}
        >
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
          <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
            {venueData.map((product, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 16,
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: "#ccc",
                  backgroundColor: "#fff",
                  width: "100%", // Ensuring each item takes the full width of the, ScrollView,
                }}
              >
                <HallImageContainer>
                  <Image
                   source={{ uri: `${product.images[0]}` }}
                    style={{ width: 120, height: 120, borderRadius: 8 }}
                  />
                </HallImageContainer>
                <HallDetailsContainer
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    justifyContent: "space-between",
                  }}
                >
                  <TopHeader style={{ marginBottom: 8 }}>
                    <Heading>{product.businessName}</Heading>
                  </TopHeader>
                  <Row style={{ marginBottom: 4 }}>
                    <JobLocation>{product.address}</JobLocation>
                  </Row>
                  <Row style={{ marginBottom: 4 }}>
                    <JobLocation>{product.city}</JobLocation>
                  </Row>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(
                        "MatrimonyProfileWithConnection",
                        venueData[index]
                      )
                    }
                  >
                    <ViewDetails>{t("view_details")}</ViewDetails>
                  </TouchableOpacity>
                </HallDetailsContainer>
              </TouchableOpacity>
            ))}
          
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

     
    </Container>
  );
};

export default NewMatrimony;

const styles = StyleSheet.create({
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
