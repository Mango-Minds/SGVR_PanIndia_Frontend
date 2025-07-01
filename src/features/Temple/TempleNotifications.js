import React, { useState, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";
import { RowBetween, SearchField } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import Icon from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native-gesture-handler";
import { decode } from "base-64";
import { BASEAPIURL } from "../../infrastructure/constants";
import { useSelector } from "react-redux";
import UserImg from "../../assets/images/general/user.png";
import BottomNavigation from "../../components/Jewellery/BottomNavigation";
import TempleShops from "./TempleShops";
import SelectDropdown from "react-native-select-dropdown";
import apiClient from "../../store/apiClient";
function TempleNotifications({ navigation, route }) {
  const [selectedTab, setSelectedTab] = useState("Requests");
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };
  const { templeinfo } = route.params;
  console.log("Notifications temple info: ", templeinfo);
  const templeId = templeinfo._id;
  console.log("Temple ID: ", templeId);
  const [pandits, setPandits] = useState([]);
  const [shops, setShops] = useState([]);

  const token = useSelector((state) => state.user.token);

  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  const user = useSelector((state) => state.user.user);
  console.log("user: ", user);
  const userId = user?.roleData?._id;

  const staticPandit = [
    {
      id: 1,
      name: "Harsh Kumar",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEhWV96tK_ZQiuMYY2YpnaC8t02-b6I-hJqXlFWfl8qff_kS8yYyVIPLAd0UvVmbqNqRg&usqp=CAU",
      address: "106 MIG, KHB Colony, 5 Block",
      city: "Bangalore",
      about:
        " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s ",
      email: "gj1@gmail.com",
      phone: "987654321",
      createdBy: "shop",
    },
    {
      id: 2,
      name: "Vivah Creations",
      image:
        "https://static.vecteezy.com/system/resources/previews/037/750/119/non_2x/ai-generated-beautiful-indian-woman-in-saree-smiling-at-camera-at-home-free-photo.jpg",
      address: "206 MIG, KHB Colony, 5 Block",
      about:
        " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s ",
      email: "gj1@gmail.com",
      phone: "987654321",

      city: "Pune",
      createdBy: "pandit",
    },
    {
      id: 3,
      name: "Essential",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAklp4WU1IcbnUw7vFGd7crM-rIVisc_6Dnw&s",
      address: "206 MIG, KHB Colony, 5 Block",
      city: "Indore",
      about:
        " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s ",
      email: "gj1@gmail.com",
      phone: "987654321",
      createdBy: "shop",
    },
    {
      id: 4,
      name: "Polki Creations",
      image:
        "https://t3.ftcdn.net/jpg/01/31/93/60/360_F_131936042_7mqbuFNDSTlCEImH4GCkIiAuI66swziu.jpg",
      address: "206 MIG, KHB Colony, 5 Block",
      city: "Kolkata",
      about:
        " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s ",
      email: "gj1@gmail.com",
      phone: "987654321",
      createdBy: "shop",
    },
    {
      id: 5,
      name: "Zari",
      image:
        "https://t4.ftcdn.net/jpg/02/92/76/21/360_F_292762118_dmWqwlN9lDmhqCHKmUYmZW6F7LaUWc80.jpg",
      address: "206 MIG, KHB Colony, 5 Block",
      city: "Chennai",
      about:
        " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s ",
      email: "gj1@gmail.com",
      phone: "987654321",
      createdBy: "pandit",
    },
    {
      id: 6,
      name: "Majestic Jewels",
      image:
        "https://media.istockphoto.com/id/1254176393/photo/portrait-of-a-happy-woman-of-indian-ethnicity.jpg?s=612x612&w=0&k=20&c=In7iJKJ0GXYatpVnLbSRqN-bbqwnXJqy4C0AjGgyUzE=",
      address: "206 MIG, KHB Colony, 5 Block",
      city: "Hyderabad",
      about:
        " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s ",
      email: "gj1@gmail.com",
      phone: "987654321",
      createdBy: "pandit",
    },
    {
      id: 7,
      name: "Royal Jewels",
      image:
        "https://img.freepik.com/free-photo/cheerful-traditional-indian-woman-white-background-studio-shot_1157-48206.jpg",
      address: "206 MIG, KHB Colony, 5 Block",
      city: "Bangalore",
      about:
        " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s ",
      email: "gj1@gmail.com",
      phone: "987654321",
      createdBy: "pandit",
    },
    {
      id: 8,
      name: "Silver Shop",
      image:
        "https://img.freepik.com/premium-photo/young-job-seeker-man-going-find-new-job-face-portrait_181020-180.jpg",
      address: "206 MIG, KHB Colony, 5 Block",
      city: "Bangalore",
      about:
        " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s ",
      email: "gj1@gmail.com",
      phone: "987654321",
      createdBy: "pandit",
    },
  ];

  //   const handleAcceptRequest = async () => {
  //     Alert.alert("Request Accept Successfully.");
  //   };
  //   const handleDeleteRequest = async () => {
  //     Alert.alert("Request Deleted Successfully.");
  //   };

  // const fetchPanditToTempleRequest = async () => {
  //   console.log("templeid in req: ", templeId);
  //   try {
  //     setLoadingAnimation(true);
  //     const response = await fetch(
  //       `${BASEAPIURL}/panditToTempleReqList/${templeId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     console.log("PanditToTempleRequest List", response);

  //     if (response.ok) {
  //       const data = await response.json();
  //       // setPandits(data);
  //       setPandits(data.requests || []);

  //       console.log("PanditToTemple Req data: ", data);
  //     } else {
  //       throw new Error("Failed to fetch requests");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching requests:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };

  const fetchPanditToTempleRequest = async () => {
    console.log("Temple ID in request:", templeId);
    try {
      setLoadingAnimation(true);
  
      const response = await apiClient.get(`/panditToTempleReqList/${templeId}`);
      console.log("PanditToTempleRequest List", response.data);
  
      setPandits(response.data.requests || []);
    } catch (error) {
      console.error("Error fetching PanditToTemple requests:", error);
    } finally {
      setLoadingAnimation(false);
    }
  };
  console.log("pandits: ", pandits);
  const removeAcceptedRequest = (requestId, setStateFunc) => {
    setStateFunc((prevRequests) =>
      prevRequests.filter((request) => request._id !== requestId)
    );
  };

  // const handleAcceptRequest = async (requestId) => {
  //   try {
  //     console.log("T req id: ", requestId);
  //     const response = await fetch(
  //       `${BASEAPIURL}/panditToTempleRequest/${requestId}`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({ action: "accept" }),
  //       }
  //     );
  //     const responseData = await response.json();

  //     if (response.ok) {
  //       Alert.alert("Request Accept Successfully.");
  //       removeAcceptedRequest(requestId, setPandits);
  //     } else {
  //       console.error("Failed to accept request:", responseData);
  //       throw new Error("Failed to accept request");
  //     }
  //   } catch (error) {
  //     console.error("Error accepting request:", error);
  //   }
  // };
  // const handleDeleteRequest = async (requestId) => {
  //   try {
  //     const response = await fetch(
  //       `${BASEAPIURL}/panditToTempleRequest/${requestId}`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({ action: "delete" }),
  //       }
  //     );
  //     const responseData = await response.json();

  //     if (response.ok) {
  //       Alert.alert("Request Deleted Successfully.");
  //       fetchPanditToTempleRequest();
  //     } else {
  //       console.error("Failed to delete request:", responseData);
  //       throw new Error("Failed to delete request");
  //     }
  //   } catch (error) {
  //     console.error("Error deleting request:", error);
  //   }
  // };

  // const fetchShopToTempleRequest = async () => {
  //   console.log("templeid in req: ", templeId);
  //   try {
  //     setLoadingAnimation(true);
  //     const response = await fetch(
  //       `${BASEAPIURL}/templeConnections/requests/${templeId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     console.log("ShopToTempleRequest List", response);

  //     if (response.ok) {
  //       const data = await response.json();

  //       setShops(data);

  //       console.log("ShopToTemple Req data: ", data);
  //     } else {
  //       throw new Error("Failed to fetch ShopToTemple requests");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching ShopToTemple requests:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };
 
  const handleAcceptRequest = async (requestId) => {
    try {
      console.log("T req id: ", requestId);
  
      const response = await apiClient.post(`/panditToTempleRequest/${requestId}`, {
        action: "accept",
      });
  
      if (response.status === 200) {
        Alert.alert("Request Accepted Successfully.");
        removeAcceptedRequest(requestId, setPandits);
      } else {
        console.error("Failed to accept request:", response.data);
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  
  const handleDeleteRequest = async (requestId) => {
    try {
      const response = await apiClient.post(`/panditToTempleRequest/${requestId}`, {
        action: "delete",
      });
  
      if (response.status === 200) {
        Alert.alert("Request Deleted Successfully.");
        fetchPanditToTempleRequest();
      } else {
        console.error("Failed to delete request:", response.data);
        throw new Error("Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };
 
  const fetchShopToTempleRequest = async () => {
    console.log("Temple ID in request:", templeId);
    try {
      setLoadingAnimation(true);
  
      const response = await apiClient.get(`/templeConnections/requests/${templeId}`);
      console.log("ShopToTempleRequest List", response.data);
  
      setShops(response.data);
    } catch (error) {
      console.error("Error fetching ShopToTemple requests:", error);
    } finally {
      setLoadingAnimation(false);
    }
  };
  // const handleShopAcceptRequest = async (requestId) => {
  //   try {
  //     console.log("S req id: ", requestId);
  //     const response = await fetch(
  //       `${BASEAPIURL}/templeConnections/action/${requestId}`,
  //       {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({ status: "accepted" }),
  //       }
  //     );
  //     const responseData = await response.json();

  //     if (response.ok) {
  //       Alert.alert("Request Accept Successfully.");
  //       removeAcceptedRequest(requestId, setShops);
  //     } else {
  //       console.error("Failed to accept Shop to temple request:", responseData);
  //       throw new Error("Failed to accept Shop to temple request");
  //     }
  //   } catch (error) {
  //     console.error("Error accepting Shop to temple request:", error);
  //   }
  // };
  // const handleShopDeleteRequest = async (requestId) => {
  //   try {
  //     const response = await fetch(
  //       `${BASEAPIURL}/templeConnections/action/${requestId}`,
  //       {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({ status: "rejected" }),
  //       }
  //     );
  //     const responseData = await response.json();

  //     if (response.ok) {
  //       Alert.alert("Request Deleted Successfully.");
  //       fetchShopToTempleRequest();
  //     } else {
  //       console.error("Failed to delete Shop to temple request:", responseData);
  //       throw new Error("Failed to delete Shop to temple request");
  //     }
  //   } catch (error) {
  //     console.error("Error deleting Shop to temple request:", error);
  //   }
  // };

  const handleShopAcceptRequest = async (requestId) => {
    try {
      console.log("S req id: ", requestId);
  
      const response = await apiClient.patch(`/templeConnections/action/${requestId}`, {
        status: "accepted",
      });
  
      if (response.status === 200) {
        Alert.alert("Request Accepted Successfully.");
        removeAcceptedRequest(requestId, setShops);
      } else {
        console.error("Failed to accept Shop to temple request:", response.data);
        throw new Error("Failed to accept Shop to temple request");
      }
    } catch (error) {
      console.error("Error accepting Shop to temple request:", error);
    }
  };
  
  const handleShopDeleteRequest = async (requestId) => {
    try {
      const response = await apiClient.patch(`/templeConnections/action/${requestId}`, {
        status: "rejected",
      });
  
      if (response.status === 200) {
        Alert.alert("Request Deleted Successfully.");
        fetchShopToTempleRequest();
      } else {
        console.error("Failed to delete Shop to temple request:", response.data);
        throw new Error("Failed to delete Shop to temple request");
      }
    } catch (error) {
      console.error("Error deleting Shop to temple request:", error);
    }
  };
  
  useEffect(() => {
    fetchPanditToTempleRequest();
    fetchShopToTempleRequest();
  }, []);

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
              style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}
            >
              Temple
            </TopText>
          </View>
        </RowBetween>
      </View>

      <View style={styles.tabsContainer}>
        {["Requests", "Notifications"].map((tab) => (
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
      <View>
        {/* {selectedTab === "Requests" && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginHorizontal: 14,
              marginTop: 10,
            }}
          >
            <SearchField placeholder="Search" />
            <View style={{ position: "absolute", right: 20, elevation: 3 }}>
              <Icon name="search" size={24} />
            </View>
          </View>
        )} */}
      </View>

      {selectedTab === "Requests" && (
        <>
          <TempleShops templeinfo={templeinfo} />
          <BottomNavigation navigation={navigation} />
        </>
      )}
      {selectedTab === "Notifications" && (
        <>
          <ScrollView style={{ flex: 1 }}>
            <View
              style={{
                padding: "2%",
                margin: "2%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {pandits.length === 0 && shops.length === 0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 400,
                  }}
                >
                  <Text style={{ fontSize: 18, color: "grey" }}>
                    No data found
                  </Text>
                </View>
              ) : (
                <>
                  {pandits.length > 0 && (
                    <>
                      {pandits.map((pandit, index) => (
                        <TouchableOpacity key={index}>
                          <View
                            style={{
                              marginVertical: "4%",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            {/* <Image
                              style={{
                                width: 60,
                                height: 65,
                                borderRadius: 8,
                                marginRight: "5%",
                              }}
                              source={{
                                uri: pandit.image,
                              }}
                            /> */}
                            <Image
                              style={{
                                width: 60,
                                height: 65,
                                borderRadius: 8,
                                marginRight: "6%",
                              }}
                              source={
                                pandit.image
                                  ? { uri: `${pandit.image}` }
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
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {pandit.requestByPanditId?.panditName}
                              </Text>
                              <Text
                                style={{
                                  fontWeight: "600",
                                  opacity: 0.4,
                                  marginTop: "2%",
                                }}
                              >
                                {"pandit"}
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
                                  const requestId = pandit._id;
                                  console.log("OnReq: ", requestId);
                                  handleAcceptRequest(requestId);
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
                                  <Text>Accept</Text>
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
                                  const requestId = pandit._id;
                                  console.log("OnReq: ", requestId);
                                  handleDeleteRequest(requestId);
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
                                  <Text>Delete</Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {shops.length > 0 && (
                    <>
                      {shops.map((shop) => (
                        <TouchableOpacity key={shop._id}>
                          <View
                            style={{
                              marginVertical: "4%",
                              flexDirection: "row",
                              alignItems: "center",
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
                                shop.image
                                  ? { uri: `${shop.image}` }
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
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {shop.name}
                              </Text>
                              <Text
                                style={{
                                  fontWeight: "600",
                                  opacity: 0.4,
                                  marginTop: "2%",
                                }}
                              >
                                {"shop"}
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
                                  const requestId = shop._id;
                                  console.log("OnReq shop: ", requestId);
                                  handleShopAcceptRequest(requestId);
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
                                  <Text>Accept</Text>
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
                                  const requestId = shop._id;
                                  console.log("OnReq shop: ", requestId);
                                  handleShopDeleteRequest(requestId);
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
                                  <Text>Delete</Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}
                </>
              )}
            </View>
          </ScrollView>

          <BottomNavigation navigation={navigation} />
        </>
      )}
    </SafeAreaView>
  );
}

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
    backgroundColor: Theme.themeColor,
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
    backgroundColor: Theme.themeColor,
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

export default TempleNotifications;
