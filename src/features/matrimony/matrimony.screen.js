import React, { useState } from "react";
import {
  Container,
  RowBetween,
  View,
  SearchField,
  MatrimonySearch,
} from "../../styles/common.styles";
import {
  View as NativeView,
  ActivityIndicator,
  ImageBackground,
  FlatList,
  Text,
  Pressable,
  RefreshControl,
  Dimensions,
} from "react-native";
import { TopText } from "../../styles/social.styles";
import { Card, IconButton } from "react-native-paper";
import { Row, BannerContainer } from "../../styles/dashboard.styles";
import { TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import CustomCarousel from "../../components/dashboard/CustomCarousel";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  MatrimonyHomeCard,
  MatrimonyHomeCardSubTitle,
  MatrimonyHomeCardTitle,
  MatrimonyHomeSwitch,
} from "../../styles/matrimony.styles";
import MatrimonyVendorsScreen from "./matrimonyVendors";
import { useQuery, useQueryClient } from "react-query";
import { getAllMatrimonyProfiles } from "../../services/matrimony.services";
import styles from "react-native-parallax-scroll-view/src/styles";
import { getImageUrl } from "../../services/socialMedia.services";
import { LinearGradient } from "expo-linear-gradient";
import { loadmatrimonyprofileImages, ErrorToggle } from "../../store/user";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BASEAPIURL } from "../../infrastructure/constants";
import authHeader from "../../services/auth.header";

const windowWidth = Dimensions.get("window").width;
// import MatrimonyVendorsScreen from './matrimonyVendors';
import {
  likeHandler,
  getCurrentUserMatrimonyprofile,
} from "../../services/matrimony.services";
import { setLikedBy } from "../../store/user";

const MatrimonyScreen = ({ navigation }) => {
  const [rerender, SetRerender] = useState(0);
  const [refetch, setRefetch] = React.useState(0);
  const [adsData, setAdsData] = useState([]);
  const [adsImages, setAdsImages] = useState([]);
  const { user } = useSelector((state) => state.user);
  // let user_id = JSON. parse(user);

  const images = useSelector((state) => state.user.matrimonyprofileImages.male);
  const imagesFemale = useSelector(
    (state) => state.user.matrimonyprofileImages.female
  );

  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [matrimonySection, setMatrimonySection] = React.useState("male");
  const likedBy = useSelector((state) => state.user.likedBy);
  // const [likedBy,setLikedBy] = useState()

  const { dataBuffer } = useQuery(
    ["matrimony-one-user"],
    () => getCurrentUserMatrimonyprofile(),
    {
      onSuccess: async (data) => {
        dispatch(setLikedBy(data.data.likes));
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

  const { data, isError, error, isLoading } = useQuery(
    ["matrimony-all-profiles", matrimonySection],
    () => getAllMatrimonyProfiles(matrimonySection),
    {
      onSuccess: async (data) => {
        if (matrimonySection === "female") {
          if (imagesFemale.length === 0) {
            let matrimonyImage = [];
            for await (let item of data.data) {
              const res = await getImageUrl(item.photos[0]);
              matrimonyImage.push(res);
            }
            dispatch(
              loadmatrimonyprofileImages([matrimonyImage, matrimonySection])
            );
          }
        } else {
          if (images.length === 0) {
            let matrimonyImage = [];
            for await (let item of data.data) {
              const res = await getImageUrl(item.photos[0]);
              matrimonyImage.push(res);
            }
            dispatch(
              loadmatrimonyprofileImages([matrimonyImage, matrimonySection])
            );
          }
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
  const likeHandlerHelper = async (_id) => {
    // navigation.navigate('Home',{navigation})
    setLikedBy([...likedBy, _id]);
    const res = await likeHandler(_id);
    // SetRerender(rerender + 1)
    await queryClient.invalidateQueries("matrimony-one-user");
  };

  React.useEffect(() => {
    // if (subscribe) {
    const getDashboardData = async () => {
      axios
        .get(BASEAPIURL + "/ad/ads-for-user", { headers: await authHeader() })
        .then(async (res) => {
          if (res.data.status === 0) {
         const foundAds = [...res.data.ads];

            setAdsData(foundAds);
            setAdsImages(res.data.imageUrl);

            // await Promise.resolve();
          } else if (res.data.status === 1) {
          }
        })
        .catch((err) => {
          dispatch(
            ErrorToggle({
              msg: err.message,
              toggle: true,
              type: "error",
            })
          );
        });
    };
    getDashboardData();

    // }

    // return () => {
    //   setSubscribe(false);
    // };
  }, []);

  const renderItem = ({ item, index }) => {
    try {
      return (
        <Pressable
          style={{
            marginLeft: "5.5%",
            marginTop: "3%",
            width: "100%",
            height : "35%",
          }}
          onPress={() => {
            item.link && item.link !== "" ? Linking.openURL(item.link) : null;
          }}
        >
          <BannerContainer
            key={index}
            source={{ uri: adsImages[index] }}
            resizeMode="cover"
          />
        </Pressable>
      );
    } catch (error) {
      dispatch(
        ErrorToggle({
          msg: error.message,
          toggle: true,
          type: "error",
        })
      );
    }
  };

  return (
    <Container style={{ backgroundColor: "#FAFAFA", paddingBottom: 0 }}>
      <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
        <View style={{ alignItems: "center" }}>
          <IconButton
            icon="arrow-left"
            size={28}
            onPress={() => navigation.goBack()}
          />
          <TopText style={{ color: "#000000", fontWeight: "bold" }}>
            Matrimony
          </TopText>
        </View>
      </RowBetween>

      {/* <Row > */}
      <TouchableOpacity
        style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}
        onPress={() =>
          navigation.navigate("MatrimonySearchScreen", { matrimonySection })
        }
      >
        <MatrimonySearch placeholder="Search" editable={false} />
        <View
          style={{ position: "absolute", left: "5%", elevation: 3, top: "35%" }}
        >
          <Text
            style={{
              opacity: 0.5,
              fontWeight: "500",
            }}
          >
            Search By Name...
          </Text>
        </View>
        <View
          style={{
            position: "absolute",
            right: "5%",
            elevation: 3,
            top: "30%",
          }}
        >
          <Icon name="magnify" size={24} />
        </View>
      </TouchableOpacity>

      {adsData && adsData.length > 0 && (
       <CustomCarousel
          data={adsData}
          renderItem={renderItem}
          itemWidth={windowWidth * 0.9}
         />
       )}
      {/* </View> */}
      {/* </Row> */}
      <NativeView
        style={{
          flexDirection: "row",
          marginTop: "5%",
          marginBottom: "3%",
          marginLeft: 16,
          marginRight: 16,
        }}
      >
        <MatrimonyHomeSwitch
          uppercase={false}
          color={matrimonySection === "male" ? "#D4AF37" : "#D4D4D4"}
          labelStyle={{
            color: matrimonySection === "male" ? "#fff" : "#D4D4D4",
            letterSpacing: 0,
          }}
          style={{
            backgroundColor: matrimonySection === "male" ? "#D4AF37" : "#fff",
            borderColor: matrimonySection === "male" ? "#D4AF37" : "#D4D4D4",
          }}
          onPress={() => setMatrimonySection("male")}
        >
          Groom
        </MatrimonyHomeSwitch>
        <MatrimonyHomeSwitch
          uppercase={false}
          color={matrimonySection === "female" ? "#D4AF37" : "#D4D4D4"}
          labelStyle={{
            color: matrimonySection === "female" ? "#fff" : "#D4D4D4",
            letterSpacing: 0,
          }}
          style={{
            backgroundColor: matrimonySection === "female" ? "#D4AF37" : "#fff",
            borderColor: matrimonySection === "female" ? "#D4AF37" : "#D4D4D4",
          }}
          onPress={() => setMatrimonySection("female")}
        >
          Bride
        </MatrimonyHomeSwitch>
        <MatrimonyHomeSwitch
          color={matrimonySection === "vendor" ? "#D4AF37" : "#D4D4D4"}
          uppercase={false}
          labelStyle={{
            color: matrimonySection === "vendor" ? "#fff" : "#D4D4D4",
            letterSpacing: 0,
          }}
          style={{
            backgroundColor: matrimonySection === "vendor" ? "#D4AF37" : "#fff",
            borderColor: matrimonySection === "vendor" ? "#D4AF37" : "#D4D4D4",
          }}
          onPress={() => setMatrimonySection("vendor")}
        >
          Vendors
        </MatrimonyHomeSwitch>
      </NativeView>
      {matrimonySection === "vendor" ? (
        <>
          <MatrimonyVendorsScreen navigation={navigation} />
        </>
      ) : isLoading ? (
        <ActivityIndicator
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "54%",
          }}
          size={"large"}
          color={"#b98c13"}
        />
      ) : matrimonySection === "male" ? (
        images &&
        images.length > 0 && (
          <FlatList
            style={{
              marginTop: 5,
              marginLeft: 16,
              marginRight: 16,
              height : "100%",
             }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            data={data.data}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={async () => {
                  await queryClient.invalidateQueries("matrimony-all-profiles");
                }}
              />
            }
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("MatrimonyViewUser", {
                      userId: item._id,
                    })
                  }
                  key={index}
                 >
                  <MatrimonyHomeCard>
                    {/* {images.length > 0 &&
                  images.map((item1, i) => {
                    return ( */}

                    <ImageBackground
                      source={{ uri: images[index].url }}
                      resizeMode="cover"
                      imageStyle={{
                        borderRadius: 16,
                        }}
                      style={{
                        height: 400,
                      }}
                    >
                      <LinearGradient
                        colors={["#00000000", "#444242"]}
                        style={{
                          height: "100%",
                          width: "100%",
                          borderBottomLeftRadius: 16,
                          borderBottomRightRadius: 16,
                        }}
                      ></LinearGradient>
                    </ImageBackground>
                    {/* ) */}
                    {/* })} */}
                    <Card.Content
                      style={{
                        position: "absolute",
                        bottom: 10,
                        borderRadius: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <NativeView>
                        <MatrimonyHomeCardTitle>
                          {item.fname + " " + item.lname}, {item.age}
                        </MatrimonyHomeCardTitle>
                        <MatrimonyHomeCardSubTitle>
                          {item.job}
                        </MatrimonyHomeCardSubTitle>
                      </NativeView>
                      <TouchableOpacity>
                        {likedBy.includes(item._id) ? (
                          <Pressable>
                            <Icon name="thumb-up" size={30} color="white" />
                          </Pressable>
                        ) : (
                          <Pressable
                            onPress={() => likeHandlerHelper(item._id)}
                          >
                            <Icon
                              name="thumb-up-outline"
                              size={30}
                              color="white"
                            />
                          </Pressable>
                        )}
                      </TouchableOpacity>
                    </Card.Content>
                  </MatrimonyHomeCard>
                </TouchableOpacity>
              );
            }}
          />
        )
      ) : (
        imagesFemale &&
        imagesFemale.length > 0 && (
          <FlatList
            style={{
              marginTop: 5,
              marginLeft: 16,
              marginRight: 16,
              height : "100%",
            }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            data={data.data}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={async () => {
                  await queryClient.invalidateQueries("matrimony-all-profiles");
                }}
              />
            }
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("MatrimonyViewUser", {
                      userId: item._id,
                    })
                  }
                  key={index}
                >
                  <MatrimonyHomeCard>
                    {/* {images.length > 0 &&
                images.map((item1, i) => {
                  return ( */}

                    <ImageBackground
                      source={{ uri: imagesFemale[index].url }}
                      resizeMode="cover"
                      key={index}
                      imageStyle={{
                        borderRadius: 16,
                        // borderTopLeftRadius: 16,
                        // borderBottomLeftRadius: 16,
                        // borderTopRightRadius: 16,
                        // borderBottomRightRadius: 16,
                      }}
                      style={{
                        height: 400,
                      }}
                    >
                      <LinearGradient
                        colors={["#00000000", "#444242"]}
                        style={{
                          height: "100%",
                          width: "100%",
                          borderBottomLeftRadius: 16,
                          borderBottomRightRadius: 16,
                        }}
                      ></LinearGradient>
                    </ImageBackground>
                    {/* ) */}
                    {/* })} */}
                    <Card.Content
                      style={{
                        position: "absolute",
                        bottom: 10,
                        borderRadius: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <NativeView>
                        <MatrimonyHomeCardTitle>
                          {item.fname + " " + item.lname}, {item.age}
                        </MatrimonyHomeCardTitle>
                        <MatrimonyHomeCardSubTitle>
                          {item.job}
                        </MatrimonyHomeCardSubTitle>
                      </NativeView>

                      <TouchableOpacity>
                        {likedBy.includes(item._id) ? (
                          <Pressable>
                            <Icon name="thumb-up" size={30} color="white" />
                          </Pressable>
                        ) : (
                          <Pressable
                            onPress={() => likeHandlerHelper(item._id)}
                          >
                            <Icon
                              name="thumb-up-outline"
                              size={30}
                              color="white"
                            />
                          </Pressable>
                        )}
                      </TouchableOpacity>
                    </Card.Content>
                  </MatrimonyHomeCard>
                </TouchableOpacity>
              );
            }}
          />
        )
      )}
    </Container>
  );
};

export default MatrimonyScreen;
