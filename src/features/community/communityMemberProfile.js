import React from "react";
import { Image, Dimensions, Text } from "react-native";
import { SafeArea } from "../../components/utility/safe-area.component";
import { MainContainer } from "../../styles/prelogin.styles";
import profileImage from "../../assets/images/general/user.png";
import { View } from "../../styles/common.styles";
import { IconButton, Subheading } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import { useDispatch } from "react-redux";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function CommunityMemberProfile({ route }) {
  const dispatch = useDispatch();
  // get width
  const { width } = Dimensions.get("window");
  const {
    fname,
    navigation,
    midname,
    lname,
    username,
    city,
    state,
    about,
    workdone,
    position,
    phone,
    email,
    dob,
    address,
    createdAt,
    pincode,
  } = route.params;

  // if (isLoading) {
  //   return (
  //     <SafeArea>
  //       <MainContainer>
  //         <ActivityIndicator
  //           style={{
  //             alignSelf: "center",
  //             marginTop: "50%",
  //           }}
  //           color="#D4AF37"
  //         />
  //       </MainContainer>
  //     </SafeArea>
  //   );
  // }

  return (
    <SafeArea>
      <MainContainer>
        <View style={{ alignItems: "center", paddingVertical: 16 }}>
          <IconButton icon="chevron-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{
              color: "#D4AF37",
              fontSize: 20,
              fontWeight: "bold",
              textTransform: "capitalize",
              letterSpacing: 0.5,
            }}
          >
            {position}
          </TopText>
        </View>
        <View
          style={{
            alignItems: "center",
            width: "95%",
            justifyContent: "center",
            backgroundColor: "#D4AF371A",
            padding: 16,
            marginLeft: "2.5%",
            borderRadius: 8,
          }}
        >
          <Image
            source={profileImage}
            resizeMode="contain"
            style={{ width: width * 0.9, height: 200 }}
          />
        </View>
        <View style={{ padding: 16, flexDirection: "column" }}>
          <TopText
            style={{
              fontSize: 20,
              fontWeight: "bold",
              textTransform: "capitalize",
              color: "#454F63",
              letterSpacing: 0.5,
            }}
          >
            {fname} {midname} {lname}
          </TopText>
          <Subheading
            style={{
              fontSize: 15,
              color: "#898E92",
              fontWeight: "600",
              lineHeight: 22,
              textTransform: "capitalize",
            }}
          >
            {username}
          </Subheading>
          {/* <Subheading
              style={{
                fontSize: 13,
                color: "#898E92",
                fontWeight : "500",
                lineHeight: 22,
                textTransform: "capitalize",
              }}
            >
             {city}
                         </Subheading> */}
        </View>
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Ionicons name="home" size={22} color="#D4AF37" />
          <Text
            style={{
              paddingHorizontal: 8,
              fontSize: 12,
              textTransform: "capitalize",
              lineHeight: 18,
              color: "#898E92",
              fontWeight: "500",
            }}
          >
            {address +
              "," +
              city +
              ", " +
              state +
              "," +
              "India" +
              "," +
              pincode}
          </Text>
        </View>

        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Ionicons name="call" size={22} color="#D4AF37" />
          <Text
            style={{
              paddingHorizontal: 8,
              fontSize: 13,
              color: "#898E92",
              fontWeight: "500",
            }}
          >
            {phone}
          </Text>
        </View>

        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Ionicons name="mail" size={22} color="#D4AF37" />
          <Text
            style={{
              paddingHorizontal: 8,
              fontSize: 13,
              color: "#898E92",
              fontWeight: "500",
            }}
          >
            {email}
          </Text>
        </View>
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <FontAwesome name="birthday-cake" size={22} color="#D4AF37" />
          <Text
            style={{
              paddingHorizontal: 8,
              fontSize: 13,
              color: "#898E92",
              fontWeight: "500",
            }}
          >
            {dob}
          </Text>
        </View>
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <MaterialCommunityIcons
            name="chart-timeline-variant"
            size={22}
            color="#D4AF37"
          />
          <Text
            style={{
              paddingHorizontal: 8,
              fontSize: 13,
              color: "#898E92",
              fontWeight: "500",
            }}
          >
            {createdAt.slice(0, 10)}
          </Text>
        </View>

        <View style={{ padding: 16, flexDirection: "column" }}>
          <TopText
            style={{
              fontSize: 16,
              fontWeight: "bold",
              textTransform: "capitalize",
              color: "#161616",
            }}
          >
            About {fname}
          </TopText>
          <Subheading
            style={{ fontSize: 12, color: "#898E92", lineHeight: 18 }}
          >
            {about ? about : "No description provided"}
          </Subheading>
        </View>

        <View style={{ padding: 16, flexDirection: "column" }}>
          <TopText
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#161616",
              textTransform: "capitalize",
            }}
          >
            Work done in community
          </TopText>
          <Subheading
            style={{ fontSize: 12, color: "#898E92", lineHeight: 18 }}
          >
            {workdone ? workdone : "No work done mentioned"}
          </Subheading>
        </View>
      </MainContainer>
    </SafeArea>
  );
}
