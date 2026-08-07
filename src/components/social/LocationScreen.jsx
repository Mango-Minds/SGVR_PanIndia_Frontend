import React, { useState } from "react";
import { ScrollView, TouchableOpacity, Text, Image } from "react-native";
import { Divider, IconButton } from "react-native-paper";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import {
  Container,
  RowBetween,
  SearchField,
  View,
} from "../../styles/common.styles";
import { Row } from "../../styles/dashboard.styles";
import { TopText } from "../../styles/social.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Locationimage from "../../assets/images/social/location.png";
import * as Location from "expo-location";
import { useTranslation } from "react-i18next";

export default function LocationScreen({ route, navigation }) {
  // const { setLocation, location } = route.params;
  const { t } = useTranslation();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const SelectLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg(t("permission_denied"));
      return;
    }

    let { coords } = await Location.getCurrentPositionAsync();

    if (coords) {
      const { latitude, longitude } = coords;
      let response = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      for (let item of response) {
        let address = `${item.name}, ${item.street}, ${item.postalCode}, ${item.city}`;

        setLocation(address);
      }
    }
  };

  let currentlocation = "Click to get Current Location using GPS";
  if (errorMsg) {
    currentlocation = errorMsg;
  } else if (location) {
    // currentlocation = JSON.stringify(location);
    currentlocation = location;
  }

  const handleChange = (currentlocation) => {
    setText(currentlocation);
  };

  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center" }}>
          <IconButton
            icon="arrow-left"
            onPress={() => {
              navigation.goBack();
            }}
          />
          <TopText
            style={{ color: "#000000", fontSize: 22, fontWeight: "bold" }}
          >
            {t("add_location")}
          </TopText>
        </View>
      </RowBetween>
      <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
        {/* <SearchField placeholder="Add Location" onChangeText={setLocation} /> */}
        <GooglePlacesAutocomplete
          placeholder={t("search")}
          query={{
            key: "",
            language: "en", // language of the results
          }}
          onPress={(data, details = null) => console.log(data)}
          onFail={(error) => console.error(error)}
        />
        <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
          <TouchableOpacity>
            <Icon name="magnify" size={24} />
          </TouchableOpacity>
        </View>
      </Row>
      <View style={{ paddingLeft: 0, paddingRight: 100, marginTop: 15 }}>
        <TouchableOpacity
          onPress={SelectLocation}
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            height: 40,
          }}
        >
          <Image
            source={Locationimage}
            style={{ width: 50, height: 50, margin: 10 }}
          />
          <Text
            onChangeText={handleChange}
            style={{
              lineHeight: 20,
              color: "gray",
              fontSize: 13,
              fontWeight: "500",
            }}
          >
            {currentlocation}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Divider />
      </ScrollView>
    </Container>
  );
}
