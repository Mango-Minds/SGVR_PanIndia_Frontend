import React from "react";
import { IconButton } from "react-native-paper";
import {
  Image,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import { useMutation } from "@tanstack/react-query";
import Hyperlink from "react-native-hyperlink";
import {
  getImageUrl,
  likePost,
  unlikePost,
} from "../../services/socialMedia.services";
import { useSelector, useDispatch } from "react-redux";
import Carousel, { Pagination } from "react-native-x2-carousel";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { ErrorToggle } from "../../store/user";

export default function SinglePostCard({
  slideUpRef,
  navigation,
  item,
  shareRef,
  updateModalData,
}) {
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [liked, setLiked] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(item.likes.length);
  const [dp, setDp] = React.useState();
  const [PostImage, setPostImage] = React.useState();
  const [imageLoading, setImageLoading] = React.useState(true);
  const [status, setStatus] = React.useState({});

  React.useEffect(async () => {
    if (item) {
      const res = await getImageUrl(item.createdBy.dp);
      if (res.status === 0 && item.createdBy.dp) {
        setDp(res.url);
      }
      if (item.post.length >= 1) {
        const resImage = await getImageUrl(item.post[0]);
        setPostImage(resImage.url);
      }
      for (let i = 0; i < item.likes.length; i++) {
        const values = item.likes[i];
        if (values.user === user._id) {
          setLiked(true);
          break;
        }
      }
    }
  }, [item]);

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
    <>
      <View
        style={{
          // padding: 18,
          borderBottomWidth: 1,
          borderBottomColor: "#C4C4C4",
          marginBottom: 17,
          backgroundColor: "white",
        }}
      >
        {/* Info Section For the user */}
        <View style={styles.infosec}>
          <View style={styles.postprofile}>
            <Image
              source={
                dp
                  ? { uri: dp }
                  : require("../../assets/images/general/user.png")
              }
              style={{
                width: 50,
                height: 50,
                borderRadius: 6,
                marginRight: 6,
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
                {item.createdBy.fname + " " + item.createdBy.lname}
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
          {item.createdBy._id !== user._id ? (
            <View>
              <IconButton
                icon="dots-horizontal"
                color="#454F63"
                size={24}
                onPress={() => {
                  updateModalData({
                    id: item.createdBy._id,
                    name: item.createdBy.fname + " " + item.createdBy.lname,
                  });
                  slideUpRef.current.open();
                }}
              />
            </View>
          ) : null}
        </View>
        <View >
              <View style={{
          paddingHorizontal : 18,
        }}>
                <Hyperlink
                  linkDefault={true}
                  onPress={(url) => console.log(url)}
                  linkStyle={{ fontSize: 16, color: "#2989e3" }}
                >
                  <Text
                    style={{
                      color: "#78849E",
                      fontSize: 15,
                      fontWeight: "500",
                      lineHeight: 20,
                      // paddingHorizontal: 18,
                      marginTop : 20,
                      // backgroundColor: "red",
                    }}
                  >
                    {item?.caption}
                  </Text>
                </Hyperlink>
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
                            paddingHorizontal: 18,
                            paddingTop: 5,
                          }}
                        >
                          @{taggedPerson.username}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {item.post.length === 1 ? (
                <TouchableWithoutFeedback
                  onPress={() => handleDoubleTap(liked)}
                >
                  <View style={{ marginTop: 20 }}>
                    {imageLoading && (
                      <View style={styles.imageOverlay}>
                        <ActivityIndicator size="large" color="black" />
                      </View>
                    )}
                    {item.post[0].includes(".mp4") ||
                    item.post[0].includes(".mov") ? (
                      <View style={styles.container}>
                        <TouchableWithoutFeedback
                          onPress={() => {
                            handleDoubleTap(liked);
                          }}
                        >
                          <Video
                            ref={video}
                            style={[styles.video, { height: 500 }]}
                            source={{
                              uri: PostImage,
                            }}
                            isMuted={mute}
                            shouldPlay={true}
                            useNativeControls={Platform.OS === "ios" && true}
                            resizeMode="contain"
                            isLooping
                            onPlaybackStatusUpdate={(status) =>
                              setStatus(() => status)
                            }
                            onLoadEnd={()=>setImageLoading(false)}
                          />
                        </TouchableWithoutFeedback>

                        <View style={styles.buttons}>
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
                          <View style={styles.muteBtn}>
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
                          source={{ uri: PostImage }}
                          style={{
                            width: Dimensions.get("screen").width,
                            height: 410,
                            display: "flex",
                            flex: 1,
                            justifyContent: "center",
                            // backgroundColor:"grey"
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
                </TouchableWithoutFeedback>
              ) : (
                <Carousel
                  pagination={Pagination}
                  data={item.post}
                  renderItem={(data, index) => {
                    console.log(data);
                    return (
                      <TouchableWithoutFeedback
                        onPress={() => handleDoubleTap(liked)}
                        key={index}
                      >
                        <View
                          style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                            marginTop: 12,
                            width: "100%",
                            backgroundColor: "white",
                          }}
                        >
                          {imageLoading && (
                            <View style={styles.imageOverlay}>
                              <ActivityIndicator size="large" color="black" />
                            </View>
                          )}
                          {data.includes(".mp4") || data.includes(".mov") ? (
                            <View style={styles.container}>
                              <TouchableWithoutFeedback
                                onPress={() => {
                                  handleDoubleTap(liked);
                                }}
                              >
                                <Video
                                  ref={video}
                                  style={[styles.video, { height: 500 }]}
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
                              </TouchableWithoutFeedback>

                              <View style={styles.buttons}>
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
                                    <Icon
                                      name="play"
                                      size={65}
                                      color="#D4AF37"
                                    />
                                  </TouchableOpacity>
                                )}
                              </View>
                              {Platform.OS === "android" && (
                                <View style={styles.muteBtn}>
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
                                source={{ uri: PostImage }}
                                style={{
                                  width: Dimensions.get("screen").width,
                                  height: 410,
                                  display: "flex",
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
                      </TouchableWithoutFeedback>
                    );
                  }}
                />
                // null
              )}
            </View>
        {/* <View style={{ marginTop: 12 }}>
          {item.post && item.post.length > 0 ? (
            <>
              <Text
                style={{
                  color: "#78849E",
                  fontSize: 15,
                  fontWeight: "500",
                  lineHeight: 20,
                  marginBottom: "5%",
                }}
              >
                {item.caption}
              </Text>
              {item.post.length === 1 ? (
                <TouchableWithoutFeedback
                  onPress={() => handleDoubleTap(liked)}
                >
                  <View>
                    {imageLoading && (
                      <View style={styles.imageOverlay}>
                        <ActivityIndicator size="large" color="black" />
                      </View>
                    )}
                    <Image
                      source={{ uri: PostImage }}
                      style={{
                        width: Dimensions.get("screen").width,
                        height: 410,
                        // display: "flex",
                        // flex: 1,
                        // justifyContent: "center",
                      }}
                      resizeMode="contain"
                      onLoadStart={() => {
                        setImageLoading(true);
                      }}
                      onLoadEnd={() => {
                        setImageLoading(false);
                      }}
                    />
                  </View>
                </TouchableWithoutFeedback>
              ) : (
                <Carousel
                  pagination={Pagination}
                  data={item.post}
                  renderItem={(data) => {
                    return (
                      <TouchableWithoutFeedback
                        onPress={() => handleDoubleTap(liked)}
                        key={item.post.indexOf(data)}
                      >
                        <View
                          style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                            marginTop: 12,
                            width: "100%",
                            backgroundColor: "white",
                          }}
                        >
                          {imageLoading && (
                            <View style={styles.imageOverlay}>
                              <ActivityIndicator size="large" color="black" />
                            </View>
                          )}
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
                            onLoadStart={() => {
                              setImageLoading(true);
                            }}
                            onLoadEnd={() => {
                              setImageLoading(false);
                            }}
                          />
                        </View>
                      </TouchableWithoutFeedback>
                    );
                  }}
                />
                // null
              )}
            </>
          ) : (
            <TouchableWithoutFeedback onPress={() => handleDoubleTap(liked)}>
              <View>
                <Text
                  style={{
                    color: "#333333",
                    fontSize: 15,
                    fontWeight: "500",
                    marginTop: 23,
                    marginBottom: 24,
                  }}
                >
                  {item.caption}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View> */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#F4F4F6FD",
            marginTop: 15,
            paddingTop: 14,
            paddingBottom: 14,
            display: "flex",
            flexDirection: "row",
            paddingHorizontal : 18,
            paddingVertical : 18,
            // flex: 1,
            justifyContent: "space-between",
          }}
        >
          <View style={styles.flexprop}>
            <View style={styles.flexprop}>
              <Pressable
                onPress={() => {
                  setLiked(!liked);
                  handleLike(!liked);
                }}
              >
                <Text>
                  {liked ? (
                    <Icon name="heart" size={25} color="#D4AF37" />
                  ) : (
                    <Icon name="heart-outline" size={25} color="gray" />
                  )}
                </Text>
              </Pressable>
              <Text
                style={{
                  color: "#78849E",
                  fontSize: 14,
                  fontWeight: "bold",
                  paddingRight: 3,
                  paddingLeft: 10,
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
            <View style={styles.flexprop}>
              <Pressable
                onPress={() => {
                  navigation.navigate("CommentScreen", {
                    postId: item._id,
                  });
                }}
              >
                <Icons name="comment-text-outline" size={25} color="gray" />
                </Pressable>
              <Text
                style={{
                  color: "#78849E",
                  fontSize: 14,
                  fontWeight: "bold",
                  paddingRight: 3,
                  paddingLeft: 5,
                }}
              >
                {item.comments.length}
              </Text>
              
            </View>
          </View>
          {/* <TouchableOpacity
            onPress={() => {
              shareRef.current.open();
            }}
          >
            <Icons name="share-outline" size={30} color="gray" />
          </TouchableOpacity> */}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  infosec: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop : 18,
    paddingHorizontal : 18,
  },
  postprofile: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  flexprop: {
    // flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 22,
    marginBottom: "-2%",
    // justifyContent: "flex-start",
  },
  imageOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 18,
  },
});
