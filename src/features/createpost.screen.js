import React, { useState } from "react";
import { IconButton, Button } from "react-native-paper";
import { Container, RowBetween, View } from "../styles/common.styles";
import {
  CreatePostButton,
  CreatePostButtonSection,
  CreatePostTextBox,
  TopText,
} from "../styles/social.styles";
import {
  Image,
  ScrollView,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  createPost,
  GetAllFriends,
  getImageUrl,
} from "../services/socialMedia.services";
import { useMutation, useQuery } from "react-query";
import { useSelector, useDispatch } from "react-redux";
import { useRef } from "react";
import TagPeople from "../components/modals/TagPeopleModal";
import FormData from "form-data";
import { ErrorToggle, setLoadingInBtn } from "../store/user";

const CreatePostScreen = ({ navigation }) => {
  const { user, loadingInBtn } = useSelector((state) => state.user);
  const [myDp, setMyDp] = useState();

  const dispatch = useDispatch();
  const tagModalRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [taggedPeople, setTaggedPeople] = useState([]);
  const [taggedPeopleNames, setTaggedPeopleNames] = useState([]);
  const { data, isError, error, isLoading } = useQuery(
    ["all-friends", user.username],
    () => GetAllFriends({ userid: user._id }),
    {
      onSuccess: (data) => {},
      onError: (err) => {
        dispatch(
          ErrorToggle({
            msg: err.response.data.message,
            type: "error",
            toggle: true,
          })
        );
      },
    }
  );
  const pickVideo = async () => {
    // const options = {
    //   mediaType:"video"

    // }
    // const result = await launchCamera(options);
    let permissions = await ImagePicker.requestCameraPermissionsAsync();

    if (permissions.granted === false) {
      alert("Permission is required. Please enable it from settings");
      return;
    }
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      crop: true,

      videoMaxDuration: 30,
    });

    if (result.cancelled === true) return;
    setSelectedImage((prev) => [...prev, result]);
  };

  const _pickDocument = async () => {
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissions.granted === false) {
      alert("Permission is required. Please enable it from settings.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
      // crop: true,
      videoMaxDuration: 30,
      duration: 30,
    });

    if (result.cancelled === true) return;
    setSelectedImage((prev) => [...prev, result]);
  };

  const pickImage = async () => {
    let permissions = await ImagePicker.requestCameraPermissionsAsync();

    if (permissions.granted === false) {
      alert("Permission is required. Please enable it from settings");
      return;
    }
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      crop: true,
      videoMaxDuration: 30,
    });

    if (result.cancelled === true) return;
    setSelectedImage((prev) => [...prev, result]);
  };

  const createPostMutation = useMutation(createPost, {
    onSuccess: async (data) => {
      await dispatch(setLoadingInBtn(false));

      navigation.navigate("PostCreated");
    },
    onError: (err) => {
      dispatch(
        ErrorToggle({
          msg: err?.response?.data?.message,
          type: "error",
          toggle: true,
        })
      );
    },
  });

  const onCreatePostSubmit = async () => {
    const data = new FormData();
    const body = {
      type: selectedImage.length === 0 ? "text" : "video",
      content: selectedImage,
      caption: postContent,
      location: selectedLocation,
      tag: taggedPeople,
    };
    let image = [];

    data.append("type", body.type);
    data.append("content", body.content);
    data.append("caption", body.caption);
    data.append("location", body.location);
    data.append("tag", JSON.stringify(body.tag));
    for (let i = 0; i < selectedImage.length; i++) {
      let uriParts = selectedImage[i].uri.split(".");
      data.append("file", {
        uri: selectedImage[i].uri,
        name: selectedImage[i].uri.split("/").pop(),
        type: "image/" + uriParts[uriParts.length - 1],
      });
    }
    await dispatch(setLoadingInBtn(true));
    await createPostMutation.mutateAsync(data);
    await dispatch(setLoadingInBtn(false));
    setSelectedImage([]);
    setPostContent("");
    setSelectedLocation("");
    setTaggedPeople([]);
  };

  const removeProfileImage = (index) => {
    let newArray = [...selectedImage];
    newArray.splice(index, 1);
    setSelectedImage(newArray);
  };
  React.useEffect(async () => {
    const res = await getImageUrl(user.dp);
    if (res.status === 0) {
      setMyDp(res.url);
    }
  }, []);
  const renderItem = ({ item, index }) => {
    return (
      <View
        style={{
          width: 100,
          height: 100,
          marginRight: 12,
          backgroundColor: "black",
          zIndex: -1,
          marginTop: Platform.OS === "ios" ? 0 : 0,
        }}
        key={index}
      >
        <Image
          key={index}
          style={styles.profileImg}
          source={{
            uri: item.uri,
          }}
        />
        <TouchableOpacity
          onPress={() => removeProfileImage(index)}
          // style={{ zIndex: 999, height:20, width:20 }}
          style={{
            position: "absolute",
            right: -5,
            bottom: -3,
            zIndex: 999999,
            // backgroundColor:"red"
          }}
        >
          {/* <View> */}
          <Image
            source={require("../assets/images/general/cross.png")}
            style={{ width: 17, height: 17, zIndex: 999 }}
          />
          {/* </View> */}
        </TouchableOpacity>
      </View>
    );
  };
  if (loadingInBtn)
    return (
      <ActivityIndicator
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          color: "#D4AF37",
        }}
      />
    );
  else
    return (
      <Container
        style={{
          margin: 0,
          paddingLeft: 0,
          paddingRight: 0,
          backgroundColor: "#FAFAFA",
          flex: 1,
        }}
      >
        <RowBetween
          style={{
            paddingTop: 24,
            paddingBottom: 12,
            backgroundColor: "#FFFFFF",
            justifyContent: "space-between",
          }}
        >
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
              Create Post
            </TopText>
          </View>
          <Button
            disabled={postContent || selectedImage.length !== 0 ? false : true}
            uppercase={false}
            labelStyle={
              ({ fontSize: 16, letterSpacing: 0 },
              postContent || selectedImage.length !== 0
                ? { color: "#B98C13" }
                : { color: "#B98C13", opacity: 0.5 })
            }
            onPress={onCreatePostSubmit}
          >
            Create
          </Button>
        </RowBetween>

        <View>
          <ScrollView
            style={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ alignItems: "flex-end" }}>
              <Image
                source={{
                  uri:
                    myDp ??
                    "https://www.freeiconspng.com/thumbs/profile-icon-png/profile-icon-9.png",
                }}
                style={{ width: 60, height: 60, borderRadius: 6 }}
              />
              <Text
                style={{
                  color: "#B98C13",
                  fontSize: 16,
                  marginLeft: 9,
                }}
              >
                @{user.username}
              </Text>
            </View>
            <CreatePostTextBox
              underlineColor="transparent"
              multiline={true}
              placeholder={`What’s on your mind, ${user.username}?`}
              activeUnderlineColor="transparent"
              selectionColor="#3F496D"
              value={postContent}
              onChangeText={(text) => setPostContent(text)}
            />
            {selectedImage && selectedImage.length > 0 && (
              <FlatList
                data={selectedImage}
                renderItem={renderItem}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
              />
            )}
            <View
              style={{
                marginTop: Platform.OS === "ios" ? 20 : 0,
              }}
            >
              {taggedPeopleNames && taggedPeopleNames.length > 0 && (
                <View>
                  {taggedPeopleNames.map((name, index) => (
                    <React.Fragment key={index}>
                      <Text style={{ color: "#B98C13", marginLeft: 10 }}>
                        @{name}{" "}
                      </Text>
                    </React.Fragment>
                  ))}
                </View>
              )}
            </View>

            <CreatePostButtonSection style={{ marginTop: 60 }}>
              <CreatePostButton
                uppercase={false}
                labelStyle={{
                  color: "#3F496D",
                  fontSize: 17,
                  letterSpacing: 0,
                  paddingVertical: 6,
                }}
                icon="image"
                color="#3F496D"
                onPress={_pickDocument}
              >
                Gallery
              </CreatePostButton>
              <CreatePostButton
                uppercase={false}
                labelStyle={{
                  color: "#3F496D",
                  fontSize: 17,
                  letterSpacing: 0,
                  paddingVertical: 6,
                }}
                icon="camera"
                color="#3F496D"
                onPress={pickImage}
              >
                Camera
              </CreatePostButton>
            </CreatePostButtonSection>
            <CreatePostButtonSection>
              {/* <CreatePostButton
                uppercase={false}
                labelStyle={{
                  color: "#3F496D",
                  fontSize: 16,
                  letterSpacing: 0,
                  paddingVertical: 6,
                }}
                icon="map-marker"
                color="#3F496D"
                onPress={() => {
                  navigation.navigate("AddLocationScreen", {
                    setLocation: setSelectedLocation,
                    location: selectedLocation,
                  });
                }}
              >
                Location
              </CreatePostButton> */}
              <CreatePostButton
                uppercase={false}
                labelStyle={{
                  color: "#3F496D",
                  fontSize: 16,
                  letterSpacing: 0,
                  paddingVertical: 6,
                }}
                icon="account-plus-outline"
                color="#3F496D"
                onPress={() => tagModalRef?.current?.open()}
              >
                Tag Someone
              </CreatePostButton>
              <CreatePostButton
                uppercase={false}
                labelStyle={{
                  color: "#3F496D",
                  fontSize: 17,
                  letterSpacing: 0,
                  paddingVertical: 6,
                }}
                icon="video"
                color="#3F496D"
                onPress={pickVideo}
              >
                Video
              </CreatePostButton>
            </CreatePostButtonSection>
          </ScrollView>
        </View>
        {data && (
          <TagPeople
            slideUpRef={tagModalRef}
            friends={data.friends.friends}
            setTaggedPeople={setTaggedPeople}
            setTaggedPeopleNames={setTaggedPeopleNames}
            // taggedPeople={taggedPeople}
          />
        )}
      </Container>
    );
};

const styles = StyleSheet.create({
  profileImg: {
    width: 100,
    height: 100,
    borderRadius: 3,
    resizeMode: "contain",
    // marginBottom: 24,
  },
});

export default CreatePostScreen;
