import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { ActivityIndicator, IconButton, Provider } from "react-native-paper";
import Theme from "../../styles/theme";
import {
  FormButton,
  FormSection,
  MainContainer,
} from "../../styles/prelogin.styles";
import { SafeArea } from "../../components/utility/safe-area.component";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useDispatch } from "react-redux";
import {setLoadingInBtn } from "../../store/user";
import { en, registerTranslation } from "react-native-paper-dates";
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";


const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  input: {
    marginTop: 24,
    backgroundColor: "#F0F0F0",
    borderColor: "#E6E6E6",
    borderRadius: 4,
  },
  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    resizeMode: "cover",
    marginBottom: 24,
  },
  dateView: {
    marginTop: 24,
    backgroundColor: "#f0f0f0",
    borderColor: "#e6e6e6",
    borderRadius: 4,
    height: 50,
    textTransform: "capitalize",
    width: "100%",
    
    fontSize: 18,
  },
});

export default function EditPost({ route, navigation }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();

  const { fetchPosts, post, description } = route.params;
  const token = useSelector((state) => state.user.token);
  console.log("Post in edit form: ", post);
  console.log("Description: ", post.content);
  console.log("Des: ", description);
  const { loadingInBtn } = useSelector((state) => state.user);

  const [modifiedDetails, setModifiedDetails] = useState({
    description: post.content,
  });
  console.log("modified details", modifiedDetails);


// const handleUpdate = async () => {
//     await dispatch(setLoadingInBtn(true));
  
//     try {
//       const formData = new FormData();
      
     
//       if (modifiedDetails.description !== post.content) {
//         formData.append("content", modifiedDetails.description);
//       }
  
//       const response = await fetch(`${BASEAPIURL}/social/post/update/${post._id}`, {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });
  
//       await dispatch(setLoadingInBtn(false));
  
//       if (!response.ok) {
//         throw new Error("Failed to update post");
//       }
  
//       const data = await response.json();  
  
//       console.log("Response from server:", data);
  
     
//       if (data?.post?.content === modifiedDetails.description) {
//         alert("Post updated successfully");
//         fetchPosts();  
//         navigation.goBack();
//       } else {
//         alert("Failed to update post description");
//       }
//     } catch (error) {
//       console.error("Error updating post:", error);
//       alert("Error updating the post");
//     }
//   };
const handleUpdate = async () => {
  await dispatch(setLoadingInBtn(true));

  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.error("Authentication token is missing.");
      Alert.alert("Error", "You are not authorized. Please log in again.");
      await dispatch(setLoadingInBtn(false));
      return;
    }

    const formData = new FormData();

    if (modifiedDetails.description !== post.content) {
      formData.append("content", modifiedDetails.description);
    }

    const response = await apiClient.patch(
      `/social/post/update/${post._id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    await dispatch(setLoadingInBtn(false));

    if (response.status !== 200) {
      throw new Error("Failed to update post");
    }

    const data = response.data;

    console.log("Response from server:", data);

    if (data?.post?.content === modifiedDetails.description) {
      alert("Post updated successfully");
      // Ensure fetchPosts completes before navigation
      if (fetchPosts) {
        await fetchPosts(true); // Pass true for refresh
      }
      // Navigate to SocialHomeScreen to ensure user stays in social section
      setTimeout(() => {
        navigation.navigate("SocialHomeScreen");
      }, 100);
    } else {
      alert("Failed to update post description");
    }
  } catch (error) {
    console.error("Error updating post:", error);
    alert("Error updating the post");
    await dispatch(setLoadingInBtn(false));
  }
};

  return (
    <SafeArea>
      <Provider>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
                     <ScrollView 
             showsVerticalScrollIndicator={false}
             keyboardShouldPersistTaps="handled"
           >
            <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
              <View style={{ alignItems: "center", flexDirection: "row" }}>
                <IconButton
                  icon="arrow-left"
                  size={28}
                  onPress={() => navigation.goBack()}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "500",
                    color: "#000",
                  }}
                >
                  Edit Post
                </Text>
              </View>
            </RowBetween>
            <MainContainer
              style={{ paddingBottom: 56 }}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior="always"
            >
              <FormSection style={{ paddingTop: 0 }}>
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 4,
                    color: "grey",
                    fontWeight: "600",
                    marginTop: 20,
                  }}
                >
                  Description
                </Text>
                                 <TextInput
                   multiline={true}
                   numberOfLines={14}
                   selectionColor={Theme.themeColor}
                   placeholder="Post Description*"
                   activeUnderlineColor={Theme.themeColor}
                   underlineColor="transparent"
                   placeholderTextColor="#9B9B9B"
                   value={modifiedDetails.description}
                   onChangeText={(text) =>
                     setModifiedDetails({ ...modifiedDetails, description: text })
                   }
                   returnKeyType="done"
                   blurOnSubmit={true}
                   style={[
                     styles.input,
                     {
                       padding: 25,
                       borderRadius: 5,
                       fontSize: 16,
                       height: 300,
                       color: "black",
                       fontWeight: "400",
                       backgroundColor: "#F0F0F0",
                       marginTop: 5,
                       paddingTop: 15,
                       borderColor: "#e6e6e6",
                       textTransform: "capitalize",
                     },
                   ]}
                 />

                <FormButton onPress={handleUpdate}>
                  <Text
                    style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                  >
                    {loadingInBtn === true ? (
                      <ActivityIndicator
                        style={{
                          display: "flex",
                          alignSelf: "center",
                          justifyContent: "center",
                          alignItems: "center",
                          flex: 1,
                        }}
                       
                        color={"white"}
                      />
                    ) : (
                      "Submit"
                    )}
                  </Text>
                </FormButton>
              </FormSection>
            </MainContainer>
          </ScrollView>
        </KeyboardAvoidingView>
      </Provider>
    </SafeArea>
  );
}
