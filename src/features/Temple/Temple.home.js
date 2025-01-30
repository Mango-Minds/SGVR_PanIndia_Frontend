import React, { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import {
  View,
  ImageBackground,
  FlatList,
  Text,
  RefreshControl,
  Image,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { TopText } from "../../styles/social.styles";

import { Card, IconButton } from "react-native-paper";
import { TouchableOpacity, ScrollView } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Profile from "../../assets/images/B2b/profile.png";
import Icon from "react-native-vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";

import {
  TempleHomeCard,
  MatrimonyHomeCardSubTitle,
  MatrimonyHomeCardTitle,
} from "../../styles/matrimony.styles";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "react-query";
import { UpdateTemple } from "../../store/Handlers/Reducer.Handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASEAPIURL, BASEIMGURL } from "../../infrastructure/constants";
import FilterMenu from "./FilterMenu";
import UserImg from "../../assets/images/general/user.png";
const TempleHome = ({ navigation }) => {
  const { user } = useSelector((state) => state.user);
  const token = useSelector((state) => state.user.token);
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  console.log("user", user);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const userType = useSelector((state) => state.user.user.userType);
  const [selectedTab, setSelectedTab] = useState("Temples");

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };
  const [refreshing, setRefreshing] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [selectedFiltersArray, setSelectedFiltersArray] = useState([]);

  const debouncedFetchTemples = useCallback(
    debounce((searchTerm, selectedFiltersArray) => {
      fetchTemples(searchTerm, selectedFiltersArray);
    }, 1200),
    []
  );

  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (e) => {
    setSearchTerm(e);
  };
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleButtonPress = (buttonName) => {
    console.log("inside buttonpress");
    setActiveButton(buttonName);
    if (buttonName === "clear") {
      setSelectedOptions([]);
      setSelectedFiltersArray([]);
    }
  };

  useEffect(() => {
    console.log("inside useeffect");
    setMenuVisible(false);
    debouncedFetchTemples(searchTerm, selectedFiltersArray);
  }, [searchTerm, selectedFiltersArray, isFocused]);

  
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  // const temple = {
  //   templelist: [
  //     {
  //       _id: "1",
  //       name: "Sun Temple",
  //       city: "Konark",
  //       country: "India",
  //       status: "accepted",
  //       images: ["https://media.istockphoto.com/id/1323524578/photo/crowd-of-tourist-at-konark-sun-temple-indian-tourism-place.jpg?s=612x612&w=0&k=20&c=2pYkIfwco__pd0l_OXRoOGshkSt3QqOg74v1Cz4Xgfo="],
  //       members: ["Keshav Tayal"],
  //       description: "A 13th-century temple in Odisha, dedicated to the Sun God.",
  //     },
  //     {
  //       _id: "2",
  //       name: "Golden Temple",
  //       city: "Amritsar",
  //       country: "India",
  //       status: "accepted",
  //       images: ["https://media.istockphoto.com/id/478673422/photo/golden-temple-amritsar.jpg?s=612x612&w=0&k=20&c=LvdukkiiqHZmQxOTjf9UPGHcWldxaFLIZc8k2FEFxfM="],
  //       members: ["Keshav Tayal"],

  //       description: "A famous Sikh Gurdwara located in Punjab, India.",
  //     },
  //     {
  //       _id: "3",
  //       name: "Meenakshi Temple",
  //       city: "Madurai",
  //       country: "India",
  //       status: "accepted",
  //       images: ["https://imgs.search.brave.com/juwEikA-Ohd6LMykb7fO5q6nRq0VIpYQd_tAHIRtIuE/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvOTU4/NDYxMzkvcGhvdG8v/bWVlbmFrc2hpLXN1/bmRhcmVzd2FyYXIt/dGVtcGxlLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1pb25s/bEJodVJPZ29heUsx/QkZlV1o0ZElkRC1B/cVB5cHRQclRGTUhU/b0E0PQ"],
  //       members: ["Keshav Tayal"],

  //       description: "A historic Hindu temple located on the southern bank of the Vaigai River.",
  //     },
  //   ],
  // };
  const [activeFilter, setActiveFilter] = useState("State");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [activeButton, setActiveButton] = useState(null);

  const filters = [
    {
      name: "State",
      options: ["Punjab", "Uttarakhand", "Haryana", "Chandigarh"],
    },
    {
      name: "City",
      options: ["Amritsar", "Rudraprayag", "Kurukshetra", "Chandigarh"],
    },
  ];

  const handleFilterClick = (filterName) => {
    setActiveFilter(filterName);
  };

  const handleOptionClick = (option) => {
    if (activeFilter === "Price") {
      // For the "Price" filter, toggle the selection
      setSelectedOptions((prevSelectedOptions) => {
        const priceFilter = filters.find((filter) => filter.name === "Price");

        if (priceFilter.options.includes(option)) {
          // Check if the clicked option is already selected
          const isSelected = prevSelectedOptions.includes(option);

          // Remove other price filters and add the current one if it's not already selected
          const updatedOptions = isSelected
            ? prevSelectedOptions.filter((item) => item !== option) // Remove the selected option
            : [
                ...prevSelectedOptions.filter(
                  (item) => !priceFilter.options.includes(item)
                ), // Remove other price options
                option, // Add the selected option
              ];

          return updatedOptions;
        }

        return prevSelectedOptions;
      });
    } else {
      // For other filters, toggle options as usual
      setSelectedOptions((prevSelectedOptions) => {
        const updatedOptions = prevSelectedOptions.includes(option)
          ? prevSelectedOptions.filter((item) => item !== option)
          : [...prevSelectedOptions, option];

        return updatedOptions;
      });
    }
  };

  const [temples, setTemples] = useState([]);

  const fetchTemples = async (searchTerm, selectedFiltersArray) => {
    const queryParams = new URLSearchParams();

    selectedFiltersArray.forEach((filter) => {
      if (filter["Filter name"] === "Temple Name") {
        filter.Options.forEach((option) =>
          queryParams.append("templeName", option.toLowerCase())
        );
      } else if (filter["Filter name"] === "State") {
        filter.Options.forEach((option) =>
          queryParams.append("state", option.toLowerCase())
        );
      } else if (filter["Filter name"] === "City") {
        filter.Options.forEach((option) =>
          queryParams.append("city", option.toLowerCase())
        );
      } else if (filter["Filter name"] === "Address") {
        filter.Options.forEach((option) =>
          queryParams.append("address", option.toLowerCase())
        );
      } else if (filter["Filter name"] === "Gods") {
        filter.Options.forEach((option) =>
          queryParams.append("gods", option.toLowerCase())
        );
      }
    });

    if (searchTerm.trim() !== "") {
      queryParams.append("search", searchTerm);
    }
    // if (user.userType === "pandit") {
    //   queryParams.append("panditId", user.roleData._id);
    // }
    // if (user.userType === "templeAdmin") {
    //   queryParams.append("templeAdminId", user.roleData._id);
    // }
    // if (user.userType === "templeShop") {
    //   queryParams.append("templeShopId", user.roleData._id);
    // }
    const queryString = queryParams.toString();
    const url = `${BASEAPIURL}/temple?${queryString}`;

    console.log("Fetching temples with URL:", url);
    try {
      setLoadingAnimation(true);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Temples data:", data);

        setTemples(data);
      } else {
        throw new Error("Failed to fetch temples");
      }
    } catch (error) {
      console.error("Error fetching temples:", error);
    } finally {
      setLoadingAnimation(false);
    }
  };

  // useEffect(() => {
  //   if (isFocused) {
  //     fetchTemples(searchTerm, selectedFiltersArray);
  //   }
  // }, [isFocused]);

  const [pandits, setPandits] = useState([]);
  const fetchPandits = async () => {
    try {
      setLoadingAnimation(true);
      const response = await fetch(`${BASEAPIURL}/panditcrud/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Pandits data:", data);

        setPandits(data);
      } else {
        throw new Error("Failed to fetch pandits");
      }
    } catch (error) {
      console.error("Error fetching pandits:", error);
    } finally {
      setLoadingAnimation(false);
    }
  };
  useEffect(() => {
    fetchPandits();
  }, []);

  console.log("Pandits: ", pandits);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <View
        style={{
          paddingHorizontal: 10,
        }}
      >
        <RowBetween style={{ paddingTop: 24 }}>
          <View style={{ alignItems: "center", flexDirection: "row" }}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <TopText
              style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
            >
              Temple
            </TopText>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selectedTab === "Temples" && (
              <>
                {user.userType === "templeAdmin" && (
                  <IconButton
                    icon="plus"
                    style={{ marginRight: 10 }}
                    onPress={() => navigation.navigate("AddTemple")}
                  />
                )}
                <Icon
                  name="search"
                  size={24}
                  style={{ marginRight: 15, color: "grey" }}
                  onPress={toggleSearch}
                />
              </>
            )}

            <TouchableOpacity
              onPress={() => {
                navigation.navigate("MyProfile", {
                  pandits: pandits,
                  fetchPandits: fetchPandits,
                });
              }}
            >
              <Image
                source={Profile}
                style={{ width: 35, height: 35, marginRight: 10 }}
              />
            </TouchableOpacity>
          </View>
        </RowBetween>
      </View>
      {isSearchVisible && (
        <View
          style={{
            alignItems: "center",
            marginLeft: 16,
            marginRight: 16,
            marginBottom: 10,
          }}
        >
          <SearchField placeholder="Search" onChangeText={handleSearch} />
        </View>
      )}

      <View style={styles.tabsContainer}>
        {["Temples", "Pandits"].map((tab) => (
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
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedTab === "Temples" && (
        <View style={{ flex: 1 }}>
          {loadingAnimation ? (
            <ActivityIndicator
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              size={"large"}
              color={"#b98c13"}
            />
          ) : (
            <View style={{ flex: 1 }}>
              {
                // userType !== "pandit" ? (
                //    && userType !== "templeAdmin" && userType !== "templeShopOwner"
                temples.length > 0 ? (
                  <View style={{ flex: 1 }}>
                    <FlatList
                      style={{
                        marginTop: 16,
                        marginLeft: 16,
                        marginRight: 16,
                        flex: 1,
                      }}
                      showsVerticalScrollIndicator={false}
                      keyExtractor={(item) => item._id}
                      data={temples}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={async () => {
                            setRefreshing(true); // Start the refreshing animation
                            try {
                              await fetchTemples(
                                searchTerm,
                                selectedFiltersArray
                              ); // Wait for the fetch operation to complete
                            } catch (error) {
                              console.error("Failed to refresh data:", error);
                            } finally {
                              setRefreshing(false); // Stop the refreshing animation
                            }
                          }}
                        />
                      }
                      renderItem={({ item, index }) => {
                        // if (item.status === "accepted") {
                        return (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                              navigation.navigate("TempleDetails", {
                                templeinfo: item,
                              })
                            }
                            key={index}
                          >
                            <TempleHomeCard>
                              <ImageBackground
                                source={
                                  item.images.length > 0
                                    ? { uri: `${BASEIMGURL}${item.images[0]}` }
                                    : ""
                                }
                                resizeMode="cover"
                                imageStyle={{
                                  borderRadius: 16,
                                }}
                                style={{
                                  height: 400,
                                }}
                              >
                                <LinearGradient
                                  colors={["#00000000", "#545454"]}
                                  style={{
                                    height: "100%",
                                    width: "100%",
                                    borderBottomLeftRadius: 16,
                                    borderBottomRightRadius: 16,
                                  }}
                                ></LinearGradient>
                              </ImageBackground>

                              <Card.Content
                                style={{
                                  position: "absolute",
                                  bottom: 10,
                                  borderRadius: 16,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  width: "100%",
                                }}
                              >
                                <View>
                                  <MatrimonyHomeCardTitle>
                                    {item.templeName}
                                  </MatrimonyHomeCardTitle>

                                  <View
                                    style={{
                                      display: "flex",
                                      flexDirection: "row",
                                    }}
                                  >
                                    <Ionicons
                                      name="location"
                                      color="#F9C620"
                                      size={20}
                                    />
                                    <Text
                                      style={{
                                        fontSize: 16,
                                        color: "white",
                                        marginLeft: 10,
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      {item.city}
                                    </Text>
                                  </View>
                                </View>
                              </Card.Content>
                            </TempleHomeCard>
                          </TouchableOpacity>
                        );
                        // }
                      }}
                    />
                  </View>
                ) : (
                  <ScrollView>
                    <View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          textAlign: "center",
                          width: "100%",
                          marginTop: 50,
                        }}
                      >
                        No Temple Found
                      </Text>
                    </View>
                  </ScrollView>
                )
                // )
                // : (
                //   <ScrollView style={{ flex: 1 }}>
                //     {temples.connectedTemples.length > 0 ? (
                //       <View style={{ flex: 1 }}>
                //         <Text
                //           style={{
                //             fontSize: 18,
                //             fontWeight: "bold",
                //             textAlign: "left",
                //             width: "100%",
                //             marginTop: 30,
                //             marginLeft: 20,
                //           }}
                //         >
                //           Your Temples
                //         </Text>
                //         <FlatList
                //           style={{
                //             marginTop: 16,
                //             marginLeft: 16,
                //             marginRight: 16,
                //             flex: 1,
                //           }}
                //           showsVerticalScrollIndicator={false}
                //           keyExtractor={(item) => item._id}
                //           data={temples.connectedTemples}
                //           refreshControl={
                //             <RefreshControl
                //               refreshing={refreshing}
                //               onRefresh={async () => {
                //                 setRefreshing(true);
                //                 fetchTemples();
                //                 setRefreshing(false);
                //               }}
                //             />
                //           }
                //           renderItem={({ item, index }) => {
                //             // if (item.status === "accepted") {
                //             return (
                //               <TouchableOpacity
                //                 activeOpacity={0.8}
                //                 onPress={() =>
                //                   navigation.navigate("TempleDetails", {
                //                     templeinfo: item,
                //                   })
                //                 }
                //                 key={index}
                //               >
                //                 <TempleHomeCard>
                //                   <ImageBackground
                //                     source={
                //                       item.images.length > 0
                //                         ? { uri: `${BASEIMGURL}${item.images[0]}` }
                //                         : ""
                //                     }
                //                     resizeMode="cover"
                //                     imageStyle={{
                //                       borderRadius: 16,
                //                     }}
                //                     style={{
                //                       height: 400,
                //                     }}
                //                   >
                //                     <LinearGradient
                //                       colors={["#00000000", "#545454"]}
                //                       style={{
                //                         height: "100%",
                //                         width: "100%",
                //                         borderBottomLeftRadius: 16,
                //                         borderBottomRightRadius: 16,
                //                       }}
                //                     ></LinearGradient>
                //                   </ImageBackground>

                //                   <Card.Content
                //                     style={{
                //                       position: "absolute",
                //                       bottom: 10,
                //                       borderRadius: 16,
                //                       flexDirection: "row",
                //                       alignItems: "center",
                //                       justifyContent: "space-between",
                //                       width: "100%",
                //                     }}
                //                   >
                //                     <View>
                //                       <MatrimonyHomeCardTitle>
                //                         {item.templeName}
                //                       </MatrimonyHomeCardTitle>

                //                       <View
                //                         style={{
                //                           display: "flex",
                //                           flexDirection: "row",
                //                         }}
                //                       >
                //                         <Ionicons
                //                           name="location"
                //                           color="#F9C620"
                //                           size={20}
                //                         />
                //                         <Text
                //                           style={{
                //                             fontSize: 16,
                //                             color: "white",
                //                             marginLeft: 10,
                //                             textTransform: "uppercase",
                //                           }}
                //                         >
                //                           {item.city}
                //                         </Text>
                //                       </View>
                //                     </View>
                //                   </Card.Content>
                //                 </TempleHomeCard>
                //               </TouchableOpacity>
                //             );
                //             // }
                //           }}
                //         />
                //       </View>
                //     ) : (
                //       <ScrollView>
                //         <Text
                //           style={{
                //             fontSize: 18,
                //             fontWeight: "bold",
                //             textAlign: "left",
                //             width: "100%",
                //             marginTop: 50,
                //             marginLeft: 20,
                //           }}
                //         >
                //           Your Temples
                //         </Text>
                //         <View>
                //           <Text
                //             style={{
                //               fontSize: 18,
                //               fontWeight: "bold",
                //               textAlign: "center",
                //               width: "100%",
                //               marginTop: 50,
                //             }}
                //           >
                //             You are not Connected To Any Temple
                //           </Text>
                //         </View>
                //       </ScrollView>
                //     )}

                //     {temples.notConnectedTemples.length > 0 ? (
                //       <View style={{ flex: 1 }}>
                //         <Text
                //           style={{
                //             fontSize: 18,
                //             fontWeight: "bold",
                //             textAlign: "left",
                //             width: "100%",
                //             marginTop: 50,
                //             marginLeft: 20,
                //           }}
                //         >
                //           Other Temples
                //         </Text>
                //         <FlatList
                //           style={{
                //             marginTop: 16,
                //             marginLeft: 16,
                //             marginRight: 16,
                //             flex: 1,
                //           }}
                //           showsVerticalScrollIndicator={false}
                //           keyExtractor={(item) => item._id}
                //           data={temples.notConnectedTemples}
                //           refreshControl={
                //             <RefreshControl
                //               refreshing={refreshing}
                //               onRefresh={async () => {
                //                 setRefreshing(true);
                //                 fetchTemples();
                //                 setRefreshing(false);
                //               }}
                //             />
                //           }
                //           renderItem={({ item, index }) => {
                //             // if (item.status === "accepted") {
                //             return (
                //               <TouchableOpacity
                //                 activeOpacity={0.8}
                //                 onPress={() =>
                //                   navigation.navigate("TempleDetails", {
                //                     templeinfo: item,
                //                   })
                //                 }
                //                 key={index}
                //               >
                //                 <TempleHomeCard>
                //                   <ImageBackground
                //                     source={
                //                       item.images.length > 0
                //                         ? { uri: `${BASEIMGURL}${item.images[0]}` }
                //                         : ""
                //                     }
                //                     resizeMode="cover"
                //                     imageStyle={{
                //                       borderRadius: 16,
                //                     }}
                //                     style={{
                //                       height: 400,
                //                     }}
                //                   >
                //                     <LinearGradient
                //                       colors={["#00000000", "#545454"]}
                //                       style={{
                //                         height: "100%",
                //                         width: "100%",
                //                         borderBottomLeftRadius: 16,
                //                         borderBottomRightRadius: 16,
                //                       }}
                //                     ></LinearGradient>
                //                   </ImageBackground>

                //                   <Card.Content
                //                     style={{
                //                       position: "absolute",
                //                       bottom: 10,
                //                       borderRadius: 16,
                //                       flexDirection: "row",
                //                       alignItems: "center",
                //                       justifyContent: "space-between",
                //                       width: "100%",
                //                     }}
                //                   >
                //                     <View>
                //                       <MatrimonyHomeCardTitle>
                //                         {item.templeName}
                //                       </MatrimonyHomeCardTitle>

                //                       <View
                //                         style={{
                //                           display: "flex",
                //                           flexDirection: "row",
                //                         }}
                //                       >
                //                         <Ionicons
                //                           name="location"
                //                           color="#F9C620"
                //                           size={20}
                //                         />
                //                         <Text
                //                           style={{
                //                             fontSize: 16,
                //                             color: "white",
                //                             marginLeft: 10,
                //                             textTransform: "uppercase",
                //                           }}
                //                         >
                //                           {item.city}
                //                         </Text>
                //                       </View>
                //                     </View>
                //                   </Card.Content>
                //                 </TempleHomeCard>
                //               </TouchableOpacity>
                //             );
                //             // }
                //           }}
                //         />
                //       </View>
                //     ) : (
                //       <ScrollView>
                //         <Text
                //           style={{
                //             fontSize: 18,
                //             fontWeight: "bold",
                //             textAlign: "left",
                //             width: "100%",
                //             marginTop: 50,
                //             marginLeft: 20,
                //           }}
                //         >
                //           Other Temples
                //         </Text>
                //         <View>
                //           <Text
                //             style={{
                //               fontSize: 18,
                //               fontWeight: "bold",
                //               textAlign: "center",
                //               width: "100%",
                //               marginTop: 50,
                //             }}
                //           >
                //             You are not Connected To Any Temple
                //           </Text>
                //         </View>
                //       </ScrollView>
                //     )}
                //   </ScrollView>
                // )
              }
            </View>
          )}
        </View>
      )}

{selectedTab === "Temples" && (
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

{menuVisible && (
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
)}


      

      {selectedTab === "Pandits" && (
        <View style={{ flex: 1 }}>
          {loadingAnimation === true ? (
            <ActivityIndicator
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              size={"large"}
              color={"#b98c13"}
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
              {pandits.length === 0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 18, color: "grey" }}>
                    No Pandit found
                  </Text>
                </View>
              ) : (
                <ScrollView
                  vertical={true}
                  showsVerticalScrollIndicator={false}
                >
                  {pandits.map((pandit, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        navigation.navigate("TemplePanditDetails", {
                          panditinfo: pandit,
                        })
                      }
                    >
                      <View
                        style={[
                          {
                            // margin: "2%",
                            padding: "4%",
                            display: "flex",
                            flexDirection: "row",
                            borderBottomWidth: 0.5,
                            borderBottomColor: "grey",
                          },
                        ]}
                      >
                        <Image
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            opacity: 1,
                          }}
                          source={
                            pandit.image && pandit.image.length > 0
                              ? { uri: `${BASEIMGURL}${pandit?.owner.image}` }
                              : UserImg
                          }
                        />
                        <View
                          style={{
                            flexDirection: "column",
                            marginLeft: "10%",
                            width: "38%",
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: "bold",
                              opacity: 0.7,
                              marginTop: "2%",
                              fontSize: 17,
                              maxWidth: 170,
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {pandit.panditName}
                          </Text>
                          
                          <Text
                            style={{
                              fontWeight: "600",
                              marginTop: "2%",
                              opacity: 1,
                              maxWidth: 170,
                              color: "#D4AF37",
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {pandit.owner.city}
                          </Text>
                        </View>
                        
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default TempleHome;
const styles = StyleSheet.create({
  Catagory: {
    marginHorizontal: 10,
    marginVertical: 15,
  },
  CatagoryText: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "center",
    color: "#616161",
  },
  StockCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 2,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  stockImage: {
    width: 90,
    height: 90,
    marginRight: 10,
  },
  stockName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#141414",
    marginBottom: 10,
  },
  stockspecs: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "73%",
  },
  stockdetails: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
    opacity: 0.5,
  },
  stocklocation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  stockloacaiontext: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
    opacity: 0.8,
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
    backgroundColor: "#D4AF37",
  },
  tabText: {
    color: "black",
  },
  selectedTabText: {
    color: "white",
  },

  shadowProp: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1.41,
    elevation: 2,
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
  iconContainer: {
    flex: 1,
    alignItems: "center",
  },

  iconText: {
    marginTop: 4,
  },
  icon: {
    marginRight: 10,
    marginTop: 3,
    marginLeft: 20,
  },
  circleImage: {
    width: 50,
    height: 50,
    borderRadius: 45,
    overflow: "hidden",
    marginBottom: 5,
    borderWidth: 0.1,
    borderColor: "gray",
  },
  chatIconBackground: {
    width: 60,
    height: 30,
    borderRadius: 22,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "lightgray",
    borderRadius: 10,
    width: 250,
    opacity: 1.5,
    height: 40,
    fontWeight: "bold",
  },
  optionText: {
    fontSize: 18,
  },
  closeButton: {
    position: "absolute",
    top: 1,
    right: 8,
  },
});
