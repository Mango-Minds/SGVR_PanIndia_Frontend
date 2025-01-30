import React, { useState } from "react";
import { ScrollView, TouchableOpacity, StyleSheet, Text } from "react-native";
import { ActivityIndicator, Provider } from "react-native-paper";
import { Heading, Row, TopHeader } from "../../styles/dashboard.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeArea } from "../../components/utility/safe-area.component";
import {
  FormButton,
  FormSection,
  LoginInputAreaField,
  LoginInputField,
  MainContainer,
} from "../../styles/prelogin.styles";
import { joinCommunity } from "../../services/community.services";

const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    marginTop: "10%",
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
});
export default function CommunityRegisterScreen({ route, navigation }) {
  const [registerDetails, setRegisterDetails] = useState({
    workDone: "",
    about: "",
  });

  const [loading, setLoading] = useState(false);

  // const { communityId } = route.params;

  const handleSignup = async () => {
    setLoading(true);
    await joinCommunity({
      // communityId,
      workDone: registerDetails.workDone,
      about: registerDetails.about,
    }).then((res) => {
      setLoading(false);
      if (res.status === 0) {
        navigation.navigate("RequestSent");
      } else {
        if (res.status === 1 && res.msg === "request already sent") {
          navigation.navigate("RequestSent");
        } else alert(res.msg);
      }
    });
  };

  if (loading) {
    return (
      <ActivityIndicator
        style={{
          alignSelf: "center",
          marginTop: "50%",
          display: "flex",
          flex: 1,
        }}
        color="#D4AF37"
      />
    );
  }

  return (
    <SafeArea>
      <Provider>
        <ScrollView>
          <Row>
            <TopHeader style={{ padding: 12 }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="chevron-left" size={32} color="#000" />
              </TouchableOpacity>
              <Heading
                style={{
                  color: "#d4af37",
                }}
              >
                Register
              </Heading>
            </TopHeader>
          </Row>
          <MainContainer style={{ paddingBottom: 56 }}>
            <FormSection style={{ paddingTop: 24 }}>
              <Heading>Join Community</Heading>
              <LoginInputAreaField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Your Contributions (Optional)"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                multiline={true}
                numberOfLines={4}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, workDone: text })
                }
              />
              <LoginInputAreaField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="About Yourself (Optional)"
                underlineColor="transparent"
                multiline={true}
                numberOfLines={4}
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, about: text })
                }
              />

              <FormButton onPress={handleSignup}>
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  Submit
                </Text>
              </FormButton>
            </FormSection>
          </MainContainer>
        </ScrollView>
      </Provider>
    </SafeArea>
  );
}
