import React from "react";
import { Image, Dimensions, Text, TouchableOpacity } from "react-native";
import { SafeArea } from "../../components/utility/safe-area.component";
import { MainContainer } from "../../styles/prelogin.styles";
import profileImage from "../../assets/images/general/user.png";
import { View } from "../../styles/common.styles";
import { ActivityIndicator, IconButton, Subheading } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import { useQuery } from "@tanstack/react-query";
import { getMyCommunities } from "../../services/community.services";
import CommunityCard from "../../components/dashboard/CommunityCard";
import { useDispatch } from "react-redux";
import { ErrorToggle } from "../../store/user";

export default function CommunityMyProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  // get width
  const { width } = Dimensions.get("window");
  const { data, isError, error, isLoading } = useQuery(
    "community-user-profile",
    getMyCommunities,
    {
      onSuccess: (data) => {
        if (data.status === 1) {
          navigation.goBack();
          return dispatch(
            ErrorToggle({
              msg: "You are not a member of any community",
              type: "error",
              toggle: true,
            })
          );
        }
      },
      onError: (err) => {
        dispatch(
          ErrorToggle({
            type: "error",
            msg: err.response.data.error,
            toggle: true,
          })
        );
      },
    }
  );

  if (isLoading) {
    return (
      <SafeArea>
        <MainContainer>
          <ActivityIndicator
            style={{
              alignSelf: "center",
              marginTop: "50%",
            }}
            color="#D4AF37"
          />
        </MainContainer>
      </SafeArea>
    );
  }

  if (data.status === 0)
    return (
      <SafeArea>
        <MainContainer>
          <View style={{ alignItems: "center", paddingVertical: 16 }}>
            <IconButton
              icon="chevron-left"
              onPress={() => navigation.goBack()}
            />
            <TopText
              style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
            >
              Your Profile
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
                fontSize: 16,
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
            >
              {data.data.userid.fname + " " + data.data.userid.lname}
            </TopText>
            <Subheading
              style={{
                fontSize: 12,
                color: "#898E92",
                lineHeight: 18,
                textTransform: "capitalize",
              }}
            >
              {data.data.userid.city + ", " + data.data.userid.state}
            </Subheading>
          </View>

          <View style={{ padding: 16, flexDirection: "column" }}>
            <TopText style={{ fontSize: 16, fontWeight: "bold" }}>
              About {data.data.userid.name}
            </TopText>
            <Subheading
              style={{ fontSize: 12, color: "#898E92", lineHeight: 18 }}
            >
              {data.data.about && data.data.about.length > 0
                ? data.data.about
                : "No description provided"}
            </Subheading>
          </View>

          <View style={{ padding: 16, flexDirection: "column" }}>
            <TopText style={{ fontSize: 16, fontWeight: "bold" }}>
              Work Done in community
            </TopText>
            <Subheading
              style={{ fontSize: 12, color: "#898E92", lineHeight: 18 }}
            >
              {data.data.workDone && data.data.workDone.length > 0
                ? data.data.workDone
                : "No work done mentioned"}
            </Subheading>
          </View>

          <View
            style={{
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Image
              source={require("../../assets/images/community/location.png")}
              style={{ width: 16, height: 16 }}
            />
            <Text style={{ paddingHorizontal: 8, fontSize: 12 }}>
              {data.data.userid.address +
                ", " +
                data.data.userid.city +
                ", " +
                data.data.userid.state +
                ", " +
                (data.data.userid.country
                  ? data.data.userid.country
                  : "India") +
                ", " +
                data.data.userid.pincode}
            </Text>
          </View>

          <View
            style={{
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Image
              source={require("../../assets/images/community/phone.png")}
              style={{ width: 16, height: 16 }}
            />
            <Text style={{ paddingHorizontal: 8, fontSize: 12 }}>
              {data.data.userid.phone}
            </Text>
          </View>

          <View
            style={{
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Image
              source={require("../../assets/images/community/email.png")}
              style={{ width: 16, height: 16 }}
            />
            <Text style={{ paddingHorizontal: 8, fontSize: 12 }}>
              {data.data.userid.email}
            </Text>
          </View>

          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: "column",
            }}
          >
            <TopText style={{ fontSize: 16, fontWeight: "bold" }}>
              My Community
            </TopText>

            <View style={{ marginTop: 16 }}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  navigation.navigate("CommunityProfile", {
                    communityId: data.data.community._id,
                  });
                }}
                // key={(data.index).toString()}
              >
                <CommunityCard
                  {...data.data.community}
                  community={data.imageUrl}
                  idx="0"
                />
              </TouchableOpacity>
            </View>
          </View>
        </MainContainer>
      </SafeArea>
    );
  else return <></>;
}
