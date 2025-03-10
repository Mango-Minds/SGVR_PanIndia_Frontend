import React from "react";
import styled from "styled-components";
import { FlatList, Dimensions } from "react-native";
import { Button, IconButton, TextInput } from "react-native-paper";
import Theme from "./theme";
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export const MainContainer = styled.ScrollView`
  flex: 1;
`;

export const SlideBottom = styled.View`
  background-color: #fff;
  height: ${windowHeight * 0.35}px;
  width: ${windowWidth}px;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  position: absolute;
  bottom: 0;
  padding: 0px 16px;
  padding-top: 32px;
  flex-direction: column;
  justify-content: space-between;
`;

export const SlideTop = styled.ImageBackground`
  height: ${(windowHeight * 90) / 100}px;
  width: ${windowWidth}px;
  position: absolute;
  top: 0;
`;

export const SlideTitle = styled.Text`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #2b2b2b;
  line-height: 40px;
`;

export const SlideText = styled.Text`
  font-size: 14px;
  color: #8d93a3;
`;

export const MainCarousel = styled(FlatList)`
  flex: 1;
`;

export const SlideContainer = styled.View`
  height: ${windowHeight - (windowHeight * 5) / 100}px;
  width: ${windowWidth}px;
  justify-content: center;
`;

export const SlideSubTitle = styled.Text`
  font-size: 18px;
  color: #3577d0;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 40px;
  padding: 0px 50px;
  line-height: 30px;
`;

export const SlideBottomMain = styled.View``;

export const NextButton = styled(Button)`
  background-color: #e2b624;
  padding: 2px 6px;
  border-radius: 30px;
  elevation: 0;
  align-items: center;
`;

export const SkipButton = styled.Text`
  color: #e2b624;
  font-size: 18px;
`;

export const SlideBottomButtons = styled.View`
  margin-bottom: 42px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const SlideHeaderButtons = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 32px 16px;
  position: absolute;
  top: 0;
  width: ${windowWidth}px;
`;

export const MainPagination = styled.View`
  flex-direction: row;
`;

export const PaginationDot = styled.View`
  width: 9px;
  height: 9px;
  border-radius: 30px;
  margin-right: 6px;
  background-color: ${({ index, i }) => (index === i ? "#2b2b2b" : "#c4c4c4")};
`;

/* Login Styles */

export const Row = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  padding: 24px 0;
`;

export const FormSection = styled.View`
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 0px;
`;

export const FormSectionTitle = styled.Text`
  font-size: 26px;
  font-weight: bold;
  color: ${(props) => props.themeColor || Theme.themeColor};
  margin-bottom: 12px;
`;

export const FormSectionSubtitle = styled.Text`
  font-size: 16px;
  color: ${(props) => props.themeColor || Theme.themeColor};
  text-transform: capitalize;
`;

export const ForgotText = styled.Text`
  font-size: 14px;
 color: ${(props) => props.themeColor || Theme.themeColor};
  ${"" /* text-decoration: underline; */}
  text-align: right;
  padding-bottom: 2px;
  ${"" /* border-bottom-color: #b98c13; */}
`;

export const LoginInputField = styled(TextInput)`
  margin-top: 24px;
  background-color: #f0f0f0;
  border-color: #e6e6e6;
  border-radius: 4px;
  height: 50px;
  text-transform: capitalize;
  width: 100%;
  color: black;
`;

export const LoginInputAreaField = styled(TextInput)`
  margin-top: 24px;
  background-color: #f0f0f0;
  border-color: #e6e6e6;
  border-radius: 4px;
  text-transform: capitalize;
  width: 100%;
  color:black;
`;

export const CheckboxContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 24px;
`;

export const FormButton = styled.TouchableOpacity`
  background-color: ${(props) => props.themeColor || Theme.themeColor};
  border-radius: 4px;
  elevation: 0;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  height: 55px;
`;

export const BottomText = styled.Text`
  font-size: 13px;
  color: #686868;
  text-align: center;
  margin-top: 32px;
`;

const ButtonContainer = styled.TouchableOpacity`
  margin-top: 24px;
  border-color: #e6e6e6;
  border-radius: 4px;
  background-color: #f0f0f0;
  padding: 8px 14px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 50px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  color: ${(props) => (props.textcolor === props.title ? "#9b9b9b" : "black")};
`;

export const MenuLead = ({ onPress, title, textcolor }) => {
  return (
    <ButtonContainer onPress={onPress}>
      <ButtonText textcolor={textcolor} title={title}>
        {title}
      </ButtonText>
      <IconButton icon="chevron-down" color={Theme.themeColor}></IconButton>
    </ButtonContainer>
  );
};

export const MenuItem = ({ onPress, title }) => (
  <ButtonContainer style={{ margin: 0, borderRadius: 0 }} onPress={onPress}>
    <ButtonText>{title}</ButtonText>
  </ButtonContainer>
);

// Verification

export const VerificationSectionSubtitle = styled.Text`
  font-size: 14px;
  color: #686868;
`;

export const MobileText = styled.Text`
  font-size: 14px;
  color: ${(props) => props.themeColor || Theme.themeColor};
`;

export const EditMobileText = styled.Text`
  font-size: 14px;
  color: #3681f4;
  /* text-decoration: underline; */
`;

export const EnterCodeText = styled.Text`
  font-size: 16px;
  color: ${(props) => props.themeColor || Theme.themeColor};
`;

export const AddProfileBox = styled.TouchableOpacity`
  border-width: 2px;
  border-color: ${(props) => props.themeColor || Theme.themeColor};
  border-radius: 100px;
  width: 60px;
  height: 60px;
  align-items: center;
  justify-content: center;
  border-style: dashed;
`;
