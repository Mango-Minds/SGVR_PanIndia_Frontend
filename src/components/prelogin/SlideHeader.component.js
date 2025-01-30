import React from "react";
import { SkipButton, SlideHeaderButtons } from "../../styles/prelogin.styles";
import Icon from "react-native-vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native";

const SlideHeader = ({ showBack, showSkip, onBack, onSkip }) => {
  return (
    <>
      {(showBack || showSkip) && (
        <SlideHeaderButtons>
          {showBack && (
            <TouchableOpacity onPress={onBack}>
              <Icon size={18} name="arrow-back-ios" />
            </TouchableOpacity>
          )}
          {showSkip && (
            <TouchableOpacity
              style={{
                marginRight: 10,
                marginLeft: "auto",
                marginTop: 30,
                letterSpacing: 1.5,
              }}
              onPress={onSkip}
            >
              <SkipButton>Skip</SkipButton>
            </TouchableOpacity>
          )}
        </SlideHeaderButtons>
      )}
    </>
  );
};

export default SlideHeader;
