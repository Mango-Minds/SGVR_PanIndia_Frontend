import React from "react";
import { useSelector } from "react-redux";
import {
  View,
  Image,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Platform,
} from "react-native";
import Hyperlink from "react-native-hyperlink";

import Carousel, { Pagination } from "react-native-x2-carousel";
import {
  getImageUrl,
  getSinglePost,
  likePost,
  unlikePost,
} from "../../services/socialMedia.services";
import Icon from "react-native-vector-icons/Ionicons";

import { VideoView, useVideoPlayer } from "expo-video";
import { stylesPostCard } from "../profile/Posts";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { ErrorToggle } from "../../store/user";

const FriendPosts = (props) => {
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const { item, userdata, navigation, dp } = props;
  //for video posts
  const [status, setStatus] = React.useState({});
  const video = React.useRef(null);
  const [mute, setMute] = React.useState(true);

  //image loader spinner
  const [imageLoading, setImageLoading] = React.useState(true);

  const [liked, setLiked] = React.useState();
  const [likesCount, setLikesCount] = React.useState(item.likes.length);
  const [media, setMedia] = React.useState([]);

  const UpdateItem = async () => {
    if (item?.post?.length > 0) {
      item.imageurl = [];
      for await (const postkey of item.post) {
        const data = await getImageUrl(postkey);
        if (data.status === 0) {
          item.imageurl.push(data.url);
          setMedia([...media, data.url]);
        }
      }
    }

    if (item && item.likes) {
      for (let i = 0; i < item.likes.length; i++) {
        const values = item.likes[i];
        for (let j = 0; j < values.length; j++) {
          const val = values[j];
          console.log(val);
          if (val.user._id === user._id) {
            setLiked(true);
          }
        }
        if (values.user._id === user._id) {
          setLiked(true);
          break;
        }
      }
    }
  };

  React.useEffect(() => {
    UpdateItem();
  }, []);

  const likeMutation = useMutation(likePost, {
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

  const unlikeMutation = useMutation(unlikePost, {
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

  const handleLike = async (likestatus) => {
    if (likestatus) {
      setLikesCount(likesCount + 1);
      likeMutation.mutateAsync({ postId: item._id });
    } else {
      setLikesCount(likesCount - 1);
      unlikeMutation.mutateAsync({ postId: item._id });
    }
  };
  let lasttap = null;

  const handleDoubleTap = (likestatus) => {
    if (!likestatus)
      if (lasttap && lasttap + 300 > Date.now()) {
        handleLike(true);
        setLiked(true);
        lasttap = null;
      } else lasttap = Date.now();
  };

  return (
    <View
      style={{
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#C4C4C4",
        marginBottom: 17,
        backgroundColor: "white",
        flex: 1,
        width: "100%",
      }}
    >
      {/* Info Section For the user */}
      <View style={stylesPostCard.infosec}>
        <View style={stylesPostCard.postprofile}>
          <Image
            source={
              dp ? { uri: dp } : require("../../assets/images/general/user.png")
            }
            style={{
              width: 50,
              height: 50,
              borderRadius: 6,
              marginRight: 6,
              // backgroundColor:"red"s
            }}
            resizeMode="contain"
          />
          <View>
            <Text
              style={{
                color: "#454F63",
                fontWeight: "600",
                fontSize: 16,
                textTransform: "capitalize",
              }}
            >
              {userdata.data.fname + " " + userdata.data.lname}
            </Text>
            <Text
              style={{
                color: "#454F63",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {new Date(item.createdAt).getDate() +
                " " +
                new Date(item.createdAt).toLocaleString("default", {
                  month: "short",
                })}
            </Text>
          </View>
        </View>
        {/* <View>
          <IconButton
            icon="dots-horizontal"
            color="#454F63"
            size={24}
            // onPress={() => {
            //   slideUpRef.current.open();
            // }}
          />
        </View> */}
      </View>
      <View style={{ marginTop: 12 }}>
        {media && media.length > 0 ? (
          <View>
            <Hyperlink
              linkDefault={true}
              linkStyle={{ fontSize: 16, color: "#2989e3" }}
            >
              <Text
                style={{
                  color: "#78849E",
                  fontSize: 16,
                  fontWeight: "500",
                  marginBottom: 5,
                }}
              >
                {item.caption}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {item?.tag.map((taggedPerson, index) => {
                  return (
                    <Pressable
                      key={index}

                      // onPress={() => {
                      //   navigation.navigate("ViewUserScreen", {
                      //     username: taggedPerson?.username,
                      //     userid: taggedPerson?._id,
                      //   });
                      // }}
                    >
                      <Text
                        style={{
                          paddingRight: "1.5%",
                          fontWeight: "bold",
                          color: "#D4AF37",
                        }}
                      >
                        @{taggedPerson.username}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Hyperlink>

            {media && media.length === 1 ? (
              <View>
                {imageLoading && (
                  <View style={stylesPostCard.imageOverlay}>
                    <ActivityIndicator size={"large"} color={"#b98c13"} />
                  </View>
                )}
                {media[0].includes(".mp4") || media[0].includes(".mov") ? (
                  <View style={stylesPostCard.container}>
                    <Text>One Video</Text>
                    <TouchableWithoutFeedback
                      onPress={() => {
                        handleDoubleTap(liked);
                      }}
                    >
                      <Video
                        onLoadStart={() => {
                          setImageLoading(true);
                        }}
                        onLoadEnd={() => {
                          setImageLoading(false);
                        }}
                        ref={video}
                        style={stylesPostCard.video}
                        source={{
                          uri: media[0],
                        }}
                        isMuted={mute}
                        shouldPlay={true}
                        useNativeControls={Platform.OS === "ios" ? true : false}
                        resizeMode="contain"
                        isLooping
                        onPlaybackStatusUpdate={(status) =>
                          setStatus(() => status)
                        }
                      />
                    </TouchableWithoutFeedback>

                    <View style={stylesPostCard.buttons}>
                      {status.isPlaying ? (
                        <TouchableOpacity
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            width: 350,
                            height: 230,
                          }}
                          onPress={() => video.current.pauseAsync()}
                        >
                          <Icon name="pause" size={65} color="#D4AF37" />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            width: 350,
                            height: 230,
                          }}
                          onPress={() => video.current.playAsync()}
                        >
                          <Icon name="play" size={65} color="#D4AF37" />
                        </TouchableOpacity>
                      )}
                    </View>
                    {Platform.OS === "android" && (
                      <View style={stylesPostCard.muteBtn}>
                        {mute ? (
                          <TouchableOpacity
                            style={{
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 1,
                              width: 33,
                              height: 33,
                            }}
                            onPress={() => setMute(false)}
                          >
                            <Icon
                              name="ios-volume-mute-sharp"
                              size={15}
                              color="#474747"
                            />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={{
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 1,
                              width: 33,
                              height: 33,
                            }}
                            onPress={() => setMute(true)}
                          >
                            <Icon
                              name="volume-high-sharp"
                              size={15}
                              color="#474747"
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                ) : (
                  <TouchableWithoutFeedback
                    onPress={() => {
                      handleDoubleTap(liked);
                    }}
                  >
                    <Image
                      source={{ uri: media[0] }}
                      style={{
                        width: Dimensions.get("screen").width - 35,
                        height: 300,
                        display: "flex",
                        borderRadius: 6,
                        flex: 1,
                        justifyContent: "center",
                      }}
                      resizeMode="contain"
                      onLoadStart={() => {
                        setImageLoading(true);
                      }}
                      onLoadEnd={() => {
                        setImageLoading(false);
                      }}
                    />
                  </TouchableWithoutFeedback>
                )}
              </View>
            ) : (
              // <Text>djfh</Text>

              <Carousel
                pagination={Pagination}
                renderItem={(data, index) => {
                  return (
                    <View
                      style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        marginTop: 12,
                        width: "100%",
                        // backgroundColor: "white",
                      }}
                      key={index}
                    >
                      {data.includes(".mp4") || data.includes(".mov") ? (
                        <View style={stylesPostCard.container}>
                          {/* <TouchableWithoutFeedback
                              onPress={() => {
                                handleDoubleTap(liked);
                              }}
                            >
                              <Video
                                ref={video}
                                style={stylesPostCard.video}
                                source={{
                                  uri: data,
                                }}
                                isMuted={mute}
                                // shouldPlay
                                useNativeControls={
                                  Platform.OS === "ios" ? true : false
                                }
                                resizeMode="contain"
                                isLooping
                                onPlaybackStatusUpdate={(status) =>
                                  setStatus(() => status)
                                }
                              />
                            </TouchableWithoutFeedback> */}

                          {/* <View style={stylesPostCard.buttons}>
                              {status.isPlaying ? (
                                <TouchableOpacity
                                  style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity: 0,
                                    width: 350,
                                    height: 230,
                                  }}
                                  onPress={() => video.current.pauseAsync()}
                                >
                                  <Icon
                                    name="pause"
                                    size={65}
                                    color="#D4AF37"
                                  />
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity: 0,
                                    width: 350,
                                    height: 230,
                                  }}
                                  onPress={() => video.current.playAsync()}
                                >
                                  <Icon name="play" size={65} color="#D4AF37" />
                                </TouchableOpacity>
                              )}
                            </View>
                            {Platform.OS === "android" && (
                              <View style={stylesPostCard.muteBtn}>
                                {mute ? (
                                  <TouchableOpacity
                                    style={{
                                      alignItems: "center",
                                      justifyContent: "center",
                                      opacity: 1,
                                      width: 33,
                                      height: 33,
                                    }}
                                    onPress={() => setMute(false)}
                                  >
                                    <Icon
                                      name="ios-volume-mute-sharp"
                                      size={15}
                                      color="#474747"
                                    />
                                  </TouchableOpacity>
                                ) : (
                                  <TouchableOpacity
                                    style={{
                                      alignItems: "center",
                                      justifyContent: "center",
                                      opacity: 1,
                                      width: 33,
                                      height: 33,
                                    }}
                                    onPress={() => setMute(true)}
                                  >
                                    <Icon
                                      name="volume-high-sharp"
                                      size={15}
                                      color="#474747"
                                    />
                                  </TouchableOpacity>
                                )}
                              </View>
                            )} */}
                        </View>
                      ) : (
                        <TouchableWithoutFeedback
                          onPress={() => {
                            handleDoubleTap(liked);
                          }}
                        >
                          <Image
                            source={{ uri: data }}
                            style={{
                              width: Dimensions.get("screen").width - 35,
                              height: 300,
                              display: "flex",
                              borderRadius: 6,
                              flex: 1,
                              justifyContent: "center",
                            }}
                            resizeMode="contain"
                          />
                        </TouchableWithoutFeedback>
                      )}
                    </View>
                  );
                }}
                data={media}
              />
            )}
          </View>
        ) : (
          <Pressable onPress={() => handleDoubleTap(liked)}>
            <Hyperlink
              linkDefault={true}
              linkStyle={{ fontSize: 16, color: "#2989e3" }}
            >
              <Text
                style={{
                  color: "black",
                  fontSize: 18,
                  fontWeight: "500",

                  marginTop: 23,
                  marginBottom: 10,
                  // backgroundColor:"blue"
                }}
              >
                {item.caption}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {item?.tag.map((taggedPerson, index) => {
                  return (
                    <Pressable
                      key={index}

                      // onPress={() => {
                      //   navigation.navigate("ViewUserScreen", {
                      //     username: taggedPerson?.username,
                      //     userid: taggedPerson?._id,
                      //   });
                      // }}
                    >
                      <Text
                        style={{
                          paddingRight: "1.5%",
                          fontWeight: "bold",
                          color: "#D4AF37",
                        }}
                      >
                        @{taggedPerson.username}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Hyperlink>
          </Pressable>
        )}
      </View>
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: "#F4F4F6FD",
          marginTop: 15,
          paddingTop: 14,
          // paddingBottom: 14,
          display: "flex",
          flexDirection: "row",
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <View style={stylesPostCard.flexprop}>
          <View style={stylesPostCard.flexprop}>
            <Pressable
              onPress={() => {
                setLiked(!liked);
                handleLike(!liked);
              }}
            >
              <Image
                source={
                  liked
                    ? require("../../assets/images/social/like-full.png")
                    : require("../../assets/images/social/like-empty.png")
                }
                style={{
                  width: 26,
                  height: 26,
                  marginRight: 15,
                }}
                resizeMode="contain"
              />
            </Pressable>
            <Text
              style={{
                color: "#78849E",
                fontSize: 14,
                fontWeight: "bold",
                paddingRight: 3,
                paddingLeft: 3,
              }}
              onPress={() => {
                if (likesCount > 0) {
                  navigation.navigate("LikesScreen", {
                    postId: item._id,
                  });
                }
              }}
            >
              {likesCount}
            </Text>
          </View>
          <View style={stylesPostCard.flexprop}>
            <Pressable
              onPress={() => {
                navigation.navigate("CommentScreen", {
                  postId: item._id,
                });
              }}
            >
              <Image
                source={require("../../assets/images/social/comment.png")}
                style={{
                  width: 26,
                  height: 26,
                  marginRight: 15,
                }}
                resizeMode="contain"
              />
            </Pressable>
            <Text
              style={{
                color: "#78849E",
                fontSize: 14,
                fontWeight: "bold",
                paddingRight: 3,
                paddingLeft: 3,
              }}
            >
              {item.comments.length}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            shareOptionsRef.current.open();
          }}
        >
          <Image
            source={require("../../assets/images/social/share.png")}
            style={{ width: 26, height: 26 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FriendPosts;
