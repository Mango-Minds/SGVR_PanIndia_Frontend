import React, { useEffect, useState } from "react";
import {
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  TextInput,
} from "react-native";
import { Divider, IconButton } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import OptionsModal from "../components/modals/OptionsModal";
import {
  editSocialMediaProfile,
  getImageUrl,
} from "../services/socialMedia.services";
import {
  Container,
  InputField,
  RowBetween,
  View,
} from "../styles/common.styles";
import { Row } from "../styles/dashboard.styles";
import * as ImagePicker from "expo-image-picker";
import { ProfileContainer } from "../styles/profile.styles";
import FormData from "form-data";
import {
  initialUser,
  ErrorToggle,
  IsBttnloading,
} from "../store/user";
import { LinearGradient } from "expo-linear-gradient";

export default function EditProfileScreen({ navigation }) {
  const { user, loadingInBtn, token } = useSelector((state) => state.user);
  const [bio, setBio] = useState(user.bio);
  const [dp, setDp] = useState("");
  const [image, setImage] = useState("");

  const dispatch = useDispatch();

  const data = async () => {
    if (user.dp) {
      await getImageUrl(user.dp).then((res) => {
        setDp(res.url);
      });
    }
  };

  useEffect(() => {
    data();
  }, []);

  const _pickDocument = async () => {
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissions.granted === false) {
      alert("Permission is required");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
      crop: true,
    });

    if (result.cancelled === true) return;
    setImage(result);
    setDp(result.uri);
  };

  const handleSubmit = async () => {
    dispatch(IsBttnloading(true));
    const formdata = new FormData();

    formdata.append("bio", bio);
    if (image) {
      let uriParts = image.uri.split(".");
      formdata.append("file", {
        uri: image.uri,
        name: image.uri.split("/").pop(),
        type: "image/" + uriParts[uriParts.length - 1],
      });
    }
    await editSocialMediaProfile(formdata)
      .then((res) => {
        console.log(res);
        setImage("");
        dispatch(initialUser(token));
        dispatch(IsBttnloading(false));
      })
      .catch((err) => {
        dispatch(
          ErrorToggle({
            msg: err.response.data.message,
            type: "error",
            toggle: true,
          })
        );
        dispatch(IsBttnloading(false));
      });
  };

  if (loadingInBtn)
    return (
      <ActivityIndicator
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    );
  else
    return (
      <Container style={{ backgroundColor: "#FAFAFA" }}>
        <RowBetween
          style={{
            paddingTop: 32,
            paddingBottom: 16,
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          {/* <View style={{ alignItems: 'center' }}> */}
          <Text
            onPress={() => navigation.goBack()}
            style={{ color: "#B98C13", fontWeight: "normal" }}
          >
            Cancel
          </Text>
          {/* </View> */}

          {/* <View style={{ alignItems: 'center' }}> */}
          <Text
            style={{ color: "#454F63", fontWeight: "bold", marginRight: 16 }}
          >
            Edit Meetup Profile
          </Text>
          {/* </View> */}
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={{ color: "#B98C13", fontWeight: "normal" }}>Done</Text>
          </TouchableOpacity>
        </RowBetween>

        <ProfileContainer
          style={{ flexDirection: "column", position: "relative" }}
        >
          <View
            style={{
              position: "absolute",
              zIndex: 3,
              borderColor: "#FFF",
              borderWidth: 3,
              borderRadius: 10,
              top: 50,
              left: "34%",
            }}
          >
            <Image
              source={
                dp && dp !== ""
                  ? {
                      uri: dp,
                    }
                  : require("../assets/images/general/user.png")
              }
              resizeMode="contain"
              style={{
                borderRadius: 5,

                width: 120,
                height: 120,
                backgroundColor: "#f7f7f7",
              }}
            />
          </View>
          <ProfileContainer style={{}}>
            <LinearGradient colors={["#363534", "#0a0a0a"]}>
              {/* // colors={["#363534", "rgba(94, 94, 94, 0.8)"]}> */}

              <ImageBackground
                blurRadius={12}
                style={{ width: "100%", height: 160 }}
                imageStyle={{ opacity: 0.7 }}
                source={
                  dp && dp !== ""
                    ? {
                        uri: dp,
                      }
                    : require("../assets/images/general/user.png")
                }
              ></ImageBackground>
            </LinearGradient>
          </ProfileContainer>
        </ProfileContainer>
        <ProfileContainer
          style={{
            paddingTop: 32,
            paddingLeft: 16,
            paddingRight: 4,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity onPress={_pickDocument}>
            <Text
              style={{
                fontSize: 16,
                color: "#b98c13",
                textAlign: "center",
                paddingBottom: 16,
              }}
            >
              CHANGE PROFILE PHOTO
            </Text>
          </TouchableOpacity>
        </ProfileContainer>
        <Divider style={{ height: 1 }} />
        <ProfileContainer style={{ paddingLeft: 8, paddingRight: 8 }}>
          {/* <Row style={{ padding: 16, marginTop: 16 }}>
          <Text style={{ fontSize: 16, width: '30%', color: '#4C5264', fontWeight: 'normal' }}>
            Name
          </Text>
          <InputField
            placeholder="Sitaraman"
            borderBottomWidth={1}
            borderColor="#00000029"
            style={{ paddingLeft: 0, marginLeft: 16, width: '65%', fontSize: 16, paddingBottom: 5 }}
          />
        </Row>
        <Row style={{ padding: 16 }}>
          <Text style={{ fontSize: 16, width: '30%', color: '#4C5264', fontWeight: 'normal' }}>
            Username
          </Text>
          <InputField
            placeholder="@sitaraman"
            borderBottomWidth={1}
            borderColor="#00000029"
            style={{ paddingLeft: 0, marginLeft: 16, width: '65%', fontSize: 16, paddingBottom: 5 }}
          />
        </Row> */}
          <Row style={{ padding: 16, flexDirection: "column" }}>
            <Text
              style={{
                fontSize: 16,
                width: "30%",
                color: "#4C5264",
                fontWeight: "700",
                marginTop: 20,
                opacity: 0.7,
              }}
            >
              About You -
            </Text>
            <TextInput
              multiline={true}
              placeholder="Tell us about yourself"
              borderWidth={1}
              borderRadius={4}
              onChangeText={(text) => setBio(text)}
              borderColor="#00000029"
              style={{
                marginTop: "3%",
                marginLeft: 0,
                fontSize: 16,
                padding: 8,
                color: "#78849e",
                minHeight: "30%",
                maxHeight: "50%",
                textAlignVertical: "top",
              }}
              value={bio}
            />
          </Row>
          {/* <Row style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 16,
              width: "30%",
              color: "#4C5264",
              fontWeight: "normal",
            }}
          >
            Location
          </Text>
          <InputField
            placeholder="Ex..Delhi"
            borderBottomWidth={1}
            borderColor="#00000029"
            onChangeText={(text) => setLocation(text)}
            style={{
              paddingLeft: 0,
              marginLeft: 16,
              width: "65%",
              fontSize: 16,
              paddingBottom: 5,
            }}
            value={location}
          />
        </Row> */}
        </ProfileContainer>
      </Container>
    );
}
