import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Share,
  Linking,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Icons from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { generateEventShareUrl, generateShareMessage } from "../../utils/shareUtils";

const EventsStackNavigator = ({ route }) => {
  const navigation = useNavigation();
  const {
    imgUrl,
    images,
    eventName,
    description,
    startdate,
    starttime,
    endtime,
    enddate,
    location,
    organizer,
    organizerPhone,
    createdAt,
  } = route.params;
  const [imgUrl2, setImgUrl2] = useState();

  useEffect(() => {
    if (imgUrl === undefined && images && images.length > 0) {
      // Handle image URL if needed
      setImgUrl2(images[0]);
    }
  }, [imgUrl, images]);

  const getEventShareUrl = () => {
    return generateEventShareUrl({
      eventName,
      eventId: eventName?.replace(/\s+/g, '-').toLowerCase(),
      location,
      organizer
    });
  };

  const shareOptions = {
    title: "Namaste",
    url: getEventShareUrl(),
    message: generateShareMessage(
      "Namaste,\n" +
      "This is your Invitation for " +
      eventName +
      ",\n" +
      description +
      "\nThe Details of event are mentioned below,\n" +
      "Timing: " +
      starttime +
      " " +
      startdate.slice(0, 10) +
      " - " +
      endtime +
      " " +
      enddate.slice(0, 10) +
      " \nVenue: " +
      location +
      " \norganized by " +
      organizer +
      "\nPhone no" + " " +
      organizerPhone,
      getEventShareUrl()
    ),
    subject: "Invitation for " + eventName,
  };

  const onSharePress = async () => {
    try {
      const result = await Share.share(shareOptions);
      if (result.action === Share.sharedAction) {
        console.log("Content shared successfully");
      }
    } catch (error) {
      console.error("Error sharing content:", error);
      // You can show an alert or toast message here
    }
  };
  return (
    <SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={34} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>Events</Text>
        <TouchableOpacity onPress={onSharePress}>
          <Icons name="share-outline" size={24} color="#b98c13" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 10 }}>
          <View style={styles.nameNdate}>
            <Text style={styles.eventName}>{eventName}</Text>
          </View>
          <Text style={styles.date}>Posted On : {createdAt.slice(0, 10)}</Text>
          <View style={{ padding: 10 }}>
            {imgUrl === undefined ? (
              <Image
                style={{ width: "100%", height: 240, borderRadius: 8 }}
                source={{ uri: imgUrl2 }}
              ></Image>
            ) : (
              <Image
                style={{ width: "100%", height: 240, borderRadius: 8 }}
                source={{ uri: imgUrl[0] }}
              ></Image>
            )}
            <View style={{ padding: 4, marginTop: "5%" }}>
              <Text
                style={{ color: "#b98c13", fontSize: 18, fontWeight: "500" }}
              >
                About Event:
              </Text>
              <Text style={{ color: "#161616", paddingTop: "1%" }}>
                {description}
              </Text>
            </View>
            <ScrollView>
              <View
                style={{
                  marginTop: "5%",
                  borderBottomColor: "#E7E7E7",
                  borderBottomWidth: 2,
                  paddingBottom: 15,
                }}
              >
                <View
                  style={{
                    marginTop: "5%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Icon name="calendar-star" size={25} color="#D4AF37" />
                  <Text style={{ padding: 4 }}>
                    {startdate.slice(0, 10) + " - " + enddate.slice(0, 10)}
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: "5%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Icon name="clock-time-nine" size={25} color="#D4AF37" />
                  <Text style={{ padding: 4 }}>
                    {starttime + " - " + endtime} (IST)
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: "5%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Icons name="location" size={25} color="#D4AF37" />
                  <Text style={{ padding: 4 }}>{location}</Text>
                </View>
              </View>
              <View style={{ paddingTop: 15, paddingBottom: 15 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "500",
                    color: "#b98c13",
                    paddingBottom: 5,
                    letterSpacing: 0.3,
                  }}
                >
                  Organizer Details
                </Text>
                <View
                  style={{
                    marginTop: "5%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Icons name="person" size={18} color="#D4AF37" />
                  <Text style={{ paddingLeft: 5, paddingTop: 0, fontSize: 16 }}>
                    {organizer}
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: "5%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Icon name="phone" size={18} color="#D4AF37" />
                  <Text
                    style={{ paddingLeft: 5, paddingTop: 0, fontSize: 16 }}
                    onPress={() => Linking.openURL(`tel:${organizerPhone}`)}
                  >
                    +91-{organizerPhone}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventsStackNavigator;

const styles = StyleSheet.create({
  date: {
    fontWeight: "600",
    opacity: 0.6,
    paddingTop: "2%",
    fontSize: 10,
    textAlign: "right",
    marginRight: 10,
  },
  eventName: {
    width: "85%",
    fontSize: 20,
    fontWeight: "700",
    marginRight: "0%",
    color: "#B98C13",
    letterSpacing: 0,
  },
  nameNdate: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    padding: 8,
    paddingLeft: 12,
  },
  headerTxt: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#b98c13",
    paddingTop: 3,
    paddingLeft: 5,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
