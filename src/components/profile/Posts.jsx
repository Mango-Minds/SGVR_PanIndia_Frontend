import React from "react";
import { IconButton } from "react-native-paper";
import { VideoView, useVideoPlayer } from "expo-video";
import Hyperlink from "react-native-hyperlink";

import {
  Image,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Button,
  Platform,
  Modal,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import {
  likePost,
  unlikePost,
  getDeletemypost,
  getImageUrl,
} from "../../services/socialMedia.services";
import Carousel, {
  FancyPagination,
  Pagination,
} from "react-native-x2-carousel";
import Icon from "react-native-vector-icons/Ionicons";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch } from "react-redux";
import { ErrorToggle } from "../../store/user";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

export function ProfilePosts(props) {
  const dispatch = useDispatch();

  const { datas, user, navigation } = props;

  console.log(datas);

  const [imageUrl, setImageUrl] = React.useState(
    datas.post.length > 0 ? datas.post : []
  );
  const [status, setStatus] = React.useState({});
  const [deleted, setDeleted] = React.useState(false);
  const [mute, setMute] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [liked, setLiked] = React.useState(
    datas.likes.filter((like) => like.user._id === user?._id).length > 0
  );
  const [likesCount, setLikesCount] = React.useState(datas.likes.length);
  const [dp, setDp] = React.useState(props.user.dp);

  const video = React.useRef(null);

  React.useEffect(async () => {
    setDp(props.user.dp);
  }, [user]);

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
    setLiked(likestatus);
    if (likestatus) {
      setLikesCount(likesCount + 1);
      likeMutation.mutateAsync({ postId: datas._id });
    } else {
      setLikesCount(likesCount - 1);
      unlikeMutation.mutateAsync({ postId: datas._id });
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

  const getDeletemypostHandler = () => {
    getDeletemypost({ id: datas._id });
    setModalVisible(!modalVisible);
    setDeleted(true);
  };
  return (
    <View
      style={[deleted ? stylesPostCard.deleted : stylesPostCard.notDeleted]}
    >
      <View style={stylesPostCard.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
          <View style={stylesPostCard.centeredView}>
            <View style={stylesPostCard.modalView}>
              <Text style={stylesPostCard.modalText}>Are you sure?</Text>
              <View style={{ flexDirection: "row" }}>
                <Pressable
                  style={[stylesPostCard.buttonCloseCancel]}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Text
                    style={[
                      stylesPostCard.textStyle,
                      { color: "black", opacity: 0.6 },
                    ]}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={[stylesPostCard.delButton]}
                  onPress={() => getDeletemypostHandler()}
                >
                  <Text style={stylesPostCard.textStyle}>Yes, Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
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
              borderRadius: 10,
              marginRight: 6,

              // backgroundColor:"red"
            }}
            resizeMode="contain"
          />
          <View>
            <Text
              style={{
                color: "#454F63",
                fontWeight: "600",
                fontSize: 14,
                textTransform: "capitalize",
                letterSpacing: 0.3,
              }}
            >
              {user.fname + " " + user.lname}
            </Text>
            <Text
              style={{
                color: "#454F63",
                fontSize: 11,
                marginTop: 4,
                fontWeight: "500",
              }}
            >
              {new Date(datas.createdAt).getDate() +
                " " +
                new Date(datas.createdAt).toLocaleString("default", {
                  month: "short",
                })}
            </Text>
          </View>
        </View>
        <View>
          <IconButton
            icon="delete"
            color="#b98c13"
            size={18}
            style={{
              marginTop: 0,
              marginRight: 0,
              marginLeft: 0,
            }}
            onPress={() => {
              setModalVisible(true);
            }}
          />
        </View>
      </View>
      <View style={{ marginTop: 12 }}>
        {/* <DoubleClick
          onClick={() => {
            if (!liked) {
              setLiked(true);
              handleLike(true);
            }
          }}
        > */}
        {imageUrl && imageUrl.length > 0 ? (
          <>
            <Hyperlink
              linkDefault={true}
              linkStyle={{ fontSize: 16, color: "#2989e3" }}
            >
              <Text
                style={{ color: "#78849E", fontSize: 15, fontWeight: "500" }}
              >
                {datas.caption}
              </Text>
            </Hyperlink>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {datas?.tag.map((taggedPerson, index) => {
                return (
                  <Pressable
                    key={index}
                    onPress={() => {
                      navigation.navigate("ViewUserScreen", {
                        username: taggedPerson?.username,
                        userid: taggedPerson?._id,
                      });
                    }}
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
            {imageUrl.length === 1 ? (
              <View style={{ marginTop: 20 }}>
                {imageUrl[0].includes(".mp4") ||
                imageUrl[0].includes(".mov") ? (
                  <View style={stylesPostCard.container}>
                    <TouchableWithoutFeedback
                      onPress={() => {
                        handleDoubleTap(liked);
                      }}
                    >
                      <Video
                        ref={video}
                        style={stylesPostCard.video}
                        source={{
                          uri: imageUrl[0],
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
                      source={{ uri: imageUrl[0] }}
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
            ) : (
              <Carousel
                pagination={Pagination}
                renderItem={(data, index) => {
                  return (
                    <View key={index}>
                      <View
                        style={{
                          flex: 1,
                          display: "flex",
                          justifyContent: "center",
                          marginTop: 12,
                          width: "100%",
                          // backgroundColor: "white",
                        }}
                      >
                        {data.includes(".mp4") || data.includes(".mov") ? (
                          <View style={stylesPostCard.container}>
                            <TouchableWithoutFeedback
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
                            )}
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
                    </View>
                  );
                }}
                data={imageUrl}
              />
            )}
          </>
        ) : (
          <TouchableWithoutFeedback
            onPress={() => {
              handleDoubleTap(liked);
            }}
          >
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
                {datas.caption}
              </Text>
            </View>
          </TouchableWithoutFeedback>
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
                paddingRight: 8,
                paddingLeft: 10,
              }}
              onPress={() => {
                if (likesCount > 0) {
                  navigation.navigate("LikesScreen", {
                    postId: datas._id,
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
                  postId: datas._id,
                });
              }}
              style={stylesPostCard.flexprop}
            >
              <Icons name="comment-text-outline" size={25} color="gray" />
              <Text
                style={{
                  color: "#78849E",
                  fontSize: 14,
                  fontWeight: "bold",
                  paddingRight: 8,
                  paddingLeft: 10,
                }}
              >
                {datas.comments.length}
              </Text>
            </Pressable>
          </View>
        </View>
        {/* <TouchableOpacity>
          <Icons name="share-outline" size={30} color="gray" />
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

export const stylesPostCard = StyleSheet.create({
  infosec: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postprofile: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
  },
  flexprop: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 22,
  },
  deleted: {
    display: "none",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    // backgroundColor: '#ecf0f1',
  },
  video: {
    alignSelf: "center",
    width: Dimensions.get("screen").width - 35,
    height: 300,
  },
  buttons: {
    position: "absolute",
    bottom: "15%",
  },
  muteBtn: {
    position: "absolute",
    bottom: "2%",
    right: "2%",
  },

  infosec: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    // justifyContent: "flex-start",
  },
  notDeleted: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#C4C4C4",
    marginBottom: 17,
    backgroundColor: "white",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 8,
    width: "75%",
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 8,
    padding: 15,
    elevation: 2,
    margin: "3%",
  },
  delButton: {
    borderRadius: 8,
    padding: 15,
    elevation: 2,
    margin: "3%",
    backgroundColor: "#b98c13",
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#c7180c",
  },
  buttonCloseCancel: {
    borderColor: "blue",
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    padding: 15,
    elevation: 1,
    margin: "3%",
  },
  imageOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 15,
  },
  modalText: {
    marginBottom: 15,
    fontWeight: "600",
    opacity: 0.6,
    textAlign: "center",
    fontSize: 18,
  },
});
