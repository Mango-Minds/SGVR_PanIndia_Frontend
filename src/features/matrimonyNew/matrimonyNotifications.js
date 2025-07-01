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
import Theme from "../../styles/theme";
import SelectDropdown from "react-native-select-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import {
  fetchConnectionRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
} from "./matrimonyAPIs";
import { useTranslation } from "react-i18next";

function MatrimonyNotifications({ navigation, route }) {
  const [selectedTab, setSelectedTab] = useState("requests");
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };
  const { t } = useTranslation();
  const { user } = route.params;
  console.log("Notifications user info: ", user);
  const userId = user?.roleData?.MatrimonyUser?._id ||user?.roleData?.MatrimonyVendor?._id  ||user?.roleData?.pandit?._id;
  console.log("User id: ", userId);
  const [requests, setRequests] = useState([]);
  const [shops, setShops] = useState([]);

  const token = useSelector((state) => state.user.token);

  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));

  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const fetchRequest = async () => {
    console.log("userId in req: ", userId);

    try {
      setLoadingAnimation(true);
      const data = await fetchConnectionRequests(userId);
      console.log("Req data: ", data);

      setReceivedRequests(data.receivedRequests || []);
      setSentRequests(data.sentRequests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoadingAnimation(false);
    }
  };
  const handleAcceptRequest = async (requestId) => {
    try {
      console.log("req id: ", requestId);
      const response = await acceptConnectionRequest(requestId);

      if (response.status === 200) {
        Alert.alert("Request Accepted Successfully.");
        removeAcceptedRequest(requestId, setReceivedRequests);
      } else {
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
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
    }
  };

  console.log("rec req: ", receivedRequests);
  console.log("sent req: ", sentRequests);

  const removeAcceptedRequest = (requestId, setStateFunc) => {
    setStateFunc((prevRequests) =>
      prevRequests.filter((request) => request._id !== requestId)
    );
  };

  useEffect(() => {
    fetchRequest();
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
              style={{
                color: Theme.themeColor,
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
             {t("matrimonyHeading")}
            </TopText>
          </View>
        </RowBetween>
      </View>

      {/* <View style={styles.tabsContainer}>
        {["requests", "notifications"].map((tab) => (
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
      </View> */}
      <View style={styles.tabsContainer}>
  {["requests", "notifications"].map((tab) => (
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
        {t(`tabs.${tab}`)}
      </Text>
    </TouchableOpacity>
  ))}
</View>
      <View></View>

      {selectedTab === "requests" && <></>}
{selectedTab === "notifications"  && (
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
              {receivedRequests.length === 0 &&
              receivedRequests.length === 0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 400,
                  }}
                >
                  <Text style={{ fontSize: 18, color: "grey" }}>
                    {t("no_data_found")}
                  </Text>
                </View>
              ) : (
                <>
                  {receivedRequests.length > 0 && (
                    <>
                      {receivedRequests.map((receivedRequest, index) => (
                        <TouchableOpacity key={index}>
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
                                receivedRequest.sender.images
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

                              <Text
                                style={{
                                  fontWeight: "600",
                                  opacity: 0.4,
                                  marginTop: "2%",
                                }}
                              >
                                {receivedRequest.createdBy}
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
                                  const requestId = receivedRequest._id;
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
                                  const requestId = receivedRequest._id;
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
                                  <Text>{t("delete")}</Text>
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

          {/* <BottomNavigation navigation={navigation} /> */}
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

export default MatrimonyNotifications;


// import React, { useState, useCallback, useEffect } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   Alert,
// } from "react-native";
// import { IconButton } from "react-native-paper";
// import { RowBetween, SearchField } from "../../styles/common.styles";
// import { TopText } from "../../styles/social.styles";
// import Icon from "react-native-vector-icons/Ionicons";
// import { ScrollView } from "react-native-gesture-handler";
// import { decode } from "base-64";
// import { BASEAPIURL } from "../../infrastructure/constants";
// import { useSelector } from "react-redux";
// import UserImg from "../../assets/images/general/user.png";
// import BottomNavigation from "../../components/Jewellery/BottomNavigation";
// import Theme from "../../styles/theme";
// import SelectDropdown from "react-native-select-dropdown";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import apiClient from "../../store/apiClient";
// import {
//   fetchConnectionRequests,
//   acceptConnectionRequest,
//   rejectConnectionRequest,
// } from "./matrimonyAPIs";
// function MatrimonyNotifications({ navigation, route }) {
//   const [selectedTab, setSelectedTab] = useState("Requests");
//   const [loadingAnimation, setLoadingAnimation] = useState(true);
//   const handleTabPress = (tab) => {
//     setSelectedTab(tab);
//   };
//   const { user } = route.params;
//   console.log("Notifications user info: ", user);
//   const userId = user?.roleDa?.MatrimonyUser?._id;
//   console.log("User id: ", userId);
//   const [requests, setRequests] = useState([]);
//   const [shops, setShops] = useState([]);

//   const token = useSelector((state) => state.user.token);

//   const tokenPayload = token.split(".")[1];
//   const decodedPayload = JSON.parse(decode(tokenPayload));

//   const [receivedRequests, setReceivedRequests] = useState([]);
//   const [sentRequests, setSentRequests] = useState([]);

//   const fetchRequest = async () => {
//     console.log("userId in req: ", userId);

//     try {
//       setLoadingAnimation(true);
//       const data = await fetchConnectionRequests(userId);
//       console.log("Req data: ", data);

//       setReceivedRequests(data.receivedRequests || []);
//       setSentRequests(data.sentRequests || []);
//     } catch (error) {
//       console.error("Error fetching requests:", error);
//     } finally {
//       setLoadingAnimation(false);
//     }
//   };
//   const handleAcceptRequest = async (requestId) => {
//     try {
//       console.log("req id: ", requestId);
//       const response = await acceptConnectionRequest(requestId);

//       if (response.status === 200) {
//         Alert.alert("Request Accepted Successfully.");
//         removeAcceptedRequest(requestId, setReceivedRequests);
//       } else {
//         throw new Error("Failed to accept request");
//       }
//     } catch (error) {
//       console.error("Error accepting request:", error);
//     }
//   };
//   const handleDeleteRequest = async (requestId) => {
//     try {
//       const response = await rejectConnectionRequest(requestId);

//       if (response.status === 200) {
//         Alert.alert("Request Deleted Successfully.");
//         fetchRequest();
//       } else {
//         throw new Error("Failed to delete request");
//       }
//     } catch (error) {
//       console.error("Error deleting request:", error);
//     }
//   };

//   console.log("rec req: ", receivedRequests);
//   console.log("sent req: ", sentRequests);

//   const removeAcceptedRequest = (requestId, setStateFunc) => {
//     setStateFunc((prevRequests) =>
//       prevRequests.filter((request) => request._id !== requestId)
//     );
//   };

//   useEffect(() => {
//     fetchRequest();
//   }, []);

//   return (
//     <SafeAreaView
//       style={{
//         flex: 1,
//         backgroundColor: "white",
//       }}
//     >
//       <View
//         style={{
//           paddingHorizontal: 10,
//         }}
//       >
//         <RowBetween style={{ paddingTop: 24 }}>
//           <View style={{ alignItems: "center", flexDirection: "row" }}>
//             <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
//             <TopText
//               style={{
//                 color: Theme.themeColor,
//                 fontSize: 20,
//                 fontWeight: "bold",
//               }}
//             >
//               Matrimony
//             </TopText>
//           </View>
//         </RowBetween>
//       </View>

//       <View style={styles.tabsContainer}>
//         {["Requests", "Notifications"].map((tab) => (
//           <TouchableOpacity
//             key={tab}
//             onPress={() => handleTabPress(tab)}
//             style={[styles.tab, selectedTab === tab ? styles.selectedTab : {}]}
//           >
//             <Text
//               style={[
//                 styles.tabText,
//                 selectedTab === tab ? styles.selectedTabText : {},
//               ]}
//             >
//               {tab}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//       <View></View>

//       {selectedTab === "Requests" && <></>}
//       {selectedTab === "Notifications" && (
//         <>
//           <ScrollView style={{ flex: 1 }}>
//             <View
//               style={{
//                 padding: "2%",
//                 margin: "2%",
//                 display: "flex",
//                 flexDirection: "column",
//               }}
//             >
//               {receivedRequests.length === 0 &&
//               receivedRequests.length === 0 ? (
//                 <View
//                   style={{
//                     flex: 1,
//                     justifyContent: "center",
//                     alignItems: "center",
//                     minHeight: 400,
//                   }}
//                 >
//                   <Text style={{ fontSize: 18, color: "grey" }}>
//                     No data found
//                   </Text>
//                 </View>
//               ) : (
//                 <>
//                   {receivedRequests.length > 0 && (
//                     <>
//                       {receivedRequests.map((receivedRequest, index) => (
//                         <TouchableOpacity key={index}>
//                           <View
//                             style={{
//                               marginVertical: "4%",
//                               flexDirection: "row",
//                               alignItems: "center",
//                             }}
//                           >
//                             <Image
//                               style={{
//                                 width: 60,
//                                 height: 65,
//                                 borderRadius: 8,
//                                 marginRight: "6%",
//                               }}
//                               source={
//                                 receivedRequest.sender.images
//                                   ? {
//                                       uri: `${receivedRequest.sender.images[0]}`,
//                                     }
//                                   : UserImg
//                               }
//                             />
//                             <View style={{ flex: 1 }}>
//                               <Text
//                                 style={{
//                                   fontWeight: "bold",
//                                   opacity: 0.7,
//                                   fontSize: 17,
//                                 }}
//                               >
//                                 {receivedRequest.sender.name}
//                               </Text>

//                               <Text
//                                 style={{
//                                   fontWeight: "600",
//                                   opacity: 0.4,
//                                   marginTop: "2%",
//                                 }}
//                               >
//                                 {receivedRequest.createdBy}
//                               </Text>
//                             </View>

//                             <View
//                               style={{
//                                 flexDirection: "row",
//                                 marginLeft: "5%",
//                                 marginTop: "2%",
//                               }}
//                             >
//                               <TouchableOpacity
//                                 style={{
//                                   width: 75,
//                                   height: 35,
//                                   backgroundColor: "#E9ECEF",
//                                   borderRadius: 8,
//                                   paddingHorizontal: 4,
//                                   margin: 0,
//                                   marginBottom: 0,
//                                   justifyContent: "center",
//                                   alignItems: "center",
//                                   marginRight: 5,
//                                 }}
//                                 onPress={() => {
//                                   const requestId = receivedRequest._id;
//                                   console.log("OnReq: ", requestId);
//                                   handleAcceptRequest(requestId);
//                                 }}
//                               >
//                                 <View
//                                   style={{
//                                     flexDirection: "row",
//                                     alignItems: "center",
//                                   }}
//                                 >
//                                   <Icon
//                                     name="checkmark-circle"
//                                     size={15}
//                                     color="#7AB163"
//                                     style={{ marginRight: 5 }}
//                                   />
//                                   <Text>Accept</Text>
//                                 </View>
//                               </TouchableOpacity>
//                               <TouchableOpacity
//                                 style={{
//                                   width: 75,
//                                   height: 35,
//                                   backgroundColor: "#E9ECEF",
//                                   borderRadius: 8,
//                                   paddingHorizontal: 4,
//                                   margin: 0,
//                                   marginBottom: 0,
//                                   justifyContent: "center",
//                                   alignItems: "center",
//                                   marginRight: 0,
//                                 }}
//                                 onPress={() => {
//                                   const requestId = receivedRequest._id;
//                                   console.log("OnReq: ", requestId);
//                                   handleDeleteRequest(requestId);
//                                 }}
//                               >
//                                 <View
//                                   style={{
//                                     flexDirection: "row",
//                                     alignItems: "center",
//                                     paddingVertical: 8,
//                                     paddingHorizontal: 12,
//                                     borderRadius: 5,
//                                   }}
//                                 >
//                                   <Icon
//                                     name="close-circle"
//                                     size={15}
//                                     color="#ff0000"
//                                     style={{ marginRight: 5 }}
//                                   />
//                                   <Text>Delete</Text>
//                                 </View>
//                               </TouchableOpacity>
//                             </View>
//                           </View>
//                         </TouchableOpacity>
//                       ))}
//                     </>
//                   )}
//                 </>
//               )}
//             </View>
//           </ScrollView>

//           <BottomNavigation navigation={navigation} />
//         </>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   Catagory: {
//     marginHorizontal: 10,
//     marginVertical: 15,
//   },
//   CatagoryText: {
//     fontSize: 13,
//     fontWeight: "500",
//     marginTop: 10,
//     textAlign: "center",
//     color: "#616161",
//   },
//   StockCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "flex-start",
//     paddingHorizontal: 10,
//     paddingVertical: 10,
//     marginVertical: 5,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 5,
//       height: 2,
//     },
//     shadowOpacity: 0.15,
//     shadowRadius: 3.84,
//     elevation: 2,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//   },
//   stockImage: {
//     width: 90,
//     height: 90,
//     marginRight: 10,
//   },
//   stockName: {
//     fontSize: 17,
//     fontWeight: "600",
//     color: "#141414",
//     marginBottom: 10,
//   },
//   stockspecs: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     width: "73%",
//   },
//   stockdetails: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#616161",
//     opacity: 0.5,
//   },
//   stocklocation: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "flex-start",
//     marginTop: 10,
//   },
//   stockloacaiontext: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#616161",
//     opacity: 0.8,
//   },
//   tabsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     marginTop: 8,
//   },
//   tab: {
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 20,
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

//   shadowProp: {
//     backgroundColor: "#f2f2f2",
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 3,
//     },
//     shadowOpacity: 0.15,
//     shadowRadius: 1.41,
//     elevation: 2,
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
//   iconContainer: {
//     flex: 1,
//     alignItems: "center",
//   },

//   iconText: {
//     marginTop: 4,
//   },
//   icon: {
//     marginRight: 10,
//     marginTop: 3,
//     marginLeft: 20,
//   },
//   circleImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 45,
//     overflow: "hidden",
//     marginBottom: 5,
//     borderWidth: 0.1,
//     borderColor: "gray",
//   },
//   chatIconBackground: {
//     width: 60,
//     height: 30,
//     borderRadius: 22,
//     backgroundColor: Theme.themeColor,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "white",
//     padding: 20,
//     borderRadius: 10,
//     elevation: 5,
//   },
//   option: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//     backgroundColor: "lightgray",
//     borderRadius: 10,
//     width: 250,
//     opacity: 1.5,
//     height: 40,
//     fontWeight: "bold",
//   },
//   optionText: {
//     fontSize: 18,
//   },
//   closeButton: {
//     position: "absolute",
//     top: 1,
//     right: 8,
//   },
// });

// export default MatrimonyNotifications;







// // import React, { useState, useCallback, useEffect } from "react";
// // import {
// //   SafeAreaView,
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   Image,
// //   Alert,
// // } from "react-native";
// // import { IconButton } from "react-native-paper";
// // import { RowBetween, SearchField } from "../../styles/common.styles";
// // import { TopText } from "../../styles/social.styles";
// // import Icon from "react-native-vector-icons/Ionicons";
// // import { ScrollView } from "react-native-gesture-handler";

// // import { decode } from "base-64";
// // import { BASEAPIURL } from "../../infrastructure/constants";
// // import { useSelector } from "react-redux";
// // import UserImg from "../../assets/images/general/user.png";
// // import BottomNavigation from "../../components/Jewellery/BottomNavigation";
// // import Theme from "../../styles/theme";
// // import SelectDropdown from "react-native-select-dropdown";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import apiClient from "../../store/apiClient";
// // import { fetchConnectionRequests,
// //   acceptConnectionRequest,
// //   rejectConnectionRequest,} from "./matrimonyAPIs";
// // function MatrimonyNotifications({ navigation, route }) {
// //   const [selectedTab, setSelectedTab] = useState("Requests");
// //   const [loadingAnimation, setLoadingAnimation] = useState(true);
// //   const handleTabPress = (tab) => {
// //     setSelectedTab(tab);
// //   };
// //   const { user } = route.params;
// //   console.log("Notifications user info: ", user);
// //   const userId = user?.roleData?._id;
// //   console.log("User id: ", userId);
// //   const [requests, setRequests] = useState([]);
// //   const [shops, setShops] = useState([]);

// //   const token = useSelector((state) => state.user.token);

// //   const tokenPayload = token.split(".")[1];
// //   const decodedPayload = JSON.parse(decode(tokenPayload));
// // //   const user = useSelector((state) => state.user.user);
// // //   console.log("user: ", user);
 
// // const [receivedRequests, setReceivedRequests] = useState([]);
// // const [sentRequests, setSentRequests] = useState([]);


  

// // //   const fetchRequest = async () => {
// // //     console.log("userId in req: ", userId);
// // //     try {
// // //       setLoadingAnimation(true);
// // //       const response = await fetch(
// // //         `${BASEAPIURL}/matrimony/connection/requests/${userId}`,
// // //         {
// // //           method: "GET",
// // //           headers: {
// // //             "Content-Type": "application/json",
// // //             Authorization: `Bearer ${token}`,
// // //           },
// // //         }
// // //       );
// // //       console.log("Request List", response);

// // //       if (response.ok) {
// // //         const data = await response.json();
// // //         setRequests(data.requests || []);

// // //         console.log("Req data: ", data);
// // //         console.log(setRequests);
// // //       } else {
// // //         throw new Error("Failed to fetch requests");
// // //       }
// // //     } catch (error) {
// // //       console.error("Error fetching requests:", error);
// // //     }
// // //     finally {
// // //       setLoadingAnimation(false);
// // //     }
// // //   };



// // //correct
// // // const fetchRequest = async () => {
// // //   console.log("userId in req: ", userId);
// // //   const token = await AsyncStorage.getItem("token");

// // //   try {
// // //     setLoadingAnimation(true);
// // //     const response = await apiClient.get(
// // //       `${BASEAPIURL}/matrimony/connection/requests/${userId}`,
// // //       {
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           Authorization: `Bearer ${token}`,
// // //         },
// // //       }
// // //     );
// // //     console.log("Request List", response);

// // //     const data = response.data;
// // //     console.log("Req data: ", data);

// // //     setReceivedRequests(data.receivedRequests || []);
// // //     setSentRequests(data.sentRequests || []);
// // //   } catch (error) {
// // //     console.error("Error fetching requests:", error);
// // //   } finally {
// // //     setLoadingAnimation(false);
// // //   }
// // // };

// // // const handleAcceptRequest = async (requestId) => {
// // //   const token = await AsyncStorage.getItem("token");

// // //   try {
// // //     console.log("req id: ", requestId);
// // //     const response = await apiClient.post(
// // //       `${BASEAPIURL}/matrimony/connection/accept-request/${requestId}`,
// // //       { action: "accepted" },
// // //       {
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           Authorization: `Bearer ${token}`,
// // //         },
// // //       }
// // //     );

// // //     if (response.status === 200) {
// // //       Alert.alert("Request Accept Successfully.");
// // //       removeAcceptedRequest(requestId, setReceivedRequests);
// // //     } else {
// // //       console.error("Failed to accept request:", response.data);
// // //       throw new Error("Failed to accept request");
// // //     }
// // //   } catch (error) {
// // //     console.error("Error accepting request:", error);
// // //   }
// // // };

// // // const handleDeleteRequest = async (requestId) => {
// // //   const token = await AsyncStorage.getItem("token");

// // //   try {
// // //     const response = await apiClient.post(
// // //       `${BASEAPIURL}/matrimony/connection/reject-request/${requestId}`,
// // //       { action: "rejected" },
// // //       {
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //           Authorization: `Bearer ${token}`,
// // //         },
// // //       }
// // //     );

// // //     if (response.status === 200) {
// // //       Alert.alert("Request Deleted Successfully.");
// // //       fetchRequest();
// // //     } else {
// // //       console.error("Failed to delete request:", response.data);
// // //       throw new Error("Failed to delete request");
// // //     }
// // //   } catch (error) {
// // //     console.error("Error deleting request:", error);
// // //   }
// // // };
// // const fetchRequest = async () => {
// //   console.log("userId in req: ", userId);

// //   try {
// //     setLoadingAnimation(true);
// //     const data = await fetchConnectionRequests(userId);
// //     console.log("Req data: ", data);

// //     setReceivedRequests(data.receivedRequests || []);
// //     setSentRequests(data.sentRequests || []);
// //   } catch (error) {
// //     console.error("Error fetching requests:", error);
// //   } finally {
// //     setLoadingAnimation(false);
// //   }
// // };
// // const handleAcceptRequest = async (requestId) => {
// //   try {
// //     console.log("req id: ", requestId);
// //     const response = await acceptConnectionRequest(requestId);

// //     if (response.status === 200) {
// //       Alert.alert("Request Accepted Successfully.");
// //       removeAcceptedRequest(requestId, setReceivedRequests);
// //     } else {
// //       throw new Error("Failed to accept request");
// //     }
// //   } catch (error) {
// //     console.error("Error accepting request:", error);
// //   }
// // };
// // const handleDeleteRequest = async (requestId) => {
// //   try {
// //     const response = await rejectConnectionRequest(requestId);

// //     if (response.status === 200) {
// //       Alert.alert("Request Deleted Successfully.");
// //       fetchRequest();
// //     } else {
// //       throw new Error("Failed to delete request");
// //     }
// //   } catch (error) {
// //     console.error("Error deleting request:", error);
// //   }
// // };


  
// //   console.log("rec req: ", receivedRequests);
// //   console.log("sent req: ", sentRequests);

// //   const removeAcceptedRequest = (requestId, setStateFunc) => {
// //     setStateFunc((prevRequests) =>
// //       prevRequests.filter((request) => request._id !== requestId)
// //     );
// //   };

  
// //   // const handleAcceptRequest = async (requestId) => {
// //   //   try {
// //   //     console.log("req id: ", requestId);
// //   //     const response = await fetch(
// //   //       `${BASEAPIURL}/matrimony/connection/accept-request/${requestId}`,
// //   //       {
// //   //         method: "POST",
// //   //         headers: {
// //   //           "Content-Type": "application/json",
// //   //           Authorization: `Bearer ${token}`,
// //   //         },
// //   //         body: JSON.stringify({ action: "accepted" }),
// //   //       }
// //   //     );
// //   //     const responseData = await response.json();

// //   //     if (response.ok) {
// //   //       Alert.alert("Request Accept Successfully.");
// //   //       removeAcceptedRequest(requestId, setReceivedRequests);
// //   //     } else {
// //   //       console.error("Failed to accept request:", responseData);
// //   //       throw new Error("Failed to accept request");
// //   //     }
// //   //   } catch (error) {
// //   //     console.error("Error accepting request:", error);
// //   //   }
// //   // };
// //   // const handleDeleteRequest = async (requestId) => {
// //   //   try {
// //   //     const response = await fetch(
// //   //       `${BASEAPIURL}/matrimony/connection/reject-request/${requestId}`,
// //   //       {
// //   //         method: "POST",
// //   //         headers: {
// //   //           "Content-Type": "application/json",
// //   //           Authorization: `Bearer ${token}`,
// //   //         },
// //   //         body: JSON.stringify({ action: "rejected" }),
// //   //       }
// //   //     );
// //   //     const responseData = await response.json();

// //   //     if (response.ok) {
// //   //       Alert.alert("Request Deleted Successfully.");
// //   //       fetchRequest();
// //   //     } else {
// //   //       console.error("Failed to delete request:", responseData);
// //   //       throw new Error("Failed to delete request");
// //   //     }
// //   //   } catch (error) {
// //   //     console.error("Error deleting request:", error);
// //   //   }
// //   // };



// //   useEffect(() => {
// //    fetchRequest();
// //   }, []);

// //   return (
// //     <SafeAreaView
// //       style={{
// //         flex: 1,
// //         backgroundColor: "white",
// //       }}
// //     >
// //       <View
// //         style={{
// //           paddingHorizontal: 10,
// //         }}
// //       >
// //         <RowBetween style={{ paddingTop: 24 }}>
// //           <View style={{ alignItems: "center", flexDirection: "row" }}>
// //             <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
// //             <TopText
// //               style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}
// //             >
// //               Matrimony
// //             </TopText>
// //           </View>
// //         </RowBetween>
// //       </View>

// //       <View style={styles.tabsContainer}>
// //         {["Requests", "Notifications"].map((tab) => (
// //           <TouchableOpacity
// //             key={tab}
// //             onPress={() => handleTabPress(tab)}
// //             style={[styles.tab, selectedTab === tab ? styles.selectedTab : {}]}
// //           >
// //             <Text
// //               style={[
// //                 styles.tabText,
// //                 selectedTab === tab ? styles.selectedTabText : {},
// //               ]}
// //             >
// //               {tab}
// //             </Text>
// //           </TouchableOpacity>
// //         ))}
// //       </View>
// //       <View>
// //         {/* {selectedTab === "Requests" && (
// //           <View
// //             style={{
// //               flexDirection: "row",
// //               alignItems: "center",
// //               marginHorizontal: 14,
// //               marginTop: 10,
// //             }}
// //           >
// //             <SearchField placeholder="Search" />
// //             <View style={{ position: "absolute", right: 20, elevation: 3 }}>
// //               <Icon name="search" size={24} />
// //             </View>
// //           </View>
// //         )} */}
// //       </View>

// //       {selectedTab === "Requests" && (
// //         <>
// //           {/* <TempleShops templeinfo={templeinfo}/> */}
// //           {/* <BottomNavigation navigation={navigation} /> */}
// //         </>
// //       )}
// //       {selectedTab === "Notifications" && (
// //         <>
// //           <ScrollView style={{ flex: 1 }}>
// //             <View
// //               style={{
// //                 padding: "2%",
// //                 margin: "2%",
// //                 display: "flex",
// //                 flexDirection: "column",
// //               }}
// //             >
// //               {receivedRequests.length === 0 && receivedRequests.length === 0 ? (
// //                 <View
// //                   style={{
// //                     flex: 1,
// //                     justifyContent: "center",
// //                     alignItems: "center",
// //                     minHeight: 400,
// //                   }}
// //                 >
// //                   <Text style={{ fontSize: 18, color: "grey" }}>
// //                     No data found
// //                   </Text>
// //                 </View>
// //               ) : (
// //                 <>
// //                   {receivedRequests.length > 0 && (
// //                     <>
// //                       {receivedRequests.map((receivedRequest, index) => (
// //                         <TouchableOpacity key={index}>
// //                           <View
// //                             style={{
// //                               marginVertical: "4%",
// //                               flexDirection: "row",
// //                               alignItems: "center",
// //                             }}
// //                           >
                            
// //                             <Image
// //                               style={{
// //                                 width: 60,
// //                                 height: 65,
// //                                 borderRadius: 8,
// //                                 marginRight: "6%",
// //                               }}
// //                               source={
// //                                 receivedRequest.sender.images
// //                                   ? { uri: `${receivedRequest.sender.images[0]}` }
// //                                   : UserImg
// //                               }
// //                             />
// //                             <View style={{ flex: 1 }}>
// //                               <Text
// //                                 style={{
// //                                   fontWeight: "bold",
// //                                   opacity: 0.7,
// //                                   fontSize: 17,
// //                                 }}
// //                               >
// //                                 {receivedRequest.sender.name}
                               
// //                               </Text>
                              
// //                               <Text
// //                                 style={{
// //                                   fontWeight: "600",
// //                                   opacity: 0.4,
// //                                   marginTop: "2%",
// //                                 }}
// //                               >
// //                                 {receivedRequest.createdBy}
// //                               </Text>
// //                             </View>

// //                             <View
// //                               style={{
// //                                 flexDirection: "row",
// //                                 marginLeft: "5%",
// //                                 marginTop: "2%",
// //                               }}
// //                             >
// //                               <TouchableOpacity
// //                                 style={{
// //                                   width: 75,
// //                                   height: 35,
// //                                   backgroundColor: "#E9ECEF",
// //                                   borderRadius: 8,
// //                                   paddingHorizontal: 4,
// //                                   margin: 0,
// //                                   marginBottom: 0,
// //                                   justifyContent: "center",
// //                                   alignItems: "center",
// //                                   marginRight: 5,
// //                                 }}
// //                                 onPress={() => {
// //                                   const requestId = receivedRequest._id;
// //                                   console.log("OnReq: ", requestId);
// //                                   handleAcceptRequest(requestId);
// //                                 }}
// //                               >
// //                                 <View
// //                                   style={{
// //                                     flexDirection: "row",
// //                                     alignItems: "center",
// //                                   }}
// //                                 >
// //                                   <Icon
// //                                     name="checkmark-circle"
// //                                     size={15}
// //                                     color="#7AB163"
// //                                     style={{ marginRight: 5 }}
// //                                   />
// //                                   <Text>Accept</Text>
// //                                 </View>
// //                               </TouchableOpacity>
// //                               <TouchableOpacity
// //                                 style={{
// //                                   width: 75,
// //                                   height: 35,
// //                                   backgroundColor: "#E9ECEF",
// //                                   borderRadius: 8,
// //                                   paddingHorizontal: 4,
// //                                   margin: 0,
// //                                   marginBottom: 0,
// //                                   justifyContent: "center",
// //                                   alignItems: "center",
// //                                   marginRight: 0,
// //                                 }}
// //                                 onPress={() => {
// //                                   const requestId = receivedRequest._id;
// //                                   console.log("OnReq: ", requestId);
// //                                   handleDeleteRequest(requestId);
// //                                 }}
// //                               >
// //                                 <View
// //                                   style={{
// //                                     flexDirection: "row",
// //                                     alignItems: "center",
// //                                     paddingVertical: 8,
// //                                     paddingHorizontal: 12,
// //                                     borderRadius: 5,
// //                                   }}
// //                                 >
// //                                   <Icon
// //                                     name="close-circle"
// //                                     size={15}
// //                                     color="#ff0000"
// //                                     style={{ marginRight: 5 }}
// //                                   />
// //                                   <Text>Delete</Text>
// //                                 </View>
// //                               </TouchableOpacity>
// //                             </View>
// //                           </View>
// //                         </TouchableOpacity>
// //                       ))}
// //                     </>
// //                   )}

                 
// //                 </>
// //               )}

             
// //             </View>
// //           </ScrollView>

// //           <BottomNavigation navigation={navigation} />
// //         </>
// //       )}
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   Catagory: {
// //     marginHorizontal: 10,
// //     marginVertical: 15,
// //   },
// //   CatagoryText: {
// //     fontSize: 13,
// //     fontWeight: "500",
// //     marginTop: 10,
// //     textAlign: "center",
// //     color: "#616161",
// //   },
// //   StockCard: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "flex-start",
// //     paddingHorizontal: 10,
// //     paddingVertical: 10,
// //     marginVertical: 5,
// //     shadowColor: "#000",
// //     shadowOffset: {
// //       width: 5,
// //       height: 2,
// //     },
// //     shadowOpacity: 0.15,
// //     shadowRadius: 3.84,
// //     elevation: 2,
// //     backgroundColor: "#fff",
// //     borderRadius: 10,
// //   },
// //   stockImage: {
// //     width: 90,
// //     height: 90,
// //     marginRight: 10,
// //   },
// //   stockName: {
// //     fontSize: 17,
// //     fontWeight: "600",
// //     color: "#141414",
// //     marginBottom: 10,
// //   },
// //   stockspecs: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     width: "73%",
// //   },
// //   stockdetails: {
// //     fontSize: 13,
// //     fontWeight: "600",
// //     color: "#616161",
// //     opacity: 0.5,
// //   },
// //   stocklocation: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "flex-start",
// //     marginTop: 10,
// //   },
// //   stockloacaiontext: {
// //     fontSize: 13,
// //     fontWeight: "600",
// //     color: "#616161",
// //     opacity: 0.8,
// //   },
// //   tabsContainer: {
// //     flexDirection: "row",
// //     justifyContent: "space-around",
// //     alignItems: "center",
// //     marginTop: 8,
// //   },
// //   tab: {
// //     paddingVertical: 8,
// //     paddingHorizontal: 14,
// //     borderRadius: 20,
// //   },
// //   selectedTab: {
// //     backgroundColor: Theme.themeColor,
// //   },
// //   tabText: {
// //     color: "black",
// //   },
// //   selectedTabText: {
// //     color: "white",
// //   },

// //   shadowProp: {
// //     backgroundColor: "#f2f2f2",
// //     borderRadius: 10,
// //     shadowColor: "#000",
// //     shadowOffset: {
// //       width: 0,
// //       height: 3,
// //     },
// //     shadowOpacity: 0.15,
// //     shadowRadius: 1.41,
// //     elevation: 2,
// //   },

// //   bottomBarContainer: {
// //     backgroundColor: "#ffffff",
// //     shadowColor: "#000",
// //     shadowOffset: {
// //       width: 0,
// //       height: 4,
// //     },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 4,
// //     elevation: 8,
// //   },
// //   bottomBar: {
// //     flexDirection: "row",
// //     justifyContent: "space-around",
// //     alignItems: "center",
// //     paddingVertical: 10,
// //   },
// //   iconContainer: {
// //     flex: 1,
// //     alignItems: "center",
// //   },

// //   iconText: {
// //     marginTop: 4,
// //   },
// //   icon: {
// //     marginRight: 10,
// //     marginTop: 3,
// //     marginLeft: 20,
// //   },
// //   circleImage: {
// //     width: 50,
// //     height: 50,
// //     borderRadius: 45,
// //     overflow: "hidden",
// //     marginBottom: 5,
// //     borderWidth: 0.1,
// //     borderColor: "gray",
// //   },
// //   chatIconBackground: {
// //     width: 60,
// //     height: 30,
// //     borderRadius: 22,
// //     backgroundColor: Theme.themeColor,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   modalBackground: {
// //     flex: 1,
// //     backgroundColor: "rgba(0, 0, 0, 0.5)",
// //     justifyContent: "flex-end",
// //   },
// //   modalContainer: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   modalContent: {
// //     backgroundColor: "white",
// //     padding: 20,
// //     borderRadius: 10,
// //     elevation: 5,
// //   },
// //   option: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginBottom: 15,
// //     backgroundColor: "lightgray",
// //     borderRadius: 10,
// //     width: 250,
// //     opacity: 1.5,
// //     height: 40,
// //     fontWeight: "bold",
// //   },
// //   optionText: {
// //     fontSize: 18,
// //   },
// //   closeButton: {
// //     position: "absolute",
// //     top: 1,
// //     right: 8,
// //   },
// // });

// // export default MatrimonyNotifications;
