import React, { useState, useEffect, useRef } from "react";
import { Alert, BackHandler } from "react-native";
import { Calendar } from "react-native-calendars";
import { getImageUrl } from "../../services/socialMedia.services";
import {
  Image,
  Text,
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  PanResponder,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import Theme from "../../styles/theme";
import ParallaxScrollView from "react-native-parallax-scroll-view";
import Temp1 from "../../assets/images/Temple/temp1.jpg";
import { SafeArea } from "../../components/utility/safe-area.component";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Row } from "../../styles/dashboard.styles";
import ImageViewerScreen from "../../components/matrimony/ImageViewerScreen";
import { useQuery } from "react-query";
import { getShceduledDates } from "../../services/matrimony.services";
import CommunityMemberCard from "../../components/community/communityMemberCard";
import { useNavigation } from "@react-navigation/native";
import { getAllEventsTemple } from "../../services/Temple.Services";
import { TempleEvents } from "./TempleEvents";
import { Card, IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import moment from "moment";
import { BASEAPIURL, BASEIMGURL } from "../../infrastructure/constants";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import TempleShops from "./TempleShops";
import { decode } from "base-64";
import { useIsFocused } from "@react-navigation/native";
import GodCard from "./GodsCard";
import BottomNavigation from "./BottomNavigation";
import UserImg from "../../assets/images/general/user.png";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Linking } from "react-native";
import * as Location from "expo-location";

const TemplePanditDetails = ({ route, navigation }) => {
  const Navigation = useNavigation();
  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));
  console.log(decodedPayload);
  const userId = decodedPayload.id;
  console.log("outeruser", outeruser);
  const { user } = useSelector((state) => state.user);
  const outeruser = useSelector((state) => state.user);
  const isFocused = useIsFocused();

  console.log("temple details page usertoken: ", token);
  const userType = useSelector((state) => state.user.user.userType);
  const { panditinfo } = route.params;
  const [loadingDates, setLoadingDates] = useState(true);
  const [markedDates, setMarkedDates] = useState();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().toISOString().slice(5, 7)); // 05/02/2022
  const today = moment().format("YYYY-MM-DD");
  useEffect(() => {
    // Simulate fetching data
    const updateMarkedDates = () => {
      const today = moment();
      const nextDay = moment(today).add(1, "days");
      const dayAfterNext = moment(today).add(2, "days");

      const newMarkedDates = {
        [today.format("YYYY-MM-DD")]: { marked: true, dotColor: "#D8AE25" },
        [nextDay.format("YYYY-MM-DD")]: { marked: false, dotColor: "#D8AE25" },
        [dayAfterNext.format("YYYY-MM-DD")]: {
          marked: false,
          dotColor: "#D8AE25",
        },
      };

      setMarkedDates(newMarkedDates);
    };

    updateMarkedDates();
    setLoadingDates(false);
  }, []);
  console.log("PanditInfo in pandit page: ", panditinfo);
  const [panditDetails, setPanditDetails] = useState(panditinfo);
  console.log("PanditDetails: ", panditDetails);
  const fetchPandit = async () => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/panditcrud/${panditDetails._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch pandit");
      }
      const data = await response.json();
      console.log("pandit response data", data);
      setPanditDetails(data);
    } catch (error) {
      console.error("Error fetching pandit:", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchPandit();
    }
  }, [isFocused]);

  const associatedTemples = panditinfo.temples;
  console.log("AT: ", associatedTemples);
  const [templeDetails, setTempleDetails] = useState(panditinfo.temples);

  console.log("TempleDetails: ", templeDetails);

  const goToEvents = (date) => {
    const temple = templeDetails[0];
    console.log("Temple: ", temple);
    Navigation.navigate("TempleEvents", {
      date: date,
      templeAdmin: temple.createdBy,
      templeId: temple._id,
      templePandits: temple.pandits,
      panditId: panditDetails._id,
      onMarkedDatesUpdate: (updatedDates) => {
        setMarkedDates(updatedDates);
        setLoadingDates(false);
      },
    });
  };
  
  const [eventsByMonth, setEventsByMonth] = useState([]);

  // const fetchPanditEventDates = async (month, year) => {
  //   setLoadingDates(true); // Show loading indicator while fetching
  //   try {
  //     const response = await fetch(
  //       `${BASEAPIURL}/templeEvents/eventsByMonth?panditId=${panditDetails._id}&month=${month}&year=${year}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (response.ok) {
  //       const data = await response.json();
  //       const dates = data.dates;
  //       let updatedMarkedDates = {};

  //       dates.forEach((date) => {
  //         updatedMarkedDates[date] = {
  //           marked: true,
  //           dotColor: Theme.themeColor,
  //         };
  //       });

  //       setMarkedDates((prevDates) => ({
  //         ...prevDates,
  //         ...updatedMarkedDates,
  //       }));
  //     } else {
  //       console.error("Failed to fetch pandit events");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching pandit event dates:", error);
  //   } finally {
  //     setLoadingDates(false);
  //   }
  // };

  // Use effect to fetch pandit events for the current month on load

  // const fetchPanditEventDates = async (month, year) => {
  //   setLoadingDates(true); // Show loading indicator while fetching
  //   try {
  //     const response = await fetch(
  //       `${BASEAPIURL}/templeEvents/eventsByMonth?panditId=${panditDetails._id}&month=${month}&year=${year}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (response.ok) {
  //       const data = await response.json();
  //       const dates = data.dates;
  //       let updatedMarkedDates = {};

  //       const today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format
  //       console.log("Today's Date:", today); // Log today's date for debugging

  //       // Ensure today is included in the marked dates
  //       if (!dates.includes(today)) {
  //         updatedMarkedDates[today] = {
  //           marked: true,
  //           dotColor: Theme.themeColor,
  //           dots: [
  //             { key: "dot1", color: Theme.themeColor },
  //             { key: "dot2", color: Theme.themeColor },
  //           ], // Two dots for today
  //         };
  //       }

  //       dates.forEach((date) => {
  //         console.log("Processing date:", date); // Log each date being processed

  //         if (date !== today) { // Skip today since it's already added
  //           updatedMarkedDates[date] = {
  //             marked: true,
  //             dotColor: Theme.themeColor, // Single dot for other event dates
  //           };
  //         }
  //       });

  //       console.log("Updated marked dates:", updatedMarkedDates); // Log the updated marked dates before setting state

  //       setMarkedDates((prevDates) => ({
  //         ...prevDates,
  //         ...updatedMarkedDates,
  //       }));
  //     } else {
  //       console.error("Failed to fetch pandit events");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching pandit event dates:", error);
  //   } finally {
  //     setLoadingDates(false);
  //   }
  // };

  const fetchPanditEventDates = async (month, year) => {
    setLoadingDates(true); // Show loading indicator while fetching
    try {
      const response = await fetch(
        `${BASEAPIURL}/templeEvents/eventsByMonth?panditId=${panditDetails._id}&month=${month}&year=${year}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const dates = data.dates;
        let updatedMarkedDates = {};

        const today = new Date().toISOString().slice(0, 10);
        console.log("Today's Date:", today);

        // Ensure today is included in the marked dates with two dots
        if (!dates.includes(today)) {
          updatedMarkedDates[today] = {
            marked: true,
            dotColor: Theme.themeColor,
            dots: [
              { key: "dot1", color: Theme.themeColor },
              { key: "dot2", color: Theme.themeColor },
            ], // Two dots for today
          };
        }

        // Process event dates
        dates.forEach((date) => {
          console.log("Processing date:", date); // Log each date being processed

          if (date !== today) {
            // Skip today since it's already added
            updatedMarkedDates[date] = {
              marked: true,
              dotColor: Theme.themeColor, // Dot color for event dates
              dots: [{ key: "dot1", color: Theme.themeColor }], // Ensure at least one dot
            };
          }
        });

        console.log("Updated marked dates:", updatedMarkedDates);

        setMarkedDates((prevDates) => ({
          ...prevDates,
          ...updatedMarkedDates,
        }));
      } else {
        console.error("Failed to fetch pandit events");
      }
    } catch (error) {
      console.error("Error fetching pandit event dates:", error);
    } finally {
      setLoadingDates(false);
    }
  };

  const handleMonthChange = (data) => {
    const month = parseInt(data.dateString.slice(5, 7));
    const year = parseInt(data.year);

    fetchPanditEventDates(month, year); // Fetch pandit events
  };
  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    fetchPanditEventDates(currentMonth, currentYear);
  }, []);
  console.log("Marked dates in pandits tab: ", markedDates);

  useEffect(() => {
    fetchPanditEventDates();
  }, [month, year]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const HEADER_EXPANDED_HEIGHT = 400;
  const HEADER_COLLAPSED_HEIGHT = 60;
  const [showViewer, setShowViewer] = React.useState(false);
  let scrollY = new Animated.Value(0);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
    outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
    extrapolate: "clamp",
  });

  const renderBackground = () => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={() => setShowViewer(true)}>
        <Animated.View style={{ height: headerHeight }}>
          <Image
            source={{
              uri: `${BASEIMGURL}${
                Array.isArray(panditDetails?.owner.image)
                  ? panditDetails?.owner.image[0]
                  : panditDetails?.owner.image
              }`,
            }}
            resizeMode="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderContentBackground = (user) => {
    // Ensure panditDetails.image is an array
    const images = Array.isArray(panditDetails?.owner.image)
      ? panditDetails?.owner.image
      : panditDetails?.owner.image
      ? [panditDetails?.owner.image]
      : [];

    return (
      <View style={styles.scrollContainer}>
        <RowBetween>
          <View>
            <Text style={styles.title}>{panditDetails.panditName}</Text>
          </View>
        </RowBetween>

        <Text style={{ marginTop: 16, fontSize: 14, fontWeight: "bold" }}>
          Pandit's Gallery
        </Text>

        <Row style={{ paddingTop: 16, paddingBottom: 16 }}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {images.length > 0 ? (
              images.map((item, index) => (
                <TouchableOpacity
                  onPress={() => {
                    setCurrentIndex(index);
                    setShowViewer(true);
                  }}
                  key={index}
                >
                  <Image
                    source={{ uri: `${BASEIMGURL}${item}` }}
                    resizeMode="cover"
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      marginRight: 10,
                    }}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View>
                <Text style={{ marginLeft: 140, opacity: 0.4 }}>No Images</Text>
              </View>
            )}
          </ScrollView>
        </Row>

        <View>
          <Text style={{ marginTop: 16, fontSize: 14, fontWeight: "bold" }}>
            About Pandit
          </Text>
        </View>
        <View style={styles.contentContainer}>
          <View
            style={{
              backgroundColor: "#F7EFD5",
              padding: 8,
              borderRadius: 20,
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="map-marker" size={20} color={Theme.themeColor} />
          </View>
          <Text
            style={{
              fontSize: 14,
              color: "#656565",
              marginLeft: 12,
              marginRight: 16,
              width: "90%",
              textTransform: "capitalize",
            }}
          >
            {panditDetails.owner.city}, {panditDetails.owner.state}
          </Text>
        </View>
        <View>
          <View style={styles.contentContainer}>
            <View
              style={{
                backgroundColor: "#F7EFD5",
                padding: 8,
                borderRadius: 20,
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="email" size={20} color={Theme.themeColor} />
            </View>
            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  color: "#656565",
                  marginLeft: 12,
                  marginRight: 16,
                  width: "90%",
                }}
              >
                {panditDetails.owner.email}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contentContainer}>
            <View
              style={{
                backgroundColor: "#F7EFD5",
                padding: 8,
                borderRadius: 20,
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="phone" size={20} color={Theme.themeColor}/>
            </View>

            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  color: "#656565",
                  marginLeft: 12,
                  marginRight: 16,
                  width: "90%",
                }}
              >
                +91-{panditDetails.owner.phone}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <RowBetween style={{ paddingTop: 24 }}>
          <View
            style={{
              marginTop: 16,
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <TopText style={{ fontSize: 14, fontWeight: "bold" }}>
              Associated Temples
            </TopText>
          </View>
        </RowBetween>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryContainer}
        >
          <View style={{ flexDirection: "row" }}>
            {associatedTemples.map((temple, index) => (
              <View
                key={temple.id}
                style={{ alignItems: "center", marginRight: 18 }}
              >
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    navigation.navigate("TempleDetails", {
                      templeinfo: temple,
                      fromPandits: true,
                    })
                  }
                  style={{ position: "relative" }}
                >
                  <Image
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 8,
                      marginBottom: 4,
                    }}
                    source={
                      temple.images[0]
                        ? {
                            uri: `${BASEIMGURL}${temple.images[0]}`,
                          }
                        : UserImg
                    }
                  />

                  <Text style={{ fontWeight: "600", opacity: 0.4 }}>
                    {temple.templeName}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {associatedTemples.length === 0 &&
              associatedTemples.length === 0 && (
                <View
                  style={{
                    // flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 35,
                  }}
                >
                  <Text style={{ fontSize: 15, color: "grey" }}>
                    No Associated Temple
                  </Text>
                </View>
              )}
          </View>
        </ScrollView>

        {images.length > 0 && (
          <Modal
            visible={showViewer}
            transparent={true}
            onRequestClose={() => setShowViewer(false)}
          >
            <ImageViewerScreen
              images={images.map((item) => `${BASEIMGURL}${item}`)}
              setShowViewer={setShowViewer}
              index={currentIndex}
            />
          </Modal>
        )}

        <RowBetween style={{ paddingTop: 24 }}>
          <View
            style={{
              marginTop: 10,
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <TopText style={{ fontSize: 14, fontWeight: "bold" }}>
              Scheduled Events
            </TopText>
          </View>
        </RowBetween>
        <View>
          <View style={{ display: "flex", flexDirection: "row" }}>
            {loadingDates && (
              <Image
                style={{
                  width: 15,
                  height: 15,
                  marginTop: "5%",
                  marginLeft: "2%",
                  opacity: 0.4,
                }}
                source={{
                  uri: "https://i.gifer.com/ZZ5H.gif",
                }}
              ></Image>
            )}
          </View>
          <View style={styles.calender}>
            <Calendar
              minDate={today}
              markingType={"multi-dot"}
              style={{
                marginTop: "3%",
                borderRadius: 6,
                backgroundColor: "#F7EFD5",
                height: 380,
              }}
              theme={{
                arrowColor: "#D8AE25",
                calendarBackground: "#f7f7f7",
                todayTextColor: "#000000",
                todayBackgroundColor: "#f7f7f7",
              }}
              markedDates={markedDates}
              onMonthChange={handleMonthChange}
              onDayPress={(day) => goToEvents(day.dateString)}
            />

            {/* <Calendar
              minDate={today}
              markingType={"period"}
              style={{
                marginTop: "3%",
                borderRadius: 6,
                backgroundColor: "#F7EFD5",
                height: 380,
              }}
              theme={{
                arrowColor: "#D8AE25",
                calendarBackground: "#f7f7f7",
              }}
              // Collection of dates that have to be marked. Default = {}
              markedDates={markedDates}
              onMonthChange={async (data) => {
                setLoadingDates(true);
                const res = await getShceduledDates(
                  _id,
                  data.dateString.slice(5, 7),
                  data.year
                );
                let bufferArray = {};
                res.data.map((item) => {
                  if (item.todate === undefined) {
                    bufferArray[item.fromdate.slice(0, 10)] = {
                      marked: true,
                      dotColor: "#D8AE25",
                      textColor: "#D8AE25",
                    };
                  } else {
                    bufferArray[item.fromdate.slice(0, 10)] = {
                      marked: true,
                      dotColor: "#D8AE25",
                      textColor: "#D8AE25",
                    };
                    bufferArray[item.todate.slice(0, 10)] = {
                      marked: true,
                      dotColor: "#D8AE25",
                      textColor: "#D8AE25",
                    };
                    var temp = new Date(item.fromdate);
                    temp.setDate(temp.getDate() + 1);
                    var daysOfYear = [];
                    for (
                      var d = temp;
                      d < new Date(item.todate);
                      d.setDate(d.getDate() + 1)
                    ) {
                      let ss = new Date(d).toISOString().slice(0, 10);

                      bufferArray[ss] = {
                        marked: true,
                        dotColor: "#D8AE25",
                        textColor: "#D8AE25",
                      };
                    }
                  }
                });
                setLoadingDates(false);
                setMarkedDates(bufferArray);
              }}
              onDayPress={(day) => {
                goToEvents(day.dateString);
              }}
            /> */}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeArea style={{ position: "relative" }}>
      <RowBetween
        style={{ paddingTop: 10, zIndex: 1000, backgroundColor: "white" }}
      >
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}
          >
            Pandit Details
          </TopText>
        </View>
      </RowBetween>

      <ScrollView style={{ flex: 1 }}>
        {renderBackground()}
        {renderContentBackground()}
      </ScrollView>

      <BottomNavigation navigation={navigation} />
    </SafeArea>
  );
};

export default TemplePanditDetails;

const styles = StyleSheet.create({
  readMore: {
    color: "grey",
    marginBottom: "5%",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 15,
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

  txtData: {
    color: "#656565",
    fontSize: 18,
    width: "30%",
  },
  txtDataValue: {
    color: "#656565",
    fontSize: 18,
  },
  oneDetail: {
    marginBottom: 12,
    display: "flex",
    flexDirection: "row",
  },
  familyDetails: {
    paddingTop: "6%",
  },
  fatherFamilyData: {
    marginTop: "4%",
    paddingTop: "1%",
  },
  fatherDetails: {
    paddingTop: "1%",
  },
  famD: {
    color: Theme.themeColor,
    fontSize: 25,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    borderRadius: 16,
    padding: 16,
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "capitalize",
    color: Theme.themeColor,
  },
  content: { color: "#898E92", textTransform: "capitalize" },
  contentContainer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },
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
    marginLeft: 15,
  },
  navigateIcon: {
    marginRight: "auto",
    marginTop: 2,
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
  galleryContainer: {
    flexDirection: "row",
    paddingTop: 16,
    paddingBottom: 16,
  },
  galleryImage: {
    width: 150,
    height: 150,
    marginRight: 10,
    borderRadius: 8,
  },
  godname: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#898E92",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    marginLeft: 4,
    fontSize: 14,
    color: "gray",
  },

  //Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    // height: "40%",
  },
  modalOption: {
    padding: 10,
    width: "100%",
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  modalText: {
    fontSize: 18,
    textAlign: "left",
  },
  postIcon: {
    marginRight: 10,
    color: "red",
  },
  modalPostText: {
    fontSize: 18,
    textAlign: "left",
    color: "red",
  },
  modalSubText: {
    fontSize: 15,
    color: "gray",
    marginTop: 5,
    marginLeft: "auto",
  },
  swipeBar: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  bar: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 2.5,
  },

  //map
  mapModalOption: {
    padding: 10,
    width: "100%",
    borderRadius: 10,
    marginRight: 60,
  },
  mapContainer: {
    flex: 1,

    marginRight: 10,
  },

  map: {
    flex: 1,
    width: "100%",
    marginRight: -10,
  },

  locationText: {
    marginTop: 200,
  },
  noMapContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    padding: 10,
    width: "100%",
    left: 30,
  },
  noMapText: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
});
