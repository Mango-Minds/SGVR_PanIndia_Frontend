import { React, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/Ionicons";
import { RowBetween, SearchField } from "../../styles/common.styles";
import SelectDropdown from "react-native-select-dropdown";
import { IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { BASEAPIURL } from "../../infrastructure/constants";
import { BASEIMGURL } from "../../infrastructure/constants";
import { decode } from "base-64";
import ActivityIndicator from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import UserImg from "../../assets/images/general/user.png";
import Theme from "../../styles/theme";

const statusOptions = [
  {
    title: "Accepted",
    value: "accepted",
    icon: "checkmark-circle",
    color: "#7AB163",
  }, // Green color
  {
    title: "Rejected",
    value: "rejected",
    icon: "close-circle",
    color: "#ff0000",
  }, // Red color
  {
    title: "Pending",
    value: "pending",
    icon: "time-outline",
    color: "#ffa500",
  }, // Orange color
];

export default function TempleShops({ templeinfo }) {
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  // const{templeinfo} = route.params;
  console.log("Temple info in shops: ", templeinfo);
  console.log("Temple id in shops: ", templeinfo._id);
  const templeId = templeinfo._id;  

  const userType = useSelector((state) => state.user.user.userType);
  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));
  const userId = decodedPayload.id;
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const [shops, setShops] = useState([]);
  const [templeDetails, setTempleDetails] = useState(templeinfo);


  const fetchShops = async () => {
    try {
      setLoadingAnimation(true);
      const response = await fetch(`${BASEAPIURL}/templeShops`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        setShops(data);
        console.log("Shops Data: ", data);
      //   const filteredShops = data.filter(shop => shop.temple._id === templeId);
      //   console.log(" Filtered Shops Data: ", filteredShops);
      // setShops(filteredShops);
      } else {
        throw new Error("Failed to fetch shops");
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setLoadingAnimation(false);
    }
  };


 


  useEffect(() => {
    if (isFocused) {
      fetchShops();
    }
  }, [isFocused]);

  const [shopData, setShopData] = useState([]);
  const handleShopStatus = async (shopId, status) => {
    try {
      setLoadingAnimation(true);
      const response = await fetch(
        `${BASEAPIURL}/templeShops/status/${shopId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        setShops((prevShops) =>
          prevShops.map((shop) =>
            shop._id === shopId ? { ...shop, status: status } : shop
          )
        );
      } else {
        throw new Error("Failed to change shop's status");
      }
    } catch (error) {
      console.error("Error changing shop's status:", error);
    } finally {
      setLoadingAnimation(false);
    }
  };

  const confirmStatusChange = (shop, newStatus) => {
    Alert.alert(
      "Confirm Status Change",
      `Do you want to change the status from ${shop.status} to ${newStatus}?`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Status change canceled"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => handleShopStatus(shop._id, newStatus),
        },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View
        style={{
          padding: "2%",
          margin: "2%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {shops.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
            }}
          >
            <Text style={{ fontSize: 18, color: "grey" }}>No data found</Text>
          </View>
        ) : (
          shops.map((shop) => (
            <TouchableOpacity
              key={shop._id}
              onPress={() => {
                console.log("ShopId: ", shop._id);
                navigation.navigate("EachShopProfile", {
                  shop: shop,
                  shopId: shop._id,
                });
              }}
            >
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
                    marginRight: "10%",
                  }}
                  source={
                    shop.image ? { uri: `${shop.image}` } : UserImg
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
                    {shop.name}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "600",
                      opacity: 0.4,
                      marginTop: "2%",
                    }}
                  >
                    {shop.city}
                  </Text>
                </View>
                {/* {userType === "templeAdmin" && ( */}
                {userType === "templeAdmin" && templeDetails.createdBy === userId && (
                  <View
                    style={{
                      flexDirection: "column",
                      marginLeft: "5%",
                      marginTop: "2%",
                    }}
                  >
                    <Text
                      style={{
                        opacity: 0.6,
                        color: "#d966ff",
                        marginTop: "2%",
                        marginBottom: "5%",
                        fontSize: 14,
                      }}
                    >
                      Status
                    </Text>

                    <SelectDropdown
                      data={statusOptions}
                      onSelect={(selectedItem) => {
                        confirmStatusChange(shop, selectedItem.value);
                      }}
                      defaultValueByIndex={statusOptions.findIndex(
                        (status) => status.value === shop.status
                      )}
                      renderDropdownIcon={(isOpened) => (
                        <Icon
                          name={isOpened ? "chevron-up" : "chevron-down"}
                          size={16}
                          color="#000"
                        />
                      )}
                      buttonTextAfterSelection={(selectedItem) =>
                        selectedItem.title
                      }
                      rowTextForSelection={(item) => item.title}
                      buttonStyle={{
                        width: 105,
                        height: 40,
                        backgroundColor: "#E9ECEF",
                        borderRadius: 8,
                        paddingHorizontal: 4,
                        margin: 0,
                        marginBottom: 0,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      buttonTextStyle={{
                        fontSize: 14,
                        color: "#000",
                        textAlign: "center",
                        paddingHorizontal: 0,
                      }}
                      dropdownStyle={{
                        borderRadius: 8,
                        marginTop: -20,
                      }}
                      rowStyle={{
                        height: 40,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#E9ECEF",
                        paddingHorizontal: 4,
                      }}
                      rowTextStyle={{
                        fontSize: 14,
                        color: "#000",
                        textAlign: "center",
                        paddingHorizontal: 0,
                      }}
                      renderCustomizedRowChild={(item) => (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Icon
                            name={item.icon}
                            size={16}
                            color={item.color}
                            style={{ marginRight: 5 }}
                          />
                          <Text>{item.title}</Text>
                        </View>
                      )}
                      renderCustomizedButtonChild={(selectedItem) => (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Icon
                            name={
                              selectedItem ? selectedItem.icon : "time-outline"
                            }
                            size={16}
                            color={
                              selectedItem ? selectedItem.color : "#ffa500"
                            }
                            style={{ marginRight: 5 }}
                          />
                          <Text>
                            {selectedItem ? selectedItem.title : "Pending"}
                          </Text>
                        </View>
                      )}
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
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
