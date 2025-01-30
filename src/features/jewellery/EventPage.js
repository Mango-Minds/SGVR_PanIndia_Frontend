import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import Profile from "../../assets/images/B2b/profile.png";
import { TopText } from "../../styles/social.styles";

import { Container, RowBetween, SearchField } from "../../styles/common.styles";
const EventPage = ({ navigation }) => {
  const eventData = {
    title: "Exclusive Jewelry Showcase",
    timing: "Saturday, May 5th, 2024 | 10:00 AM - 6:00 PM",
    description:
      "Join us for an exclusive showcase of the latest jewelry designs. Discover breathtaking collections curated just for you.",
    venue: "Diamond Plaza",
    address: "123 Jewelry Street, Diamond District, Bangalore",
    organizer: "Gemstone Jewelers",
    contact: "+1234567890",
    website: "www.gemstonejewelers.com",
    email: "info@gemstonejewelers.com",
  };

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
              Events
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
            />
            <TouchableOpacity onPress={() => navigation.navigate("MyProfile")}>
              <Image
                source={Profile}
                style={{ width: 35, height: 35, marginRight: 10 }}
              />
            </TouchableOpacity>

            <IconButton
              icon="bell-outline"
              style={{ marginLeft: "auto" }}
            ></IconButton>
          </View>
        </RowBetween>
      </View>

      {/* Event Details */}
      <View style={styles.eventContainer}>
        <Image
          source={{
            uri:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFIhtLC0lMI_5N2C53p2KZKou2qbM9VFkRf63ZiKqTcTy1RsQKnHq6p53NeADBqa9ZnS0&usqp=CAU",
          }}
          style={styles.eventImage}
        />
        <Text style={styles.title}>{eventData.title}</Text>
        <Text style={styles.timing}>{eventData.timing}</Text>
        <Text style={styles.description}>{eventData.description}</Text>
        
        <View style={styles.venueContainer}>
          <Text style={styles.venue}>{eventData.venue}</Text>
          <Text style={styles.address}>{eventData.address}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Icon name="people-outline" size={24} color="#D4AF37" />
          <Text style={styles.organizer}>
            Organizer: {eventData.organizer}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <Icon name="call-outline" size={24} color="#D4AF37" />
          <Text style={styles.contact}>Contact: {eventData.contact}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Icon name="globe-outline" size={24} color="#D4AF37" />
          <Text style={styles.website}>Website: {eventData.website}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Icon name="mail-outline" size={24} color="#D4AF37" />
          <Text style={styles.email}>Email: {eventData.email}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  eventContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  eventImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  timing: {
    fontSize: 16,
    color: "grey",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  venueContainer: {
    backgroundColor: "#F7DCA3",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    alignItems: "center",
  },
  venue: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
    textAlign: "center",
  },
  address: {
    textAlign: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding:5
  },
  organizer: {
    fontSize: 16,
    marginLeft: 10,
  },
  contact: {
    fontSize: 16,
    marginLeft: 10,
  },
  website: {
    fontSize: 16,
    marginLeft: 10,
  },
  email: {
    fontSize: 16,
    marginLeft: 10,
  },
});

export default EventPage;
