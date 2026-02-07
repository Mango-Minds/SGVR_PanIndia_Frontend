import React, { useEffect, useState } from "react";
import {
  Image,
  Text,
  View,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  Dimensions,
  Linking,
  ActivityIndicator,
  ScrollView} from "react-native";
import { ScrollView as GestureScrollView } from "react-native-gesture-handler";
// import { SafeArea } from "../../components/utility/safe-area.component";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Row } from "../../styles/dashboard.styles";
import ImageViewerScreen from "../../components/matrimony/ImageViewerScreen";
import { useQuery } from "@tanstack/react-query";
import CommunityMemberCard from "../../components/community/communityMemberCard";
import {
  viewCommunityById,
  viewMembers,
} from "../../services/community.services";
import { useSelector, useDispatch } from "react-redux";
import { ErrorToggle } from "../../store/user";

export default function CommunityProfileScreen({ route, navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [images, setImages] = useState([]);
  const [modelImages, setModelImages] = useState([]);
  const iscommittee = React.useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMember, setIsMember] = useState("new");

  const setModalImagesFunc = (images) => {
    let arr = [];
    for (let i = 0; i < images.length; i++) {
      const value = images[i];
      arr.push({
        url: value,
        props: {
          style: { width: "100%", height: "100%" },
        },
      });
    }
    Promise.resolve(setModelImages(arr));
  };

  const HEADER_EXPANDED_HEIGHT = 200;
  const HEADER_COLLAPSED_HEIGHT = 100;
  const [showViewer, setShowViewer] = React.useState(false);
  let scrollY = new Animated.Value(0);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
    outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
    extrapolate: "clamp",
  });

  const { communityId } = route.params;
  const id = communityId;
  const { data, isError, error, isLoading } = useQuery({
    queryKey: ["community-profile"],
    queryFn: () => viewCommunityById(id),
    onSuccess: (data) => {
      setImages(data.imageUrl);
      setModalImagesFunc(data.imageUrl);
    },
    onError: (err) => {
      dispatch(
        ErrorToggle({
          msg: err.response.data.message,

          type: "error",
          toggle: true,
        })
      );
    },
  });

  const members = useQuery({
    queryKey: ["community-members"],
    queryFn: () => viewMembers(id),
    onSuccess: (data) => {
      console.log(data);
      if (data.data && data.data.length > 0)
        for (let i = 0; i < data.data.length; i++) {
          const element = data.data[i];
          if (
            element.userid &&
            element.userid._id === user._id &&
            element.status === "accepted"
          ) {
            setIsMember("accepted");
            break;
          } else if (
            element.userid &&
            element.userid._id === user._id &&
            element.status === "pending"
          ) {
            setIsMember("pending");
            break;
          } else {
            setIsMember("new");
          }
        }
    },
    onError: (err) => {
      dispatch(
        ErrorToggle({
          msg: err.response.data.message,
          toggle: true,
          type: "error",
        })
      );
    },
  });

  if (isLoading || members.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#b98c13" />
      </View>
    );
  }

  // useEffect(() => {
  //   setModalImages();
  // }, [images]);

  const renderBackground = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          setShowViewer(true);
        }}
      >
        <Animated.View
          style={{
            height: headerHeight,
            padding: 16,
            backgroundColor: "#FFF",
            zIndex: 1,
          }}
        >
          <Image
            source={
              images[0]
                ? {
                    uri: images[0],
                  }
                : require("../../assets/images/general/community.png")
            }
            resizeMode="cover"
            style={{ width: "100%", height: "100%", borderRadius: 4 }}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderContentBackground = (user) => {
    return (
      <View style={styles.scrollContainer}>
        <View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginTop: 16,
              textTransform: "capitalize",
            }}
          >
            {data.data?.name}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#898E92",
              marginTop: 5,
              textTransform: "capitalize",
            }}
          >
            {data.data?.state + ", " + data.data?.city}
          </Text>
        </View>

        {images && images.length > 0 && (
          <>
            <Text style={{ marginTop: 16, fontSize: 14, fontWeight: "bold" }}>
              Community Gallery
            </Text>
            <Row style={{ paddingTop: 16, paddingBottom: 16 }}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              >
                {images.map((item, i) => (
                  <TouchableOpacity
                    onPress={() => {
                      setShowViewer(true);
                      setCurrentIndex(i);
                    }}
                    key={i}
                  >
                    <Image
                      source={{
                        uri: item,
                      }}
                      resizeMode="cover"
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        marginRight: 10,
                      }}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Row>
          </>
        )}

        <View
          style={{
            marginTop: 18,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            Description
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#898E92",
              marginTop: 4,
            }}
          >
            {data.data?.description}
          </Text>
        </View>

        <View
          style={{
            marginTop: 18,
            // height: "40%",
            maxHeight: "60%",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            Upcoming Events
          </Text>
          {data.event?.length > 0 ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {data.event.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() =>
                    navigation.navigate("Event", {
                      navigation: navigation,
                      images: item.images,
                      eventName: item.eventName,
                      description: item.description,
                      startdate: item.startdate,
                      starttime: item.starttime,
                      endtime: item.endtime,
                      enddate: item.enddate,
                      location: item.location,
                      organizer: item.organizer,
                      organizerPhone: item.organizerPhone,
                      createdAt: item.createdAt,
                    })
                  }
                >
                  <CommunityMemberCard
                    name={item.eventName}
                    title={item.location}
                    image={item.images[0]}
                    resizeMode="contain"
                    imgStyle={{
                      borderRadius: 0,
                      width: 20,
                      height: 20,
                    }}
                    imgContainerStyle={{
                      width: "auto",
                      backgroundColor: "#FFF",
                    }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View>
              <Text
                style={{
                  fontSize: 15,
                  color: "#898E92",
                  marginTop: 20,
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                There are no upcoming events.
              </Text>
            </View>
          )}
        </View>
        <View style={styles.contentContainer}>
          <View
            style={{
              backgroundColor: "#F7EFD5",
              padding: 8,
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="map-marker" size={20} color="#D4AF37" />
          </View>
          <Text
            style={{
              fontSize: 14,
              color: "#656565",
              marginLeft: 12,
              marginRight: 16,
              width: "90%",
            }}
          >
            {`${data.data.address}, ${data.data.city}, ${data.data.state}, ${data.data.pincode}`}
          </Text>
        </View>
        <View style={styles.contentContainer}>
          <View
            style={{
              backgroundColor: "#F7EFD5",
              padding: 8,
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="phone" size={20} color="#D4AF37" />
          </View>
          <Text
            style={{
              fontSize: 14,
              color: "#656565",
              marginLeft: 12,
              marginRight: 16,
              width: "90%",
            }}
            onPress={() => Linking.openURL(`tel:${data.data.phone}`)}
          >
            {data.data.phone}
          </Text>
        </View>
        <View style={styles.contentContainer}>
          <View
            style={{
              backgroundColor: "#F7EFD5",
              padding: 8,
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="mail" size={20} color="#D4AF37" />
          </View>
          <Text
            style={{
              fontSize: 14,
              color: "#656565",
              marginLeft: 12,
              marginRight: 16,
              width: "90%",
            }}
            onPress={() => Linking.openURL("mailto:" + data.data.email)}
          >
            {data.data.email}
          </Text>
        </View>

        <Text style={{ marginTop: 20, fontSize: 14, fontWeight: "bold" }}>
          Committee Members
        </Text>
        {/* <Row style={{ flexWrap: "wrap" }}>
          {user?.hobbies?.map((hobby, i) => (
            <InterestPill key={i}>{hobby}</InterestPill>
          ))}
        </Row> */}

        <View>
          {members.data.data &&
            members.data.data.length > 0 &&
            members.data.data.map((item, i) => {
              if (
                item.status === "accepted" &&
                item.position !== "member" &&
                item.userid !== null
              ) {
                if (!iscommittee.current) iscommittee.current = false;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() =>
                      navigation.navigate("CommunityMemberProfileScreen", {
                        navigation: navigation,
                        fname: item.userid?.fname,
                        midname: item.userid?.midname,
                        lname: item.userid?.lname,
                        username: item.userid?.username,
                        city: item.userid?.city,
                        state: item.userid?.state,
                        about: item.about,
                        workdone: item.workDone,
                        position: item.position,
                        phone: item.userid?.phone,
                        email: item.userid?.email,
                        dob: item.userid?.dob,
                        address: item.userid?.address,
                        country: item.userid?.country,
                        pincode: item.userid?.pincode,
                        createdAt: item.createdAt,
                      })
                    }
                  >
                    <CommunityMemberCard
                      name={item.userid?.fname + " " + item.userid?.lname}
                      title={item.position}
                      imgStyle={{
                        borderRadius: 0,
                        width: 20,
                        height: 20,
                      }}
                      imgContainerStyle={{
                        width: "auto",
                        backgroundColor: "white",
                      }}
                    />
                  </TouchableOpacity>
                );
              }
            })}

          {isMember && iscommittee.current && (
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  marginTop: 16,
                  // textDecoration: "underline",
                  textAlign: "center",
                  color: "#D4AF37",
                }}
                onPress={() => {
                  navigation.navigate("CommunityMembers", {
                    id: data.data._id,
                  });
                }}
              >
                View All Members
              </Text>
            </View>
          )}

          {members.data.data.length === 0 || !iscommittee.current ? (
            <Text
              style={{
                color: "#C4C4C4",
                marginTop: 20,
                fontSize: 16,
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              No Members In Community
            </Text>
          ) : null}
          {isMember && !iscommittee.current && (
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  marginTop: 16,
                  // textDecoration: "underline",
                  textAlign: "center",
                  color: "#D4AF37",
                }}
                onPress={() => {
                  navigation.navigate("CommunityMembers", {
                    id: data.data._id,
                  });
                }}
              >
                View All Community Members
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeArea>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={34} color="#000" />
        </TouchableOpacity>
      </View>

      <Modal visible={showViewer} transparent={false}>
        <ImageViewerScreen
          images={modelImages}
          index={currentIndex}
          setShowViewer={setShowViewer}
        />
      </Modal>

      <ScrollView
        renderBackground={renderBackground}
        renderContentBackground={() => renderContentBackground(data)}
        parallaxHeaderHeight={200}
        // renderForeground={() => (
        //   <TouchableOpacity
        //     activeOpacity={1}
        //     onPress={() => setShowViewer(true)}
        //     style={{ height: "100%" }}
        //   ></TouchableOpacity>
        // )}
      />
      {isMember === "new" ? (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.bottomButtonStyle,
            { backgroundColor: isMember === "new" ? "#D4AF37" : "#438C25" },
          ]}
          onPress={() => {
            navigation.navigate("Register", {
              communityId: communityId,
            });
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, textAlign: "center" }}>
            Be a member of this community
          </Text>
        </TouchableOpacity>
      ) : isMember === "pending" ? (
        <TouchableOpacity
          activeOpacity={0.2}
          style={[
            styles.bottomButtonStyle,
            { backgroundColor: isMember === "new" ? "#D4AF37" : "#438C25" },
          ]}
        >
          <Text style={{ color: "white", fontSize: 16, textAlign: "center" }}>
            Approval Pending
          </Text>
        </TouchableOpacity>
      ) : null}
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    // flex:1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 50,
    height: "60%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  content: { color: "#898E92" },
  contentContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  bottomButtonStyle: {
    marginTop: 28,
    textAlign: "center",
    padding: 12,
    paddingTop: "4%",
    borderTopRightRadius: 4,
    borderTopLeftRadius: 4,
    position: "absolute",
    height: 60,
    bottom: 0,
    width: "100%",
  },
});
